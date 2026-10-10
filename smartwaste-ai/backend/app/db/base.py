from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models here so Base.metadata.create_all() sees every table.
from app.models import user  # noqa: F401,E402
