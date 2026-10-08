#!/usr/bin/env python3
"""Validate the derived clean runtime path without mutating approved sources."""
from pathlib import Path
from PIL import Image
import subprocess

ROOT=Path(__file__).resolve().parents[1]
errors=[]

party=ROOT/"assets/hero_party_walk.png"
if not party.exists():
    errors.append("missing assets/hero_party_walk.png")
else:
    im=Image.open(party).convert("RGBA")
    if im.size!=(96,512): errors.append(f"hero_party_walk.png: {im.size} != (96, 512)")
    bad=sorted(a for a in set(im.getchannel("A").getdata()) if a not in (0,255))
    if bad: errors.append(f"hero_party_walk.png: semitransparent alpha remains: {bad[:12]}")
    for r,g,b,a in im.getdata():
        if a==0 and (r or g or b):
            errors.append("hero_party_walk.png: RGB fringe remains under transparent pixels")
            break
    px=im.load();w,h=im.size
    if any(px[0,y][3] or px[w-1,y][3] for y in range(h)):
        errors.append("hero_party_walk.png: opaque pixels touch outer left/right sheet boundary")

# Karen remains byte-for-byte locked. This explicitly catches accidental source cleanup.
karen=subprocess.run(
    ["python","tools/verify_karen_visual_regression_control.py"],
    cwd=ROOT,text=True,capture_output=True
)
if karen.returncode:
    errors.append("Karen approved source/runtime lock changed")

animation=(ROOT/"js/systems/animation.js").read_text(encoding="utf-8")
for marker in ("normalizeRuntimeAlpha","RUNTIME_ALPHA_THRESHOLD=128","getImageData","putImageData"):
    if marker not in animation: errors.append(f"runtime alpha normalizer missing marker: {marker}")

if errors:
    raise SystemExit("CLEAN RUNTIME SPRITE VERIFY FAIL\n"+"\n".join(errors))
print("CLEAN RUNTIME SPRITE VERIFY PASS")
print("Approved source PNGs remain locked; derived/runtime rendering removes cutout fringe.")
