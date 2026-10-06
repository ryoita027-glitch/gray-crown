#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import json, subprocess, sys

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"assets/environment/prototype"
PALETTE=OUT/"environment_palette_v1.json"
TILE=OUT/"tiles/environment_tiles_v1.png"
SCENES={
    "village_micro_v1.png":(512,320),
    "grass_field_micro_v1.png":(512,320),
    "house_exterior_v1.png":(512,320),
    "house_interior_v1.png":(512,320),
}
REQUIRED_PALETTE={
    "grass","grass_shadow","grass_detail","soil","path","stone",
    "wood_light","wood_mid","wood_dark","plaster","roof","roof_shadow",
    "interior_floor","interior_wall","furniture","shadow","accent",
}
# Git blob controls captured from the approved base branch.
PROTECTED_BLOBS={
    "assets/characters/karen/karen_idle.png":"782785fd504a4baba92be4ff099a827dd1ecac81",
    "assets/characters/triton/triton_idle.png":"e6ca25a935e773cf17dd35e2355c28d647ffd7ef",
    "docs/pixel/reference/karen_chibi_direction_v1.png":"d5aaf6029efaf246e9dc5afd75e1faa043870dbc",
    "docs/pixel/reference/triton_chibi_direction_lock_v1.png":"cf7a09a7ec6f148cb5a536df3d24fdcffc8827cb",
    "js/data/maps.js":"3af9d84498aa0d9f5a14963af36c2b1f94a5ffbe",
}
errors=[]

def blob_id(rel):
    p=ROOT/rel
    if not p.exists():
        return None
    return subprocess.check_output(["git","hash-object",str(p)],cwd=ROOT,text=True).strip()

if not PALETTE.exists():
    errors.append("missing palette")
else:
    try:
        p=json.loads(PALETTE.read_text(encoding="utf-8"))
        if set(p)!=REQUIRED_PALETTE:
            errors.append(f"palette keys mismatch: {sorted(set(p)^REQUIRED_PALETTE)}")
        for k,v in p.items():
            if not isinstance(v,str) or len(v)!=7 or not v.startswith("#"):
                errors.append(f"invalid palette color {k}: {v!r}")
    except Exception as exc:
        errors.append(f"palette invalid: {exc}")

tracked=set(subprocess.check_output(["git","ls-files"],cwd=ROOT,text=True).splitlines())
required_pngs=[str(TILE.relative_to(ROOT))]+[
    str((OUT/"scenes"/name).relative_to(ROOT)) for name in SCENES
]
for rel in required_pngs:
    if rel not in tracked:
        errors.append(f"prototype PNG must be committed: {rel}")

if not TILE.exists():
    errors.append("missing tile sheet")
else:
    with Image.open(TILE) as im:
        if im.mode!="RGBA": errors.append(f"tile mode {im.mode} != RGBA")
        if im.size!=(128,128): errors.append(f"tile size {im.size} != (128,128)")

for name,size in SCENES.items():
    f=OUT/"scenes"/name
    if not f.exists():
        errors.append(f"missing scene {name}")
        continue
    with Image.open(f) as im:
        if im.mode!="RGBA": errors.append(f"{name} mode {im.mode} != RGBA")
        if im.size!=size: errors.append(f"{name} size {im.size} != {size}")

for p in ROOT.glob("assets/environment/**/*.png"):
    try:
        p.relative_to(OUT)
    except ValueError:
        errors.append(f"environment PNG outside prototype directory: {p.relative_to(ROOT)}")

for rel,expected in PROTECTED_BLOBS.items():
    actual=blob_id(rel)
    if actual!=expected:
        errors.append(f"protected baseline changed: {rel}: expected {expected}, got {actual}")

if errors:
    print("GRAY CROWN ENVIRONMENT PROTOTYPE v1 ASSET FAIL",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)

print("GRAY CROWN ENVIRONMENT PROTOTYPE v1 ASSET PASS")
print(f"Committed generated PNGs: {len(required_pngs)}")
print("Karen/Triton controls and production maps.js remain byte-identical to base")
