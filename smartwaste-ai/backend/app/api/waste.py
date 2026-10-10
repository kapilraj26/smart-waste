import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.waste import WasteRecord
from app.schemas.waste import WasteAnalysis, WasteClassifyOut
from app.services import ollama_service

router = APIRouter(prefix="/waste", tags=["waste"])
BIN_MAP = {
    "Plastic": "Blue bin — Recyclables",
    "Organic": "Green bin — Compost",
    "Paper": "Blue bin — Recyclables",
    "Glass": "Blue bin — Recyclables",
    "Metal": "Blue bin — Recyclables",
    "E-Waste": "E-waste depot",
    "Textile": "Textile bank — Donate",
}

MAX_BYTES = 10 * 1024 * 1024


def _record_out(rec: WasteRecord) -> dict:
    """Serialize a row; `details` is stored as a JSON string in Postgres."""
    try:
        details = json.loads(rec.details or "[]")
    except (TypeError, ValueError):
        details = []
    return {
        "id": rec.id,
        "category": rec.category,
        "confidence": rec.confidence,
        "bin_name": rec.bin_name,
        "guidance": rec.guidance or "",
        "details": details if isinstance(details, list) else [],
        "recyclable": bool(rec.recyclable),
        "created_at": rec.created_at,
    }


@router.post("/classify", response_model=WasteClassifyOut)
def classify(
    file: UploadFile,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """Classify upload (heuristic stub) and persist the result to `waste_records`."""
    name = (file.filename or "").lower()
    if "organic" in name or "food" in name:
        category, confidence = "Organic", 88.0
    elif "paper" in name:
        category, confidence = "Paper", 91.5
    elif "glass" in name:
        category, confidence = "Glass", 90.0
    elif "metal" in name or "ewaste" in name or "e-waste" in name:
        category, confidence = "E-Waste", 87.0
    else:
        category, confidence = "Plastic", 82.0
    rec = WasteRecord(
        category=category,
        confidence=confidence,
        bin_name=BIN_MAP.get(category, "General bin"),
        image_path=file.filename or "",
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return _record_out(rec)


@router.get("/records", response_model=list[WasteClassifyOut])
def records(
    limit: int = 50,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """Recent scanner classifications, newest first (Postgres `waste_records`)."""
    rows = (
        db.query(WasteRecord)
        .order_by(desc(WasteRecord.created_at))
        .limit(min(limit, 200))
        .all()
    )
    return [_record_out(r) for r in rows]


@router.post("/analyze", response_model=WasteAnalysis)
async def analyze(
    file: UploadFile = File(...),
    hint: str | None = Form(default=None),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Analyze a waste photo with the local Ollama model and persist the result.

    Accepts camera captures and uploads. Requires login (Bearer token).
    """
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Only JPG, PNG or WEBP photos are accepted")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="Photo must be under 10 MB")

    try:
        out = ollama_service.analyze_waste(data, hint)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except ValueError:
        raise HTTPException(status_code=502, detail="The AI model returned an unreadable response. Try again.")

    db.add(
        WasteRecord(
            category=out["category"],
            confidence=float(out["confidence"]),
            bin_name=out["bin"],
            image_path=file.filename or "capture.jpg",
            guidance=out["guidance"],
            details=json.dumps(out["details"]),
            recyclable=bool(out["recyclable"]),
        )
    )
    db.commit()

    return WasteAnalysis(
        category=out["category"],
        confidence=out["confidence"],
        bin=out["bin"],
        guidance=out["guidance"],
        details=out["details"],
        recyclable=out["recyclable"],
        model=out["_model"],
        mode=out["_mode"],
    )
