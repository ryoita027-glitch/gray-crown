"""Regression guards for player-only and single-file Gray Crown distributions.

These checks validate packaging, not visual quality or full browser playthrough.
Original JS, CSS and image bytes are authoritative.
"""
from __future__ import annotations
import base64
import importlib
import json
import re
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
play = importlib.import_module("build_player_release")
single = importlib.import_module("build_standalone_html")


class PlayerPackagingIntegrity(unittest.TestCase):
    def test_runtime_dependencies_exist_and_are_closed(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        paths = play.validate(play.player_files())
        rel = {p.as_posix() for p in paths}
        self.assertIn("index.html", rel)
        self.assertGreaterEqual(len(rel), 10)
        self.assertTrue(all(path == "index.html" or path.split("/")[0] in
                            {"js", "css", "assets"} for path in rel))
        for ref in play.APP_SCRIPT.findall(html) + play.APP_STYLE.findall(html):
            self.assertIn(ref, rel)
            self.assertTrue((ROOT / ref).is_file())

    def test_player_zip_preserves_exact_game_bytes(self):
        with tempfile.TemporaryDirectory(prefix="gc-release-test-") as tmp:
            dest = Path(tmp) / "player.zip"
            result = play.create(dest)
            self.assertEqual(result["play_files"], len(play.validate(play.player_files())))
            with ZipFile(dest) as z:
                self.assertIsNone(z.testzip())
                names = set(z.namelist())
                self.assertIn("GrayCrown/GrayCrown_起動.html", names)
                for rel in play.validate(play.player_files()):
                    target = ("GrayCrown/GrayCrown_起動.html" if
                              rel.as_posix() == "index.html" else
                              "GrayCrown/" + rel.as_posix())
                    self.assertEqual(z.read(target), (ROOT / rel).read_bytes(),
                                     "Game file changed during packaging: " + target)
                self.assertFalse(any("/docs/" in name or "/tests/" in name or
                                     "/tools/" in name or "/.github/" in name
                                     for name in names))
                self.assertEqual(
                    len([x for x in names if x.endswith(".html")]), 1)

    def test_standalone_contains_identical_modules_and_art(self):
        with tempfile.TemporaryDirectory(prefix="gc-standalone-test-") as tmp:
            with patch.object(single, "DIST", Path(tmp)):
                dest = single.build()
            result = dest.read_text(encoding="utf-8")
            original = (ROOT / "index.html").read_text(encoding="utf-8")
            scripts = single.SCRIPTS.findall(original)
            self.assertGreaterEqual(len(scripts), 10)
            self.assertIsNone(single.SCRIPTS.search(result))
            self.assertIsNone(single.STYLES.search(result))
            for rel in scripts:
                original_js = (ROOT / rel).read_text(encoding="utf-8")
                self.assertIn(original_js.replace("</script>", "<\\/script>"), result,
                              "JS module was changed or dropped: " + rel)
            embedded = re.search(
                r"window\.__GC_INLINE_ASSETS__=(\{.*?\});\s*const gc_asset_path",
                result, re.S)
            self.assertIsNotNone(embedded, "Asset map is missing")
            assets = json.loads(embedded.group(1))
            expected = [p for p in (ROOT / "assets").rglob("*") if p.is_file()]
            self.assertEqual(len(assets), len(expected))
            for asset in expected:
                rel = asset.relative_to(ROOT).as_posix()
                self.assertIn(rel, assets, "Asset not embedded: " + rel)
                self.assertEqual(base64.b64decode(assets[rel].split(",", 1)[1]),
                                 asset.read_bytes(), "Image/audio bytes changed: " + rel)

if __name__ == "__main__":
    unittest.main()
