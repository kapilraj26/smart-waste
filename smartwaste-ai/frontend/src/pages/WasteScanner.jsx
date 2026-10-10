import { useRef, useState } from "react";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import { classifyWaste } from "../services/wasteService";

const BIN_GUIDANCE = {
  Plastic: "Rinse the container, remove the cap, and place it in the blue bin.",
  Organic: "Place food scraps in the green compost bin.",
  Paper: "Keep paper dry and place it in the blue bin.",
  Glass: "Rinse and place glass in the blue bin.",
  Metal: "Rinse metal cans and place them in the blue bin.",
  "E-Waste": "Do not bin — drop off at the e-waste depot.",
};

export default function WasteScanner() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  function onPick(f) {
    if (!f) return;
    setFile(f);
    setFileName(f.name);
    setResult(null);
    setError("");
  }

  async function onClassify() {
    const target = file || fileRef.current?.files?.[0];
    if (!target) return;
    setScanning(true);
    setResult(null);
    setError("");
    try {
      // Real backend call — result is stored in Postgres `waste_records`.
      const data = await classifyWaste(target);
      setResult({
        category: data.category,
        confidence: `${Number(data.confidence).toFixed(1)}%`,
        bin: data.bin_name,
        guidance: BIN_GUIDANCE[data.category] || "Follow local disposal guidance.",
      });
    } catch {
      setError("Classification failed. Is the backend running?");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Waste Scanner</div>
          <div className="page-sub">Upload a photo to classify waste and get disposal guidance.</div>
        </div>
      </div>

      <div className="steps">
        {["Upload photo", "AI classification", "Disposal guidance"].map((s, i) => (
          <div className={`step${i === 0 || result ? " active" : ""}${i === 1 && scanning ? " active" : ""}`} key={s}>
            <span className="step-num">{result && i < 2 ? <Icon name="check" size={13} strokeWidth={3} /> : i + 1}</span>
            <span className="step-name">{s}</span>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <div className="card-title" style={{ marginBottom: 12 }}>Upload</div>
          <div className="dropzone" onClick={() => fileRef.current?.click()}>
            <span className="dropzone-icon"><Icon name="scan" size={24} /></span>
            <div className="cell-strong">{fileName || "Drop an image here, or browse"}</div>
            <div className="cell-muted" style={{ marginTop: 4 }}>JPG or PNG, up to 10 MB</div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onPick(e.target.files?.[0])}
            />
          </div>
          {error && <div style={{ color: "var(--warn)", fontSize: 13, marginTop: 12 }}>{error}</div>}
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary btn-block" disabled={!fileName || scanning} onClick={onClassify}>
              {scanning ? "Classifying..." : "Classify waste"}
            </button>
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-title" style={{ marginBottom: 12 }}>Result</div>
          {!result && !scanning && (
            <div className="cell-muted">No scan yet. Upload a photo to see the classification, confidence and the correct bin.</div>
          )}
          {scanning && <div className="cell-muted">Analyzing image...</div>}
          {result && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span className="stat-icon" style={{ background: "var(--brand-50)", color: "var(--brand-700)" }}>
                  <Icon name="box" size={22} />
                </span>
                <div>
                  <div className="stat-value" style={{ fontSize: 20 }}>{result.category}</div>
                  <div className="stat-label">Confidence {result.confidence}</div>
                </div>
                <span style={{ marginLeft: "auto" }}>
                  <StatusBadge status={result.category} />
                </span>
              </div>
              <div className="field">
                <span className="field-label">Assigned bin</span>
                <div className="cell-strong">{result.bin}</div>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">Guidance</span>
                <div style={{ fontSize: 13.5 }}>{result.guidance}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
