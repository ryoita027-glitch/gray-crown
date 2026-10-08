#!/usr/bin/env python3
from pathlib import Path
from PIL import Image

ROOT=Path("prototype_artifacts/margaret_generated")
EXPECTED={
    "idle":(192,192),
    "walk":(288,192),
    "turn":(144,192),
    "talk":(192,192),
    "surprise":(192,192),
    "approach":(192,192),
    "laugh":(288,192),
    "run":(288,192),
}

for name,size in EXPECTED.items():
    p=ROOT/f"margaret_{name}.png"
    if not p.exists():
        raise SystemExit(f"missing {p}")
    with Image.open(p) as im:
        if im.size!=size:
            raise SystemExit(f"{name} size mismatch: {im.size} != {size}")
        if im.mode!="RGBA":
            raise SystemExit(f"{name} mode mismatch: {im.mode}")
        # Four direction rows must each contain visible pixels.
        for row in range(4):
            band=im.crop((0,row*48,im.width,(row+1)*48))
            if band.getbbox() is None:
                raise SystemExit(f"{name} direction row {row} empty")

print("Margaret 8-animation prototype assets PASS")
