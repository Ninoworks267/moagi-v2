from fastapi import APIRouter
from sqlalchemy import func

from ..deps import DbSession, UserRequired
from ..models import Booking, Favorite, Message, Property, Review
from ..schemas import UserPrivate
from ..serializers import property_out

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard")
def dashboard(db: DbSession, user: UserRequired):
    unread = (
        db.query(Message)
        .filter(Message.recipient_id == user.id, Message.read_at.is_(None))
        .count()
    )
    payload = {
        "user": UserPrivate.model_validate(user),
        "unread_messages": unread,
        "stats": {},
        "listings": [],
        "favorites": [],
        "bookings": [],
        "reviews": [],
    }

    if user.role in ("landlord", "admin"):
        listings = (
            db.query(Property)
            .filter(Property.landlord_id == user.id)
            .order_by(Property.created_at.desc())
            .all()
        )
        avg, count = (
            db.query(func.avg(Review.rating), func.count(Review.id))
            .filter(Review.landlord_id == user.id)
            .one()
        )
        payload["listings"] = [property_out(db, p, user.id) for p in listings]
        payload["stats"] = {
            "listings": len(listings),
            "active": len([p for p in listings if p.status == "active"]),
            "reviews": count,
            "rating": round(float(avg), 1) if avg else None,
            "monthly_value": round(sum(p.price for p in listings), 2),
        }
        payload["reviews"] = (
            db.query(Review)
            .filter(Review.landlord_id == user.id)
            .order_by(Review.created_at.desc())
            .limit(5)
            .all()
        )
    else:
        favorites = (
            db.query(Property)
            .join(Favorite, Favorite.property_id == Property.id)
            .filter(Favorite.user_id == user.id)
            .all()
        )
        bookings = (
            db.query(Booking)
            .filter(Booking.user_id == user.id)
            .order_by(Booking.created_at.desc())
            .all()
        )
        reviews = (
            db.query(Review)
            .filter(Review.author_id == user.id)
            .order_by(Review.created_at.desc())
            .all()
        )
        payload["favorites"] = [property_out(db, p, user.id) for p in favorites]
        payload["bookings"] = bookings
        payload["reviews"] = reviews
        payload["stats"] = {
            "favorites": len(favorites),
            "bookings": len(bookings),
            "reviews": len(reviews),
        }
    return payload
