const TONE = {
  completed: "success",
  collected: "success",
  active: "success",
  resolved: "success",
  pending: "warn",
  scheduled: "info",
  "in-progress": "info",
  missed: "danger",
  failed: "danger",
  plastic: "info",
  organic: "success",
  "e-waste": "warn",
  metal: "neutral",
  paper: "neutral",
  glass: "info",
  textile: "info",
};

export default function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase();
  const tone = TONE[key] || "neutral";
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
