import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
WEB_DIST = BASE_DIR / "web" / "dist"
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ENV = os.getenv("ENV", "development")
IS_PROD = ENV == "production"

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'moagi.db'}")
SECRET_KEY = os.getenv("MOAGI_SECRET", "")
if not SECRET_KEY and not IS_PROD:
    SECRET_KEY = "dev-secret-change-me-before-launch"
COOKIE_NAME = "moagi_session"
SESSION_DAYS = 7
ALLOWED_ORIGINS = [o for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o]
SEED_DEMO = os.getenv("SEED_DEMO", "true" if not IS_PROD else "false").lower() == "true"

if IS_PROD:
    if not SECRET_KEY or SECRET_KEY in ("dev-secret-change-me-before-launch", "dev-secret-change-me"):
        raise RuntimeError("MOAGI_SECRET must be set to a strong value in production.")
    if len(SECRET_KEY) < 32:
        raise RuntimeError("MOAGI_SECRET must be at least 32 characters in production.")
    if not ALLOWED_ORIGINS:
        raise RuntimeError("ALLOWED_ORIGINS must be set in production.")
