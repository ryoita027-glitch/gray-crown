#!/usr/bin/env python3
"""Reject missing, skipped or incomplete Node TAP test results.

Node's exit code alone is insufficient evidence that any tests ran. This
validator is intentionally strict for the exact-SHA Save/Continue QA gate.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import re

MINIMUM_SAVE_TESTS = 21  # 10 checkpoint + 1 map parity + 10 follower tests
SUMMARY_KEYS = ("tests", "pass", "fail", "cancelled", "skipped", "todo")
SUMMARY_LINE = re.compile(r"^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$")


def verify_tap(text: str) -> dict[str, int]:
    """Return final TAP counters or raise ValueError on incomplete results."""
    counters: dict[str, int] = {}
    for raw in text.splitlines():
        match = SUMMARY_LINE.fullmatch(raw.strip())
        if match:
            counters[match.group(1)] = int(match.group(2))
    missing = set(SUMMARY_KEYS) - counters.keys()
    if missing:
        raise ValueError("Missing Node TAP summary counters: " + ", ".join(sorted(missing)))
    if counters["tests"] < MINIMUM_SAVE_TESTS:
        raise ValueError(
            f"Node TAP reports {counters['tests']} tests; at least {MINIMUM_SAVE_TESTS} required"
        )
    if counters["pass"] != counters["tests"]:
        raise ValueError("Not all Node TAP tests passed")
    for key in ("fail", "cancelled", "skipped", "todo"):
        if counters[key] != 0:
            raise ValueError(f"Node TAP has {counters[key]} {key} tests")
    return counters


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("log", type=Path, help="Node --test --test-reporter=tap output log")
    args = parser.parse_args()
    try:
        counts = verify_tap(args.log.read_text(encoding="utf-8", errors="replace"))
    except (OSError, ValueError) as exc:
        print("SAVE NODE TAP AUDIT FAIL:", exc)
        return 1
    print(f"SAVE NODE TAP AUDIT PASS: {counts['pass']}/{counts['tests']} tests, no skips")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
