#!/usr/bin/env python3
"""Rebuild reversible Margaret idle contour V2 and same-scale NPC comparison."""
import argparse
import hashlib
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/characters/margaret/margaret_idle.png"
NPC = ROOT / "assets/npc/featured_residents_charm_v5.png"
OUT = ROOT / "docs/art/evidence"
RIGHT = [
 {25:34,26:34,27:35,28:35,29:35,30:34,31:33,32:33,33:32,34:32,35:31,36:31,37:31,38:32,39:32,40:31},
 {25:34,26:35,27:35,28:34,29:34,30:34,31:33,32:33,33:31,34:32,35:32,36:31,37:30},
 {},
 {28:34,29:34,30:34,31:34,32:34,33:33,34:33,35:33,36:32,37:32,38:33,39:33,40:32}
]
LEFT = [
 {}, {},
 {25:12,26:12,27:12,28:12,29:12,30:11,31:12},
 {28:12,29:12,30:12,31:12,32:13,33:12,34:12,35:12,36:13,37:13,38:13,39:13,40:13}
]
HAIR = {(184,170,205),(216,207,229),(242,238,247),(139,121,166),(245,232,255)}
HIGHLIGHT = {(242,238,247),(245,232,255)}

def blob_sha(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\\0".replace(b"\\0", b"\0") + data).hexdigest()

def build(source):
    if source.size != (192,192):
        raise ValueError("Unexpected Margaret idle dimensions")
    source = source.convert("RGBA")
    out = source.copy()
    for d in range(4):
        for f in range(4):
            for y in range(25,41):
                for x in range(48):
                    pos = (f*48+x,d*48+y)
                    r,g,b,a = source.getpixel(pos)
                    if a and (r,g,b) in HAIR and (x>RIGHT[d].get(y,47) or x<LEFT[d].get(y,0)):
                        out.putpixel(pos,(0,0,0,0))
    snap = out.copy()
    for d in range(4):
        for f in range(4):
            for y in range(2,40):
                for x in range(1,47):
                    pos = (f*48+x,d*48+y)
                    r,g,b,a = snap.getpixel(pos)
                    if a != 255 or (r,g,b) not in HAIR:
                        continue
                    neighbors = [(f*48+x-1,d*48+y),(f*48+x+1,d*48+y),
                                 (f*48+x,d*48+y-1),(f*48+x,d*48+y+1)]
                    if any(snap.getpixel(q)[3]==0 for q in neighbors):
                        out.putpixel(pos,(123,107,149,255))
                    elif (r,g,b) in HIGHLIGHT and sum(snap.getpixel(q)[:3] in HIGHLIGHT and snap.getpixel(q)[3]>0 for q in neighbors)<=1:
                        out.putpixel(pos,(216,207,229,255))
    return out

def make_board(source,candidate,npc):
    if npc.size != (432,192):
        raise ValueError("Unexpected V5 NPC dimensions")
    board = Image.new("RGBA",(220,176))
    for d in range(4):
        for k in range(5):
            for y in range(44):
                for x in range(44):
                    sx,sy=x*48//44,y*48//44
                    image = source if k==0 else candidate if k==1 else npc
                    xx = sx if k<2 else [1,3,4][k-2]*48+sx
                    r,g,b,a=image.getpixel((xx,d*48+sy))
                    bg=100 if (x//4+y//4)%2 else 120
                    rgb=tuple((v*a+bg*(255-a)+127)//255 for v in (r,g,b))
                    board.putpixel((k*44+x,d*44+y),(*rgb,255))
    return board

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--check",action="store_true")
    args=parser.parse_args()
    if blob_sha(SOURCE.read_bytes())!="910458eabfcfaef7442f885f319d0e2a09c88a66":
        raise AssertionError("Margaret source blob changed")
    if blob_sha(NPC.read_bytes())!="b169b58a846e1812dc42f566ca1843a6088e901f":
        raise AssertionError("V5 NPC source blob changed")
    src=Image.open(SOURCE).convert("RGBA")
    npc=Image.open(NPC).convert("RGBA")
    cand=build(src)
    counts=[0]*4
    alpha=0
    for d in range(4):
        for f in range(4):
            for y in range(48):
                for x in range(48):
                    p=(f*48+x,d*48+y)
                    a,b=src.getpixel(p),cand.getpixel(p)
                    if a!=b:
                        counts[d]+=1
                        if a[3]!=b[3]:
                            alpha+=1
                        if y>=42:
                            raise AssertionError("Footline changed")
                        if a[3]!=b[3] and a[:3] not in HAIR:
                            raise AssertionError("Non-hair alpha removed")
    if counts != [461,461,586,442] or alpha != 208:
        raise AssertionError(f"Unexpected changed pixels: {counts}, alpha {alpha}")
    board=make_board(src,cand,npc)
    zoom=board.resize((880,704),Image.Resampling.NEAREST)
    paths=[
      (OUT/"margaret_idle_contour_v2_HOLD_48x192.png",cand),
      (OUT/"margaret_idle_contour_v2_native44_AB_NPC.png",board),
      (OUT/"margaret_idle_contour_v2_4x_review.png",zoom),
    ]
    if args.check:
        for path,image in paths:
            existing=Image.open(path).convert("RGBA")
            if existing.size!=image.size or existing.tobytes()!=image.tobytes():
                raise AssertionError(f"Committed PNG differs: {path}")
    else:
        OUT.mkdir(parents=True,exist_ok=True)
        for path,image in paths:
            image.save(path)
    print("ART HOLD: 1950 RGBA pixels changed / 208 alpha; 16 idle cells; source and feet protected")
if __name__=="__main__":
    main()
