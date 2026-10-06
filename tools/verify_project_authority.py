#!/usr/bin/env python3
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
FILES={
 "current":ROOT/"docs/audit/CURRENT_PROJECT_STATE.md",
 "next":ROOT/"docs/audit/NEXT_WORK_ORDER.md",
 "source":ROOT/"docs/visual/SOURCE_OF_TRUTH_STATUS.md",
}
errors=[]
for label,path in FILES.items():
    if not path.exists(): errors.append(f"missing authority file: {path.relative_to(ROOT)}")
if errors:
    print("\n".join(errors),file=sys.stderr);sys.exit(1)
current=FILES["current"].read_text(encoding="utf-8")
nxt=FILES["next"].read_text(encoding="utf-8")
source=FILES["source"].read_text(encoding="utf-8")
checks=[
 ("current",current,"main / v23 / Save schema 23"),
 ("current",current,"Triton Second Character Validation PASS"),
 ("current",current,"Sophie 4-direction + 8Animation technical implementation"),
 ("current",current,"Environment Pixel production remains paused"),
 ("next",nxt,"Sophie 4-direction + 8Animation implementation"),
 ("next",nxt,"Sophie Character Validation — PASS / REVISE"),
 ("source",source,"Sophie Chibi Direction Lock v1 — USER APPROVED"),
 ("source",source,"Sophie 4-direction + 8Animation technical implementation"),
 ("source",source,"Environment Pixel production remains paused"),
]
for label,textv,needle in checks:
    if needle not in textv: errors.append(f"{label} authority missing {needle!r}")
stale=[
 "Sophie v3: user Visual Review pending",
 "Sophie remains front-only until explicit PASS",
 "Sophie Front v3 — PASS / REVISE / FAIL",
]
for marker in stale:
    if marker in current or marker in nxt or marker in source:
        errors.append(f"stale Sophie front-gate marker remains: {marker!r}")
if errors:
    print("GRAY CROWN AUTHORITY CONSISTENCY FAILED",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)
print("GRAY CROWN AUTHORITY CONSISTENCY PASS")
print("Sophie Chibi Direction Lock v1 is authoritative")
print("Active phase: Sophie 4-direction + 8Animation technical implementation")
print("Karen and Triton remain locked controls")
print("Margaret and Environment remain paused")
