#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib

PATH = Path("docs/pixel/reference/margaret_chibi_direction_lock_v3_48.png")
EXPECTED_PIXEL_SHA256 = "b978ba8c255fadd9238c5d34a1eeac4e6d58ecf4d73dc91b2f0418e382a8f12b"

if not PATH.exists():
    raise SystemExit(f"missing Margaret direction lock: {PATH}")

with Image.open(PATH) as im:
    im = im.convert("RGBA")
    if im.size != (192, 48):
        raise SystemExit(f"Margaret direction lock size mismatch: {im.size}")
    min_widths = {"down": 32, "left": 32, "right": 32, "up": 30}
    for i, name in enumerate(("down", "left", "right", "up")):
        cell = im.crop((48*i, 0, 48*(i+1), 48))
        bbox = cell.getbbox()
        if bbox is None:
            raise SystemExit(f"Margaret {name} cell is empty")
        width = bbox[2] - bbox[0]
        height = bbox[3] - bbox[1]
        if width < min_widths[name]:
            raise SystemExit(f"Margaret {name} occupied width too small: {width} < {min_widths[name]}")
        if height < 43:
            raise SystemExit(f"Margaret {name} occupied height too small: {height} < 43")
        if bbox[1] > 4 or bbox[3] < 47:
            raise SystemExit(f"Margaret {name} vertical occupancy regressed: {bbox}")

print("Margaret Chibi Direction Lock v3 PASS")
