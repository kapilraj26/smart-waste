from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class WasteRecord(Base):
    """Postgres `waste_records` table — scanner classifications stored here."""

    __tablename__ = "waste_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category: Mapped[str] = mapped_column(String(50), index=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    bin_name: Mapped[str] = mapped_column(String(100), default="")
    image_path: Mapped[str] = mapped_column(String(255), default="")
    guidance: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[str] = mapped_column(Text, default="[]")  # JSON array string
    recyclable: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
