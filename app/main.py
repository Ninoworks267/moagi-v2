from contextlib import asynccontextmanager
from urllib.parse import urlparse

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from .config import ALLOWED_ORIGINS, IS_PROD, SEED_DEMO, TRUSTED_HOSTS, UPLOAD_DIR, WEB_DIST
from .database import Base, SessionLocal, engine
from .routers import (
    admin,
    auth,
    bookings,
    dashboard,
    favorites,
    messages,
    properties,
    reports,
    reviews,
    stays,
    uploads,
    users,
)
from .seed import seed


def _dev_add_category_column() -> None:
    """Dev-only shim for old local SQLite files. Production uses Alembic migrations."""
    inspector = inspect(engine)
    if "properties" in inspector.get_table_names():
        existing = {column["name"] for column in inspector.get_columns("properties")}
        if "category" not in existing:
            with engine.begin() as connection:
                connection.execute(
                    text("ALTER TABLE properties ADD COLUMN category VARCHAR(40) DEFAULT 'all'")
                )


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not IS_PROD:
        # In production the schema is owned by Alembic (`alembic upgrade head`).
        Base.metadata.create_all(bind=engine)
        _dev_add_category_column()
    if SEED_DEMO:
        db = SessionLocal()
        try:
            seed(db)
        finally:
            db.close()
    yield


app = FastAPI(
    title="MOAGI API",
    version="2.0.0",
    lifespan=lifespan,
    # No public API docs/schema in production.
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
    openapi_url=None if IS_PROD else "/openapi.json",
)

if TRUSTED_HOSTS:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=TRUSTED_HOSTS)

allowed_origins = list(ALLOWED_ORIGINS)
if not IS_PROD:
    allowed_origins += ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

UNSAFE_METHODS = ("POST", "PUT", "PATCH", "DELETE")
ALLOWED_NETLOCS = {urlparse(o).netloc for o in allowed_origins}
CSP = (
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; "
    "script-src 'self'; connect-src 'self' https:; font-src 'self' data:; "
    "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"
)


def secure(response, request: Request):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    # Swagger UI loads assets from a CDN; only relax CSP for the dev docs pages.
    if IS_PROD or request.url.path not in ("/docs", "/redoc"):
        response.headers["Content-Security-Policy"] = CSP
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    if IS_PROD:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.middleware("http")
async def origin_guard(request: Request, call_next):
    if request.method in UNSAFE_METHODS:
        origin = request.headers.get("origin")
        blocked = False
        if origin:
            netloc = urlparse(origin).netloc
            host = request.headers.get("host", "")
            blocked = netloc not in ALLOWED_NETLOCS and netloc != host
        elif request.headers.get("sec-fetch-site") == "cross-site":
            blocked = True
        if blocked:
            return secure(JSONResponse({"detail": "Invalid request origin."}, status_code=403), request)
    return secure(await call_next(request), request)


@app.get("/api/health")
def health():
    return {"status": "ok"}


for router in (
    auth.router,
    users.router,
    properties.router,
    favorites.router,
    stays.router,
    bookings.router,
    reviews.router,
    messages.router,
    reports.router,
    admin.router,
    dashboard.router,
    uploads.router,
):
    app.include_router(router)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

if WEB_DIST.exists():
    app.mount("/assets", StaticFiles(directory=WEB_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa(full_path: str):
        if full_path == "api" or full_path.startswith("api/"):
            return JSONResponse({"detail": "Not found."}, status_code=404)
        candidate = (WEB_DIST / full_path).resolve()
        if full_path and candidate.is_file() and WEB_DIST.resolve() in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(WEB_DIST / "index.html")

else:

    @app.get("/", include_in_schema=False)
    def root():
        return {
            "app": "MOAGI API",
            "note": "Frontend not built. Run: cd web && npm ci && npm run build",
        }
