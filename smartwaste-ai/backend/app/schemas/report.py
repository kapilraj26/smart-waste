from datetime import datetime

from pydantic import BaseModel


class ReportCreate(BaseModel):
    category: str
    location: str
    weight_kg: float = 0.0
    status: str = "Pending"
    reporter: str = ""


class ReportStatusUpdate(BaseModel):
    status: str


class ReportOut(BaseModel):
    id: int
    code: str
    category: str
    location: str
    weight_kg: float
    status: str
    reporter: str
    created_at: datetime

    class Config:
        from_attributes = True
