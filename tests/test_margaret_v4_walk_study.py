#!/usr/bin/env python3
"""Margaret V4 independent walk-study structural gate (NOT art approval)."""
from pathlib import Path
import unittest
from PIL import Image

ASSET = Path(__file__).resolve().parents[1] / 'assets/characters/margaret/studies/margaret_walk_v4_study.png'

class MargaretV4WalkStudy(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.im = Image.open(ASSET).convert('RGBA')

    def test_four_directions_six_frames(self):
        self.assertEqual(self.im.size, (288, 192))

    def test_each_direction_has_distinct_walk_poses_and_same_footline(self):
        for direction in range(4):
            frames = [self.im.crop((48*i,48*direction,48*(i+1),48*(direction+1))) for i in range(6)]
            with self.subTest(direction=direction):
                self.assertGreaterEqual(len({f.tobytes() for f in frames}), 3)
                self.assertEqual({f.getbbox()[3] for f in frames}, {44})
                self.assertTrue(all(f.getbbox()[0] >= 10 and f.getbbox()[2] <= 38 for f in frames))

    def test_transparency_and_no_bottom_overflow(self):
        self.assertEqual(self.im.getpixel((0,0))[3], 0)
        for direction in range(4):
            for frame in range(6):
                cell = self.im.crop((frame*48,direction*48,(frame+1)*48,(direction+1)*48))
                with self.subTest(direction=direction,frame=frame):
                    self.assertEqual(cell.crop((0,44,48,48)).getbbox(), None)
                    self.assertGreater(sum(cell.getchannel('A').histogram()[1:]), 160)

if __name__ == '__main__':
    unittest.main()
