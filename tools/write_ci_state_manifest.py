#!/usr/bin/env python3
"""Write a machine-readable snapshot of the current CI/handoff state."""
from pathlib import Path
import hashlib
import importlib.metadata
import json
import os
import platform
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "prototype_artifacts"
OUT.mkdir(exist_ok=True)

def sha256(rel):
    path = ROOT / rel
    if not path.exists() or not path.is_file():
        return None
    return hashlib.sha256(path.read_bytes()).hexdigest()

def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()

def installed_version(name):
    try:
        return importlib.metadata.version(name)
    except importlib.metadata.PackageNotFoundError:
        return None

def command_version(*args):
    try:
        return subprocess.check_output(list(args), text=True).strip()
    except Exception:
        return None

def event_context():
    path = os.environ.get("GITHUB_EVENT_PATH")
    if not path or not Path(path).exists():
        return {}
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception:
        return {}

event = event_context()
pr = event.get("pull_request") or {}

save_text = (ROOT / "js/core/save.js").read_text(encoding="utf-8")
m = re.search(r"\bSAVE_SCHEMA\s*=\s*(\d+)\s*;", save_text)

files = [
    "docs/audit/CURRENT_PROJECT_STATE.md",
    "docs/audit/NEXT_WORK_ORDER.md",
    "docs/visual/SOURCE_OF_TRUTH_STATUS.md",
    "docs/pixel/reference/karen_chibi_direction_v1.png",
    "docs/pixel/reference/triton_idle_4dir_v1.png",
    "docs/pixel/reference/triton_idle_front_repair_candidate_v3_48.png",
    "prototype_artifacts/triton_idle_front_repair_candidate_v4_48.png",
]
for char in ("karen", "triton"):
    for anim in ("idle", "walk", "turn", "talk", "surprise", "approach", "laugh", "run"):
        files.append(f"assets/characters/{char}/{char}_{anim}.png")

status = subprocess.check_output(
    ["git", "status", "--porcelain", "--untracked-files=all"],
    cwd=ROOT,
    text=True,
).splitlines()

data = {
    "project": "Gray Crown",
    "production_baseline": {
        "branch": "main",
        "game_version": "v23",
        "save_schema": int(m.group(1)) if m else None,
    },
    "active_gate": "Triton Front v4 — USER VISUAL",
    "automation_boundary": {
        "visual_pass_is_automatic": False,
        "main_merge_is_automatic": False,
        "formal_pixel_native_adoption_is_automatic": False,
    },
    "git": {
        "checked_out_head": git("rev-parse", "HEAD"),
        "pr_head_sha": ((pr.get("head") or {}).get("sha")),
        "pr_head_ref": ((pr.get("head") or {}).get("ref")),
        "pr_base_ref": ((pr.get("base") or {}).get("ref")),
        "github_sha": os.environ.get("GITHUB_SHA"),
        "ref_name": os.environ.get("GITHUB_REF_NAME"),
        "working_tree_after_generation": status,
    },
    "github_actions": {
        "event": os.environ.get("GITHUB_EVENT_NAME"),
        "run_id": os.environ.get("GITHUB_RUN_ID"),
        "run_number": os.environ.get("GITHUB_RUN_NUMBER"),
    },
    "environment": {
        "python": platform.python_version(),
        "node": command_version("node", "--version"),
        "npm": command_version("npm", "--version"),
        "packages": {
            "pillow": installed_version("pillow"),
            "playwright": installed_version("playwright"),
            "greenlet": installed_version("greenlet"),
            "pyee": installed_version("pyee"),
            "typing-extensions": installed_version("typing-extensions"),
        },
    },
    "sha256": {rel: sha256(rel) for rel in files},
}
path = OUT / "ci_state_manifest.json"
path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
print(json.dumps(data, indent=2, ensure_ascii=False))
