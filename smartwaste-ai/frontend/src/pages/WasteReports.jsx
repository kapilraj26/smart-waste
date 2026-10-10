import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import WasteCard from "../components/WasteCard";
import { isManagement } from "../services/authService";
import { formatReport, listReports, updateReportStatus } from "../services/reportService";

const STATUSES = ["Pending", "Scheduled", "In-Progress", "Collected", "Missed"];

export default function WasteReports() {
  const management = isManagement();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await listReports();
        if (alive) setReports(data.map(formatReport));
      } catch {
        if (alive) setError("Could not load reports from the database.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const rows = reports.filter(
    (r) =>
      (status === "all" || r.status.toLowerCase() === status) &&
      `${r.id} ${r.category} ${r.location}`.toLowerCase().includes(query.toLowerCase())
  );

  async function onStatusChange(report, next) {
    if (next === report.status || savingId) return;
    setSavingId(report.pk);
    setError("");
    try {
      const updated = await updateReportStatus(report.pk, next);
      setReports((list) =>
        list.map((r) => (r.pk === report.pk ? formatReport(updated) : r))
      );
    } catch {
      setError("Could not update status. Management role required.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Waste Reports</div>
          <div className="page-sub">{loading ? "Loading..." : `${rows.length} of ${reports.length} reports shown`}</div>
        </div>
      </div>

      {error && <div className="card card-pad" style={{ color: "var(--warn)", marginBottom: 16 }}>{error}</div>}

      <div className="toolbar">
        <div className="input-wrap toolbar-search">
          <span className="input-icon"><Icon name="search" size={17} /></span>
          <input
            className="input"
            placeholder="Search id, category, location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="input" style={{ width: 180 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In-Progress</option>
          <option value="collected">Collected</option>
          <option value="missed">Missed</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Category</th>
                <th>Weight</th>
                <th>Reporter</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="cell-muted" style={{ textAlign: "center", padding: 32 }}>Loading database data...</td></tr>
              )}
              {!loading && rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="cell-strong">{r.id}</div>
                    <div className="cell-muted">{r.location} &middot; {r.reportedAt}</div>
                  </td>
                  <td>{r.category}</td>
                  <td>{r.weight}</td>
                  <td>{r.reporter}</td>
                  <td>
                    {management ? (
                      <select
                        className="input"
                        style={{ height: 36, width: 150, paddingLeft: 10, fontSize: 13 }}
                        value={r.status}
                        disabled={savingId === r.pk}
                        onChange={(e) => onStatusChange(r, e.target.value)}
                        title="Set status (management)"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={r.status} />
                    )}
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={5} className="cell-muted" style={{ textAlign: "center", padding: 32 }}>
                  {reports.length === 0 ? "No reports in the database yet." : "No reports match the current filters."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2 mt" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", display: "grid" }}>
        {rows.slice(0, 3).map((r) => (
          <WasteCard key={r.id} item={r} />
        ))}
      </div>
    </div>
  );
}
