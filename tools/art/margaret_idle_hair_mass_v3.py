#!/usr/bin/env python3
"""Rebuild Margaret idle hair mass V3; no approved/runtime assets are overwritten."""
from pathlib import Path
from PIL import Image
import hashlib, argparse
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"assets/characters/margaret/margaret_idle.png"
NPC=ROOT/"assets/npc/featured_residents_charm_v5.png"
OUT=ROOT/"docs/art/evidence"
HAIR={(184,170,205),(216,207,229),(242,238,247),(139,121,166),(245,232,255)}
BOUNDS=[[(13,37),(14,36),(15,35),(16,34),(18,32)],[(10,40),(11,39),(12,38),(13,37),(14,35)],[(9,39),(10,38),(11,37),(12,36),(13,34)],[(12,37),(13,36),(14,35),(15,34),(17,32)]]
def sha(data):
 return hashlib.sha1(b"blob "+str(len(data)).encode()+bytes([0])+data).hexdigest()
def make(src):
 out=src.copy()
 for d in range(4):
  for f in range(4):
   for y in range(7,42):
    for x in range(48):
     pos=(f*48+x,d*48+y)
     r,g,b,a=src.getpixel(pos)
     if not a or (r,g,b) not in HAIR:continue
     if y>=25:
      sec=0 if y<=27 else 1 if y<=31 else 2 if y<=35 else 3 if y<=38 else 4
      lo,hi=BOUNDS[d][sec]
      if x<lo or x>hi:
       out.putpixel(pos,(0,0,0,0));continue
     color=None
     if y>=27:
      if (r,g,b) in {(242,238,247),(245,232,255)}:color=(184,170,205) if y>=33 else (216,207,229)
      elif (r,g,b)==(216,207,229) and y>=34:color=(184,170,205)
      elif (r,g,b)==(184,170,205) and y>=36:color=(165,155,182)
     if color:out.putpixel(pos,(*color,a))
 return out
def board(src,cand,npc):
 result=Image.new("RGBA",(220,176))
 for d in range(4):
  for k in range(5):
   im=src if k==0 else cand if k==1 else npc
   for y in range(44):
    for x in range(44):
     xx=x*48//44 if k<2 else [1,3,4][k-2]*48+x*48//44
     r,g,b,a=im.getpixel((xx,d*48+y*48//44))
     bg=100 if (x//4+y//4)%2 else 120
     result.putpixel((k*44+x,d*44+y),(*( (v*a+bg*(255-a)+127)//255 for v in (r,g,b)),255))
 return result
def main():
 parser=argparse.ArgumentParser()
 parser.add_argument("--check",action="store_true")
 args=parser.parse_args()
 assert sha(SRC.read_bytes())=="910458eabfcfaef7442f885f319d0e2a09c88a66"
 assert sha(NPC.read_bytes())=="b169b58a846e1812dc42f566ca1843a6088e901f"
 src=Image.open(SRC).convert("RGBA");npc=Image.open(NPC).convert("RGBA")
 assert src.size==(192,192) and npc.size==(432,192)
 cand=make(src);compare=board(src,cand,npc)
 paths=[(OUT/"margaret_idle_hair_mass_v3_HOLD.png",cand),(OUT/"margaret_idle_hair_mass_v3_native44_AB_NPC.png",compare)]
 for p,im in paths:
  if args.check:
   assert Image.open(p).convert("RGBA").tobytes()==im.tobytes(),p
  else:
   p.parent.mkdir(parents=True,exist_ok=True);im.save(p)
 print("V3 source-locked, native44 pixel board verified; ART HOLD")
if __name__=="__main__":main()
