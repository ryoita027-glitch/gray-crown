"""Regression: incomplete local QA checkouts must leave machine-readable failure evidence.

Run directly: python tests/test_local_quality_preflight.py
No npm, Chromium, GitHub Actions or external network is required.
"""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


RUNNER = Path(__file__).resolve().parents[1] / "tools" / "run_local_quality.py"


class LocalQualityPreflightTests(unittest.TestCase):
    def test_missing_package_json_writes_failure_report(self):
        with tempfile.TemporaryDirectory(prefix="gray_quality_preflight_") as tmp:
            root = Path(tmp)
            (root / "tools").mkdir()
            shutil.copyfile(RUNNER, root / "tools" / "run_local_quality.py")
            completed = subprocess.run(
                [sys.executable, str(root / "tools" / "run_local_quality.py"), "--mode", "quick"],
                cwd=root, capture_output=True, text=True, timeout=30, check=False,
            )
            self.assertEqual(completed.returncode, 2, completed.stdout + completed.stderr)
            reports = list((root / "prototype_artifacts" / "local_quality_runs").glob("*/results.json"))
            self.assertEqual(len(reports), 1, "One preflight run must produce one results.json")
            data = json.loads(reports[0].read_text(encoding="utf-8"))
            self.assertEqual(data["verdict"], "FAIL_OR_INCOMPLETE")
            self.assertIn("package.json", data["preflight_error"])
            self.assertEqual(data["tests"], [])
            self.assertEqual(data["github_actions_minutes_used"], 0)
            self.assertIn("run_completed_at", data)


if __name__ == "__main__":
    unittest.main()
