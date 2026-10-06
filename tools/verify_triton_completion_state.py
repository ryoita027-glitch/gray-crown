#!/usr/bin/env python3
"""Verify Triton remains a completed locked control after the active gate moves on.

This is a technical integrity gate only. Triton no longer needs to be the active
work order once Triton Second Character Validation PASS is recorded.
"""
from pathlib import Path
from PIL import Image
import hashlib
import json
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"
REGEN=OUT/"triton_regenerated"
LOCK=ROOT/"docs/pixel/reference/triton_chibi_direction_lock_v1.png"
ALIAS=ROOT/"docs/pixel/reference/triton_idle_4dir_v1.png"
EXPECTED_LOCK_SHA256="e8ec4ffd3061ad2b3bad1d465b6199a32bf5ab9ea18027ac26426acda0920060"
ANIMS={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}

errors=[]
metrics={}

def file_sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def rgba_hash(path):
    with Image.open(path) as im:
        rgba=im.convert("RGBA")
        return hashlib.sha256(rgba.tobytes()).hexdigest(),rgba.size,rgba.mode

for path,label in ((LOCK,"lock"),(ALIAS,"compatibility alias")):
    if not path.exists():
        errors.append(f"missing Triton {label}: {path.relative_to(ROOT)}")

if LOCK.exists():
    metrics["lock_file_sha256"]=file_sha(LOCK)
    if metrics["lock_file_sha256"]!=EXPECTED_LOCK_SHA256:
        errors.append("approved Triton lock file hash changed")
    with Image.open(LOCK) as im:
        if im.mode!="RGBA" or im.size!=(192,48):
            errors.append(f"approved Triton lock must be RGBA 192x48, got {im.mode} {im.size}")

if LOCK.exists() and ALIAS.exists():
    metrics["alias_file_sha256"]=file_sha(ALIAS)
    if LOCK.read_bytes()!=ALIAS.read_bytes():
        errors.append("triton_idle_4dir_v1.png no longer matches approved Chibi Direction Lock v1")

tracked=set(subprocess.check_output(["git","ls-files"],cwd=ROOT,text=True).splitlines())
for name,count in ANIMS.items():
    rel=f"assets/characters/triton/triton_{name}.png"
    path=ROOT/rel
    if rel not in tracked:
        errors.append(f"missing committed Triton runtime asset: {rel}")
        continue
    if not path.exists():
        errors.append(f"missing Triton runtime file: {rel}")
        continue
    h,size,mode=rgba_hash(path)
    metrics[f"{name}_committed_rgba_sha256"]=h
    expected=(48*count,192)
    if size!=expected or mode!="RGBA":
        errors.append(f"{rel} expected RGBA {expected}, got {mode} {size}")

if not errors:
    REGEN.mkdir(parents=True,exist_ok=True)
    subprocess.run(
        [sys.executable,"tools/generate_triton_prototype_assets.py","--out",str(REGEN.relative_to(ROOT))],
        cwd=ROOT,check=True
    )
    for name in ANIMS:
        committed=ROOT/f"assets/characters/triton/triton_{name}.png"
        regenerated=REGEN/f"triton_{name}.png"
        ch,cs,cm=rgba_hash(committed)
        rh,rs,rm=rgba_hash(regenerated)
        metrics[f"{name}_regenerated_rgba_sha256"]=rh
        if (ch,cs,cm)!=(rh,rs,rm):
            errors.append(f"committed Triton {name} sheet does not match deterministic regeneration")

animations=(ROOT/"js/data/animations.js").read_text(encoding="utf-8")
for marker in (
    "triton-chibi-direction-lock-v1",
    "docs/pixel/reference/triton_chibi_direction_lock_v1.png",
    "GROUND ANCHOR",
):
    if marker not in animations:
        errors.append(f"Triton runtime metadata missing current lock marker: {marker}")

# Triton is now a completed control, not necessarily the active gate.
for rel in (
    "docs/audit/CURRENT_PROJECT_STATE.md",
    "docs/audit/NEXT_WORK_ORDER.md",
    "docs/visual/SOURCE_OF_TRUTH_STATUS.md",
):
    text=(ROOT/rel).read_text(encoding="utf-8")
    if "Triton Front v4" in text:
        errors.append(f"stale v4 gate marker remains in authority: {rel}")
    if "Triton Second Character Validation PASS" not in text:
        errors.append(f"Triton PASS marker missing from authority: {rel}")

OUT.mkdir(exist_ok=True)
(OUT/"triton_completion_integrity.json").write_text(
    json.dumps({"status":"PASS" if not errors else "FAIL","metrics":metrics,"errors":errors},indent=2),
    encoding="utf-8"
)

if errors:
    print("TRITON COMPLETION INTEGRITY FAIL",file=sys.stderr)
    for e in errors:
        print(" -",e,file=sys.stderr)
    sys.exit(1)

print("TRITON COMPLETION INTEGRITY PASS")
print("Triton remains a completed locked control after active work moved to Sophie")
print("Approved lock, compatibility atlas, runtime metadata and 8 committed sheets are synchronized")
print("All eight runtime sheets match deterministic regeneration")
