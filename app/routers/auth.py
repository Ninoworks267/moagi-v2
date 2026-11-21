import hashlib
import logging
from urllib.parse import quote

from fastapi import APIRouter, HTTPException, Request, Response
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

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

# Roles a visitor may pick for themselves. Never allow "admin" (or any staff role) here.
SELF_SERVICE_ROLES = {"tenant", "landlord"}

# Verified against when the email is unknown so response time doesn't reveal which emails exist.
_DUMMY_HASH = hash_password("not-a-real-password-for-timing")


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _email_tag(email: str) -> str:
    # Log a short digest instead of raw user input (avoids log injection and PII in logs).
    return hashlib.sha256(email.encode()).hexdigest()[:12]


@router.post("/register", response_model=UserPrivate, status_code=201)
def register(data: RegisterIn, request: Request, response: Response, db: DbSession):
    rate_limit(request, "register")
    if data.role not in SELF_SERVICE_ROLES:
        raise HTTPException(status_code=400, detail="Invalid account type.")
    email = data.email.lower().strip()
    exists = db.query(User.id).filter(func.lower(User.email) == email).first()
    if exists:
        raise HTTPException(status_code=409, detail="That email is already registered.")
    first = data.first_name.strip()
    last = data.surname.strip()
    user = User(
        first_name=first,
        surname=last,
        email=email,
        phone=data.phone.strip(),
        password_hash=hash_password(data.password),
        role=data.role,
        location=data.location.strip(),
        citizenship=data.citizenship.strip() or "Botswana",
        gender=data.gender or None,
        bio="",
        avatar_url=f"https://api.dicebear.com/9.x/notionists/svg?seed={quote(first + ' ' + last, safe='')}",
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="That email is already registered.")
    db.refresh(user)
    set_session_cookie(response, create_token(user.id), IS_PROD)
    return user


@router.post("/login", response_model=UserPrivate)
def login(data: LoginIn, request: Request, response: Response, db: DbSession):
    rate_limit(request, "login")
    email = data.email.lower().strip()
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if user:
        valid = verify_password(data.password, user.password_hash)
    else:
        verify_password(data.password, _DUMMY_HASH)
        valid = False
    if not valid:
        logger.warning("failed_login email_tag=%s ip=%s", _email_tag(email), _client_ip(request))
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
