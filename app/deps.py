from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from .config import COOKIE_NAME
from .database import get_db
from .models import User
from .security import decode_token

DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(request: Request, db: DbSession) -> User | None:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        auth = request.headers.get("authorization", "")
        if auth.lower().startswith("bearer "):
            token = auth[7:]
    if not token:
        return None
    user_id = decode_token(token)
    if not user_id:
        return None
    return db.get(User, user_id)


def require_user(user: Annotated[User | None, Depends(get_current_user)]) -> User:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Please log in.")
    return user


def require_landlord(user: Annotated[User, Depends(require_user)]) -> User:
    if user.role not in ("landlord", "admin"):
        raise HTTPException(status_code=403, detail="Landlord account required.")
    return user


def require_tenant(user: Annotated[User, Depends(require_user)]) -> User:
    if user.role != "tenant":
        raise HTTPException(status_code=403, detail="Tenant account required.")
    return user


def require_admin(user: Annotated[User, Depends(require_user)]) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user


CurrentUser = Annotated[User | None, Depends(get_current_user)]
UserRequired = Annotated[User, Depends(require_user)]
LandlordRequired = Annotated[User, Depends(require_landlord)]
TenantRequired = Annotated[User, Depends(require_tenant)]
AdminRequired = Annotated[User, Depends(require_admin)]
