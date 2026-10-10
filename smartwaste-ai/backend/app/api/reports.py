from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user, require_management
from app.db.session import get_db
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportCreate, ReportOut, ReportStatusUpdate

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=list[ReportOut])
def list_reports(db: Session = Depends(get_db), _user: User = Depends(get_current_user)):
    """All rows from Postgres `reports` — no static data."""
    return list(db.scalars(select(Report).order_by(desc(Report.id))).all())


@router.post("", response_model=ReportOut, status_code=201)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    report = Report(
        code="TMP",
        category=payload.category.strip(),
        location=payload.location.strip(),
        weight_kg=payload.weight_kg,
        status=payload.status.strip() or "Pending",
        reporter=payload.reporter.strip(),
    )
    db.add(report)
    db.flush()
    report.code = f"WR-{1040 + report.id}"
    db.commit()
    db.refresh(report)
    return report


REPORT_STATUSES = ("Pending", "Scheduled", "In-Progress", "Collected", "Missed")


@router.patch("/{report_id}", response_model=ReportOut)
def update_status(
    report_id: int,
    payload: ReportStatusUpdate,
    db: Session = Depends(get_db),
    _manager: User = Depends(require_management),
):
    """Management sets the workflow status of a report."""
    if payload.status not in REPORT_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status must be one of {', '.join(REPORT_STATUSES)}")
    report = db.get(Report, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = payload.status
    db.commit()
    db.refresh(report)
    return report
