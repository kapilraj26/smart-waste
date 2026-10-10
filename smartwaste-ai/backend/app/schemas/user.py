from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True
