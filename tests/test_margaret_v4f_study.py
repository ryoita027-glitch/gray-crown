#!/usr/bin/env python3
"""Structural regression only. PASS is not a commercial-art acceptance."""
from pathlib import Path
from PIL import Image
import unittest

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"assets/characters/margaret/studies/margaret_walk_v4e_study.png"
CANDIDATE=ROOT/"assets/characters/margaret/studies/margaret_walk_v4f_study.png"

class MargaretV4F(unittest.TestCase):
    def test_png_decode_and_separate_source(self):
        with Image.open(CANDIDATE) as im:
            self.assertEqual(im.format,"PNG")
            self.assertEqual(im.size,(288,192))
            im.verify()
        with Image.open(CANDIDATE) as im: im.load()
        with Image.open(SOURCE) as a,Image.open(CANDIDATE) as b:
            self.assertNotEqual(a.convert("RGBA").tobytes(),b.convert("RGBA").tobytes())

    def test_four_directions_six_frames_groundline(self):
        with Image.open(CANDIDATE) as im: sheet=im.convert("RGBA")
        for d in range(4):
            cells=[sheet.crop((f*48,d*48,(f+1)*48,(d+1)*48)) for f in range(6)]
            self.assertGreaterEqual(len({c.tobytes() for c in cells}),3)
            for c in cells:
                bounds=c.getbbox()
                self.assertIsNotNone(bounds)
                self.assertEqual(bounds[1],6)
                self.assertEqual(bounds[3],44)
                self.assertIsNone(c.crop((0,44,48,48)).getbbox())

    def test_directional_book_no_duplicate_right_block(self):
        with Image.open(CANDIDATE) as im: sheet=im.convert("RGBA")
        for d in range(4):
            for f in range(6):
                cell=sheet.crop((f*48,d*48,(f+1)*48,(d+1)*48))
                pixels=[(x,y) for y in range(30,41) for x in range(10,42)
                        if cell.getpixel((x,y))==(88,113,108,255)]
                self.assertGreater(len(pixels),10)
                if d in (1,3): self.assertLess(max(x for x,y in pixels),21)
                else: self.assertGreater(min(x for x,y in pixels),28)
                self.assertFalse(any(cell.getpixel((x,y))[3]
                                     for y in range(33,40) for x in range(37,40)))

if __name__=="__main__": unittest.main()
