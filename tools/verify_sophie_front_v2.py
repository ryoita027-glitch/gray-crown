#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib, subprocess, sys

ROOT=Path(__file__).resolve().parents[1]
V1=ROOT/"docs/pixel/reference/sophie_steady_hands_front_candidate_v1_48.png"
V2=ROOT/"docs/pixel/reference/sophie_steady_hands_front_candidate_v2_48.png"
EXPECTED_V2_SHA256="ce025a99472495b7ba7b0f4ecf27505097775e3888baa2d92ea4ff5b76083571"

errors=[]

for path,label in ((V1,"v1"),(V2,"v2")):
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

if V2.exists():
    actual=hashlib.sha256(V2.read_bytes()).hexdigest()
    if actual!=EXPECTED_V2_SHA256:
        errors.append(f"v2 sha256 changed: expected {EXPECTED_V2_SHA256}, got {actual}")

if V1.exists() and V2.exists() and V1.read_bytes()==V2.read_bytes():
    errors.append("v2 is byte-identical to revised v1")

# Front-only gate: do not silently start Sophie runtime production.
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
    print("SOPHIE FRONT V2 VERIFY FAIL",file=sys.stderr)
    for e in errors:
        print(" -",e,file=sys.stderr)
    sys.exit(1)

print("SOPHIE FRONT V2 VERIFY PASS")
print("sha256",EXPECTED_V2_SHA256)
print("front-only gate preserved")
print("runtime Sophie assets: 0")
