import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import { currentUser } from "../services/authService";

const STATS = [
  { label: "Waste classified", value: "1,284", icon: "scan", bg: "var(--brand-50)", fg: "var(--brand-700)" },
  { label: "Pickups completed", value: "312", icon: "truck", bg: "var(--info-bg)", fg: "var(--info)" },
  { label: "Active reports", value: "48", icon: "report", bg: "var(--warn-bg)", fg: "var(--warn)" },
  { label: "Diversion rate", value: "76%", icon: "chart", bg: "var(--success-bg)", fg: "var(--success)" },
];

const RECENT = [
  { id: "WR-1042", category: "Plastic", location: "Sector 9, Bin A-12", weight: "4.2 kg", status: "Collected", reportedAt: "Today, 09:41" },
  { id: "WR-1041", category: "Organic", location: "Sector 4, Bin C-03", weight: "7.8 kg", status: "Scheduled", reportedAt: "Today, 08:15" },
  { id: "WR-1040", category: "E-Waste", location: "Sector 9, Depot 2", weight: "2.1 kg", status: "In-Progress", reportedAt: "Yesterday, 16:02" },
  { id: "WR-1039", category: "Paper", location: "Sector 1, Bin B-07", weight: "3.5 kg", status: "Pending", reportedAt: "Yesterday, 11:26" },
];

export default function Dashboard() {
  const user = currentUser();

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

      <div className="stat-grid">
        {STATS.map((s) => (
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
                {RECENT.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="cell-strong">{r.id}</div>
                      <div className="cell-muted">{r.location}</div>
                    </td>
                    <td>{r.category}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
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
            {[
              { t: "Sector 9 route — bins A-01 to A-20", m: "Crew B · Due 12:00", done: true },
              { t: "Depot 2 e-waste pickup", m: "Crew A · Due 14:30", done: true },
              { t: "Sector 4 organic round", m: "Crew C · Due 16:00", done: false },
            ].map((task) => (
              <div className="task-row" key={task.t}>
                <span className={`task-check${task.done ? " done" : ""}`}>
                  {task.done && <Icon name="check" size={13} strokeWidth={3} />}
                </span>
                <div className="task-main">
                  <div className="task-title">{task.t}</div>
                  <div className="task-meta">{task.m}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
