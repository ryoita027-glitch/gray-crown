#!/usr/bin/env python3
"""Fail fast when Gray Crown's current authority documents drift out of sync.

This is intentionally a phase guard, not a design decider. It protects the
current handoff from stale instructions while keeping visual approval manual.
When the user changes the active phase, update the authority documents and this
guard together in the same reviewed change.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

FILES = {
    "current": ROOT / "docs/audit/CURRENT_PROJECT_STATE.md",
    "next": ROOT / "docs/audit/NEXT_WORK_ORDER.md",
    "source": ROOT / "docs/visual/SOURCE_OF_TRUTH_STATUS.md",
}

errors = []

for label, path in FILES.items():
    if not path.exists():
        errors.append(f"missing authority file: {path.relative_to(ROOT)}")

if errors:
    for error in errors:
        print("AUTHORITY GUARD FAIL:", error, file=sys.stderr)
    sys.exit(1)

current = FILES["current"].read_text(encoding="utf-8")
next_work = FILES["next"].read_text(encoding="utf-8")
source = FILES["source"].read_text(encoding="utf-8")

checks = [
    ("current", current, "production branch: `main`"),
    ("current", current, "Save schema: 23"),
    ("current", current, "docs/pixel/reference/karen_chibi_direction_v1.png"),
    ("current", current, "pixel-karen-triton-face-differentiation-fix"),
    ("current", current, "TRITON FRONT V4"),
    ("current", current, "USER VISUAL GATE"),
    ("next", next_work, "Triton Front v4"),
    ("next", next_work, "USER VISUAL PASS / REVISE / FAIL"),
    ("next", next_work, "Sophie"),
    ("next", next_work, "main merge"),
    ("source", source, "docs/audit/CURRENT_PROJECT_STATE.md"),
    ("source", source, "docs/audit/NEXT_WORK_ORDER.md"),
    ("source", source, "Triton Front v4"),
    ("source", source, "USER VISUAL"),
    ("source", source, "Sophie"),
]

for label, text_value, needle in checks:
    if needle not in text_value:
        errors.append(f"{label} authority is missing required marker: {needle!r}")

stale_markers = [
    "Next experimental character: **Sophie",
    "Next experimental character: Sophie",
]

for marker in stale_markers:
    if marker in source:
        errors.append(
            "SOURCE_OF_TRUTH_STATUS still advertises Sophie as the immediate next "
            f"character while Triton v4 is the active user gate: {marker!r}"
        )

if "Sophie is paused" not in source and "Sophie remains paused" not in source:
    errors.append("SOURCE_OF_TRUTH_STATUS must explicitly state that Sophie is paused")

if "main merge" not in source or ("paused" not in source.lower() and "undecided" not in source.lower()):
    errors.append("SOURCE_OF_TRUTH_STATUS must keep main merge non-automatic")

if errors:
    print("GRAY CROWN AUTHORITY CONSISTENCY FAILED", file=sys.stderr)
    for error in errors:
        print(f" - {error}", file=sys.stderr)
    sys.exit(1)

print("GRAY CROWN AUTHORITY CONSISTENCY PASS")
print("Active gate: Triton Front v4 — USER VISUAL")
print("Karen remains the locked regression control")
print("Sophie remains paused until the Triton gate is resolved")
print("main merge remains non-automatic")
