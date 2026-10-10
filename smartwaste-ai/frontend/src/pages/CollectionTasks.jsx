import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";

const TASKS = [
  { id: "CT-211", title: "Sector 9 morning route", meta: "Bins A-01 to A-20 · Crew B · 12 stops", due: "Today, 12:00", status: "Completed", done: true },
  { id: "CT-210", title: "Depot 2 e-waste pickup", meta: "Commercial · Crew A · Truck 4", due: "Today, 14:30", status: "In-Progress", done: false },
  { id: "CT-209", title: "Sector 4 organic round", meta: "Bins C-01 to C-15 · Crew C · 15 stops", due: "Today, 16:00", status: "Scheduled", done: false },
  { id: "CT-208", title: "Sector 1 paper collection", meta: "Bins B-01 to B-10 · Crew B · 10 stops", due: "Tomorrow, 09:00", status: "Scheduled", done: false },
  { id: "CT-207", title: "Sector 6 glass pickup", meta: "Bins D-01 to D-12 · Crew A · 12 stops", due: "Yesterday, 17:00", status: "Missed", done: false },
];

export default function CollectionTasks() {
  const done = TASKS.filter((t) => t.done).length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Collection Tasks</div>
          <div className="page-sub">{done} of {TASKS.length} tasks completed</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary"><Icon name="plus" size={16} /> Assign task</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-pad">
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
            <span className="cell-strong">Daily completion</span>
            <span className="cell-muted">{Math.round((done / TASKS.length) * 100)}%</span>
          </div>
          <div className="progress"><div style={{ width: `${(done / TASKS.length) * 100}%` }} /></div>
        </div>
      </div>

      <div className="card">
        <div className="task-list">
          {TASKS.map((t) => (
            <div className="task-row" key={t.id}>
              <span className={`task-check${t.done ? " done" : ""}`}>
                {t.done && <Icon name="check" size={13} strokeWidth={3} />}
              </span>
              <div className="task-main">
                <div className="task-title">{t.title}</div>
                <div className="task-meta">{t.id} &middot; {t.meta}</div>
              </div>
              <div className="task-meta" style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                  <Icon name="clock" size={14} /> {t.due}
                </div>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
