import { useState } from "react";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import WasteCard from "../components/WasteCard";

const REPORTS = [
  { id: "WR-1042", category: "Plastic", location: "Sector 9, Bin A-12", weight: "4.2 kg", status: "Collected", reportedAt: "Today, 09:41", reporter: "A. Khan" },
  { id: "WR-1041", category: "Organic", location: "Sector 4, Bin C-03", weight: "7.8 kg", status: "Scheduled", reportedAt: "Today, 08:15", reporter: "S. Malik" },
  { id: "WR-1040", category: "E-Waste", location: "Sector 9, Depot 2", weight: "2.1 kg", status: "In-Progress", reportedAt: "Yesterday, 16:02", reporter: "R. Ahmed" },
  { id: "WR-1039", category: "Paper", location: "Sector 1, Bin B-07", weight: "3.5 kg", status: "Pending", reportedAt: "Yesterday, 11:26", reporter: "F. Iqbal" },
  { id: "WR-1038", category: "Glass", location: "Sector 6, Bin D-11", weight: "5.0 kg", status: "Collected", reportedAt: "Oct 8, 15:44", reporter: "A. Khan" },
  { id: "WR-1037", category: "Metal", location: "Sector 2, Depot 1", weight: "6.3 kg", status: "Missed", reportedAt: "Oct 8, 10:05", reporter: "S. Malik" },
];

export default function WasteReports() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const rows = REPORTS.filter(
    (r) =>
      (status === "all" || r.status.toLowerCase() === status) &&
      `${r.id} ${r.category} ${r.location}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Waste Reports</div>
          <div className="page-sub">{rows.length} of {REPORTS.length} reports shown</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary"><Icon name="plus" size={16} /> New report</button>
        </div>
      </div>

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
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="cell-strong">{r.id}</div>
                    <div className="cell-muted">{r.location} &middot; {r.reportedAt}</div>
                  </td>
                  <td>{r.category}</td>
                  <td>{r.weight}</td>
                  <td>{r.reporter}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="cell-muted" style={{ textAlign: "center", padding: 32 }}>No reports match the current filters.</td></tr>
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
