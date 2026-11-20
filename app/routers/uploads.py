from fastapi import APIRouter, HTTPException, UploadFile

from ..config import UPLOAD_DIR
from ..deps import UserRequired

import secrets

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_BYTES = 5 * 1024 * 1024

MAGIC = {
    "image/jpeg": (b"\xff\xd8\xff",),
    "image/png": (b"\x89PNG\r\n\x1a\n",),
    "image/webp": (b"RIFF",),
}


@router.post("")
async def upload_image(file: UploadFile, user: UserRequired):
    if file.content_type not in ALLOWED:
        raise HTTPException(400, "Use a JPG, PNG or WEBP image.")
    content = await file.read(MAX_BYTES + 1)
    if len(content) > MAX_BYTES:
        raise HTTPException(400, "Image must be smaller than 5MB.")
    if not any(content.startswith(sig) for sig in MAGIC[file.content_type]):
        raise HTTPException(400, "File content does not match an allowed image type.")
    if file.content_type == "image/webp" and content[8:12] != b"WEBP":
        raise HTTPException(400, "File content does not match an allowed image type.")
    name = secrets.token_hex(12) + ALLOWED[file.content_type]
    (UPLOAD_DIR / name).write_bytes(content)
    return {"url": f"/uploads/{name}"}