#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib

PATH = Path("docs/pixel/reference/margaret_chibi_direction_lock_v3_48.png")
EXPECTED_SHA256 = "a4d570ec42c0c0db427ba1312780c047cfef66a8c925b4febda94776ef1d69e2"

if not PATH.exists():
    raise SystemExit(f"missing Margaret direction lock: {PATH}")

raw = PATH.read_bytes()
sha = hashlib.sha256(raw).hexdigest()
if sha != EXPECTED_SHA256:
    raise SystemExit(f"Margaret direction lock SHA mismatch: {sha}")

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
