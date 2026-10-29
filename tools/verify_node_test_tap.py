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
PLAN_LINE = re.compile(r"^1\.\.(\d+)$")
TEST_LINE = re.compile(r"^(ok|not ok) (\d+)(?:\s+-.*)?$")


def verify_tap(text: str) -> dict[str, int]:
    """Require one complete TAP document with every top-level case passing."""
    counters: dict[str, int] = {}
    plans: list[int] = []
    cases: list[tuple[str, int]] = []
    versions = 0
    for raw in text.splitlines():
        line = raw.rstrip()  # Preserve indentation: nested subtests are not top-level cases.
        if line == "TAP version 13":
            versions += 1
        plan = PLAN_LINE.fullmatch(line)
        if plan:
            plans.append(int(plan.group(1)))
        case = TEST_LINE.fullmatch(line)
        if case:
            cases.append((case.group(1), int(case.group(2))))
        match = SUMMARY_LINE.fullmatch(line)
        if match:
            key = match.group(1)
            if key in counters:
                raise ValueError("Duplicate Node TAP summary counter: " + key)
            counters[key] = int(match.group(2))
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
    if versions != 1:
        raise ValueError("Expected exactly one TAP version 13 header")
    if plans != [counters["tests"]]:
        raise ValueError("Node TAP plan missing, duplicated or inconsistent with summary")
    if cases != [("ok", n) for n in range(1, counters["tests"] + 1)]:
        raise ValueError("Node TAP top-level test results missing, failed or out of order")
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
