import secrets

from fastapi import APIRouter, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from ..config import UPLOAD_DIR
from ..deps import UserRequired
from ..imaging import InvalidImage, sanitize_image

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = 5 * 1024 * 1024


@router.post("")
async def upload_image(file: UploadFile, user: UserRequired):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Use a JPG, PNG or WEBP image.")
    content = await file.read(MAX_BYTES + 1)
    if len(content) > MAX_BYTES:
        raise HTTPException(400, "Image must be smaller than 5MB.")
    try:
        clean, ext = await run_in_threadpool(sanitize_image, content)
    except InvalidImage:
        raise HTTPException(400, "File content does not match an allowed image type.")
    name = secrets.token_hex(16) + ext
    tmp = UPLOAD_DIR / f".{name}.tmp"
    tmp.write_bytes(clean)
    tmp.replace(UPLOAD_DIR / name)
    return {"url": f"/uploads/{name}"}
