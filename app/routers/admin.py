import logging

from fastapi import APIRouter
from sqlalchemy import func

from ..deps import AdminRequired, DbSession
from ..models import Booking, Message, Property, Report, Review, Stay, User
from ..schemas import UserPrivate

logger = logging.getLogger("moagi.security")

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def stats(db: DbSession, user: AdminRequired):
    return {
        "users": db.query(User).count(),
        "landlords": db.query(User).filter(User.role == "landlord").count(),
        "tenants": db.query(User).filter(User.role == "tenant").count(),
        "properties": db.query(Property).count(),
        "stays": db.query(Stay).count(),
        "bookings": db.query(Booking).count(),
        "reviews": db.query(Review).count(),
        "open_reports": db.query(Report).filter(Report.status == "open").count(),
        "unread_messages": db.query(Message).filter(Message.read_at.is_(None)).count(),
        "booking_value": round(
            db.query(func.coalesce(func.sum(Booking.total), 0)).scalar() or 0, 2
        ),
    }


@router.get("/users", response_model=list[UserPrivate])
def list_users(db: DbSession, user: AdminRequired, q: str = ""):
    query = db.query(User)
    if q.strip():
        like = f"%{q.strip()}%"
        query = query.filter(
            (User.first_name.ilike(like))
            | (User.surname.ilike(like))
            | (User.email.ilike(like))
        )
    return query.order_by(User.created_at.desc()).all()


@router.get("/properties")
def list_all_properties(db: DbSession, user: AdminRequired):
    rows = db.query(Property).order_by(Property.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "location": p.location,
            "status": p.status,
            "landlord": f"{p.landlord.first_name} {p.landlord.surname}",
            "created_at": p.created_at,
        }
        for p in rows
    ]
