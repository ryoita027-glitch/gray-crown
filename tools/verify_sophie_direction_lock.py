#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib,sys
ROOT=Path(__file__).resolve().parents[1]
REF=ROOT/"docs/pixel/reference/sophie_chibi_direction_lock_v1_48.png"
EXPECTED="bd4d58ef0fe11c82308d355302dc52eeb1734df265e91bec2de8436893c41e43"
errors=[]
if not REF.exists(): errors.append("missing Sophie direction lock source")
else:
    h=hashlib.sha256(REF.read_bytes()).hexdigest()
    if h!=EXPECTED: errors.append(f"Sophie lock SHA changed: {h}")
    with Image.open(REF) as im:
        if im.size!=(192,48): errors.append(f"expected 192x48, got {im.size}")
for rel in ("docs/pixel/SOPHIE_CHIBI_DIRECTION_LOCK_v1.md","docs/pixel/SOPHIE_ACTING_REFERENCE_v1.md"):
    if not (ROOT/rel).exists(): errors.append(f"missing authority: {rel}")
if errors:
    print("SOPHIE DIRECTION LOCK VERIFY FAIL",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)
print("SOPHIE DIRECTION LOCK VERIFY PASS")
print(EXPECTED)
