#!/usr/bin/env python3
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
FILES={"current":ROOT/"docs/audit/CURRENT_PROJECT_STATE.md","next":ROOT/"docs/audit/NEXT_WORK_ORDER.md","source":ROOT/"docs/visual/SOURCE_OF_TRUTH_STATUS.md"}
errors=[]
for label,path in FILES.items():
 if not path.exists():errors.append(f"missing authority file: {path.relative_to(ROOT)}")
if errors:
 print("\n".join(errors),file=sys.stderr);sys.exit(1)
current=FILES["current"].read_text(encoding="utf-8");nxt=FILES["next"].read_text(encoding="utf-8");source=FILES["source"].read_text(encoding="utf-8")
checks=[
 ("current",current,"main / v23 / Save schema 23"),
 ("current",current,"Triton Chibi Direction Lock v1"),("current",current,"Triton completion"),
 ("next",nxt,"Triton completion"),("next",nxt,"Triton Second Character Validation PASS"),("next",nxt,"Sophie"),
 ("source",source,"Triton Chibi Direction Lock v1"),("source",source,"Sophie is paused"),("source",source,"main merge")
]
for label,textv,needle in checks:
 if needle not in textv:errors.append(f"{label} authority missing {needle!r}")
if "Triton Front v4" in current or "Triton Front v4" in nxt or "Triton Front v4" in source:
 errors.append("stale Triton v4 user-gate marker remains in active authority")
if errors:
 print("GRAY CROWN AUTHORITY CONSISTENCY FAILED",file=sys.stderr)
 for e in errors:print(" -",e,file=sys.stderr)
 sys.exit(1)
print("GRAY CROWN AUTHORITY CONSISTENCY PASS")
print("Active gate: Triton completion from user-approved Chibi Direction Lock v1")
print("Karen remains locked; Sophie remains paused until Triton PASS")
print("main merge remains non-automatic")
