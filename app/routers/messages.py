from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlalchemy import and_, or_

from ..deps import DbSession, UserRequired
from ..models import Message, User
from ..schemas import MessageIn, MessageOut, ThreadDetail, ThreadOut, UserPublic

router = APIRouter(prefix="/api/messages", tags=["messages"])


def _other_id(msg: Message, me: int) -> int:
    return msg.recipient_id if msg.sender_id == me else msg.sender_id


@router.get("/threads", response_model=list[ThreadOut])
def threads(db: DbSession, user: UserRequired):
    rows = (
        db.query(Message)
        .filter(or_(Message.sender_id == user.id, Message.recipient_id == user.id))
        .order_by(Message.created_at.desc())
        .all()
    )
    latest: dict[int, Message] = {}
    for msg in rows:
        other = _other_id(msg, user.id)
        latest.setdefault(other, msg)

    unread_rows = (
        db.query(Message.sender_id, Message.id)
        .filter(Message.recipient_id == user.id, Message.read_at.is_(None))
        .all()
    )
    unread: dict[int, int] = {}
    for sender_id, _ in unread_rows:
        unread[sender_id] = unread.get(sender_id, 0) + 1

    result = []
    for other_id, msg in latest.items():
        other = db.get(User, other_id)
        if not other:
            continue
        result.append(
            ThreadOut(
                user=UserPublic.model_validate(other),
                last_message=msg.body,
                last_at=msg.created_at,
                unread=unread.get(other_id, 0),
            )
        )
    result.sort(key=lambda t: t.last_at, reverse=True)
    return result


@router.get("/unread", response_model=dict)
def unread_count(db: DbSession, user: UserRequired):
    count = (
        db.query(Message)
        .filter(Message.recipient_id == user.id, Message.read_at.is_(None))
        .count()
    )
    return {"unread": count}


@router.get("/{other_id}", response_model=ThreadDetail)
def thread(other_id: int, db: DbSession, user: UserRequired):
    other = db.get(User, other_id)
    if not other:
        raise HTTPException(404, "User not found.")
    rows = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == user.id, Message.recipient_id == other_id),
                and_(Message.sender_id == other_id, Message.recipient_id == user.id),
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )
    now = datetime.now(timezone.utc)
    changed = False
    for msg in rows:
        if msg.recipient_id == user.id and msg.read_at is None:
            msg.read_at = now
            changed = True
    if changed:
        db.commit()
    return ThreadDetail(
        user=UserPublic.model_validate(other),
        messages=[MessageOut.model_validate(m) for m in rows],
    )


@router.post("/{other_id}", response_model=MessageOut, status_code=201)
def send_message(other_id: int, data: MessageIn, db: DbSession, user: UserRequired):
    if other_id == user.id:
        raise HTTPException(400, "You cannot message yourself.")
    other = db.get(User, other_id)
    if not other:
        raise HTTPException(404, "User not found.")
    msg = Message(sender_id=user.id, recipient_id=other_id, body=data.body.strip())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
