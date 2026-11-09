"""Regression: an existing but different Git HEAD must never pass the pinned QA preflight.

Run: python -m unittest tests/test_local_quality_wrong_head.py
No network, npm execution, Chromium, or GitHub Actions required.
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


@unittest.skipUnless(shutil.which("git"), "Git is required to create an actual checkout")
class WrongHeadPreflightTest(unittest.TestCase):
    def test_valid_but_wrong_sha_records_failure_before_any_gate(self):
        with tempfile.TemporaryDirectory(prefix="gray_wrong_head_") as tmp:
            root = Path(tmp)
            (root / "tools").mkdir()
            shutil.copyfile(RUNNER, root / "tools" / "run_local_quality.py")
            (root / "package.json").write_text('{"private":true}', encoding="utf-8")
            subprocess.run(["git", "init", "-q"], cwd=root, check=True, capture_output=True)
            subprocess.run(["git", "add", "package.json"], cwd=root, check=True, capture_output=True)
            env = dict(os.environ)
            env.update({"GIT_AUTHOR_NAME": "QA", "GIT_AUTHOR_EMAIL": "qa@example.invalid",
                        "GIT_COMMITTER_NAME": "QA", "GIT_COMMITTER_EMAIL": "qa@example.invalid"})
            subprocess.run(["git", "commit", "-qm", "fixture"], cwd=root, env=env,
                           check=True, capture_output=True)
            actual = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()
            wrong = "0" * 40 if actual != "0" * 40 else "1" * 40
            # npm is resolved at preflight but must never be invoked.
            bin_dir = root / "bin"
            bin_dir.mkdir()
            npm = bin_dir / ("npm.cmd" if os.name == "nt" else "npm")
            npm.write_text("@echo off\nexit /b 99\n" if os.name == "nt"
                           else "#!/bin/sh\nexit 99\n", encoding="utf-8")
            npm.chmod(0o755)
            env["PATH"] = str(bin_dir) + os.pathsep + env.get("PATH", "")
            proc = subprocess.run(
                [sys.executable, str(root / "tools" / "run_local_quality.py"),
                 "--mode", "quick", "--expect-head", wrong],
                cwd=root, env=env, capture_output=True, text=True, timeout=30, check=False)
            self.assertEqual(proc.returncode, 2, proc.stdout + proc.stderr)
            reports = list((root / "prototype_artifacts" / "local_quality_runs").glob("*/results.json"))
            self.assertEqual(len(reports), 1)
            report = json.loads(reports[0].read_text(encoding="utf-8"))
            self.assertEqual(report["head_sha"], actual)
            self.assertEqual(report["preflight_error"],
                             "WRONG_HEAD: checkout SHA differs from --expect-head")
            self.assertEqual(report["tests"], [])
            self.assertEqual(report["verdict"], "FAIL_OR_INCOMPLETE")
            self.assertEqual(report["github_actions_minutes_used"], 0)
            self.assertIn("run_completed_at", report)


if __name__ == "__main__":
    unittest.main()
