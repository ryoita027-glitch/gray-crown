#!/usr/bin/env python3
"""Run every browser gate, keep going after failures, and preserve per-test logs."""
from pathlib import Path
import json
import os
import subprocess
import sys
import time

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"/"browser_logs"
OUT.mkdir(parents=True,exist_ok=True)
TESTS=[
    "tests/browser_v21_gate.py",
    "tests/browser_alpha2_frontier_e2e_test.py",
    "tests/browser_alpha2_frontier_second_e2e_test.py",
    "tests/browser_devmode_test.py",
    "tests/browser_karen_pixel_prototype_e2e_test.py",
    "tests/browser_karen_chibi_scale_e2e_test.py",
    "tests/browser_triton_pixel_validation_e2e_test.py",
    "tests/browser_sophie_pixel_validation_e2e_test.py",
]
summary=[]
failed=[]
env=os.environ.copy()
env["PYTHONUNBUFFERED"]="1"

for rel in TESTS:
    started=time.monotonic()
    name=Path(rel).stem
    try:
        proc=subprocess.run(
            [sys.executable,rel],
            cwd=ROOT,
            env=env,
            capture_output=True,
            text=True,
            timeout=240,
        )
        code=proc.returncode
        output=(proc.stdout or "")+("\n--- STDERR ---\n"+proc.stderr if proc.stderr else "")
        status="PASS" if code==0 else "FAIL"
    except subprocess.TimeoutExpired as exc:
        code=124
        output=(exc.stdout or "")+("\n--- STDERR ---\n"+(exc.stderr or "") if exc.stderr else "")
        output+=f"\nTIMEOUT: {rel} exceeded 240 seconds\n"
        status="TIMEOUT"
    seconds=round(time.monotonic()-started,3)
    (OUT/f"{name}.log").write_text(output,encoding="utf-8")
    summary.append({"test":rel,"status":status,"exit_code":code,"seconds":seconds})
    print(f"[{status}] {rel} ({seconds}s)",flush=True)
    if code!=0:
        failed.append(rel)
        tail="\n".join(output.splitlines()[-60:])
        print(f"--- failure tail: {rel} ---\n{tail}\n--- end tail ---",flush=True)

summary_path=ROOT/"prototype_artifacts"/"browser_suite_summary.json"
summary_path.write_text(json.dumps(summary,indent=2),encoding="utf-8")

if failed:
    print("BROWSER SUITE FAIL:",", ".join(failed),file=sys.stderr)
    sys.exit(1)
print(f"BROWSER SUITE PASS: {len(TESTS)} gates")
