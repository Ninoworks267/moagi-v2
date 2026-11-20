import secrets
from datetime import date

from fastapi import APIRouter, HTTPException

from ..deps import DbSession, TenantRequired
from ..models import Booking, Stay
from ..schemas import BookingIn, BookingOut

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(data: BookingIn, db: DbSession, user: TenantRequired):
    stay = db.get(Stay, data.stay_id)
    if not stay:
        raise HTTPException(404, "Stay not found.")
    try:
        checkin = date.fromisoformat(data.checkin)
        checkout = date.fromisoformat(data.checkout)
    except ValueError:
        raise HTTPException(400, "Please provide valid check-in and check-out dates.")
    nights = (checkout - checkin).days
    if nights < 1:
        raise HTTPException(400, "Check-out must be after check-in.")
    reference = "MGG-" + secrets.token_hex(4).upper()
    booking = Booking(
        stay_id=stay.id,
        user_id=user.id,
        checkin=data.checkin,
        checkout=data.checkout,
        guests=data.guests,
        nights=nights,
        total=round(nights * stay.price, 2),
        phone=data.phone.strip(),
        method=data.method,
        reference=reference,
        status="confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/mine", response_model=list[BookingOut])
def my_bookings(db: DbSession, user: TenantRequired):
    return (
        db.query(Booking)
        .filter(Booking.user_id == user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
