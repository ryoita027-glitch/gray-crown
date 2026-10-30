#!/usr/bin/env python3
"""Structural regression for unapproved Margaret V4E walk study, NOT art approval."""
from pathlib import Path
from PIL import Image
import unittest

ROOT = Path(__file__).resolve().parents[1]
CANDIDATE = ROOT / "assets/characters/margaret/studies/margaret_walk_v4e_study.png"
BASE = ROOT / "assets/characters/margaret/studies/margaret_walk_v4_study.png"

class MargaretV4E(unittest.TestCase):
    def test_png_integrity_and_48px_grid(self):
        with Image.open(CANDIDATE) as im:
            self.assertEqual(im.format, "PNG")
            self.assertEqual(im.size, (288, 192))
            im.verify()  # CRCs
        with Image.open(CANDIDATE) as im:
            im.load()  # full IDAT decode
            self.assertEqual(im.convert("RGBA").getpixel((0, 0))[3], 0)

    def test_directions_walk_variation_and_groundline(self):
        with Image.open(CANDIDATE) as im:
            sheet = im.convert("RGBA")
        for d in range(4):
            cells = [sheet.crop((f*48, d*48, (f+1)*48, (d+1)*48)) for f in range(6)]
            with self.subTest(direction=d):
                self.assertGreaterEqual(len({c.tobytes() for c in cells}), 3)
                for c in cells:
                    bounds = c.getbbox()
                    self.assertIsNotNone(bounds)
                    self.assertEqual(bounds[3], 44)
                    self.assertGreaterEqual(bounds[0], 10)
                    self.assertLessEqual(bounds[2], 41)
                    self.assertIsNone(c.crop((0, 44, 48, 48)).getbbox())

    def test_source_remains_separate_and_silhouette_is_changed(self):
        self.assertNotEqual(CANDIDATE, BASE)
        with Image.open(CANDIDATE) as a, Image.open(BASE) as b:
            a, b = a.convert("RGBA"), b.convert("RGBA")
            self.assertNotEqual(a.tobytes(), b.tobytes())
            for d in range(4):
                self.assertLessEqual(a.crop((0, d*48, 48, d*48+48)).getbbox()[1], 6)
                self.assertEqual(b.crop((0, d*48, 48, d*48+48)).getbbox()[3], 44)

if __name__ == "__main__":
    unittest.main()
