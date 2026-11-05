#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib, subprocess, sys

ROOT=Path(__file__).resolve().parents[1]
V2=ROOT/"docs/pixel/reference/sophie_steady_hands_front_candidate_v2_48.png"
V3=ROOT/"docs/pixel/reference/sophie_steady_hands_front_candidate_v3_48.png"
EXPECTED_V3_SHA256="c71f6f19b8dd50e1d53110f9a77c9ce434b544822f2ce4404221c226a6973074"

errors=[]

for path,label in ((V2,"v2"),(V3,"v3")):
    if not path.exists():
        errors.append(f"missing Sophie {label}: {path.relative_to(ROOT)}")
        continue
    with Image.open(path) as im:
        if im.mode!="RGBA":
            errors.append(f"{label} mode {im.mode} != RGBA")
        if im.size!=(48,48):
            errors.append(f"{label} size {im.size} != (48,48)")
        if not im.getchannel("A").getbbox():
            errors.append(f"{label} has no visible pixels")

if V3.exists():
    actual=hashlib.sha256(V3.read_bytes()).hexdigest()
    if actual!=EXPECTED_V3_SHA256:
        errors.append(f"v3 sha256 changed: expected {EXPECTED_V3_SHA256}, got {actual}")

if V2.exists() and V3.exists() and V2.read_bytes()==V3.read_bytes():
    errors.append("v3 is byte-identical to rejected v2")

tracked=subprocess.check_output(["git","ls-files"],cwd=ROOT,text=True).splitlines()
runtime=[p for p in tracked if p.startswith("assets/characters/sophie/")]
if runtime:
    errors.append("Sophie runtime production started before front visual PASS: "+", ".join(runtime))

forbidden=[
 "sophie_idle_4dir",
 "sophie_walk.png",
 "sophie_talk.png",
 "sophie_surprise.png",
 "sophie_laugh.png",
 "sophie_approach.png",
 "sophie_run.png",
 "sophie_turn.png",
]
for p in tracked:
    low=p.lower()
    if "sophie" in low and any(mark in low for mark in forbidden):
        errors.append(f"premature Sophie production asset: {p}")

if errors:
    print("SOPHIE FRONT V3 VERIFY FAIL",file=sys.stderr)
    for e in errors:
        print(" -",e,file=sys.stderr)
    sys.exit(1)

print("SOPHIE FRONT V3 VERIFY PASS")
print("sha256",EXPECTED_V3_SHA256)
print("front-only gate preserved")
print("runtime Sophie assets: 0")
