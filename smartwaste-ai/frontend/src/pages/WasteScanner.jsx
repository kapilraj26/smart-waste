import { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import { analyzeWaste } from "../services/wasteService";

export default function WasteScanner() {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [tab, setTab] = useState("upload"); // upload | camera
  const [photo, setPhoto] = useState(null); // { blob, url, name }
  const [hint, setHint] = useState("");
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [camOn, setCamOn] = useState(false);
  const [camError, setCamError] = useState("");

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  }

  useEffect(() => () => stopCamera(), []);

  async function startCamera() {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamOn(true);
    } catch {
      setCamError("Camera unavailable. Check browser permission, or use photo upload instead.");
    }
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        if (photo?.url) URL.revokeObjectURL(photo.url);
        setPhoto({ blob, url: URL.createObjectURL(blob), name: "live-capture.jpg" });
        setResult(null);
      },
      "image/jpeg",
      0.92
    );
  }

  function onFile(file) {
    if (!file) return;
    if (photo?.url) URL.revokeObjectURL(photo.url);
    setPhoto({ blob: file, url: URL.createObjectURL(file), name: file.name });
    setResult(null);
    setError("");
  }

  async function classify() {
    if (!photo) return;
    setError("");
    setResult(null);
    setScanning(true);
    try {
      const data = await analyzeWaste(photo.blob, hint);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Analysis failed. Make sure the backend and Ollama are running, then try again."
      );
    } finally {
      setScanning(false);
    }
  }

  const stepState = (i) => {
    if (result) return " active";
    if (i === 0 && photo) return " active";
    if (i === 1 && scanning) return " active";
    return "";
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Waste Scanner</div>
          <div className="page-sub">
            Capture a live photo or upload one — Llama 3.2 on Ollama analyzes the waste details.
          </div>
        </div>
      </div>

      <div className="steps">
        {["Capture photo", "AI classification", "Disposal guidance"].map((s, i) => (
          <div className={`step${stepState(i)}`} key={s}>
            <span className="step-num">
              {result && i < 2 ? <Icon name="check" size={13} strokeWidth={3} /> : i + 1}
            </span>
            <span className="step-name">{s}</span>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <div className="tabs">
            <button className={`tab${tab === "upload" ? " active" : ""}`} onClick={() => setTab("upload")}>
              <Icon name="report" size={15} /> Upload
            </button>
            <button
              className={`tab${tab === "camera" ? " active" : ""}`}
              onClick={() => { setTab("camera"); if (!camOn) startCamera(); }}
            >
              <Icon name="scan" size={15} /> Live camera
            </button>
          </div>

          {tab === "upload" && (
            <div className="dropzone" onClick={() => fileRef.current?.click()}>
              <span className="dropzone-icon"><Icon name="scan" size={24} /></span>
              <div className="cell-strong">{photo?.name && tab === "upload" ? photo.name : "Drop an image here, or browse"}</div>
              <div className="cell-muted" style={{ marginTop: 4 }}>JPG, PNG or WEBP, up to 10 MB</div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </div>
          )}

          {tab === "camera" && (
            <div>
              <div className="cam-view">
                {!camOn && !camError && <div className="cell-muted">Starting camera...</div>}
                {camError && <div className="form-error">{camError}</div>}
                <video ref={videoRef} className="cam-video" playsInline muted style={{ display: camOn ? "block" : "none" }} />
                {camOn && <span className="cam-live">LIVE</span>}
              </div>
              <canvas ref={canvasRef} hidden />
              <div className="cam-actions">
                {!camOn ? (
                  <button className="btn btn-outline" onClick={startCamera}>
                    <Icon name="scan" size={16} /> Start camera
                  </button>
                ) : (
                  <>
                    <button className="btn btn-outline" onClick={capture}>
                      Capture photo
                    </button>
                    <button className="btn btn-ghost" onClick={stopCamera}>Stop</button>
                  </>
                )}
              </div>
            </div>
          )}

          {photo && (
            <div className="preview-row">
              <img src={photo.url} alt="Waste to analyze" className="preview-img" />
              <div className="task-meta">{photo.name}</div>
            </div>
          )}

          <div className="field" style={{ marginTop: 16 }}>
            <label className="field-label" htmlFor="scan-hint">What is in the photo? (optional, improves accuracy)</label>
            <input
              id="scan-hint"
              className="input"
              style={{ paddingLeft: 14 }}
              placeholder="e.g. a blue plastic bottle"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div style={{ marginTop: error ? 16 : 4 }}>
            <button className="btn btn-primary btn-block" disabled={!photo || scanning} onClick={classify}>
              {scanning ? "Analyzing with Llama 3.2..." : "Analyze waste"}
              {!scanning && <Icon name="arrowRight" size={16} />}
            </button>
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-title" style={{ marginBottom: 12 }}>Analysis result</div>
          {!result && !scanning && (
            <div className="cell-muted">No scan yet. Capture or upload a photo, then run the analysis to see waste details.</div>
          )}
          {scanning && <div className="cell-muted">Llama 3.2 is examining the photo evidence...</div>}
          {result && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <span className="stat-icon" style={{ background: "var(--brand-50)", color: "var(--brand-700)" }}>
                  <Icon name="box" size={22} />
                </span>
                <div>
                  <div className="stat-value" style={{ fontSize: 20 }}>{result.category}</div>
                  <div className="stat-label">Confidence {result.confidence}%</div>
                </div>
                <span style={{ marginLeft: "auto" }}>
                  <StatusBadge status={result.category} />
                </span>
              </div>
              <div className="progress" style={{ marginBottom: 14 }}>
                <div style={{ width: `${result.confidence}%` }} />
              </div>
              <div className="field">
                <span className="field-label">Assigned bin</span>
                <div className="cell-strong">{result.bin}</div>
              </div>
              <div className="field">
                <span className="field-label">Guidance</span>
                <div style={{ fontSize: 13.5 }}>{result.guidance}</div>
              </div>
              {result.details?.length > 0 && (
                <div className="field">
                  <span className="field-label">Waste details</span>
                  <ul className="detail-list">
                    {result.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="task-meta" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <StatusBadge status={result.recyclable ? "Recyclable" : "Not recyclable"} />
                <span>Analyzed with {result.model} via Ollama</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
