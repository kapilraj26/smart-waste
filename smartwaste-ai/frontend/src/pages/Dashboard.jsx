import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import { currentUser } from "../services/authService";
import { getAnalyticsSummary, listCollections } from "../services/collectionService";
import { formatReport, listReports } from "../services/reportService";
import { listWasteRecords } from "../services/wasteService";

export default function Dashboard() {
  const user = currentUser();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [s, reports, collections, records] = await Promise.all([
          getAnalyticsSummary(),
          listReports(),
          listCollections(),
          listWasteRecords().catch(() => []),
        ]);
        if (!alive) return;
        setSummary(s);
        setRecent(reports.slice(0, 4).map(formatReport));
        setTasks(collections.slice(0, 3));
        setScans((Array.isArray(records) ? records : []).slice(0, 5));
      } catch {
        if (alive) setError("Could not load database data. Is the backend running?");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const stats = [
    { label: "Waste classified", value: summary ? String(summary.total_reports) : "—", icon: "scan", bg: "var(--brand-50)", fg: "var(--brand-700)" },
    { label: "Pickups completed", value: summary ? String(summary.pickups_completed) : "—", icon: "truck", bg: "var(--info-bg)", fg: "var(--info)" },
    { label: "Active reports", value: summary ? String(summary.active_reports) : "—", icon: "report", bg: "var(--warn-bg)", fg: "var(--warn)" },
    { label: "Diversion rate", value: summary ? `${summary.diversion_rate}%` : "—", icon: "chart", bg: "var(--success-bg)", fg: "var(--success)" },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Good morning, {user?.name?.split(" ")[0] || "Operator"}</div>
          <div className="page-sub">Here is what is happening across your zones today.</div>
        </div>
        <div className="page-actions">
          <Link className="btn btn-outline" to="/reports">View reports</Link>
          <Link className="btn btn-primary" to="/scanner">
            <Icon name="scan" size={16} /> New scan
          </Link>
        </div>
      </div>

      {loading && <div className="cell-muted" style={{ padding: "12px 0" }}>Loading database data...</div>}
      {error && <div className="card card-pad" style={{ color: "var(--warn)" }}>{error}</div>}

      {!loading && !error && (
        <>
          <div className="stat-grid">
            {stats.map((s) => (
              <div className="card stat-card" key={s.label}>
                <span className="stat-icon" style={{ background: s.bg, color: s.fg }}>
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
              <div className="card-head">
                <span className="card-title">Recent reports</span>
                <Link className="link-btn" to="/reports">View all</Link>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Report</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="cell-strong">{r.id}</div>
                          <div className="cell-muted">{r.location}</div>
                        </td>
                        <td>{r.category}</td>
                        <td><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                    {recent.length === 0 && (
                      <tr><td colSpan={3} className="cell-muted" style={{ textAlign: "center", padding: 24 }}>No reports in the database yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <span className="card-title">Today&apos;s collections</span>
                <Link className="link-btn" to="/collections">View all</Link>
              </div>
              <div className="task-list">
                {tasks.map((task) => (
                  <div className="task-row" key={task.code}>
                    <span className={`task-check${task.done ? " done" : ""}`}>
                      {task.done && <Icon name="check" size={13} strokeWidth={3} />}
                    </span>
                    <div className="task-main">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">{task.meta}</div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="cell-muted" style={{ padding: 16 }}>No collection tasks in the database yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="card mt">
            <div className="card-head">
              <span className="card-title">Recent AI scans</span>
              <Link className="link-btn" to="/scanner">Open scanner</Link>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Scan</th>
                    <th>Bin</th>
                    <th>Guidance</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="cell-strong">
                          <StatusBadge status={s.category} />
                        </div>
                        <div className="cell-muted">{s.created_at ? new Date(s.created_at).toLocaleString() : ""}</div>
                      </td>
                      <td>{s.bin_name}</td>
                      <td style={{ maxWidth: 320 }}>{s.guidance || "—"}</td>
                      <td>{typeof s.confidence === "number" ? `${Math.round(s.confidence)}%` : s.confidence}</td>
                    </tr>
                  ))}
                  {scans.length === 0 && (
                    <tr><td colSpan={4} className="cell-muted" style={{ textAlign: "center", padding: 24 }}>No scans stored yet. Classify a photo in the Waste Scanner.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
