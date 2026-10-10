"""Ollama integration for waste analysis.

Default path (text-only models such as llama3.2:3b):
  1. extract_features() measures simple visual evidence from the photo
     (brightness, contrast, dominant colors, edge density, orientation).
  2. That evidence + the operator's optional note is sent to the local
     Llama model, which returns a strict-JSON waste classification.

Vision path: if OLLAMA_MODEL is a vision-capable model (llava, moondream,
qwen2.5vl, llama3.2-vision, ...), the raw photo bytes are sent natively.
"""

import base64
import io
import json
import logging
from functools import lru_cache

import httpx
from PIL import Image, ImageFilter, ImageStat

from app.core.config import settings

log = logging.getLogger(__name__)

CATEGORIES = ["Plastic", "Organic", "Paper", "Glass", "Metal", "E-Waste", "Textile", "Mixed", "Unknown"]

SYSTEM_PROMPT = """You are a waste-sorting expert for a municipal SmartWaste system.
IMPORTANT: you cannot see the photo. You only get approximate measurements plus an operator note.
Classify the waste and respond with ONLY a JSON object — no markdown, no extra text:
{
  "category": one of ["Plastic", "Organic", "Paper", "Glass", "Metal", "E-Waste", "Textile", "Mixed", "Unknown"],
  "confidence": integer 0-100,
  "bin": short bin assignment,
  "guidance": one or two practical disposal sentences,
  "details": array of 2-4 short factual strings about the item and handling,
  "recyclable": true or false
}
Rules:
- If the operator note names the item (e.g. "clothes", "shirt", "bottle", "banana peel"), trust it: pick the matching category with confidence 85-97.
- Fabric/garment/cloth/shoe words map to "Textile". Bin: "Textile bank - Donate" when clean and dry, else "General waste bin". Guidance must mention donating clean textiles.
- "Plastic" -> "Blue bin - Recyclables". "Organic"/food -> "Green bin - Compost". "Paper"/cardboard -> "Blue bin - Recyclables". "Glass"/"Metal" -> "Blue bin - Recyclables". "E-Waste"/battery/phone -> "E-waste depot".
- With NO operator note you are guessing from measurements: choose the single most plausible category, keep confidence 40-70, and say so in guidance (ask the operator to describe the item). Never exceed 70 without an operator note."""


def _color_name(rgb: tuple[int, int, int]) -> str:
    r, g, b = rgb
    mx, mn = max(rgb), min(rgb)
    if mx - mn < 25:
        return "black" if mx < 60 else ("white" if mx > 200 else "gray")
    if r == mx and r - max(g, b) > 30:
        return "red"
    if g == mx and g - max(r, b) > 30:
        return "green"
    if b == mx and b - max(r, g) > 30:
        return "blue"
    if r > 150 and g > 150 and b < 120:
        return "yellow"
    if r > 150 and 80 < g < 180 and b < 100:
        return "orange" if r > g else "brown"
    return "mixed"


