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
 ("current",current,"main / v23 / Save schema 23 / Story 00–19"),
 ("current",current,"Sophie Chibi Direction Lock v2"),
 ("current",current,"Margaret Chibi Direction Lock v5"),
 ("current",current,"FOUR PROTAGONIST RUNTIME HARMONIZATION"),
 ("current",current,"four-protagonist environment integration"),
 ("next",nxt,"Four Protagonist Runtime Harmonization"),
 ("next",nxt,"Four Protagonist Environment Integration"),
 ("source",source,"Sophie Chibi Direction Lock v2"),
 ("source",source,"Margaret Chibi Direction Lock v5"),
 ("source",source,"FOUR PROTAGONIST RUNTIME HARMONIZATION"),
 ("source",source,"AI-generated comparison boards remain prohibited"),
]
for label,textv,needle in checks:
    if needle not in textv: errors.append(f"{label} authority missing {needle!r}")

stale=[
 "Margaret remains paused until Sophie PASS",
 "Margaret before Sophie PASS",
 "Sophie Character Validation — USER PASS / REVISE",
 "Sophie Character Validation — PASS / REVISE",
 "Environment Pixel production remains paused until Karen, Triton, Sophie and Margaret complete validation",
]
for marker in stale:
    if marker in current or marker in nxt or marker in source:
        errors.append(f"stale protagonist gate remains: {marker!r}")

if errors:
    print("GRAY CROWN AUTHORITY CONSISTENCY FAILED",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)

print("GRAY CROWN AUTHORITY CONSISTENCY PASS")
print("Production remains main / v23 / Save schema 23 / Story 00-19")
print("Karen/Triton locked; Sophie v2 cleanup and Margaret v5 runtime promoted on prototype branch")
print("Active gate: Four Protagonist Runtime Harmonization")
print("Next after green: Four Protagonist Environment Integration")
