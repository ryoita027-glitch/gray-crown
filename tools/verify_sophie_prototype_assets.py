#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
REF=ROOT/"docs/pixel/reference/sophie_chibi_direction_lock_v1_48.png"
OUT=ROOT/"assets/characters/sophie"
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}

errors=[]
if not REF.exists():
    errors.append("missing Sophie four-direction lock")
else:
    try:
        with Image.open(REF) as im:
            im.load()
            if im.size!=(192,48): errors.append(f"reference size {im.size} != (192,48)")
    except Exception as exc:
        errors.append(f"reference decode failed: {exc}")

for name,count in FRAMES.items():
    p=OUT/f"sophie_{name}.png"
    if not p.exists():
        errors.append(f"missing {p.relative_to(ROOT)}")
        continue
    try:
        with Image.open(p) as im:
            im.load()
            expected=(48*count,192)
            if im.size!=expected: errors.append(f"{name} size {im.size} != {expected}")
            if im.mode!="RGBA": errors.append(f"{name} mode {im.mode} != RGBA")
    except Exception as exc:
        errors.append(f"{name} decode failed: {exc}")

if not errors:
    with tempfile.TemporaryDirectory() as td:
        regen=Path(td)
        subprocess.run(
            [sys.executable,"tools/generate_sophie_prototype_assets.py","--out",str(regen)],
            cwd=ROOT,check=True,capture_output=True,text=True
        )
        for name in FRAMES:
            committed=OUT/f"sophie_{name}.png"
            generated=regen/f"sophie_{name}.png"
            if hashlib.sha256(committed.read_bytes()).hexdigest()!=hashlib.sha256(generated.read_bytes()).hexdigest():
                # PNG byte identity may vary across Pillow versions; compare RGBA pixels too.
                with Image.open(committed) as a, Image.open(generated) as b:
                    if a.convert("RGBA").tobytes()!=b.convert("RGBA").tobytes():
                        errors.append(f"{name} runtime sheet differs from deterministic generator output")

if errors:
    print("SOPHIE ASSET VERIFY FAIL")
    for e in errors: print(" -",e)
    sys.exit(1)

print("SOPHIE ASSET VERIFY PASS: 4-direction lock + exactly 8 synchronized animation sheets")
