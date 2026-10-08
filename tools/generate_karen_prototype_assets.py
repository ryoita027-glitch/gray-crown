#!/usr/bin/env python3
"""Generate Karen Chibi Direction Lock v1 runtime animation sheets.

The approved four-view Karen image is the visual source.
This generator preserves:
- 48x48 source cells
- exactly 8 animation categories
- large head / compact Chibi body
- readable red-hair silhouette + low partial tie
- warm off-white sleeves + short muted-red vest
- Karen remains left-handed
- sword is always anatomical RIGHT hip in runtime metadata / acting rules

Animation changes are intentionally simple and readable. This is an integration
asset generator, not a final animation-polish pass.
"""
from PIL import Image
from pathlib import Path
import argparse

CELL=48
DIRS=("down","left","right","up")
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
DIR_INDEX={"down":0,"left":1,"right":2,"up":3}

def base_pose(ref,direction):
    i=DIR_INDEX[direction]
    return ref.crop((CELL*i,0,CELL*(i+1),CELL)).copy()

def whole_shift(im,dx=0,dy=0):
    out=Image.new("RGBA",im.size,(0,0,0,0)); out.alpha_composite(im,(dx,dy)); return out

def move_region(im,box,dx,dy):
    out=im.copy(); x0,y0,x1,y1=box
    out.paste(Image.new("RGBA",(x1-x0,y1-y0),(0,0,0,0)),(x0,y0))
    out.alpha_composite(im.crop(box),(x0+dx,y0+dy)); return out

def leg_motion(im,phase,amount=1):
    if phase==0:return im.copy()
    out=move_region(im,(12,30,24,46),-amount*phase,0)
    return move_region(out,(24,30,37,46),amount*phase,0)

def arm_motion(im,direction,amount):
    if direction in ("down","up"):
        out=move_region(im,(8,21,20,34),-amount,0)
        return move_region(out,(28,21,41,34),amount,0)
    if direction=="right":return move_region(im,(27,20,42,34),amount,0)
    return move_region(im,(6,20,21,34),-amount,0)

def hair_lag(im,direction,amount):
    if not amount:return im.copy()
    if direction=="right":return move_region(im,(4,12,18,30),-amount,0)
    if direction=="left":return move_region(im,(30,12,45,30),amount,0)
    out=move_region(im,(3,10,17,30),-amount,0)
    return move_region(out,(31,10,46,30),amount,0)

def upper_shift(im,direction,amount):
    out=im.copy(); upper=im.crop((4,3,44,32))
    out.paste(Image.new("RGBA",(40,29),(0,0,0,0)),(4,3))
    dx=amount if direction=="right" else -amount if direction=="left" else 0
    out.alpha_composite(upper,(4+dx,3)); return out

def make_frame(base,anim,i,direction):
    if anim=="idle":return whole_shift(base,0,(0,0,-1,0)[i])
    if anim=="walk":
        phase=(-1,0,1,1,0,-1)[i]; dy=(0,-1,0,0,-1,0)[i]
        out=whole_shift(base,0,dy); out=leg_motion(out,phase,1)
        if i in (1,2):out=hair_lag(out,direction,1)
        if i in (2,3):out=arm_motion(out,direction,1)
        return out
    if anim=="talk":
        out=base.copy()
        if i in (1,2):out=arm_motion(out,direction,1 if i==1 else 2)
        if i==2:out=whole_shift(out,0,-1)
        return out
    if anim=="surprise":
        out=base.copy()
        if i in (1,2):
            out=whole_shift(out,0,-1 if i==1 else -2)
            out=arm_motion(out,direction,2); out=hair_lag(out,direction,1)
        elif i==3:out=arm_motion(out,direction,1)
        return out
    if anim=="laugh":
        out=whole_shift(base,0,(0,-1,-2,-1,0,0)[i])
        if i in (1,2,3,4):
            out=arm_motion(out,direction,1 if i in (1,4) else 2)
            out=hair_lag(out,direction,1)
        return out
    if anim=="approach":
        out=base.copy()
        if i in (1,2,3):
            out=upper_shift(out,direction,1); out=arm_motion(out,direction,1)
        return out
    if anim=="run":
        phase=(-1,1,-1,1,-1,1)[i]
        out=whole_shift(base,0,-1 if i%2 else 0)
        out=upper_shift(out,direction,2); out=leg_motion(out,phase,2)
        return hair_lag(out,direction,2 if i in (1,2,3,4) else 1)
    if anim=="turn":
        if i==1:
            box=base.getbbox()
            if box:
                x0,y0,x1,y1=box; reg=base.crop(box); nw=max(1,reg.width-4)
                reg=reg.resize((nw,reg.height),Image.NEAREST)
                out=Image.new("RGBA",(CELL,CELL),(0,0,0,0))
                out.alpha_composite(reg,((CELL-nw)//2,y0)); return out
        return base.copy()
    raise ValueError(anim)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--reference",default="docs/pixel/reference/karen_chibi_direction_v1.png")
    ap.add_argument("--out",default="assets/characters/karen")
    args=ap.parse_args()
    ref=Image.open(args.reference).convert("RGBA")
    if ref.size!=(CELL*4,CELL):raise ValueError("reference must be a 192x48 four-direction atlas")
    bases={d:base_pose(ref,d) for d in DIRS}
    out=Path(args.out); out.mkdir(parents=True,exist_ok=True)
    for anim,n in FRAMES.items():
        sheet=Image.new("RGBA",(CELL*n,CELL*len(DIRS)),(0,0,0,0))
        for row,direction in enumerate(DIRS):
            for i in range(n):
                sheet.alpha_composite(make_frame(bases[direction],anim,i,direction),(CELL*i,CELL*row))
        sheet.save(out/f"karen_{anim}.png",optimize=False)
        print(f"{anim}: {sheet.size[0]}x{sheet.size[1]}")

if __name__=="__main__":
    main()
