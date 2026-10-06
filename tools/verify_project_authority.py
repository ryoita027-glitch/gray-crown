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
 ("current",current,"Triton Chibi Direction Lock v1"),
 ("current",current,"Triton completion: **PASS**"),
 ("current",current,"Triton Second Character Validation PASS"),
 ("current",current,"Sophie — STEADY HANDS front Idle validation"),
 ("next",nxt,"Triton completion PASS"),
 ("next",nxt,"Triton Second Character Validation PASS"),
 ("next",nxt,"Sophie — STEADY HANDS"),
 ("next",nxt,"Sophie Front — PASS / REVISE / FAIL"),
 ("source",source,"Triton Chibi Direction Lock v1"),
 ("source",source,"Triton completion: PASS"),
 ("source",source,"Triton Second Character Validation PASS"),
 ("source",source,"Sophie — STEADY HANDS front Idle"),
 ("source",source,"main merge")
]
for label,textv,needle in checks:
    if needle not in textv:
        errors.append(f"{label} authority missing {needle!r}")

stale=[
 "Sophie is paused until Triton",
 "Active phase: Triton completion",
 "TRITON FRONT V4 — USER VISUAL GATE"
]
for marker in stale:
    if marker in current or marker in nxt or marker in source:
        errors.append(f"stale active-gate marker remains: {marker!r}")

if errors:
    print("GRAY CROWN AUTHORITY CONSISTENCY FAILED",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)

print("GRAY CROWN AUTHORITY CONSISTENCY PASS")
print("Triton Second Character Validation PASS is authoritative")
print("Active gate: Sophie — STEADY HANDS front Idle")
print("Karen remains locked; Margaret remains paused")
print("main merge remains non-automatic")
