import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import { listCollections } from "../services/collectionService";

export default function CollectionTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await listCollections();
        if (alive) setTasks(data);
      } catch {
        if (alive) setError("Could not load collection tasks from the database.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Collection Tasks</div>
          <div className="page-sub">{loading ? "Loading..." : `${done} of ${tasks.length} tasks completed`}</div>
        </div>
      </div>

      {error && <div className="card card-pad" style={{ color: "var(--warn)", marginBottom: 16 }}>{error}</div>}

      {loading && <div className="cell-muted" style={{ padding: "12px 0" }}>Loading database data...</div>}

      {!loading && tasks.length === 0 && !error && (
        <div className="card card-pad cell-muted">No collection tasks in the database yet.</div>
      )}

      {!loading && tasks.length > 0 && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-pad">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                <span className="cell-strong">Daily completion</span>
                <span className="cell-muted">{pct}%</span>
              </div>
              <div className="progress"><div style={{ width: `${pct}%` }} /></div>
            </div>
          </div>

          <div className="card">
            <div className="task-list">
              {tasks.map((t) => (
                <div className="task-row" key={t.code}>
                  <span className={`task-check${t.done ? " done" : ""}`}>
                    {t.done && <Icon name="check" size={13} strokeWidth={3} />}
                  </span>
                  <div className="task-main">
                    <div className="task-title">{t.title}</div>
                    <div className="task-meta">{t.code} &middot; {t.meta}</div>
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
        </>
      )}
    </div>
  );
}
