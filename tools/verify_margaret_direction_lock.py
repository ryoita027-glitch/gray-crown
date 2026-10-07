#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib

PATH = Path("docs/pixel/reference/margaret_chibi_direction_lock_v2_48.png")
EXPECTED_SHA256 = "ca8aa68a0bb2b81925406411aa381914910ef280a8ebd7c4c006a7f03255b8c7"

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
    if im.mode != "RGBA":
        raise SystemExit(f"Margaret direction lock mode mismatch: {im.mode}")
    for i, name in enumerate(("down", "left", "right", "up")):
        cell = im.crop((48*i, 0, 48*(i+1), 48))
        bbox = cell.getbbox()
        if bbox is None:
            raise SystemExit(f"Margaret {name} cell is empty")
        if bbox[3] > 48:
            raise SystemExit(f"Margaret {name} cell exceeds source bounds")

print("Margaret Chibi Direction Lock v2 PASS")
