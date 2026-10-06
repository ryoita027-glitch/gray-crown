#!/usr/bin/env python3
"""Write a machine-readable snapshot of the Triton-completion CI state."""
from pathlib import Path
import hashlib
import importlib.metadata
import json
import os
import platform
import re
import subprocess

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"
OUT.mkdir(exist_ok=True)

def sha256(rel):
    p=ROOT/rel
    return hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() and p.is_file() else None

def git(*args):
    return subprocess.check_output(["git",*args],cwd=ROOT,text=True).strip()

def installed(name):
    try:return importlib.metadata.version(name)
    except importlib.metadata.PackageNotFoundError:return None

def command_version(*args):
    try:return subprocess.check_output(list(args),text=True).strip()
    except Exception:return None

event={}
event_path=os.environ.get("GITHUB_EVENT_PATH")
if event_path and Path(event_path).exists():
    try:event=json.loads(Path(event_path).read_text(encoding="utf-8"))
    except Exception:pass
pr=event.get("pull_request") or {}
save_text=(ROOT/"js/core/save.js").read_text(encoding="utf-8")
m=re.search(r"\bSAVE_SCHEMA\s*=\s*(\d+)\s*;",save_text)

files=[
    "docs/audit/CURRENT_PROJECT_STATE.md",
    "docs/audit/NEXT_WORK_ORDER.md",
    "docs/visual/SOURCE_OF_TRUTH_STATUS.md",
    "docs/pixel/reference/karen_chibi_direction_v1.png",
    "docs/pixel/reference/triton_chibi_direction_lock_v1.png",
    "docs/pixel/reference/triton_idle_4dir_v1.png",
    "prototype_artifacts/triton_completion_integrity.json",
    "prototype_artifacts/karen_triton_completion_metrics.json",
    "prototype_artifacts/browser_suite_summary.json",
]
for char in ("karen","triton"):
    for anim in ("idle","walk","turn","talk","surprise","approach","laugh","run"):
        files.append(f"assets/characters/{char}/{char}_{anim}.png")

data={
    "project":"Gray Crown",
    "production_baseline":{"branch":"main","game_version":"v23","save_schema":int(m.group(1)) if m else None},
    "active_gate":"Triton completion",
    "approved_visual_source":"Triton Chibi Direction Lock v1",
    "automation_boundary":{
        "technical_completion_checks_are_automatic":True,
        "main_merge_is_automatic":False,
        "formal_pixel_native_adoption_is_automatic":False,
        "sophie_visual_approval_is_automatic":False,
    },
    "git":{
        "checked_out_head":git("rev-parse","HEAD"),
        "pr_head_sha":((pr.get("head") or {}).get("sha")),
        "pr_head_ref":((pr.get("head") or {}).get("ref")),
        "pr_base_ref":((pr.get("base") or {}).get("ref")),
        "github_sha":os.environ.get("GITHUB_SHA"),
        "ref_name":os.environ.get("GITHUB_REF_NAME"),
        "working_tree":subprocess.check_output(["git","status","--porcelain","--untracked-files=all"],cwd=ROOT,text=True).splitlines(),
    },
    "github_actions":{"event":os.environ.get("GITHUB_EVENT_NAME"),"run_id":os.environ.get("GITHUB_RUN_ID"),"run_number":os.environ.get("GITHUB_RUN_NUMBER")},
    "environment":{
        "python":platform.python_version(),
        "node":command_version("node","--version"),
        "npm":command_version("npm","--version"),
        "packages":{"pillow":installed("pillow"),"playwright":installed("playwright"),"greenlet":installed("greenlet"),"pyee":installed("pyee"),"typing-extensions":installed("typing-extensions")},
    },
    "sha256":{rel:sha256(rel) for rel in files},
}
(OUT/"ci_state_manifest.json").write_text(json.dumps(data,indent=2,ensure_ascii=False),encoding="utf-8")
print(json.dumps(data,indent=2,ensure_ascii=False))
