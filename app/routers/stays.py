from fastapi import APIRouter, HTTPException
from sqlalchemy import or_

from ..deps import DbSession
from ..models import Stay
from ..schemas import StayOut

router = APIRouter(prefix="/api/stays", tags=["stays"])


@router.get("", response_model=list[StayOut])
def list_stays(db: DbSession, q: str = "", stay_type: str = "", city: str = ""):
    query = db.query(Stay)
    if q.strip():
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(Stay.title.ilike(like), Stay.location.ilike(like), Stay.description.ilike(like))
        )
    if stay_type.strip():
        query = query.filter(Stay.stay_type == stay_type.strip())
    if city.strip():
        query = query.filter(Stay.city.ilike(f"%{city.strip()}%"))
    return query.order_by(Stay.id.desc()).all()


@router.get("/{stay_id}", response_model=StayOut)
def get_stay(stay_id: int, db: DbSession):
    stay = db.get(Stay, stay_id)
    if not stay:
        raise HTTPException(404, "Stay not found.")
    return stay
