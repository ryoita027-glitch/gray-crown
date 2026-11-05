"""A pinned commit with locally modified files must fail before any QA gate.

Run: python -m unittest tests/test_local_quality_dirty_checkout.py
Uses a temporary Git repository; no network or hosted Actions.
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


@unittest.skipUnless(shutil.which("git"), "Git is required")
class DirtyCheckoutPreflightTest(unittest.TestCase):
    def test_pinned_head_rejects_modified_tracked_file(self):
        with tempfile.TemporaryDirectory(prefix="gray_dirty_head_") as tmp:
            root = Path(tmp)
            (root / "tools").mkdir()
            shutil.copyfile(RUNNER, root / "tools" / "run_local_quality.py")
            (root / "package.json").write_text('{"private":true}', encoding="utf-8")
            subprocess.run(["git", "init", "-q"], cwd=root, check=True)
            subprocess.run(["git", "add", "tools/run_local_quality.py", "package.json"],
                           cwd=root, check=True)
            env = dict(os.environ)
            env.update(GIT_AUTHOR_NAME="QA", GIT_AUTHOR_EMAIL="qa@example.invalid",
                       GIT_COMMITTER_NAME="QA", GIT_COMMITTER_EMAIL="qa@example.invalid")
            subprocess.run(["git", "commit", "-qm", "fixture"], cwd=root,
                           env=env, check=True)
            head = subprocess.check_output(["git", "rev-parse", "HEAD"],
                                           cwd=root, text=True).strip()
            # Modify a tracked file *after* the expected commit was created.
            (root / "package.json").write_text('{"private":false}', encoding="utf-8")
            bin_dir = root / "bin"
            bin_dir.mkdir()
            npm = bin_dir / ("npm.cmd" if os.name == "nt" else "npm")
            npm.write_text("@echo off\nexit /b 99\n" if os.name == "nt"
                           else "#!/bin/sh\nexit 99\n", encoding="utf-8")
            npm.chmod(0o755)
            env["PATH"] = str(bin_dir) + os.pathsep + env.get("PATH", "")
            proc = subprocess.run(
                [sys.executable, str(root / "tools" / "run_local_quality.py"),
                 "--mode", "quick", "--expect-head", head],
                cwd=root, env=env, capture_output=True, text=True, timeout=30)
            self.assertEqual(proc.returncode, 2, proc.stdout + proc.stderr)
            reports = list((root / "prototype_artifacts" / "local_quality_runs")
                           .glob("*/results.json"))
            self.assertEqual(len(reports), 1)
            data = json.loads(reports[0].read_text(encoding="utf-8"))
            self.assertEqual(data["head_sha"], head)
            self.assertEqual(data["source_integrity_before"], "FAIL")
            self.assertIn("package.json", data["source_integrity_error_before"]["git_status"])
            self.assertEqual(data["tests"], [])
            self.assertEqual(data["verdict"], "FAIL_OR_INCOMPLETE")
            self.assertEqual(data["github_actions_minutes_used"], 0)


if __name__ == "__main__":
    unittest.main()
