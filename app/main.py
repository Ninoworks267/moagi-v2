from contextlib import asynccontextmanager
from urllib.parse import urlparse

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from .config import ALLOWED_ORIGINS, ENV, UPLOAD_DIR, WEB_DIST
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    if "properties" in inspector.get_table_names():
        existing = {column["name"] for column in inspector.get_columns("properties")}
        if "category" not in existing:
            with engine.begin() as connection:
                connection.execute(
                    text("ALTER TABLE properties ADD COLUMN category VARCHAR(40) DEFAULT 'all'")
                )
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
    yield


app = FastAPI(title="MOAGI API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS + ["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def origin_guard(request: Request, call_next):
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        origin = request.headers.get("origin")
        if origin:
            host = request.headers.get("host", "")
            parsed = urlparse(origin)
            allowed = {host} | {urlparse(o).netloc for o in ALLOWED_ORIGINS}
            if parsed.netloc not in allowed and parsed.netloc not in (
                "localhost:5173",
                "127.0.0.1:5173",
            ):
                return JSONResponse({"detail": "Invalid request origin."}, status_code=403)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if ENV == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.get("/api/health")
def health():
    return {"status": "ok", "app": "MOAGI", "version": "2.0.0"}


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
        if full_path.startswith("api/"):
            return JSONResponse({"detail": "Not found."}, status_code=404)
        candidate = (WEB_DIST / full_path).resolve()
        if full_path and candidate.is_file() and WEB_DIST in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(WEB_DIST / "index.html")

else:

    @app.get("/", include_in_schema=False)
    def root():
        return {
            "app": "MOAGI API",
            "docs": "/docs",
            "note": "Frontend not built. Run: cd web && npm install && npm run build",
        }
