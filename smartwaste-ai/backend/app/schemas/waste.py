from datetime import datetime

from pydantic import BaseModel


class WasteClassifyOut(BaseModel):
    id: int
    category: str
    confidence: float
    bin_name: str
    created_at: datetime

    class Config:
        from_attributes = True
