"""Experimental V23 Margaret walk. Never edits live sprites. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw
import hashlib
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'assets/character_trials/margaret_idle_adult_mage_v22_structural_trial.png'
OUT=ROOT/'assets/character_trials/margaret_walk_adult_mage_v23_stride_trial.png'
def git_sha(p):
 b=p.read_bytes();return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
assert git_sha(SRC)=='d7d0aa4eaa7286b85c3cf0181b36c550962b688d'
src=Image.open(SRC).convert('RGBA');assert src.size==(192,192)
steps=[(-4,3,0),(-2,2,1),(0,0,2),(4,-3,3),(2,-2,4),(0,0,5)]
centers=[(20,29),(22,28),(20,27),(20,29)]
edge=(43,34,40,255); dark=(54,41,48,255); leather=(77,57,64,255); lit=(109,81,85,255)
out=Image.new('RGBA',(288,192))
for d in range(4):
 base=src.crop((0,d*48,48,(d+1)*48))
 for f,(dl,dr,phase) in enumerate(steps):
  cell=base.copy();pen=ImageDraw.Draw(cell)
  pen.rectangle((10,40,40,44),fill=(0,0,0,0))
  cx=sum(centers[d])//2
  for x,planted in [(centers[d][0]+dl,phase<3),(centers[d][1]+dr,phase>=3)]:
   y=44 if planted else 42
   pen.rectangle((x-2,y-3,x+2,y),fill=edge)
   pen.rectangle((x-1,y-3,x+2,y-1),fill=leather if planted else dark)
   pen.line((x,y-2,x+2,y-2),fill=lit)
  swing=[-1,-1,0,1,1,0][f]
  for y in range(40,43):
   for x in range(11,39):
    rgba=base.getpixel((x,y))
    if not rgba[3]:continue
    if y==42 and cx-2<=x<=cx+2 and phase in (0,3):continue
    cell.putpixel((x+(swing if x<cx else -swing),y),rgba)
  if d in (0,3):
   for x in (cx-5,cx+5):
    p=base.getpixel((x,41))
    if p[3]:cell.putpixel((x,43),p)
  out.paste(cell,(f*48,d*48))
  assert cell.getbbox()[3]==45
  assert cell.crop((0,0,48,36)).tobytes()==base.crop((0,0,48,36)).tobytes()
OUT.parent.mkdir(parents=True,exist_ok=True)
colors=sorted(set(out.getdata()))
lut={c:i for i,c in enumerate(colors)}
indexed=Image.frombytes('P',out.size,bytes(lut[c] for c in out.getdata()))
indexed.putpalette([v for c in colors for v in c[:3]])
indexed.info['transparency']=bytes(c[3] for c in colors)
indexed.save(OUT,optimize=True)
print(OUT,git_sha(OUT))
