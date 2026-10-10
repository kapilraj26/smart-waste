from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.collection import CollectionTask
from app.models.user import User
from app.schemas.collection import CollectionCreate, CollectionOut, CollectionUpdate

router = APIRouter(prefix="/collections", tags=["collections"])


@router.get("", response_model=list[CollectionOut])
def list_collections(
    db: Session = Depends(get_db), _user: User = Depends(get_current_user)
):
    """All rows from Postgres `collection_tasks` — no static data."""
    return list(db.scalars(select(CollectionTask).order_by(desc(CollectionTask.id))).all())


@router.post("", response_model=CollectionOut, status_code=201)
def create_collection(
    payload: CollectionCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    task = CollectionTask(
        code="TMP",
        title=payload.title.strip(),
        meta=payload.meta.strip(),
        due=payload.due.strip(),
        status=payload.status.strip() or "Scheduled",
        done=payload.done,
    )
    db.add(task)
    db.flush()
    task.code = f"CT-{200 + task.id}"
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=CollectionOut)
def update_collection(
    task_id: int,
    payload: CollectionUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    task = db.get(CollectionTask, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(task)
    return task
