"""Regression tests for local QA preflight rejection without running expensive gates.

Run: python -m unittest tests/test_local_quality_cli_preflight.py
These cases must fail before npm tests, browser downloads or GitHub Actions.
"""
from __future__ import annotations

from pathlib import Path
import shutil
import subprocess
import sys
import unittest


ROOT = Path(__file__).resolve().parents[1]
RUNNER = ROOT / "tools" / "run_local_quality.py"


@unittest.skipUnless(shutil.which("npm.cmd" if sys.platform == "win32" else "npm"),
                     "npm is required for local QA preflight")
class LocalQualityPreflightTests(unittest.TestCase):
    def invoke(self, *arguments: str) -> subprocess.CompletedProcess[str]:
        self.assertTrue((ROOT / "package.json").is_file())
        self.assertTrue(RUNNER.is_file())
        return subprocess.run(
            [sys.executable, str(RUNNER), *arguments],
            cwd=ROOT, capture_output=True, text=True, timeout=30, check=False,
        )

    def test_full_rejects_missing_historical_save_fixture_flag(self) -> None:
        result = self.invoke("--mode", "full")
        self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
        self.assertIn("Full acceptance requires --with-v23", result.stderr)
        self.assertNotIn("[1]", result.stdout, "No quality gate should have started")

    def test_full_rejects_unpinned_head_before_tests(self) -> None:
        result = self.invoke("--mode", "full", "--with-v23")
        self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
        self.assertIn("Full acceptance requires --expect-head", result.stderr)
        self.assertNotIn("[1]", result.stdout, "No quality gate should have started")

    def test_wrong_but_well_formed_head_is_rejected_before_tests(self) -> None:
        # A syntactically valid SHA must not be accepted as the checkout identity.
        # All-zero SHA cannot be the SHA of a real Git commit.
        result = self.invoke("--mode", "quick", "--expect-head", "0" * 40)
        self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
        self.assertIn("WRONG_HEAD:", result.stderr)
        self.assertNotIn("[1]", result.stdout, "No quality gate should have started")

    def test_invalid_expected_head_is_rejected_before_tests(self) -> None:
        result = self.invoke("--mode", "quick", "--expect-head", "not-a-sha")
        self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
        self.assertIn("--expect-head requires", result.stderr)
        self.assertNotIn("[1]", result.stdout, "No quality gate should have started")


if __name__ == "__main__":
    unittest.main()
