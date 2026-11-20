import logging

from fastapi import APIRouter, HTTPException, Request, Response, status
from sqlalchemy import func

from ..config import IS_PROD
from ..deps import CurrentUser, DbSession, UserRequired
from ..models import User
from ..schemas import LoginIn, RegisterIn, UserPrivate, UserPublic
from ..ratelimit import clear_failures, rate_limit, record_failure
from ..security import (
    clear_session_cookie,
    create_token,
    hash_password,
    set_session_cookie,
    verify_password,
)

logger = logging.getLogger("moagi.security")

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserPrivate, status_code=201)
def register(data: RegisterIn, request: Request, response: Response, db: DbSession):
    rate_limit(request, "register")
    email = data.email.lower().strip()
    exists = db.query(User.id).filter(func.lower(User.email) == email).first()
    if exists:
        raise HTTPException(status_code=409, detail="That email is already registered.")
    user = User(
        first_name=data.first_name.strip(),
        surname=data.surname.strip(),
        email=email,
        phone=data.phone.strip(),
        password_hash=hash_password(data.password),
        role=data.role,
        location=data.location.strip(),
        citizenship=data.citizenship.strip() or "Botswana",
        gender=data.gender or None,
        bio="",
        avatar_url=f"https://api.dicebear.com/9.x/notionists/svg?seed={data.first_name}%20{data.surname}",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    set_session_cookie(response, create_token(user.id), IS_PROD)
    return user


@router.post("/login", response_model=UserPrivate)
def login(data: LoginIn, request: Request, response: Response, db: DbSession):
    rate_limit(request, "login")
    user = (
        db.query(User)
        .filter(func.lower(User.email) == data.email.lower().strip())
        .first()
    )
    if not user or not verify_password(data.password, user.password_hash):
        logger.warning("failed_login email=%s ip=%s", data.email, request.client.host if request.client else "unknown")
        record_failure(request, "login")
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    clear_failures(request, "login")
    set_session_cookie(response, create_token(user.id), IS_PROD)
    return user


@router.post("/logout", status_code=204)
def logout(response: Response):
    clear_session_cookie(response)
    return Response(status_code=204)


@router.get("/me", response_model=UserPrivate)
def me(user: UserRequired):
    return user


@router.get("/check", response_model=UserPublic | None)
def check(user: CurrentUser):
    return user
