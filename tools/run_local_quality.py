#!/usr/bin/env python3
"""Run Gray Crown's real quality gates on the developer PC, no GitHub Actions minutes.

Windows usage (from repo root):
    py -3 tools/run_local_quality.py --mode full --install
    py -3 tools/run_local_quality.py --mode quick
All commands execute synchronously, in the **actual local repository checkout**.
Reports are written under ignored prototype_artifacts/local_quality_runs/.
Never treats an unrun command as a PASS. Never pushes, merges or edits sprites.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "prototype_artifacts" / "local_quality_runs"
MAIN_V23 = "d689aabb5146c9f45466a4f74f397e664c08fb4f"

SOURCES = [
    ["python", "tools/verify_phase1_asset_manifest.py"],
    ["python", "tools/verify_sophie_direction_lock.py"],
    ["python", "tools/verify_margaret_direction_lock.py"],
    ["python", "tools/verify_clean_runtime_sprite_assets.py"],
    ["python", "tools/verify_four_protagonist_appeal_runtime.py"],
]
FULL_BROWSER = [
    ["python", "tests/browser_pixel_vslice_acceptance_e2e_test.py"],
    ["python", "tests/browser_ryune_acting_e2e_test.py"],
    ["python", "tests/browser_ryune_environment_e2e_test.py"],
    ["python", "tests/browser_road_cave_quality_e2e_test.py"],
    ["python", "tests/browser_vertical_slice_e2e_test.py"],
    ["python", "tests/browser_capital_first_arc_e2e_test.py"],
]

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("quick", "capital", "full"), default="quick")
    parser.add_argument("--install", action="store_true",
        help="Install pinned Python dependencies and Chromium into current PC (network required)")
    parser.add_argument("--with-v23", action="store_true",
        help="Create a temporary local git worktree at real main-v23 SHA and run historical save test")
    args = parser.parse_args()
    stamp = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    out = BASE / stamp
    out.mkdir(parents=True, exist_ok=True)
    python = sys.executable
    npm = shutil.which("npm.cmd" if os.name == "nt" else "npm")
    if not npm:
        print("Node.js/npm not installed. Install current Node LTS.", file=sys.stderr)
        return 2
    git = shutil.which("git")
    env = dict(os.environ)
    if not os.access(ROOT / "package.json", os.R_OK):
        print("Run from a complete local checkout of Gray Crown.", file=sys.stderr)
        return 2
    started = time.monotonic()
    steps = []
    report = {
        "run_started_at": dt.datetime.now().isoformat(),
        "mode": args.mode,
        "root": str(ROOT),
        "github_actions_minutes_used": 0,
        "tests": steps,
        "artifacts": [
            "prototype_artifacts/capital_first_arc_v1/",
            "prototype_artifacts/vertical_slice_v1/",
            "prototype_artifacts/ryune_acting_v1/",
            "prototype_artifacts/road_cave_combat_v1/"
        ],
        "head_sha": None,
        "v23_fixture": "not requested",
        "verdict": "NOT RUN",
    }

    def resolve(command):
        return [python if x == "python" else npm if x == "npm" else x for x in command]

    def run(label, command, environment=None, timeout=3600):
        actual = resolve(command)
        logfile = out / (str(len(steps)+1).zfill(2) + "_" +
                         "".join(c if c.isalnum() or c in "-_" else "_" for c in label) + ".log")
        print(f"\n[{len(steps)+1}] {label}: {' '.join(map(str, command))}", flush=True)
        begin = time.monotonic()
        try:
            with logfile.open("w", encoding="utf-8", errors="replace") as stream:
                proc = subprocess.run(actual, cwd=ROOT, env=environment or env,
                                      stdout=stream, stderr=subprocess.STDOUT,
                                      timeout=timeout, check=False)
            code = proc.returncode
            exception = None
        except Exception as e:
            code, exception = 1, str(e)
            logfile.write_text(exception, encoding="utf-8")
        item = {
            "label": label,
            "command": command,
            "result": "PASS" if code == 0 else "FAIL",
            "returncode": code,
            "seconds": round(time.monotonic() - begin, 2),
            "log": str(logfile.relative_to(ROOT))
                if logfile.is_relative_to(ROOT) else str(logfile),
        }
        if exception:
            item["error"] = exception
        steps.append(item)
        print(f"    {item['result']} ({item['seconds']}s) — {logfile}", flush=True)
        if code:
            print(logfile.read_text(encoding="utf-8", errors="replace")[-6000:])
        write_report()
        return code == 0

    def write_report():
        report["seconds_elapsed"] = round(time.monotonic() - started, 2)
        (out / "results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    worktree = None
    try:
        if git:
            p = subprocess.run([git, "rev-parse", "HEAD"], cwd=ROOT,
                               text=True, capture_output=True, check=False)
            if p.returncode == 0:
                report["head_sha"] = p.stdout.strip()
        write_report()
        if args.install:
            if not run("pinned-python-dependencies", ["python", "-m", "pip", "install", "-r", "requirements-ci.txt"]):
                return 1
            if args.mode != "quick" and not run("playwright-chromium", ["python", "-m", "playwright", "install", "chromium"]):
                return 1

        # Developer-safe quick path: no browser download, minimal CPU and zero Actions.
        if not run("repo-hygiene", ["python", "tools/verify_repo_hygiene.py"]): return 1
        if not run("source-of-truth", ["python", "tools/verify_project_authority.py"]): return 1
        if not run("source-syntax", ["python", "-m", "compileall", "-q", "tools", "tests"]): return 1
        if not run("javascript-syntax", ["node", "tests/check-syntax.js"]): return 1
        if not run("all-node-regressions", [npm, "test"]): return 1
        for i, source in enumerate(SOURCES):
            if not run("locked-asset-" + str(i+1), source): return 1

        if args.mode != "quick":
            # This includes existing Story 00-19 browser gates.
            if not run("original-full-npm-check", [npm, "run", "check"]): return 1
            browser_tests = FULL_BROWSER if args.mode == "full" else [
                ["python", "tests/browser_capital_first_arc_e2e_test.py"]]
            for i, command in enumerate(browser_tests):
                if not run("real-chromium-" + str(i+1), command): return 1

        if args.with_v23:
            if not git:
                print("Historical main v23 test requires git.", file=sys.stderr)
                return 1
            # Use local immutable SHA, NOT a guessed new baseline or remote branch.
            check = subprocess.run([git, "cat-file", "-e", MAIN_V23 + "^{commit}"],
                                   cwd=ROOT, check=False, capture_output=True)
            if check.returncode:
                report["v23_fixture"] = "BLOCKED: immutable production commit absent from local git database"
                write_report()
                print("Historical v23 commit unavailable locally. Fetch original git history separately.")
                return 1
            worktree = Path(tempfile.mkdtemp(prefix="gray_crown_v23_"))
            worktree.rmdir()
            add = subprocess.run([git, "worktree", "add", "--detach", str(worktree), MAIN_V23],
                                 cwd=ROOT, text=True, capture_output=True, check=False)
            if add.returncode:
                report["v23_fixture"] = "BLOCKED: " + add.stderr
                write_report()
                return 1
            report["v23_fixture"] = "actual immutable git commit " + MAIN_V23
            env["GRAY_CROWN_MAIN_V23_DIR"] = str(worktree)
            if not run("real-main-v23-save-migration-backup", [
                  "python", "tests/browser_phase0_remaining_e2e_test.py"], environment=env):
                return 1
        report["verdict"] = "PASS"
        print("\nAll requested local tests PASSED. This is not an artistic approval.")
        return 0
    finally:
        if worktree is not None and git:
            subprocess.run([git, "worktree", "remove", "--force", str(worktree)],
                           cwd=ROOT, check=False, capture_output=True)
        if report["verdict"] != "PASS":
            report["verdict"] = "FAIL_OR_INCOMPLETE"
        report["run_completed_at"] = dt.datetime.now().isoformat()
        write_report()
        print(f"\nMachine-readable evidence: {out / 'results.json'}", flush=True)


if __name__ == "__main__":
    sys.exit(main())
