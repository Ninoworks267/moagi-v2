from sqlalchemy import func
from sqlalchemy.orm import Session

from .models import Favorite, Property, Review
from .schemas import PropertyOut


def property_out(db: Session, prop: Property, user_id: int | None = None) -> PropertyOut:
    is_favorite = False
    if user_id:
        is_favorite = (
            db.query(Favorite.id)
            .filter(Favorite.user_id == user_id, Favorite.property_id == prop.id)
            .first()
            is not None
        )
    avg, count = (
        db.query(func.avg(Review.rating), func.count(Review.id))
        .filter(Review.property_id == prop.id)
        .one()
    )
    data = PropertyOut.model_validate(prop)
    return data.model_copy(
        update={
            "is_favorite": is_favorite,
            "review_rating": round(float(avg), 1) if avg else None,
            "review_count": count,
        }
    )
