#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib

PATH=Path("docs/pixel/reference/margaret_chibi_direction_lock_v4_48.png")
EXPECTED_PIXEL_SHA256="447dae2ffd1acf1cf4eb19b1cebe34e176b1d21e9023d46be8b94d7d18ff62f6"

if not PATH.exists():
    raise SystemExit(f"missing Margaret direction lock: {PATH}")

with Image.open(PATH) as im:
    im=im.convert("RGBA")
    if im.size!=(192,48):
        raise SystemExit(f"Margaret direction lock size mismatch: {im.size}")
    pixel_sha=hashlib.sha256(im.tobytes()).hexdigest()
    if pixel_sha!=EXPECTED_PIXEL_SHA256:
        raise SystemExit(f"Margaret v4 pixel hash mismatch: {pixel_sha}")
    min_widths={"down":32,"left":33,"right":33,"up":31}
    for i,name in enumerate(("down","left","right","up")):
        cell=im.crop((48*i,0,48*(i+1),48))
        bbox=cell.getbbox()
        if bbox is None:
            raise SystemExit(f"Margaret {name} cell is empty")
        width=bbox[2]-bbox[0]
        height=bbox[3]-bbox[1]
        if width<min_widths[name]:
            raise SystemExit(f"Margaret {name} occupied width too small: {width} < {min_widths[name]}")
        if height<44:
            raise SystemExit(f"Margaret {name} occupied height too small: {height} < 44")
        if bbox[1]>3 or bbox[3]<47:
            raise SystemExit(f"Margaret {name} vertical occupancy regressed: {bbox}")

print("Margaret Chibi Direction Lock v4 PASS")
