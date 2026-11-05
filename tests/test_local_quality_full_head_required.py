"""Regression: full acceptance must refuse an unpinned checkout before any npm command.

Run: python -m unittest tests/test_local_quality_full_head_required.py
This test uses an isolated fixture and never invokes GitHub Actions.
"""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

RUNNER = Path(__file__).resolve().parents[1] / "tools" / "run_local_quality.py"


class FullHeadRequiredTest(unittest.TestCase):
    def test_full_mode_requires_expected_sha_even_with_v23_flag(self):
        with tempfile.TemporaryDirectory(prefix="gray_full_head_") as tmp:
            root = Path(tmp)
            (root / "tools").mkdir()
            shutil.copyfile(RUNNER, root / "tools" / "run_local_quality.py")
            (root / "package.json").write_text('{"private":true}', encoding="utf-8")
            bin_dir = root / "bin"
            bin_dir.mkdir()
            npm_name = "npm.cmd" if os.name == "nt" else "npm"
            npm = bin_dir / npm_name
            npm.write_text("@echo off\nexit /b 99\n" if os.name == "nt" else "#!/bin/sh\nexit 99\n", encoding="utf-8")
            npm.chmod(0o755)
            env = dict(os.environ)
            env["PATH"] = str(bin_dir)
            proc = subprocess.run(
                [sys.executable, str(root / "tools" / "run_local_quality.py"),
                 "--mode", "full", "--with-v23"],
                cwd=root, env=env, capture_output=True, text=True,
                timeout=30, check=False,
            )
            self.assertEqual(proc.returncode, 2, proc.stdout + proc.stderr)
            reports = list((root / "prototype_artifacts" / "local_quality_runs").glob("*/results.json"))
            self.assertEqual(len(reports), 1)
            report = json.loads(reports[0].read_text(encoding="utf-8"))
            self.assertIn("requires --expect-head", report["preflight_error"])
            self.assertEqual(report["tests"], [])
            self.assertEqual(report["verdict"], "FAIL_OR_INCOMPLETE")
            self.assertEqual(report["github_actions_minutes_used"], 0)
            self.assertIn("run_completed_at", report)


if __name__ == "__main__":
    unittest.main()
