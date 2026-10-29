"""Regression tests for the exact-SHA Save/Continue Node TAP audit."""
import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.verify_node_test_tap import verify_tap


def summary(tests=21, passed=21, failed=0, cancelled=0, skipped=0, todo=0):
    cases = "".join(f"ok {n} - case {n}\n" for n in range(1, tests + 1))
    return ("TAP version 13\n" + cases + f"1..{tests}\n"
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

    def test_summary_without_test_results_rejected(self):
        fake = summary().replace("".join(f"ok {n} - case {n}\\n" for n in range(1, 22)), "")
        with self.assertRaisesRegex(ValueError, "top-level"):
            verify_tap(fake)

    def test_missing_plan_rejected(self):
        with self.assertRaisesRegex(ValueError, "plan"):
            verify_tap(summary().replace("1..21\\n", ""))

    def test_duplicate_or_mismatched_plan_rejected(self):
        for data in (summary().replace("1..21\\n", "1..20\\n"),
                     summary().replace("1..21\\n", "1..21\\n1..21\\n")):
            with self.subTest(data=data[-140:]), self.assertRaisesRegex(ValueError, "plan"):
                verify_tap(data)

    def test_forged_appended_success_summary_rejected(self):
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            verify_tap(summary(passed=20, failed=1) + summary())

    def test_failed_test_line_rejected_even_with_green_counters(self):
        with self.assertRaisesRegex(ValueError, "top-level"):
            verify_tap(summary().replace("ok 5 - case 5", "not ok 5 - case 5"))

    def test_duplicate_test_number_rejected(self):
        with self.assertRaisesRegex(ValueError, "top-level"):
            verify_tap(summary().replace("ok 6 - case 6", "ok 5 - case 6"))

    def test_nested_subtest_lines_do_not_count_as_top_level(self):
        with self.assertRaisesRegex(ValueError, "top-level"):
            verify_tap(summary().replace("ok 7 - case 7", "    ok 7 - case 7"))

    def test_duplicate_tap_header_rejected(self):
        with self.assertRaisesRegex(ValueError, "header"):
            verify_tap("TAP version 13\\n" + summary())


if __name__ == "__main__":
    unittest.main()
