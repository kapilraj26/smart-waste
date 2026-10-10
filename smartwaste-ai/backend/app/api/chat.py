import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import asc
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.chat import ChatMessage
from app.models.user import User
from app.schemas.chat import ChatMessageOut, ChatRequest, ChatResponse
from app.services import ollama_service

router = APIRouter(prefix="/chat", tags=["chat"])

HISTORY_LIMIT = 20


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Chat with the local Ollama assistant. History persists in Postgres."""
    session_id = payload.session_id or uuid.uuid4().hex

    db.add(ChatMessage(session_id=session_id, role="user", content=payload.message.strip()))
    db.commit()

    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(asc(ChatMessage.id))
        .all()[-HISTORY_LIMIT:]
    )
    try:
        reply = ollama_service.chat_reply(
            [{"role": m.role, "content": m.content} for m in history]
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    db.add(ChatMessage(session_id=session_id, role="assistant", content=reply))
    db.commit()

    return ChatResponse(reply=reply, session_id=session_id, model=ollama_service.settings.OLLAMA_MODEL)


@router.get("/history", response_model=list[ChatMessageOut])
def history(
    session_id: str,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """Load a persisted conversation (Postgres `chat_messages`)."""
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(asc(ChatMessage.id))
        .limit(200)
        .all()
    )
