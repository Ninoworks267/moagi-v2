import os
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent.parent
WEB_DIST = BASE_DIR / "web" / "dist"


def _get(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


ENV = _get("ENV", "development").lower()
if ENV not in {"development", "test", "production"}:
    raise RuntimeError(f"ENV must be development, test or production (got {ENV!r}).")
IS_PROD = ENV == "production"

UPLOAD_DIR = Path(_get("UPLOAD_DIR") or BASE_DIR / "uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DEV_SECRET = "dev-secret-change-me-before-launch"

DATABASE_URL = _get("DATABASE_URL", f"sqlite:///{BASE_DIR / 'moagi.db'}")
# Some hosts hand out postgres://, which SQLAlchemy 1.4+ rejects.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql://" + DATABASE_URL[len("postgres://"):]

SECRET_KEY = _get("MOAGI_SECRET")
if not SECRET_KEY and not IS_PROD:
    SECRET_KEY = DEV_SECRET

COOKIE_NAME = "moagi_session"
SESSION_DAYS = 7

ALLOWED_ORIGINS = [o.strip().rstrip("/") for o in _get("ALLOWED_ORIGINS").split(",") if o.strip()]
# Optional: comma-separated Host headers the app will answer to (enables TrustedHostMiddleware).
TRUSTED_HOSTS = [h.strip() for h in _get("TRUSTED_HOSTS").split(",") if h.strip()]

SEED_DEMO = _get("SEED_DEMO", "false" if IS_PROD else "true").lower() == "true"

if IS_PROD:
    problems = []
    if len(SECRET_KEY) < 32 or SECRET_KEY == DEV_SECRET:
        problems.append("MOAGI_SECRET must be a random value of at least 32 characters.")
    if not ALLOWED_ORIGINS:
        problems.append("ALLOWED_ORIGINS must be set.")
    elif any(urlparse(o).scheme != "https" or not urlparse(o).netloc for o in ALLOWED_ORIGINS):
        problems.append("ALLOWED_ORIGINS entries must be full https:// origins.")
    if DATABASE_URL.startswith("sqlite"):
        problems.append("DATABASE_URL must point to PostgreSQL, not SQLite.")
    if SEED_DEMO:
        problems.append("SEED_DEMO must be false in production.")
    if problems:
        raise RuntimeError("Invalid production configuration:\n- " + "\n- ".join(problems))
