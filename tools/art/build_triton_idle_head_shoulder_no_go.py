#!/usr/bin/env python3
"""Reproduce the deliberately REJECTED Triton idle geometry trial. Never writes production assets."""
from pathlib import Path
from PIL import Image
import hashlib
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"assets/characters/triton/triton_idle.png"
EXPECTED="e6ca25a935e773cf17dd35e2355c28d647ffd7ef"
raw=SOURCE.read_bytes()
assert hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()==EXPECTED, "locked source changed"
im=Image.open(SOURCE).convert("RGBA")
assert im.size==(192,192)
src=im.load()
out=im.copy()
pix=out.load()
for d in range(4):
    for f in range(4):
        bx,by=f*48,d*48
        for y in range(3,23):
            xs=[x for x in range(5,43) if src[bx+x,by+y][3]>100]
            if len(xs)<10: continue
            for x in (xs[0],xs[-1]):
                r,g,b,a=src[bx+x,by+y]
                if max(r,g,b)<170: pix[bx+x,by+y]=(r,g,b,0)
        if d in (0,3):
            for y in range(24,30):
                xs=[x for x in range(6,42) if src[bx+x,by+y][3]>180]
                if len(xs)<10: continue
                offset=1 if y<=25 or y>=28 else 2
                for side in (-1,1):
                    edge=xs[0] if side<0 else xs[-1]
                    sx=edge-side
                    for k in range(1,offset+1):
                        tx=edge+side*k
                        if tx<0 or tx>=48 or src[bx+tx,by+y][3]>100: continue
                        r,g,b,a=src[bx+sx,by+y]
                        pix[bx+tx,by+y]=(r,g,b,235)
dest=ROOT/"docs/art/studies/triton_idle_head_shoulder_NO_GO.png"
dest.parent.mkdir(parents=True,exist_ok=True)
out.save(dest)
print("REJECTED trial written:",dest)
