import io

import pytest
from PIL import Image

from app.imaging import InvalidImage, sanitize_image


def _img_bytes(fmt, size=(32, 32), **save_kwargs):
    out = io.BytesIO()
    Image.new("RGB", size, (200, 30, 30)).save(out, fmt, **save_kwargs)
    return out.getvalue()


@pytest.mark.parametrize("fmt,ext", [("JPEG", ".jpg"), ("PNG", ".png"), ("WEBP", ".webp")])
def test_valid_images_round_trip(fmt, ext):
    clean, got_ext = sanitize_image(_img_bytes(fmt))
    assert got_ext == ext
    assert Image.open(io.BytesIO(clean)).format == fmt


def test_exif_is_stripped():
    exif = Image.Exif()
    exif[0x010F] = "SecretCamera"
    clean, _ = sanitize_image(_img_bytes("JPEG", exif=exif))
    assert not Image.open(io.BytesIO(clean)).getexif()


def test_trailing_payload_is_dropped():
    payload = b"<script>alert(1)</script>"
    clean, _ = sanitize_image(_img_bytes("PNG") + payload)
    assert payload not in clean


def test_non_image_rejected():
    with pytest.raises(InvalidImage):
        sanitize_image(b"<?php system($_GET['c']); ?>")


def test_gif_rejected():
    with pytest.raises(InvalidImage):
        sanitize_image(_img_bytes("GIF"))


def test_truncated_image_rejected():
    with pytest.raises(InvalidImage):
        sanitize_image(_img_bytes("PNG", size=(200, 200))[:60])


def test_oversized_dimensions_rejected():
    with pytest.raises(InvalidImage):
        sanitize_image(_img_bytes("PNG", size=(6000, 6000)))
