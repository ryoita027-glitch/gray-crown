#!/usr/bin/env python3
"""Protect Karen as Gray Crown's visual regression control.

This file intentionally pins Git blob IDs for Karen's approved source atlas and
all committed runtime PNGs. Triton/Sophie/Margaret work must never update these
files implicitly.
"""
from pathlib import Path
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
EXPECTED={
 "docs/pixel/reference/karen_chibi_direction_v1.png":"d5aaf6029efaf246e9dc5afd75e1faa043870dbc",
 "assets/characters/karen/karen_idle.png":"782785fd504a4baba92be4ff099a827dd1ecac81",
 "assets/characters/karen/karen_walk.png":"2d1085e3e07aaa2550dccf2d33fe961ea6f2d3de",
 "assets/characters/karen/karen_turn.png":"5dca0ed451a45bc019d6654a8c3becfa22f9a4f1",
 "assets/characters/karen/karen_talk.png":"2e1fa043a623fe2e184998f8789790e891c411d7",
 "assets/characters/karen/karen_surprise.png":"776ec4c88acc0eff208050b440670f16cc3fb95b",
 "assets/characters/karen/karen_approach.png":"c089bad76a00c13b8866263f2649c4a5b0a0b959",
 "assets/characters/karen/karen_laugh.png":"cc2846879fe90b696f958a1708906f1d9d8b8787",
 "assets/characters/karen/karen_run.png":"d08632ecb9ceda11d900b8a0263790c92ebfef58",
}

def blob_id(path):
    p=ROOT/path
    if not p.exists():
        return None
    return subprocess.check_output(["git","hash-object",str(p)],cwd=ROOT,text=True).strip()

errors=[]
for path,expected in EXPECTED.items():
    actual=blob_id(path)
    if actual!=expected:
        errors.append((path,expected,actual))
    else:
        print(f"KAREN LOCK OK {actual} {path}")

if errors:
    print("KAREN VISUAL REGRESSION CONTROL FAILED",file=sys.stderr)
    for path,expected,actual in errors:
        print(f" - {path}: expected {expected}, got {actual}",file=sys.stderr)
    sys.exit(1)

print(f"KAREN VISUAL REGRESSION CONTROL PASS: {len(EXPECTED)} committed PNGs unchanged")
