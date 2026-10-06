#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
FILES={
  "current":ROOT/"docs/audit/CURRENT_PROJECT_STATE.md",
  "next":ROOT/"docs/audit/NEXT_WORK_ORDER.md",
  "source":ROOT/"docs/visual/SOURCE_OF_TRUTH_STATUS.md"
}
errors=[]
for label,path in FILES.items():
    if not path.exists():
        errors.append(f"missing authority file: {path.relative_to(ROOT)}")
if errors:
    print("\n".join(errors),file=sys.stderr);sys.exit(1)

current=FILES["current"].read_text(encoding="utf-8")
nxt=FILES["next"].read_text(encoding="utf-8")
source=FILES["source"].read_text(encoding="utf-8")

checks=[
 ("current",current,"main / v23 / Save schema 23"),
 ("current",current,"Triton Second Character Validation PASS"),
 ("current",current,"Sophie — STEADY HANDS Front Candidate v3 redesign"),
 ("current",current,"Environment Pixel production is not authorized"),
 ("next",nxt,"Triton Second Character Validation PASS"),
 ("next",nxt,"Sophie — STEADY HANDS Front Candidate v3"),
 ("next",nxt,"Sophie Front v3 — PASS / REVISE / FAIL"),
 ("source",source,"Triton Second Character Validation PASS"),
 ("source",source,"Sophie — STEADY HANDS Front Candidate v3 redesign"),
 ("source",source,"Visual REVISE — rejected as frightening / uncanny"),
 ("source",source,"Environment Pixel production remains paused"),
]
for label,textv,needle in checks:
    if needle not in textv:
        errors.append(f"{label} authority missing {needle!r}")

stale=[
 "Sophie v2: user Visual Review pending",
 "Sophie — STEADY HANDS Front Candidate v2 Visual Gate",
 "TRITON FRONT V4 — USER VISUAL GATE",
]
for marker in stale:
    if marker in current or marker in nxt or marker in source:
        errors.append(f"stale active-gate marker remains: {marker!r}")

if errors:
    print("GRAY CROWN AUTHORITY CONSISTENCY FAILED",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)

print("GRAY CROWN AUTHORITY CONSISTENCY PASS")
print("Active gate: Sophie — STEADY HANDS Front Candidate v3 redesign")
print("Sophie v2 is rejected; no directional expansion authorized")
print("Karen and Triton remain locked controls")
print("Margaret and Environment remain paused")
