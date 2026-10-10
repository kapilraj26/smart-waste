from datetime import datetime

from pydantic import BaseModel


class CollectionCreate(BaseModel):
    title: str
    meta: str = ""
    due: str = ""
    status: str = "Scheduled"
    done: bool = False


class CollectionUpdate(BaseModel):
    title: str | None = None
    meta: str | None = None
    due: str | None = None
    status: str | None = None
    done: bool | None = None


class CollectionOut(BaseModel):
    id: int
    code: str
    title: str
    meta: str
    due: str
    status: str
    done: bool
    created_at: datetime

    class Config:
        from_attributes = True
