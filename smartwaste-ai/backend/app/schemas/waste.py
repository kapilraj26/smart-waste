from datetime import datetime

from pydantic import BaseModel, Field


class WasteClassifyOut(BaseModel):
    id: int
    category: str
    confidence: float
    bin_name: str
    guidance: str = ""
    details: list[str] = []
    recyclable: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class WasteAnalysis(BaseModel):
    category: str
    confidence: int = Field(ge=0, le=100)
    bin: str
    guidance: str
    details: list[str] = []
    recyclable: bool = False
    model: str = ""
    mode: str = ""
