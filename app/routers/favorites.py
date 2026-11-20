from fastapi import APIRouter

from ..deps import DbSession, TenantRequired
from ..models import Favorite, Property
from ..schemas import PropertyOut
from ..serializers import property_out

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.get("", response_model=list[PropertyOut])
def list_favorites(db: DbSession, user: TenantRequired):
    rows = (
        db.query(Property)
        .join(Favorite, Favorite.property_id == Property.id)
        .filter(Favorite.user_id == user.id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    return [property_out(db, p, user.id) for p in rows]


@router.post("/{property_id}", status_code=204)
def add_favorite(property_id: int, db: DbSession, user: TenantRequired):
    if not db.get(Property, property_id):
        return
    existing = (
        db.query(Favorite)
        .filter(Favorite.user_id == user.id, Favorite.property_id == property_id)
        .first()
    )
    if not existing:
        db.add(Favorite(user_id=user.id, property_id=property_id))
        db.commit()


@router.delete("/{property_id}", status_code=204)
def remove_favorite(property_id: int, db: DbSession, user: TenantRequired):
    db.query(Favorite).filter(
        Favorite.user_id == user.id, Favorite.property_id == property_id
    ).delete()
    db.commit()
