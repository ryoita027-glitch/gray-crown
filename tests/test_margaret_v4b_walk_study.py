#!/usr/bin/env python3
"""V4B structural checks only; never an art-quality acceptance."""
from pathlib import Path
from PIL import Image
import unittest
ROOT=Path(__file__).resolve().parents[1]
OLD=ROOT/'assets/characters/margaret/studies/margaret_walk_v4_study.png'
NEW=ROOT/'assets/characters/margaret/studies/margaret_walk_v4b_study.png'
class MargaretV4B(unittest.TestCase):
 def test_four_directions_and_ground(self):
  im=Image.open(NEW).convert('RGBA');self.assertEqual(im.size,(288,192))
  for d in range(4):
   frames=[im.crop((i*48,d*48,(i+1)*48,(d+1)*48)) for i in range(6)]
   self.assertGreaterEqual(len({f.tobytes() for f in frames}),3)
   self.assertEqual({f.getbbox()[3] for f in frames},{44})
   self.assertTrue(all(f.getbbox()[0]>=10 and f.getbbox()[2]<=38 for f in frames))
 def test_v4b_height_increase_without_foot_shift(self):
  a=Image.open(OLD).convert('RGBA');b=Image.open(NEW).convert('RGBA')
  for d in range(4):
   for i in range(6):
    rect=(i*48,d*48,(i+1)*48,(d+1)*48)
    old=a.crop(rect);new=b.crop(rect)
    self.assertLess(new.getbbox()[1],old.getbbox()[1])
    self.assertEqual(new.getbbox()[3],old.getbbox()[3])
    self.assertNotEqual(new.tobytes(),old.tobytes())
 def test_gallery_uses_real_sources_and_44px(self):
  html=(ROOT/'tools/margaret_v4b_real_source_ab.html').read_text('utf-8')
  self.assertIn("'mayor','../assets/npc/featured_residents_charm_v5.png',3",html)
  self.assertIn("'messenger','../assets/npc/featured_residents_charm_v5.png',4",html)
  self.assertIn('c.imageSmoothingEnabled=false',html)
  self.assertIn('c.drawImage(img,column*48,dir*48,48,48,28,20,44,44)',html)
if __name__=='__main__':unittest.main()
