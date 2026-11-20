from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError

from ..deps import DbSession, TenantRequired
from ..models import Property, Review, User
from ..schemas import ReviewIn, ReviewOut

router = APIRouter(prefix="/api", tags=["reviews"])


@router.get("/users/{user_id}/reviews", response_model=list[ReviewOut])
def list_reviews(user_id: int, db: DbSession):
    return (
        db.query(Review)
        .filter(Review.landlord_id == user_id)
        .order_by(Review.created_at.desc())
        .all()
    )


@router.post("/users/{landlord_id}/reviews", response_model=ReviewOut, status_code=201)
def create_review(landlord_id: int, data: ReviewIn, db: DbSession, user: TenantRequired):
    landlord = db.get(User, landlord_id)
    if not landlord or landlord.role not in ("landlord", "admin"):
        raise HTTPException(404, "Landlord not found.")
    if landlord.id == user.id:
        raise HTTPException(400, "You cannot review yourself.")
    if data.property_id:
        prop = db.get(Property, data.property_id)
        if not prop or prop.landlord_id != landlord_id:
            raise HTTPException(400, "That property does not belong to this landlord.")
    review = Review(
        landlord_id=landlord_id,
        author_id=user.id,
        property_id=data.property_id,
        rating=data.rating,
        comment=data.comment.strip(),
    )
    db.add(review)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "You have already reviewed this landlord.")
    db.refresh(review)
    return review
