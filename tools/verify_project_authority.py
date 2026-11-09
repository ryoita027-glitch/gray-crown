#!/usr/bin/env python3
"""Reject stale phase-0 authority, accidental production promotion and misidentified work.
Phase-1 state is deliberately **development adoption**, not a main merge.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    "current": ROOT / "docs/audit/CURRENT_PROJECT_STATE.md",
    "next": ROOT / "docs/audit/NEXT_WORK_ORDER.md",
    "handoff": ROOT / "docs/audit/NEXT_AI_MASTER_INSTRUCTION.md",
    "visual": ROOT / "docs/visual/SOURCE_OF_TRUTH_STATUS.md",
    "manifest": ROOT / "docs/visual/VISUAL_ASSET_MANIFEST.md",
    "standard": ROOT / "docs/visual/PIXEL_NATIVE_PRODUCTION_STANDARD_v1.md",
    "slice": ROOT / "docs/audit/VERTICAL_SLICE_PRODUCTION_PLAN_v1.md",
}
errors = []
texts = {}
for name, path in FILES.items():
    if not path.is_file():
        errors.append(f"missing authority file {path.relative_to(ROOT)}")
    else:
        texts[name] = path.read_text(encoding="utf-8")
if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)

branch = "integration/phase1-pixel-native-baseline-20261010"
for name in ("current", "next", "handoff", "visual"):
    for needle in (branch, "main", "23", "Portrait", "UNDECIDED"):
        if needle not in texts[name]:
            errors.append(f"{name}: missing authority marker {needle}")
for name in ("current", "visual"):
    for needle in ("LOCKED", "PROVISIONAL", "SUPERSEDED", "Sophie", "Margaret", "v3", "v7"):
        if needle not in texts[name]:
            errors.append(f"{name}: missing active-status marker {needle}")
for name in ("current", "next", "slice"):
    if "Story 00–19" not in texts[name] or "Save schema 23" not in texts[name]:
        errors.append(f"{name}: production Story/Save guard missing")
if "v23" not in texts["handoff"]:
    errors.append("handoff: baseline v23 missing")
for needle in ("48×48", "44", "[24,44]", "down, left, right, up", "idle=4", "walk=6"):
    if needle not in texts["standard"]:
        errors.append(f"standard: missing sprite-contract {needle}")
if "AI-generated comparison boards remain prohibited" not in texts["visual"]:
    errors.append("visual: exact-PNG validation policy missing")
if "Ryune Village" not in texts["slice"] or "first boss" not in texts["slice"]:
    errors.append("slice: agreed vertical-slice boundary missing")
if "assets/characters/karen/karen_walk.png" not in texts["manifest"]:
    errors.append("manifest: live assets not enumerated")
# Check these specific *active instruction* regressions, not historical mentions.
for stale in ("Create only one front-facing Karen Idle candidate",
              "Now: Karen Cute Chibi Pixel Direction — Front Idle Gate",
              "Do not proceed to Triton", "Sophie is paused until"):
    if any(stale in texts[name] for name in ("current", "next", "handoff", "visual")):
        errors.append(f"active work order reintroduced obsolete instruction: {stale}")
# Executable non-canon guard, independent of narrative.
save = (ROOT / "js/core/save.js").read_text(encoding="utf-8")
if "const SAVE_SCHEMA=23;" not in save:
    errors.append("runtime SAVE_SCHEMA unexpectedly changed")
state = (ROOT / "js/core/state.js").read_text(encoding="utf-8")
if "schema:23" not in state:
    errors.append("runtime state schema changed")
if errors:
    print("PHASE-1 AUTHORITY FAILED:", file=sys.stderr)
    print("\n".join(" - "+e for e in errors), file=sys.stderr)
    sys.exit(1)
print("PHASE-1 AUTHORITY PASS: candidate development adoption / main v23 unchanged")
