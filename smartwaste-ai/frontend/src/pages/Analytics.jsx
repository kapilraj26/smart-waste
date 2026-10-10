import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import { getAnalyticsSummary } from "../services/collectionService";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getAnalyticsSummary();
        if (alive) setSummary(data);
      } catch {
        if (alive) setError("Could not load analytics from the database.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const bars = summary?.per_day || [];
  const mix = summary?.mix || [];
  const max = Math.max(1, ...bars.map((b) => b.value));

  const statCards = [
    { label: "Total classified", value: summary ? `${summary.total_kg} kg` : "—", icon: "box" },
    { label: "Diversion rate", value: summary ? `${summary.diversion_rate}%` : "—", icon: "chart" },
    { label: "Total reports", value: summary ? String(summary.total_reports) : "—", icon: "clock" },
    { label: "Active reports", value: summary ? String(summary.active_reports) : "—", icon: "pin" },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-sub">Performance for the last 7 days across all zones.</div>
        </div>
      </div>

      {loading && <div className="cell-muted" style={{ padding: "12px 0" }}>Loading database data...</div>}
      {error && <div className="card card-pad" style={{ color: "var(--warn)" }}>{error}</div>}

      {!loading && !error && summary && (
        <>
          <div className="stat-grid">
            {statCards.map((s) => (
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
                {bars.map((b) => (
                  <div className="bar-col" key={b.date}>
                    <span className="bar-val">{b.value}</span>
                    <div className="bar" style={{ height: `${(b.value / max) * 130}px` }} />
                    <span className="bar-label">{b.label}</span>
                  </div>
                ))}
                {bars.length === 0 && <div className="cell-muted" style={{ padding: 16 }}>No data in the database yet.</div>}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><span className="card-title">Category mix</span></div>
              <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {mix.map((m) => (
                  <div key={m.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span className="cell-strong">{m.label}</span>
                      <span className="cell-muted">{m.pct}%</span>
                    </div>
                    <div className="progress"><div style={{ width: `${m.pct}%` }} /></div>
                  </div>
                ))}
                {mix.length === 0 && <div className="cell-muted">No data in the database yet.</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
