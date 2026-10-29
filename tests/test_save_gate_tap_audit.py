"""Regression tests for the exact-SHA Save/Continue Node TAP audit."""
import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.verify_node_test_tap import verify_tap


def summary(tests=21, passed=21, failed=0, cancelled=0, skipped=0, todo=0):
    return ("TAP version 13\n1..21\n"
            f"# tests {tests}\n# pass {passed}\n# fail {failed}\n"
            f"# cancelled {cancelled}\n# skipped {skipped}\n# todo {todo}\n")


class SaveTapAuditTests(unittest.TestCase):
    def test_all_passed(self):
        self.assertEqual(verify_tap(summary())["tests"], 21)

    def test_no_tests_rejected(self):
        with self.assertRaisesRegex(ValueError, "at least 21"):
            verify_tap(summary(tests=0, passed=0))

    def test_node_empty_file_false_green_rejected(self):
        with self.assertRaisesRegex(ValueError, "at least 21"):
            verify_tap(summary(tests=1, passed=1))

    def test_skipped_tests_rejected(self):
        with self.assertRaisesRegex(ValueError, "Not all|skipped"):
            verify_tap(summary(passed=20, skipped=1))

    def test_failed_tests_rejected(self):
        with self.assertRaises(ValueError):
            verify_tap(summary(passed=20, failed=1))

    def test_missing_summary_rejected(self):
        with self.assertRaisesRegex(ValueError, "Missing"):
            verify_tap("TAP version 13\nok 1 - test\n")

    def test_cancelled_or_todo_rejected(self):
        for field in ("cancelled", "todo"):
            with self.subTest(field=field), self.assertRaises(ValueError):
                verify_tap(summary(passed=20, **{field: 1}))


if __name__ == "__main__":
    unittest.main()
