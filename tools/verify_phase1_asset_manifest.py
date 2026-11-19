#!/usr/bin/env python3
"""Read-only verification that the manifest pins 32 live runtime PNG Git blobs.
No source regeneration or writes to the working tree.
"""
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
manifest = (ROOT / "docs/visual/VISUAL_ASSET_MANIFEST.md").read_text(encoding="utf-8")
ids = ("karen", "triton", "sophie", "margaret")
animations = ("idle", "walk", "turn", "talk", "surprise", "approach", "laugh", "run")
errors = []
for hero in ids:
    for anim in animations:
        path = f"assets/characters/{hero}/{hero}_{anim}.png"
        pattern = rf"^\| `{re.escape(path)}` \| `([0-9a-f]{{40}})` \| LOCKED"
        match = re.search(pattern, manifest, re.MULTILINE)
        if not match:
            errors.append(f"{path}: missing LOCKED hash")
            continue
        if not (ROOT / path).is_file():
            errors.append(f"{path}: asset not committed")
            continue
        actual = subprocess.check_output(["git", "hash-object", path], cwd=ROOT, text=True).strip()
        if match.group(1) != actual:
            errors.append(f"{path}: Git blob changed without manifest update: {actual}")
for path in (
    "docs/pixel/reference/karen_chibi_direction_v1.png",
    "docs/pixel/reference/triton_chibi_direction_lock_v1.png",
    "docs/pixel/reference/sophie_chibi_direction_appeal_v3_48.png",
    "docs/pixel/reference/margaret_chibi_direction_appeal_v7_48.png",
):
    pattern = rf"^\| `{re.escape(path)}` \| `([0-9a-f]{{40}})`"
    match = re.search(pattern, manifest, re.MULTILINE)
    actual = subprocess.check_output(["git", "hash-object", path], cwd=ROOT, text=True).strip()
    if not match or match.group(1) != actual:
        errors.append(f"{path}: active reference hash mismatch")
if errors:
    raise SystemExit("PHASE-1 ASSET MANIFEST FAIL\n" + "\n".join(errors))
print("PHASE-1 ASSET MANIFEST PASS: 32 sheets + 4 references pinned to Git object SHA")
