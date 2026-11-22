#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import sys

ROOT=Path(__file__).resolve().parents[1]
REF=ROOT/"docs/pixel/reference/triton_idle_4dir_v1.png"
OUT=ROOT/"assets/characters/triton"
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}

errors=[]
if not REF.exists():errors.append("missing four-direction reference")
else:
    with Image.open(REF) as im:
        if im.size!=(192,48):errors.append(f"reference size {im.size} != (192,48)")
        if im.mode!="RGBA":errors.append(f"reference mode {im.mode} != RGBA")
for name,count in FRAMES.items():
    p=OUT/f"triton_{name}.png"
    if not p.exists():
        errors.append(f"missing {p.relative_to(ROOT)}");continue
    with Image.open(p) as im:
        expected=(48*count,48*4)
        if im.size!=expected:errors.append(f"{name} size {im.size} != {expected}")
        if im.mode!="RGBA":errors.append(f"{name} mode {im.mode} != RGBA")
if errors:
    print("TRITON ASSET VERIFY FAIL")
    for e in errors:print(" -",e)
    sys.exit(1)
print("TRITON ASSET VERIFY PASS: 4-direction source + exactly 8 animation sheets")
