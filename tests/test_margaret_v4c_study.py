#!/usr/bin/env python3
"""Strict V4C PNG integrity and 4-direction walk-geometry gate; NOT art approval."""
from pathlib import Path
from PIL import Image
import unittest

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / 'assets/characters/margaret/studies/margaret_walk_v4c_study.png'

class MargaretV4C(unittest.TestCase):
    def test_png_stream_and_rgba(self):
        with Image.open(ASSET) as im:
            self.assertEqual(im.format, 'PNG')
            self.assertEqual(im.size, (288, 192))
            im.verify()  # Validate all PNG chunk CRCs, not just header.
        with Image.open(ASSET) as im:
            im.load()    # Decode all compressed scanlines.
            self.assertEqual(im.convert('RGBA').getpixel((0, 0))[3], 0)

    def test_four_directions_six_frames_and_footline(self):
        with Image.open(ASSET) as im:
            sheet = im.convert('RGBA')
        for direction in range(4):
            cells = [sheet.crop((i*48,direction*48,(i+1)*48,(direction+1)*48)) for i in range(6)]
            with self.subTest(direction=direction):
                self.assertGreaterEqual(len({c.tobytes() for c in cells}), 3)
                for cell in cells:
                    self.assertEqual(cell.getbbox()[3], 44)
                    self.assertGreaterEqual(cell.getbbox()[0], 10)
                    self.assertLessEqual(cell.getbbox()[2], 38)
                    self.assertIsNone(cell.crop((0,44,48,48)).getbbox())

if __name__ == '__main__':
    unittest.main()
