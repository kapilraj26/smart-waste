"""Seed local SQLite DB with demo user + sample reports/tasks (mirrors database/seed.sql)."""
from datetime import datetime, timedelta, timezone

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.collection import CollectionTask
from app.models.report import Report
from app.models.user import User

Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    if not db.query(User).filter(User.email == "demo@smartwaste.ai").first():
        db.add(User(name="Demo User", email="demo@smartwaste.ai",
                    hashed_password=hash_password("demo1234")))
    now = datetime.now(timezone.utc)
    reports = [
        ("WR-1042", "Plastic", "Sector 9, Bin A-12", 4.2, "Collected", "A. Khan", 2),
        ("WR-1041", "Organic", "Sector 4, Bin C-03", 7.8, "Scheduled", "S. Malik", 4),
        ("WR-1040", "E-Waste", "Sector 9, Depot 2", 2.1, "In-Progress", "R. Ahmed", 24),
        ("WR-1039", "Paper", "Sector 1, Bin B-07", 3.5, "Pending", "F. Iqbal", 28),
        ("WR-1038", "Glass", "Sector 6, Bin D-11", 5.0, "Collected", "A. Khan", 48),
        ("WR-1037", "Metal", "Sector 2, Depot 1", 6.3, "Missed", "S. Malik", 52),
    ]
    for code, cat, loc, kg, status, reporter, hours_ago in reports:
        if not db.query(Report).filter(Report.code == code).first():
            db.add(Report(code=code, category=cat, location=loc, weight_kg=kg,
                          status=status, reporter=reporter,
                          created_at=now - timedelta(hours=hours_ago)))
    tasks = [
        ("CT-211", "Sector 9 morning route", "Bins A-01 to A-20 · Crew B · 12 stops", "Today, 12:00", "Completed", True),
        ("CT-210", "Depot 2 e-waste pickup", "Commercial · Crew A · Truck 4", "Today, 14:30", "In-Progress", False),
        ("CT-209", "Sector 4 organic round", "Bins C-01 to C-15 · Crew C · 15 stops", "Today, 16:00", "Scheduled", False),
        ("CT-208", "Sector 1 paper collection", "Bins B-01 to B-10 · Crew B · 10 stops", "Tomorrow, 09:00", "Scheduled", False),
        ("CT-207", "Sector 6 glass pickup", "Bins D-01 to D-12 · Crew A · 12 stops", "Yesterday, 17:00", "Missed", False),
    ]
    for code, title, meta, due, status, done in tasks:
        if not db.query(CollectionTask).filter(CollectionTask.code == code).first():
            db.add(CollectionTask(code=code, title=title, meta=meta, due=due,
                                  status=status, done=done))
    db.commit()
    print(f"SEED_OK users={db.query(User).count()} reports={db.query(Report).count()} tasks={db.query(CollectionTask).count()}")
finally:
    db.close()
