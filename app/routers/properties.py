from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import or_

from ..deps import CurrentUser, DbSession, LandlordRequired
from ..models import Property
from ..schemas import PropertyIn, PropertyList, PropertyOut
from ..serializers import property_out

router = APIRouter(prefix="/api/properties", tags=["properties"])

SORTS = {
    "newest": (Property.created_at.desc(), Property.id.desc()),
    "price_asc": (Property.price.asc(),),
    "price_desc": (Property.price.desc(),),
    "bedrooms": (Property.bedrooms.desc(), Property.price.asc()),
}


@router.get("", response_model=PropertyList)
def list_properties(
    db: DbSession,
    user: CurrentUser,
    q: str = "",
    city: str = "",
    property_type: str = "",
    category: str = "",
    min_price: float | None = None,
    max_price: float | None = None,
    bedrooms: int | None = None,
    bathrooms: int | None = None,
    furnished: bool | None = None,
    sort: str = "newest",
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=48),
):
    query = db.query(Property).filter(Property.status == "active")
    if q.strip():
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Property.title.ilike(like),
                Property.location.ilike(like),
                Property.description.ilike(like),
                Property.city.ilike(like),
            )
        )
    if city.strip():
        query = query.filter(Property.city.ilike(f"%{city.strip()}%"))
    if property_type.strip():
        query = query.filter(Property.property_type == property_type.strip())
    if category.strip() and category.strip() != "all":
        query = query.filter(Property.category == category.strip())
    if min_price is not None:
        query = query.filter(Property.price >= min_price)
    if max_price is not None:
        query = query.filter(Property.price <= max_price)
    if bedrooms is not None:
        query = query.filter(Property.bedrooms >= bedrooms)
    if bathrooms is not None:
        query = query.filter(Property.bathrooms >= bathrooms)
    if furnished is not None:
        query = query.filter(Property.furnished == furnished)

    total = query.count()
    query = query.order_by(*SORTS.get(sort, SORTS["newest"]))
    rows = query.offset((page - 1) * page_size).limit(page_size).all()
    uid = user.id if user else None
    return PropertyList(
        items=[property_out(db, p, uid) for p in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/mine", response_model=list[PropertyOut])
def my_properties(db: DbSession, user: LandlordRequired):
    rows = (
        db.query(Property)
        .filter(Property.landlord_id == user.id)
        .order_by(Property.created_at.desc())
        .all()
    )
    return [property_out(db, p, user.id) for p in rows]


@router.get("/{property_id}", response_model=PropertyOut)
def get_property(property_id: int, db: DbSession, user: CurrentUser):
    prop = db.get(Property, property_id)
    if not prop:
        raise HTTPException(404, "Property not found.")
    if prop.status != "active" and not (user and (user.id == prop.landlord_id or user.role == "admin")):
        raise HTTPException(404, "Property not found.")
    return property_out(db, prop, user.id if user else None)


@router.post("", response_model=PropertyOut, status_code=201)
def create_property(data: PropertyIn, db: DbSession, user: LandlordRequired):
    payload = data.model_dump()
    if user.role != "admin":
        payload["featured"] = False
    prop = Property(landlord_id=user.id, **payload)
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return property_out(db, prop, user.id)


@router.patch("/{property_id}", response_model=PropertyOut)
def update_property(property_id: int, data: PropertyIn, db: DbSession, user: LandlordRequired):
    prop = db.get(Property, property_id)
    if not prop:
        raise HTTPException(404, "Property not found.")
    if prop.landlord_id != user.id and user.role != "admin":
        raise HTTPException(403, "You can only edit your own listings.")
    payload = data.model_dump()
    if user.role != "admin":
        payload["featured"] = False
    for key, value in payload.items():
        setattr(prop, key, value)
    db.commit()
    db.refresh(prop)
    return property_out(db, prop, user.id)


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(property_id: int, db: DbSession, user: LandlordRequired):
    prop = db.get(Property, property_id)
    if not prop:
        raise HTTPException(404, "Property not found.")
    if prop.landlord_id != user.id and user.role != "admin":
        raise HTTPException(403, "You can only remove your own listings.")
    db.delete(prop)
    db.commit()
