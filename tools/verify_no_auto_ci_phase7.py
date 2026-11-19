#!/usr/bin/env python3
"""Keep the capital Draft branch on manual-only hosted workflows while quota is exhausted."""
from pathlib import Path
import re
import sys

ROOT=Path(__file__).resolve().parents[1]
FILES=(
    ".github/workflows/capital-first-arc-acceptance.yml",
    ".github/workflows/karen-prototype-check.yml",
)
failures=[]
for rel in FILES:
    path=ROOT/rel
    if not path.is_file():
        failures.append(f"missing workflow {rel}")
        continue
    text=path.read_text(encoding="utf-8")
    if not re.search(r"(?m)^on:\s*\n(?:[ ]{2}workflow_dispatch:\s*\n)",text):
        failures.append(f"{rel}: expected explicit manual-only trigger")
    if re.search(r"(?m)^[ ]{2}(?:push|pull_request|schedule|workflow_run):",text):
        failures.append(f"{rel}: automatic GitHub Actions trigger reintroduced")
    if "permissions:" not in text or "contents: read" not in text:
        failures.append(f"{rel}: read-only permissions lost")
if failures:
    print("PHASE 7 MANUAL-ONLY ACTIONS REGRESSION",file=sys.stderr)
    for issue in failures:
        print(" -",issue,file=sys.stderr)
    sys.exit(1)
print("PHASE 7 NO-AUTO-ACTIONS PASS: existing test jobs retained for local/manual use")
