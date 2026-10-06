#!/usr/bin/env python3
"""Guard Gray Crown's current Triton-completion repository state."""
from pathlib import Path
import json
import re
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
tracked=set(subprocess.check_output(["git","ls-files"],cwd=ROOT,text=True).splitlines())
errors=[]

for path in sorted(tracked):
    parts=Path(path).parts
    if path.startswith("prototype_artifacts/"):
        errors.append(f"generated evidence is tracked: {path}")
    if any(part in {"node_modules","__pycache__",".pytest_cache","playwright-report","test-results"} for part in parts):
        errors.append(f"local/build output is tracked: {path}")
    if Path(path).name in {".DS_Store","Thumbs.db"} or path.endswith((".pyc",".pyo")):
        errors.append(f"junk file is tracked: {path}")

save=ROOT/"js/core/save.js"
if not save.exists():
    errors.append("missing js/core/save.js")
else:
    schemas=re.findall(r"\bSAVE_SCHEMA\s*=\s*(\d+)\s*;",save.read_text(encoding="utf-8"))
    if schemas!=["23"]:
        errors.append(f"SAVE_SCHEMA must remain exactly 23, found {schemas!r}")

package=ROOT/"package.json"
try:
    pdata=json.loads(package.read_text(encoding="utf-8"))
    if pdata.get("version")!="23.0.0":
        errors.append(f"package version drifted from v23: {pdata.get('version')!r}")
except Exception as exc:
    errors.append(f"invalid package.json: {exc}")

anims=("idle","walk","turn","talk","surprise","approach","laugh","run")
for char in ("karen","triton"):
    for anim in anims:
        rel=f"assets/characters/{char}/{char}_{anim}.png"
        if rel not in tracked:
            errors.append(f"missing committed runtime asset: {rel}")

required={
    "docs/pixel/reference/karen_chibi_direction_v1.png",
    "docs/pixel/reference/triton_chibi_direction_lock_v1.png",
    "docs/pixel/reference/triton_idle_4dir_v1.png",
    "docs/pixel/TRITON_CHIBI_DIRECTION_LOCK_v1.md",
    "docs/audit/CURRENT_PROJECT_STATE.md",
    "docs/audit/NEXT_WORK_ORDER.md",
    "docs/visual/SOURCE_OF_TRUTH_STATUS.md",
    "tools/verify_triton_direction_lock.py",
    "tools/verify_triton_completion_state.py",
    ".github/workflows/karen-prototype-check.yml",
    ".github/workflows/sync-triton-lock-assets.yml",
    "requirements-ci.txt",
}
for rel in sorted(required):
    if rel not in tracked:
        errors.append(f"missing required project control file: {rel}")

requirements=ROOT/"requirements-ci.txt"
if requirements.exists():
    for raw in requirements.read_text(encoding="utf-8").splitlines():
        line=raw.strip()
        if line and not line.startswith("#") and "==" not in line:
            errors.append(f"CI dependency is not exactly pinned: {line}")
else:
    errors.append("missing requirements-ci.txt")

validation=(ROOT/".github/workflows/karen-prototype-check.yml").read_text(encoding="utf-8")
if "contents: read" not in validation or "contents: write" in validation:
    errors.append("validation CI must remain read-only")

sync=(ROOT/".github/workflows/sync-triton-lock-assets.yml").read_text(encoding="utf-8")
if "contents: write" not in sync:
    errors.append("Triton generated-asset sync requires contents: write")
if "pixel-karen-triton-face-differentiation-fix" not in sync:
    errors.append("Triton generated-asset sync must stay scoped to the experimental branch")
if "assets/characters/triton/" not in sync:
    errors.append("Triton generated-asset sync must explicitly restrict committed output paths")

for path in (ROOT/".github/workflows").glob("*.y*ml"):
    text=path.read_text(encoding="utf-8")
    if "contents: write" in text and path.name!="sync-triton-lock-assets.yml":
        errors.append(f"unexpected workflow has repository write permission: {path.name}")

if errors:
    print("GRAY CROWN REPOSITORY HYGIENE FAILED",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)

print("GRAY CROWN REPOSITORY HYGIENE PASS")
print(f"Tracked files checked: {len(tracked)}")
print("Production remains main / v23 / Save schema 23")
print("Karen and Triton approved/current runtime sheets are committed")
print("Only the narrowly scoped Triton asset-sync workflow has contents: write")
