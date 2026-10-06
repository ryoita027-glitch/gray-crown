#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib,sys

ROOT=Path(__file__).resolve().parents[1]
REF=ROOT/"docs/pixel/reference/sophie_chibi_direction_lock_v1_48.png"
EXPECTED="3291a1331fb1a41d85bd023e2f9907e798926746c856c92c63c7eb5aa26c3e36"
errors=[]

if not REF.exists():
    errors.append("missing Sophie direction lock source")
else:
    h=hashlib.sha256(REF.read_bytes()).hexdigest()
    if h!=EXPECTED:
        errors.append(f"Sophie lock SHA changed: {h}")
    try:
        with Image.open(REF) as im:
            im.load()
            rgba=im.convert("RGBA")
            if rgba.size!=(192,48):
                errors.append(f"expected 192x48, got {rgba.size}")
            if not rgba.getchannel("A").getbbox():
                errors.append("Sophie direction lock contains no visible pixels")
    except Exception as exc:
        errors.append(f"Sophie direction lock is not a fully readable PNG: {exc}")

for rel in ("docs/pixel/SOPHIE_CHIBI_DIRECTION_LOCK_v1.md","docs/pixel/SOPHIE_ACTING_REFERENCE_v1.md"):
    if not (ROOT/rel).exists():
        errors.append(f"missing authority: {rel}")

if errors:
    print("SOPHIE DIRECTION LOCK VERIFY FAIL",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)

print("SOPHIE DIRECTION LOCK VERIFY PASS")
print("sha256",EXPECTED)
print("PNG decode PASS")
print("size 192x48 / cell 48x48 / order down-left-right-up")
