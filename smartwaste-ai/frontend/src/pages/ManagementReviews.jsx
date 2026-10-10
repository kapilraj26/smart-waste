import { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { formatReport, listReports, updateReportStatus } from "../services/reportService";
import { listWasteRecords } from "../services/wasteService";

const STATUSES = ["Pending", "Scheduled", "In-Progress", "Collected", "Missed"];

/* Management-only review console: people's sent scans + pending reports
   with status control. Operators never see this page. */
export default function ManagementReviews() {
  const [reports, setReports] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [reps, recs] = await Promise.all([
          listReports(),
          listWasteRecords().catch(() => []),
        ]);
        if (!alive) return;
        setReports(reps.map(formatReport));
        setScans(Array.isArray(recs) ? recs : []);
      } catch {
        if (alive) setError("Could not load review data from the database.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const pending = reports.filter((r) => r.status === "Pending");

  async function onStatusChange(report, next) {
    if (next === report.status || savingId) return;
    setSavingId(report.pk);
    setError("");
    try {
      const updated = await updateReportStatus(report.pk, next);
      setReports((list) => list.map((r) => (r.pk === report.pk ? formatReport(updated) : r)));
    } catch {
      setError("Could not update status. Try again.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Review Queue</div>
          <div className="page-sub">
            {loading ? "Loading..." : `${pending.length} pending from operators · ${scans.length} AI scans stored`}
          </div>
        </div>
      </div>

      {error && <div className="card card-pad" style={{ color: "var(--warn)", marginBottom: 16 }}>{error}</div>}

      <div className="card">
        <div className="card-head"><span className="card-title">Pending reports from operators</span></div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Category</th>
                <th>Reporter</th>
                <th>Set status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} className="cell-muted" style={{ textAlign: "center", padding: 32 }}>Loading database data...</td></tr>
              )}
              {!loading && pending.map((r) => (
                <tr key={r.pk}>
                  <td>
                    <div className="cell-strong">{r.id}</div>
                    <div className="cell-muted">{r.location} &middot; {r.reportedAt}</div>
                  </td>
                  <td>{r.category}</td>
                  <td>{r.reporter}</td>
                  <td>
                    <select
                      className="input"
                      style={{ height: 36, width: 150, paddingLeft: 10, fontSize: 13 }}
                      value={r.status}
                      disabled={savingId === r.pk}
                      onChange={(e) => onStatusChange(r, e.target.value)}
                      title="Set status"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {!loading && pending.length === 0 && (
                <tr><td colSpan={4} className="cell-muted" style={{ textAlign: "center", padding: 32 }}>Queue clear — nothing pending.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt">
        <div className="card-head"><span className="card-title">Latest AI scans from operators</span></div>
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
              {scans.slice(0, 8).map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="cell-strong"><StatusBadge status={s.category} /></div>
                    <div className="cell-muted">{s.created_at ? new Date(s.created_at).toLocaleString() : ""}</div>
                  </td>
                  <td>{s.bin_name}</td>
                  <td style={{ maxWidth: 340 }}>{s.guidance || "—"}</td>
                  <td>{typeof s.confidence === "number" ? `${Math.round(s.confidence)}%` : s.confidence}</td>
                </tr>
              ))}
              {scans.length === 0 && !loading && (
                <tr><td colSpan={4} className="cell-muted" style={{ textAlign: "center", padding: 32 }}>No scans stored yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
