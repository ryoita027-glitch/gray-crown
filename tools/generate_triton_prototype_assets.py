#!/usr/bin/env python3
"""Generate Triton GROUND ANCHOR prototype animation sheets.

Source:
- docs/pixel/reference/triton_idle_4dir_v1.png
- 48x48 source cells in down / left / right / up order
- exactly eight animation categories matching Karen's prototype architecture

Triton's motion is intentionally heavier than Karen's:
- reduced whole-body bounce
- planted legs and lower center of gravity
- heavy shoulder-length hair; only tips lag
- broad laugh, stable run
"""
from PIL import Image
from pathlib import Path
import argparse

CELL=48
DIRS=("down","left","right","up")
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
DIR_INDEX={d:i for i,d in enumerate(DIRS)}

def base_pose(ref,direction):
    i=DIR_INDEX[direction]
    return ref.crop((CELL*i,0,CELL*(i+1),CELL)).copy()

def whole_shift(im,dx=0,dy=0):
    out=Image.new("RGBA",im.size,(0,0,0,0));out.alpha_composite(im,(dx,dy));return out

def move_region(im,box,dx,dy):
    out=im.copy();x0,y0,x1,y1=box
    out.paste(Image.new("RGBA",(x1-x0,y1-y0),(0,0,0,0)),(x0,y0))
    out.alpha_composite(im.crop(box),(x0+dx,y0+dy));return out

def leg_motion(im,phase,amount=1):
    if phase==0:return im.copy()
    out=move_region(im,(11,30,24,46),-amount*phase,0)
    return move_region(out,(24,30,38,46),amount*phase,0)

def arm_motion(im,direction,amount):
    if direction in ("down","up"):
        out=move_region(im,(8,20,20,35),-amount,0)
        return move_region(out,(28,20,41,35),amount,0)
    if direction=="right":return move_region(im,(26,19,42,35),amount,0)
    return move_region(im,(6,19,22,35),-amount,0)

def hair_tip_lag(im,direction,amount):
    if not amount:return im.copy()
    if direction=="right":return move_region(im,(12,18,23,29),-amount,0)
    if direction=="left":return move_region(im,(25,18,37,29),amount,0)
    out=move_region(im,(10,18,18,29),-amount,0)
    return move_region(out,(30,18,38,29),amount,0)

def torso_shift(im,direction,amount):
    out=im.copy();reg=im.crop((6,5,42,33))
    out.paste(Image.new("RGBA",(36,28),(0,0,0,0)),(6,5))
    dx=amount if direction=="right" else -amount if direction=="left" else 0
    out.alpha_composite(reg,(6+dx,5));return out

def make_frame(base,anim,i,direction):
    if anim=="idle":return whole_shift(base,0,(0,0,-1,0)[i])
    if anim=="walk":
        phase=(-1,0,1,1,0,-1)[i]
        out=whole_shift(base,0,(0,0,0,0,-1,0)[i]);out=leg_motion(out,phase,1)
        if i in (2,3):out=arm_motion(out,direction,1)
        if i in (1,4):out=hair_tip_lag(out,direction,1)
        return out
    if anim=="turn":
        if i==1:
            box=base.getbbox()
            if box:
                x0,y0,x1,y1=box;reg=base.crop(box);nw=max(1,reg.width-3)
                reg=reg.resize((nw,reg.height),Image.NEAREST)
                out=Image.new("RGBA",(CELL,CELL),(0,0,0,0))
                out.alpha_composite(reg,((CELL-nw)//2,y0));return out
        return base.copy()
    if anim=="talk":
        out=base.copy()
        if i in (1,2):out=arm_motion(out,direction,1 if i==1 else 2)
        return out
    if anim=="surprise":
        out=base.copy()
        if i in (1,2):
            out=whole_shift(out,0,-1);out=arm_motion(out,direction,1 if i==1 else 2)
        return out
    if anim=="approach":
        out=base.copy()
        if i in (1,2,3):
            out=torso_shift(out,direction,1);out=leg_motion(out,1 if i%2 else -1,1)
        return out
    if anim=="laugh":
        out=whole_shift(base,0,(0,0,-1,-1,0,0)[i])
        if i in (1,2,3,4):out=arm_motion(out,direction,1 if i in (1,4) else 2)
        return out
    if anim=="run":
        phase=(-1,1,-1,1,-1,1)[i]
        out=leg_motion(base,phase,2);out=torso_shift(out,direction,1)
        return hair_tip_lag(out,direction,1 if i%2 else 0)
    raise ValueError(anim)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--reference",default="docs/pixel/reference/triton_idle_4dir_v1.png")
    ap.add_argument("--out",default="assets/characters/triton")
    args=ap.parse_args()
    ref=Image.open(args.reference).convert("RGBA")
    if ref.size!=(CELL*4,CELL):raise ValueError("reference must be a 192x48 four-direction atlas")
    bases={d:base_pose(ref,d) for d in DIRS}
    out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
    for anim,n in FRAMES.items():
        sheet=Image.new("RGBA",(CELL*n,CELL*len(DIRS)),(0,0,0,0))
        for row,direction in enumerate(DIRS):
            for i in range(n):
                sheet.alpha_composite(make_frame(bases[direction],anim,i,direction),(CELL*i,CELL*row))
        sheet.save(out/f"triton_{anim}.png",optimize=False)
        print(f"{anim}: {sheet.size[0]}x{sheet.size[1]}")

if __name__=="__main__":
    main()
