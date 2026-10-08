#!/usr/bin/env python3
from PIL import Image
from pathlib import Path
import argparse

CELL=48
DIRS=("down","left","right","up")
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
IDX={d:i for i,d in enumerate(DIRS)}

def base(ref,d):
    return ref.crop((CELL*IDX[d],0,CELL*(IDX[d]+1),CELL)).copy()

def shift(im,dx=0,dy=0):
    out=Image.new("RGBA",im.size,(0,0,0,0))
    out.alpha_composite(im,(dx,dy))
    return out

def center_scale(im,sx=1.0,sy=1.0,dy=0):
    bb=im.getbbox()
    if not bb:
        return im.copy()
    x0,y0,x1,y1=bb
    reg=im.crop(bb)
    nw=max(1,round(reg.width*sx))
    nh=max(1,round(reg.height*sy))
    reg=reg.resize((nw,nh),Image.Resampling.NEAREST)
    out=Image.new("RGBA",(CELL,CELL),(0,0,0,0))
    x=(CELL-nw)//2
    y=min(CELL-nh,max(0,y0+dy))
    out.alpha_composite(reg,(x,y))
    return out

def frame(b,anim,i,d):
    # Margaret = restrained / measured. Keep the approved source intact and
    # animate through small whole-sprite transforms so no limb holes are created.
    if anim=="idle":
        return shift(b,0,(0,0,-1,0)[i])

    if anim=="walk":
        bob=(0,-1,0,-1,0,0)[i]
        if d=="left":
            dx=(0,-1,-1,0,0,-1)[i]
        elif d=="right":
            dx=(0,1,1,0,0,1)[i]
        else:
            dx=(0,-1,0,1,0,-1)[i]
        return shift(b,dx,bob)

    if anim=="turn":
        if i==1:
            return center_scale(b,0.94,1.0,0)
        return b.copy()

    if anim=="talk":
        if d in ("down","up"):
            dx=(0,1,0,-1)[i]
        elif d=="left":
            dx=(0,-1,0,0)[i]
        else:
            dx=(0,1,0,0)[i]
        return shift(b,dx,(0,0,-1,0)[i])

    if anim=="surprise":
        if i==1:
            return shift(center_scale(b,1.02,1.0,0),0,-2)
        if i==2:
            return shift(b,0,-2)
        return b.copy()

    if anim=="approach":
        if d=="down":
            seq=((0,0),(0,1),(0,1),(0,0))
        elif d=="up":
            seq=((0,0),(0,-1),(0,-1),(0,0))
        elif d=="left":
            seq=((0,0),(-1,0),(-1,0),(0,0))
        else:
            seq=((0,0),(1,0),(1,0),(0,0))
        return shift(b,*seq[i])

    if anim=="laugh":
        dx,dy=((0,0),(0,-1),(1,-1),(0,-1),(-1,0),(0,0))[i]
        if d=="left":
            dx=-abs(dx)
        elif d=="right":
            dx=abs(dx)
        return shift(b,dx,dy)

    if anim=="run":
        bob=(0,-2,0,-2,0,-1)[i]
        if d=="left":
            dx=(0,-2,-1,-2,-1,0)[i]
        elif d=="right":
            dx=(0,2,1,2,1,0)[i]
        else:
            dx=(-1,0,1,0,-1,0)[i]
        return shift(b,dx,bob)

    raise ValueError(anim)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--reference",default="docs/pixel/reference/margaret_chibi_direction_lock_v3_48.png")
    ap.add_argument("--out",default="prototype_artifacts/margaret_generated")
    args=ap.parse_args()

    ref=Image.open(args.reference).convert("RGBA")
    if ref.size!=(192,48):
        raise ValueError(f"reference must be 192x48, got {ref.size}")

    out=Path(args.out)
    out.mkdir(parents=True,exist_ok=True)

    for anim,n in FRAMES.items():
        sheet=Image.new("RGBA",(CELL*n,CELL*4),(0,0,0,0))
        for row,d in enumerate(DIRS):
            b=base(ref,d)
            for i in range(n):
                sheet.alpha_composite(frame(b,anim,i,d),(CELL*i,CELL*row))
        sheet.save(out/f"margaret_{anim}.png",optimize=False)
        print(anim,sheet.size)

if __name__=="__main__":
    main()
