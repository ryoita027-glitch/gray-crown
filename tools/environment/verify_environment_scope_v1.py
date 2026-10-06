#!/usr/bin/env python3
from pathlib import Path
import subprocess, os, sys, json

ROOT=Path(__file__).resolve().parents[2]
base=os.environ.get("ENV_PROTOTYPE_BASE_REF","origin/pixel-karen-triton-face-differentiation-fix")
try: out=subprocess.check_output(["git","diff","--name-only",f"{base}...HEAD"],cwd=ROOT,text=True)
except subprocess.CalledProcessError as e:
    print("ENVIRONMENT SCOPE FAIL: cannot diff base",e,file=sys.stderr); sys.exit(1)
changed=[x for x in out.splitlines() if x]
allowed_prefixes=("docs/pixel/environment/","docs/pixel/reference/environment/","assets/environment/prototype/","prototypes/environment/","tools/environment/","tests/environment/")
allowed_exact={".github/workflows/environment-prototype-check.yml","package.json"}
forbidden_prefixes=("js/data/maps.js","js/core/","js/systems/","js/render/","assets/characters/","docs/audit/","docs/visual/SOURCE_OF_TRUTH_STATUS.md","docs/pixel/reference/karen_","docs/pixel/reference/triton_")
errors=[]
for p in changed:
    if p=="package.json": continue
    if p in allowed_exact or any(p.startswith(x) for x in allowed_prefixes): continue
    errors.append(f"outside allowed environment scope: {p}")
    if any(p.startswith(x) for x in forbidden_prefixes): errors.append(f"protected path changed: {p}")
if "package.json" in changed:
    before=json.loads(subprocess.check_output(["git","show",f"{base}:package.json"],cwd=ROOT,text=True)); after=json.loads((ROOT/"package.json").read_text())
    b_scripts=before.pop("scripts",{}); a_scripts=after.pop("scripts",{})
    if before!=after: errors.append("package.json changed outside scripts")
    for k,v in b_scripts.items():
        if a_scripts.get(k)!=v: errors.append(f"existing package script changed: {k}")
    required={"environment-generate","environment-verify","environment-scope","environment-evidence","environment-browser-test","environment-check"}
    if not required.issubset(a_scripts): errors.append("environment package scripts incomplete")
if errors:
    print("GRAY CROWN ENVIRONMENT SCOPE v1 FAIL",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)
print("GRAY CROWN ENVIRONMENT SCOPE v1 PASS")
print("changed files",len(changed))
