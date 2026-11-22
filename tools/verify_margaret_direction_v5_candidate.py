#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib

PATH=Path("prototype_artifacts/margaret_face_v5/margaret_chibi_direction_candidate_v5_48.png")
EXPECTED_PIXEL_SHA256="0aacc491fde7b30b7b9dc524e59881570afa49f277e6a8718b51c1a92c0786bd"
EXPECTED_BBOX={
    "down":(9,3,39,47),
    "left":(9,3,39,47),
    "right":(9,3,39,47),
    "up":(10,3,38,47),
}

im=Image.open(PATH).convert("RGBA")
if im.size != (192,48):
    raise SystemExit(f"candidate size mismatch: {im.size}")
sha=hashlib.sha256(im.tobytes()).hexdigest()
if sha != EXPECTED_PIXEL_SHA256:
    raise SystemExit(f"candidate pixel hash mismatch: {sha}")

for i,name in enumerate(("down","left","right","up")):
    cell=im.crop((48*i,0,48*(i+1),48))
    bbox=cell.getbbox()
    if bbox != EXPECTED_BBOX[name]:
        raise SystemExit(f"{name} bbox mismatch: {bbox} != {EXPECTED_BBOX[name]}")

# Front-face readability guard: v5 must retain several distinct very-dark eye pixels
# in the upper face area instead of collapsing them through head resampling.
front=im.crop((0,0,48,48))
dark=0
for y in range(13,22):
    for x in range(14,30):
        r,g,b,a=front.getpixel((x,y))
        if a and r<90 and g<80 and b<100:
            dark += 1
if dark < 4:
    raise SystemExit(f"front face dark-detail guard failed: {dark}")

print("Margaret v5 face-readability candidate PASS")
