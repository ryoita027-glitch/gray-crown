#!/usr/bin/env python3
"""Guard the current Gray Crown repository baseline against accidental drift.

This script intentionally protects only objective, reversible constraints.
Visual approval and production/main adoption remain user decisions.
"""
from pathlib import Path
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]

def tracked_files():
    raw = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT)
    return {p for p in raw.decode("utf-8").split("\0") if p}

tracked = tracked_files()
errors = []

# Generated evidence and local/build junk must never become repository state.
for path in sorted(tracked):
    parts = Path(path).parts
    if path.startswith("prototype_artifacts/"):
        errors.append(f"generated evidence is tracked: {path}")
    if any(part in {"node_modules", "__pycache__", ".pytest_cache", "playwright-report", "test-results"} for part in parts):
        errors.append(f"local/build output is tracked: {path}")
    if Path(path).name in {".DS_Store", "Thumbs.db"} or path.endswith((".pyc", ".pyo")):
        errors.append(f"junk file is tracked: {path}")

# Current production baseline is intentionally v23 / Save schema 23.
save_path = ROOT / "js/core/save.js"
if not save_path.exists():
    errors.append("missing js/core/save.js")
else:
    save_text = save_path.read_text(encoding="utf-8")
    schemas = re.findall(r"\bSAVE_SCHEMA\s*=\s*(\d+)\s*;", save_text)
    if schemas != ["23"]:
        errors.append(f"SAVE_SCHEMA must be exactly one definition at 23, found {schemas!r}")

package_path = ROOT / "package.json"
if not package_path.exists():
    errors.append("missing package.json")
else:
    try:
        package = json.loads(package_path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"package.json is invalid JSON: {exc}")
    else:
        if package.get("version") != "23.0.0":
            errors.append(f"package version drifted from production v23: {package.get('version')!r}")

# Locked/current runtime asset sets must remain complete.
anims = ("idle", "walk", "turn", "talk", "surprise", "approach", "laugh", "run")
for char in ("karen", "triton"):
    for anim in anims:
        rel = f"assets/characters/{char}/{char}_{anim}.png"
        if rel not in tracked:
            errors.append(f"missing tracked runtime asset: {rel}")

required = {
    "docs/pixel/reference/karen_chibi_direction_v1.png",
    "docs/pixel/reference/triton_idle_4dir_v1.png",
    "docs/pixel/reference/triton_idle_front_repair_candidate_v3_48.png",
    "docs/audit/CURRENT_PROJECT_STATE.md",
    "docs/audit/NEXT_WORK_ORDER.md",
    "docs/visual/SOURCE_OF_TRUTH_STATUS.md",
    ".github/workflows/karen-prototype-check.yml",
}
for rel in sorted(required):
    if rel not in tracked:
        errors.append(f"missing required tracked project authority/control file: {rel}")

# v4 is still a deterministic review candidate. Do not silently promote it to
# committed visual authority before the user issues PASS.
v4_committed = "docs/pixel/reference/triton_idle_front_repair_candidate_v4_48.png"
if v4_committed in tracked:
    errors.append(
        "Triton front v4 is committed as a reference before the active USER VISUAL gate was resolved"
    )

workflow = (ROOT / ".github/workflows/karen-prototype-check.yml").read_text(encoding="utf-8")
if "contents: write" in workflow or "pull-requests: write" in workflow:
    errors.append("CI gained repository write permission; keep validation read-only")
if "contents: read" not in workflow:
    errors.append("CI must explicitly keep contents: read")

if errors:
    print("GRAY CROWN REPOSITORY HYGIENE FAILED", file=sys.stderr)
    for error in errors:
        print(f" - {error}", file=sys.stderr)
    sys.exit(1)

print("GRAY CROWN REPOSITORY HYGIENE PASS")
print(f"Tracked files checked: {len(tracked)}")
print("Production baseline remains v23 / Save schema 23")
print("Generated evidence remains untracked")
print("Triton v4 remains a review candidate, not committed authority")
