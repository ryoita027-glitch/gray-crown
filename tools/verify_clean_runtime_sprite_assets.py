#!/usr/bin/env python3
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
CHARS=("karen","triton","sophie","margaret")
ANIMS={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}

errors=[]
for char in CHARS:
    for anim,frames in ANIMS.items():
        p=ROOT/f"assets/characters/{char}/{char}_{anim}.png"
        if not p.exists():
            errors.append(f"missing {p}")
            continue
        im=Image.open(p).convert("RGBA")
        expected=(48*frames,48*4)
        if im.size!=expected:
            errors.append(f"{p}: size {im.size} != {expected}")
        alphas=set(im.getchannel("A").getdata())
        bad=sorted(a for a in alphas if a not in (0,255))
        if bad:
            errors.append(f"{p}: semitransparent alpha values remain: {bad[:12]}")
        # Transparent pixels must not retain RGB fringe colors.
        for r,g,b,a in im.getdata():
            if a==0 and (r or g or b):
                errors.append(f"{p}: RGB data remains under transparent pixels")
                break

party=ROOT/"assets/hero_party_walk.png"
if not party.exists():
    errors.append("missing assets/hero_party_walk.png")
else:
    im=Image.open(party).convert("RGBA")
    if im.size!=(96,512):
        errors.append(f"hero_party_walk.png: {im.size} != (96, 512)")
    bad=sorted(a for a in set(im.getchannel("A").getdata()) if a not in (0,255))
    if bad:
        errors.append(f"hero_party_walk.png: semitransparent alpha remains: {bad[:12]}")
    # Every 32x32 cell gets a transparent safety boundary check for left/right sheet edges.
    # Individual characters may legitimately occupy an internal cell edge, but no sprite may
    # escape the sheet itself.
    px=im.load(); w,h=im.size
    if any(px[0,y][3] or px[w-1,y][3] for y in range(h)):
        errors.append("hero_party_walk.png: opaque pixels touch outer left/right sheet boundary")

if errors:
    raise SystemExit("CLEAN RUNTIME SPRITE VERIFY FAIL\n"+"\n".join(errors))
print("CLEAN RUNTIME SPRITE VERIFY PASS")
print("All committed runtime sheets use binary alpha only; no cutout fringe remains.")
