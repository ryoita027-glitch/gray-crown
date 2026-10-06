#!/usr/bin/env python3
"""Generate Triton Chibi Direction Lock v1 animation sheets.\n\nRuntime PNGs are deterministic generated outputs of the locked 4-direction source.

Source: docs/pixel/reference/triton_chibi_direction_lock_v1.png
48x48 cells, rows down/left/right/up. The eight category/frame budgets match
Karen technically, while Triton's motion stays grounded and heavier.
"""
from PIL import Image
from pathlib import Path
import argparse
CELL=48
DIRS=("down","left","right","up")
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
IDX={d:i for i,d in enumerate(DIRS)}
def base_pose(ref,d): return ref.crop((CELL*IDX[d],0,CELL*(IDX[d]+1),CELL)).copy()
def shift(im,dx=0,dy=0):
 out=Image.new("RGBA",im.size,(0,0,0,0));out.alpha_composite(im,(dx,dy));return out
def move(im,box,dx,dy):
 out=im.copy();x0,y0,x1,y1=box;out.paste(Image.new("RGBA",(x1-x0,y1-y0),(0,0,0,0)),(x0,y0));out.alpha_composite(im.crop(box),(x0+dx,y0+dy));return out
def legs(im,p,a=1):
 if not p:return im.copy()
 out=move(im,(11,30,24,46),-a*p,0);return move(out,(24,30,38,46),a*p,0)
def arms(im,d,a=1):
 if d in ("down","up"):
  out=move(im,(8,20,20,35),-a,0);return move(out,(28,20,41,35),a,0)
 return move(im,(26,19,42,35),a,0) if d=="right" else move(im,(6,19,22,35),-a,0)
def hair(im,d,a):
 if not a:return im.copy()
 if d=="right":return move(im,(12,18,23,29),-a,0)
 if d=="left":return move(im,(25,18,37,29),a,0)
 out=move(im,(10,18,18,29),-a,0);return move(out,(30,18,38,29),a,0)
def torso(im,d,a):
 out=im.copy();reg=im.crop((6,5,42,33));out.paste(Image.new("RGBA",(36,28),(0,0,0,0)),(6,5))
 dx=a if d=="right" else -a if d=="left" else 0;out.alpha_composite(reg,(6+dx,5));return out
def frame(base,anim,i,d):
 if anim=="idle":return shift(base,0,(0,0,-1,0)[i])
 if anim=="walk":
  p=(-1,0,1,1,0,-1)[i];out=shift(base,0,(0,0,0,0,-1,0)[i]);out=legs(out,p,1)
  if i in (2,3):out=arms(out,d,1)
  if i in (1,4):out=hair(out,d,1)
  return out
 if anim=="turn":
  if i==1:
   box=base.getbbox()
   if box:
    x0,y0,x1,y1=box;reg=base.crop(box);nw=max(1,reg.width-3);reg=reg.resize((nw,reg.height),Image.Resampling.NEAREST)
    out=Image.new("RGBA",(CELL,CELL),(0,0,0,0));out.alpha_composite(reg,((CELL-nw)//2,y0));return out
  return base.copy()
 if anim=="talk":
  out=base.copy()
  if i in (1,2):out=arms(out,d,1)
  return out
 if anim=="surprise":
  out=base.copy()
  if i in (1,2):out=arms(shift(out,0,-1),d,1)
  return out
 if anim=="approach":
  out=base.copy()
  if i in (1,2,3):out=legs(torso(out,d,1),1 if i%2 else -1,1)
  return out
 if anim=="laugh":
  out=shift(base,0,(0,0,-1,-1,0,0)[i])
  if i in (1,2,3,4):out=arms(out,d,1)
  return out
 if anim=="run":
  p=(-1,1,-1,1,-1,1)[i];out=torso(legs(base,p,2),d,1);return hair(out,d,1 if i%2 else 0)
 raise ValueError(anim)
def main():
 ap=argparse.ArgumentParser();ap.add_argument("--reference",default="docs/pixel/reference/triton_chibi_direction_lock_v1.png");ap.add_argument("--out",default="assets/characters/triton");args=ap.parse_args()
 ref=Image.open(args.reference).convert("RGBA")
 if ref.size!=(192,48):raise ValueError("reference must be 192x48")
 bases={d:base_pose(ref,d) for d in DIRS};out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
 for anim,n in FRAMES.items():
  sheet=Image.new("RGBA",(CELL*n,CELL*4),(0,0,0,0))
  for row,d in enumerate(DIRS):
   for i in range(n):sheet.alpha_composite(frame(bases[d],anim,i,d),(CELL*i,CELL*row))
  sheet.save(out/f"triton_{anim}.png",optimize=False);print(anim,sheet.size)
if __name__=="__main__":main()
