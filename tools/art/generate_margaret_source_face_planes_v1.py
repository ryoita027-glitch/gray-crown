#!/usr/bin/env python3
"""Rebuild the reversible Margaret source-derived walk study. Requires Pillow."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets/characters/margaret/margaret_walk.png"
OUT = ROOT / "assets/characters/margaret/studies/margaret_original_face_planes_v1_walk.png"
im = Image.open(SRC).convert("RGBA")
assert im.size == (288, 192), im.size
out = im.copy()
C = {"skin": (224,191,174), "shadow": (173,137,129), "light": (242,214,195), "eye": (55,43,58), "brow": (107,81,90), "hair": (222,215,209), "hairShade": (173,162,171), "robe": (62,48,68), "robeMid": (95,73,94), "trim": (173,144,104)}
def put(d,f,x,y,color):
    if 0 <= x < 48 and 0 <= y < 48:
        out.putpixel((f*48+x,d*48+y),(*C.get(color,color),255))
def rect(d,f,x0,y0,x1,y1,c):
    for y in range(y0,y1+1):
        for x in range(x0,x1+1): put(d,f,x,y,c)
def line(d,f,x0,y0,x1,y1,c):
    n=max(abs(x1-x0),abs(y1-y0))
    for i in range(n+1):
        put(d,f,round(x0+(x1-x0)*i/n),round(y0+(y1-y0)*i/n),c)
for d in range(4):
  for f in range(6):
    for y in range(4,43):
      for x in range(8,41):
        r,g,b,a=im.getpixel((f*48+x,d*48+y))
        if not a: continue
        if (y<=25 or (y<=39 and (x<=16 or x>=32))) and r>142 and b>r-10 and b>g+3:
          m=(r+g+b)/3
          color=(238,230,220) if m>220 else (216,204,203) if m>190 else (183,169,177) if m>165 else (143,130,151)
          put(d,f,x,y,color)
    if d==0:
      rect(d,f,20,17,27,21,"skin");rect(d,f,21,22,26,22,"skin")
      rect(d,f,22,23,25,24,"shadow");rect(d,f,20,16,27,17,"light")
      put(d,f,19,18,"shadow");put(d,f,28,18,"shadow")
      line(d,f,19,16,22,15,"hair");line(d,f,26,15,29,17,"hairShade")
      rect(d,f,20,18,22,18,"brow");rect(d,f,25,18,27,18,"brow")
      put(d,f,21,19,"eye");put(d,f,26,19,"eye")
      put(d,f,22,19,"light");put(d,f,25,19,"light");put(d,f,24,21,"shadow")
      line(d,f,23,23,24,23,"brow")
      rect(d,f,23,25,25,27,"skin");put(d,f,23,27,"shadow")
      line(d,f,19,28,22,30,"robe");line(d,f,29,28,26,30,"robe")
      line(d,f,22,29,24,31,"trim");line(d,f,26,31,28,29,"trim")
      rect(d,f,23,32,25,35,"robeMid");line(d,f,21,33,21,38,"trim")
    elif d in (1,2):
      mx=lambda x: 47-x if d==2 else x
      for y in range(18,23):
        for x in range(18,24): put(d,f,mx(x),y,"skin")
      for x in range(19,23): put(d,f,mx(x),23,"shadow")
      for x in range(18,24): put(d,f,mx(x),17,"light")
      put(d,f,mx(19),19,"brow");put(d,f,mx(19),20,"eye");put(d,f,mx(18),21,"shadow")
      for y in range(25,28):
        for x in range(21,24): put(d,f,mx(x),y,"skin")
      line(d,f,mx(19),28,mx(23),31,"robe")
      line(d,f,mx(23),31,mx(25),29,"trim")
    else:
      line(d,f,18,30,21,34,"robeMid");line(d,f,29,30,26,34,"robeMid")
OUT.parent.mkdir(parents=True,exist_ok=True)
out.save(OUT,optimize=True)
print(OUT, out.size)
