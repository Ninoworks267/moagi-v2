"""Image validation and re-encoding for uploads.

Decoding and re-encoding (instead of trusting the declared type or magic bytes) drops EXIF/GPS
metadata, trailing payloads and polyglot tricks, and rejects decompression bombs.
"""
import io

from PIL import Image, ImageOps, UnidentifiedImageError

MAX_PIXELS = 25_000_000
Image.MAX_IMAGE_PIXELS = MAX_PIXELS

FORMATS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}


class InvalidImage(ValueError):
    pass


def sanitize_image(content: bytes) -> tuple[bytes, str]:
    """Return (clean_bytes, file_extension) or raise InvalidImage."""
    try:
        with Image.open(io.BytesIO(content)) as probe:
            fmt = probe.format
            if fmt not in FORMATS:
                raise InvalidImage("Unsupported image type.")
            width, height = probe.size
            if width < 1 or height < 1 or width * height > MAX_PIXELS:
                raise InvalidImage("Image dimensions are too large.")
            probe.verify()
        with Image.open(io.BytesIO(content)) as img:
            img.load()
            img = ImageOps.exif_transpose(img)  # apply rotation before metadata is dropped
            out = io.BytesIO()
            if fmt == "JPEG":
                if img.mode not in ("RGB", "L"):
                    img = img.convert("RGB")
                img.save(out, "JPEG", quality=88, optimize=True)
            elif fmt == "PNG":
                img.save(out, "PNG", optimize=True)
            else:
                img.save(out, "WEBP", quality=88)
    except InvalidImage:
        raise
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError, Image.DecompressionBombError) as exc:
        raise InvalidImage("File is not a valid image.") from exc
    return out.getvalue(), FORMATS[fmt]
