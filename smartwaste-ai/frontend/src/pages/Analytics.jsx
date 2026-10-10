import Icon from "../components/Icon";

const BARS = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 58 },
  { label: "Wed", value: 51 },
  { label: "Thu", value: 66 },
  { label: "Fri", value: 74 },
  { label: "Sat", value: 90 },
  { label: "Sun", value: 47 },
];

const MIX = [
  { label: "Plastic", pct: 34 },
  { label: "Organic", pct: 28 },
  { label: "Paper", pct: 16 },
  { label: "Glass", pct: 12 },
  { label: "E-Waste", pct: 10 },
];

const max = Math.max(...BARS.map((b) => b.value));

export default function Analytics() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-sub">Performance for the last 7 days across all zones.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline"><Icon name="calendar" size={16} /> Last 7 days</button>
        </div>
      </div>

      <div className="stat-grid">
        {[
          { label: "Total classified", value: "418 kg", icon: "box" },
          { label: "Diversion rate", value: "76%", icon: "chart" },
          { label: "Avg. pickup time", value: "38 min", icon: "clock" },
          { label: "Active zones", value: "12", icon: "pin" },
        ].map((s) => (
          <div className="card stat-card" key={s.label}>
            <span className="stat-icon" style={{ background: "var(--brand-50)", color: "var(--brand-700)" }}>
              <Icon name={s.icon} size={22} />
            </span>
            <span>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </span>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><span className="card-title">Waste collected per day (kg)</span></div>
          <div className="bars">
            {BARS.map((b) => (
              <div className="bar-col" key={b.label}>
                <span className="bar-val">{b.value}</span>
                <div className="bar" style={{ height: `${(b.value / max) * 130}px` }} />
                <span className="bar-label">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Category mix</span></div>
          <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {MIX.map((m) => (
              <div key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span className="cell-strong">{m.label}</span>
                  <span className="cell-muted">{m.pct}%</span>
                </div>
                <div className="progress"><div style={{ width: `${m.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
