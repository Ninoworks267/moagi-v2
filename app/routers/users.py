from fastapi import APIRouter, HTTPException
from sqlalchemy import func

from urllib.parse import urlparse

from ..deps import CurrentUser, DbSession, UserRequired
from ..models import Property, Review, User
from ..schemas import ProfileUpdate, ReviewOut, UserPrivate, UserPublic
from ..serializers import property_out

from urllib.parse import urlparse

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/{user_id}", response_model=dict)
def public_profile(user_id: int, db: DbSession, user: CurrentUser):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(404, "User not found.")
    props = (
        db.query(Property)
        .filter(Property.landlord_id == user_id, Property.status == "active")
        .order_by(Property.created_at.desc())
        .all()
    )
    reviews = (
        db.query(Review)
        .filter(Review.landlord_id == user_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    avg = db.query(func.avg(Review.rating)).filter(Review.landlord_id == user_id).scalar()
    return {
        "user": UserPublic.model_validate(target),
        "properties": [
            property_out(db, p, user.id if user else None) for p in props
        ],
        "reviews": [ReviewOut.model_validate(r) for r in reviews],
        "stats": {
            "listings": len(props),
            "reviews": len(reviews),
            "rating": round(float(avg), 1) if avg else None,
        },
        "is_me": bool(user and user.id == target.id),
    }


@router.patch("/me", response_model=UserPrivate)
def update_me(data: ProfileUpdate, db: DbSession, user: UserRequired):
    payload = data.model_dump(exclude_unset=True)
    if "avatar_url" in payload and payload["avatar_url"]:
        value = payload["avatar_url"].strip()
        parsed = urlparse(value)
        if value.startswith("/uploads/"):
            pass
        elif parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise HTTPException(400, "Avatar URL must be an http(s) URL or uploaded image.")
        payload["avatar_url"] = value
    for key, value in payload.items():
        if value is not None:
            if isinstance(value, str):
                setattr(user, key, value.strip())
            else:
                setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
