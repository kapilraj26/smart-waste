from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models here so Base.metadata.create_all() sees every table.
from app.models import chat, collection, report, user, waste  # noqa: F401,E402