def extract_features(image_bytes: bytes) -> dict:
    """Cheap, dependency-light visual evidence from a photo."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size
    small = img.resize((160, 160))
    gray = small.convert("L")
    stat = ImageStat.Stat(gray)
    brightness = round(stat.mean[0], 1)
    contrast = round(stat.stddev[0], 1)

    quantized = small.quantize(colors=5).convert("RGB")
    counts: dict[tuple, int] = {}
    for px in quantized.getdata():
        counts[px] = counts.get(px, 0) + 1
    total = sum(counts.values())
    dominant = [
        {"color": _color_name(px), "share": round(n / total * 100)}
        for px, n in sorted(counts.items(), key=lambda kv: -kv[1])[:3]
    ]

    edges = gray.filter(ImageFilter.FIND_EDGES)
    edge_stat = ImageStat.Stat(edges)
    edge_density = round(edge_stat.mean[0] / 255, 3)
    texture = round(edge_stat.stddev[0] / 255, 3)
    colorfulness = round(ImageStat.Stat(small).stddev[0] + ImageStat.Stat(small).stddev[1], 1)

    hsv = small.convert("HSV")
    saturation = round(ImageStat.Stat(hsv).mean[1] / 255, 3)
    cx0, cy0 = int(w * 0.3), int(h * 0.3)
    center = img.crop((cx0, cy0, cx0 + int(w * 0.4), cy0 + int(h * 0.4))).convert("L").resize((64, 64))
    center_brightness = round(ImageStat.Stat(center).mean[0], 1)

    return {
        "dimensions": f"{w}x{h}",
        "orientation": "landscape" if w >= h else "portrait",
        "brightness_0_255": brightness,
        "lighting": "well lit" if brightness > 140 else ("dim" if brightness > 70 else "dark"),
        "contrast": contrast,
        "dominant_colors": dominant,
        "saturation_0_1": saturation,
        "colorfulness": colorfulness,
        "edge_density_0_1": edge_density,
        "texture_0_1": texture,
        "texture_hint": (
            "smooth/flat surfaces" if texture < 0.08
            else ("woven/fibrous or crumpled texture" if texture < 0.2 else "busy/detailed surfaces")
        ),
        "center_vs_overall": (
            "subject brighter than background" if center_brightness > brightness + 15
            else ("subject darker than background" if center_brightness < brightness - 15 else "even exposure")
        ),
        "shape_hint": "clear object outlines" if edge_density > 0.12 else "soft/uniform surfaces",
    }


def _evidence_text(features: dict, hint: str | None) -> str:
    colors = ", ".join(f"{c['color']} {c['share']}%" for c in features["dominant_colors"])
    lines = [
        f"Dimensions: {features['dimensions']} ({features['orientation']}).",
        f"Lighting: {features['lighting']} (mean brightness {features['brightness_0_255']}/255, contrast {features['contrast']}).",
        f"Dominant colors: {colors} (saturation {features['saturation_0_1']}).",
        f"Edges: {features['shape_hint']} (density {features['edge_density_0_1']}).",
        f"Texture: {features['texture_hint']}.",
        f"Framing: {features['center_vs_overall']}.",
    ]
    if hint and hint.strip():
        lines.append(f"Operator note: \"{hint.strip()}\".")
    else:
        lines.append("Operator note: none provided.")
    return "\n".join(lines)


@lru_cache(maxsize=1)
def model_supports_vision() -> bool:
    """Detect vision capability of the configured Ollama model (cached)."""
    name = settings.OLLAMA_MODEL.lower()
    if any(k in name for k in ("llava", "moondream", "vision", "vl", "bakllava", "llama3.2-vision")):
        return True
    try:
        r = httpx.get(f"{settings.OLLAMA_URL}/api/tags", timeout=10)
        for m in r.json().get("models", []):
            if m.get("name", "").lower() == name and "vision" in (m.get("capabilities") or []):
                return True
    except Exception as exc:  # Ollama unreachable -> caller surfaces the error
        log.warning("Could not query Ollama tags: %s", exc)
    return False


def _chat(payload: dict) -> str:
    try:
        r = httpx.post(
            f"{settings.OLLAMA_URL}/api/chat",
            json=payload,
            timeout=settings.OLLAMA_TIMEOUT_S,
        )
        r.raise_for_status()
    except httpx.ConnectError:
        raise RuntimeError(f"Cannot reach Ollama at {settings.OLLAMA_URL}. Is `ollama serve` running?")
    data = r.json()
    return data.get("message", {}).get("content", "")


CHAT_SYSTEM = """You are the SmartWaste AI assistant inside a municipal waste-operations console.
Answer concisely in plain language (no emojis). You help with: which bin a waste item goes in
(Blue bin - Recyclables, Green bin - Compost, E-waste depot, General waste), pickup scheduling,
recycling guidance, and explaining dashboard metrics. If unsure, say so and suggest asking the
operations team. Keep replies under 150 words unless the user asks for detail."""


def chat_reply(history: list[dict]) -> str:
    """Free-text assistant reply over [{{role, content}}] history (roles: user/assistant)."""
    content = _chat(
        {
            "model": settings.OLLAMA_MODEL,
            "stream": False,
            "options": {"temperature": 0.4},
            "messages": [{"role": "system", "content": CHAT_SYSTEM}, *history],
        }
    ).strip()
    if not content:
        raise ValueError("The AI model returned an empty response. Try again.")
    return content


def _parse_json(content: str) -> dict:
    text = content.strip()
    if text.startswith("```"):
        text = text.strip("`").split("\n", 1)[-1]
        if text.lower().startswith("json"):
            text = text[4:]
    # Small local models often append prose or repeat the object; accept the
    # first valid JSON object found anywhere in the output.
    decoder = json.JSONDecoder()
    obj = None
    idx = 0
    while True:
        start = text.find("{", idx)
        if start == -1:
            break
        try:
            obj, _ = decoder.raw_decode(text[start:])
            break
        except json.JSONDecodeError:
            idx = start + 1
    if not isinstance(obj, dict):
        raise ValueError("LLM did not return JSON")
    if obj.get("category") not in CATEGORIES:
        obj["category"] = "Unknown"
    try:
        obj["confidence"] = max(0, min(100, int(obj.get("confidence", 50))))
    except (TypeError, ValueError):
        obj["confidence"] = 50
    obj.setdefault("bin", "General waste bin")
    obj.setdefault("guidance", "Place in the general waste bin.")
    obj.setdefault("details", [])
    obj.setdefault("recyclable", False)
    return obj


def analyze_waste(image_bytes: bytes, hint: str | None = None) -> dict:
    """Run the full analysis; returns dict with result + model metadata."""
    model = settings.OLLAMA_MODEL
    if model_supports_vision():
        content = _chat(
            {
                "model": model,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.2},
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": f"Classify the waste in this photo.\n{('Operator note: ' + hint) if hint else 'No operator note.'}",
                        "images": [base64.b64encode(image_bytes).decode()],
                    },
                ],
            }
        )
        mode = "vision"
        features = None
    else:
        features = extract_features(image_bytes)
        content = _chat(
            {
                "model": model,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.2},
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": "Classify the waste from this photo evidence:\n" + _evidence_text(features, hint),
                    },
                ],
            }
        )
        mode = "feature-reasoning"

    result = _parse_json(content)
    result["_model"] = model
    result["_mode"] = mode
    return result
