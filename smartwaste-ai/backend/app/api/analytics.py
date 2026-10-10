from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.collection import CollectionTask
from app.models.report import Report
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """Everything computed from Postgres — no hardcoded numbers."""
    total_reports = db.scalar(select(func.count(Report.id))) or 0
    total_kg = db.scalar(select(func.coalesce(func.sum(Report.weight_kg), 0.0))) or 0.0
    collected = db.scalar(select(func.count(Report.id)).where(Report.status == "Collected")) or 0
    active_reports = db.scalar(
        select(func.count(Report.id)).where(Report.status.notin_(["Collected", "Missed"]))
    ) or 0
    pickups_completed = collected
    diversion_rate = round((collected / total_reports * 100) if total_reports else 0, 1)

    # Last 7 days, per-day kg (fills missing days with 0 so chart never uses static data).
    now = datetime.now(timezone.utc)
    start = (now - timedelta(days=6)).date()
    rows = db.execute(
        select(
            func.date(Report.created_at).label("day"),
            func.coalesce(func.sum(Report.weight_kg), 0.0).label("kg"),
        )
        .where(func.date(Report.created_at) >= start)
        .group_by(func.date(Report.created_at))
    ).all()
    by_day = {str(r.day): float(r.kg) for r in rows}
    per_day = []
    for i in range(7):
        day = (now - timedelta(days=6 - i)).date()
        per_day.append(
            {
                "label": day.strftime("%a"),
                "date": str(day),
                "value": round(by_day.get(str(day), 0.0), 1),
            }
        )

    # Category mix from DB.
    cat_rows = db.execute(
        select(Report.category, func.count(Report.id)).group_by(Report.category)
    ).all()
    mix = [
        {
            "label": cat,
            "count": cnt,
            "pct": round(cnt / total_reports * 100, 1) if total_reports else 0,
        }
        for cat, cnt in cat_rows
    ]

    tasks_done = db.scalar(select(func.count(CollectionTask.id)).where(CollectionTask.done.is_(True))) or 0
    tasks_total = db.scalar(select(func.count(CollectionTask.id))) or 0

    return {
        "total_reports": total_reports,
        "total_kg": round(float(total_kg), 1),
        "pickups_completed": pickups_completed,
        "active_reports": active_reports,
        "diversion_rate": diversion_rate,
        "tasks_done": tasks_done,
        "tasks_total": tasks_total,
        "per_day": per_day,
        "mix": mix,
    }
