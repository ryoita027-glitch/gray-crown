#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import json, sys

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"assets/environment/prototype"
PALETTE=OUT/"environment_palette_v1.json"
SCENES={"village_micro_v1.png":(512,320),"grass_field_micro_v1.png":(512,320),"house_exterior_v1.png":(512,320),"house_interior_v1.png":(512,320)}
errors=[]
if not PALETTE.exists(): errors.append("missing palette")
else:
    try:
        p=json.loads(PALETTE.read_text(encoding="utf-8"))
        req={"grass","grass_shadow","grass_detail","soil","path","stone","wood_light","wood_mid","wood_dark","plaster","roof","roof_shadow","interior_floor","interior_wall","furniture","shadow","accent"}
        if set(p)!=req: errors.append(f"palette keys mismatch: {sorted(set(p)^req)}")
    except Exception as e: errors.append(f"palette invalid: {e}")
tile=OUT/"tiles/environment_tiles_v1.png"
if not tile.exists(): errors.append("missing tile sheet")
else:
    with Image.open(tile) as im:
        if im.mode!="RGBA": errors.append(f"tile mode {im.mode} != RGBA")
        if im.size!=(128,128): errors.append(f"tile size {im.size} != (128,128)")
for name,size in SCENES.items():
    f=OUT/"scenes"/name
    if not f.exists(): errors.append(f"missing scene {name}"); continue
    with Image.open(f) as im:
        if im.mode!="RGBA": errors.append(f"{name} mode {im.mode} != RGBA")
        if im.size!=size: errors.append(f"{name} size {im.size} != {size}")
for p in ROOT.glob("assets/environment/**/*.png"):
    try: p.relative_to(OUT)
    except ValueError: errors.append(f"environment PNG outside prototype directory: {p.relative_to(ROOT)}")
if errors:
    print("GRAY CROWN ENVIRONMENT PROTOTYPE v1 ASSET FAIL",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)
print("GRAY CROWN ENVIRONMENT PROTOTYPE v1 ASSET PASS")
