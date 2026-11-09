#!/usr/bin/env python3
from PIL import Image
from pathlib import Path
import argparse

CELL=48
DIRS=("down","left","right","up")
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
IDX={d:i for i,d in enumerate(DIRS)}

def base(ref,d): return ref.crop((CELL*IDX[d],0,CELL*(IDX[d]+1),CELL)).copy()
def shift(im,dx=0,dy=0):
    out=Image.new("RGBA",im.size,(0,0,0,0)); out.alpha_composite(im,(dx,dy)); return out
def move(im,box,dx,dy):
    out=im.copy(); x0,y0,x1,y1=box
    out.paste(Image.new("RGBA",(x1-x0,y1-y0),(0,0,0,0)),(x0,y0))
    out.alpha_composite(im.crop(box),(x0+dx,y0+dy)); return out
def legs(im,p,a=1):
    if not p:return im.copy()
    out=move(im,(12,31,24,46),-a*p,0)
    return move(out,(24,31,37,46),a*p,0)
def hands(im,d,a=1,up=False):
    dy=-a if up else 0
    if d in ("down","up"):
        out=move(im,(10,23,20,36),-a,dy)
        return move(out,(28,23,39,36),a,dy)
    return move(im,(7,22,20,36),-a,dy) if d=="left" else move(im,(28,22,41,36),a,dy)
def hair(im,d,a=1):
    if not a:return im.copy()
    if d=="right":return move(im,(9,19,21,34),-a,0)
    if d=="left":return move(im,(27,19,39,34),a,0)
    out=move(im,(9,20,18,35),-a,0)
    return move(out,(30,20,39,35),a,0)
def torso(im,d,a=1):
    out=im.copy(); reg=im.crop((8,8,40,34))
    out.paste(Image.new("RGBA",(32,26),(0,0,0,0)),(8,8))
    dx=a if d=="right" else -a if d=="left" else 0
    out.alpha_composite(reg,(8+dx,8)); return out

def frame(b,anim,i,d):
    if anim=="idle": return shift(b,0,(0,0,-1,0)[i])
    if anim=="walk":
        p=(-1,0,1,1,0,-1)[i]; out=legs(shift(b,0,(0,0,-1,0,0,0)[i]),p,1)
        if i in (2,3): out=hands(out,d,1)
        if i in (1,4): out=hair(out,d,1)
        return out
    if anim=="turn":
        if i==1 and (bb:=b.getbbox()):
            x0,y0,x1,y1=bb; reg=b.crop(bb); nw=max(1,reg.width-2)
            reg=reg.resize((nw,reg.height),Image.Resampling.NEAREST)
            out=Image.new("RGBA",(CELL,CELL),(0,0,0,0)); out.alpha_composite(reg,((CELL-nw)//2,y0)); return out
        return b.copy()
    if anim=="talk":
        out=b.copy()
        if i==1: out=hands(out,d,1,True)
        if i==2: out=hands(out,d,1,False)
        return out
    if anim=="surprise":
        return hands(shift(b,0,-1),d,1,True) if i in (1,2) else b.copy()
    if anim=="approach":
        if i==1:return legs(b,1,1)
        if i==2:return hands(torso(b,d,1),d,1)
        if i==3:return legs(b,-1,1)
        return b.copy()
    if anim=="laugh":
        out=shift(b,0,(0,0,-1,-1,0,0)[i])
        return hands(out,d,1,True) if i in (1,2,3,4) else out
    if anim=="run":
        out=torso(legs(b,(-1,1,-1,1,-1,1)[i],2),d,1)
        return hair(out,d,1) if i%2 else out
    raise ValueError(anim)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--reference",default="docs/pixel/reference/sophie_chibi_direction_lock_v1_48.png")
    ap.add_argument("--out",default="assets/characters/sophie")
    args=ap.parse_args()
    ref=Image.open(args.reference).convert("RGBA")
    if ref.size!=(192,48): raise ValueError(f"reference must be 192x48, got {ref.size}")
    out=Path(args.out); out.mkdir(parents=True,exist_ok=True)
    for anim,n in FRAMES.items():
        sheet=Image.new("RGBA",(CELL*n,CELL*4),(0,0,0,0))
        for row,d in enumerate(DIRS):
            b=base(ref,d)
            for i in range(n):
                sheet.alpha_composite(frame(b,anim,i,d),(CELL*i,CELL*row))
        sheet.save(out/f"sophie_{anim}.png",optimize=False)
        print(anim,sheet.size)
if __name__=="__main__": main()
