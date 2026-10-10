import Icon from "./Icon";
import StatusBadge from "./StatusBadge";

/* Summary card for a single waste report. */
export default function WasteCard({ item, onAction, actionLabel = "View details" }) {
  return (
    <div className="card card-pad">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="stat-icon" style={{ background: "var(--brand-50)", color: "var(--brand-700)", width: 40, height: 40 }}>
            <Icon name="box" size={20} />
          </span>
          <div>
            <div className="cell-strong">{item.category}</div>
            <div className="cell-muted">{item.location}</div>
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="task-meta">
        Reported {item.reportedAt} &middot; {item.weight}
      </div>
      {onAction && (
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-outline btn-sm" onClick={() => onAction(item)}>
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
