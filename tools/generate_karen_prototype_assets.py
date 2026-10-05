#!/usr/bin/env python3
"""Generate Karen Chibi Direction Lock v1 48px animation sheets.

This is a deterministic translation of the user-approved four-view Chibi Karen
into the proven 48x48 source-cell prototype architecture.

Design lock:
- cute Chibi Pixel RPG heroine, large readable head / compact body
- Karen B — VILLAGE RUNNER
- healthy 23-year-old adult identity through clothing, posture, behavior
- strong red-hair silhouette, low partial tie + loose hair
- warm off-white long sleeves + short muted-red work vest
- leather boots
- left-handed
- LOCK: sword is always anatomical RIGHT hip; Karen remains left-handed
- exactly 8 animation categories
- 4 directions
- no scale-integration logic in this generator
"""
from __future__ import annotations
from PIL import Image, ImageDraw
from pathlib import Path
import argparse, base64, io

CELL=48
DIRS=("down","left","right","up")
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}

BASE64 = {
    "down": "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",
    "left": "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",
    "right": "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",
    "up": "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",
}

def load_base(direction):
    return Image.open(io.BytesIO(base64.b64decode(BASE64[direction]))).convert("RGBA")

def translate(im,dx=0,dy=0):
    out=Image.new("RGBA",im.size,(0,0,0,0))
    out.alpha_composite(im,(int(dx),int(dy)))
    return out

def _rgba(px):
    return px if len(px)==4 else (*px,255)

def _hair_color(c):
    r,g,b,a=_rgba(c)
    return a>0 and r>85 and r>g*1.35 and r>b*1.15

def _arm_color(c):
    r,g,b,a=_rgba(c)
    return a>0 and ((r>175 and g>125 and b>90) or (r>155 and g>110 and b>80 and r-g<90))

def _leg_color(c):
    r,g,b,a=_rgba(c)
    if not a:return False
    return r<155 and g<125 and b<110 and not (r>125 and g>75 and b<55)

def move_pixels(im,box,dx=0,dy=0,predicate=lambda c:True):
    x0,y0,x1,y1=map(int,box)
    out=im.copy()
    src=im.load(); dst=out.load()
    picked=[]
    for y in range(max(0,y0),min(CELL,y1)):
        for x in range(max(0,x0),min(CELL,x1)):
            c=src[x,y]
            if predicate(c):
                picked.append((x,y,c))
    for x,y,c in picked:
        dst[x,y]=(0,0,0,0)
    for x,y,c in picked:
        nx,ny=x+int(dx),y+int(dy)
        if 0<=nx<CELL and 0<=ny<CELL:
            dst[nx,ny]=c
    return out

def regions(direction):
    if direction in ("down","up"):
        return {
            "arm_l":(8,21,19,34),"arm_r":(29,21,40,34),
            "leg_l":(12,31,24,46),"leg_r":(24,31,36,46),
            "hair":(28,13,44,31) if direction=="down" else (17,14,35,32),
        }
    if direction=="right":
        return {"arm_l":(9,21,21,35),"arm_r":(26,21,39,35),
                "leg_l":(15,31,27,46),"leg_r":(24,31,37,46),"hair":(7,12,24,31)}
    return {"arm_l":(9,21,22,35),"arm_r":(27,21,40,35),
            "leg_l":(13,31,26,46),"leg_r":(23,31,35,46),"hair":(27,12,45,31)}

def nudge_hair(im,direction,amount):
    if not amount:return im
    r=regions(direction)["hair"]
    dx=amount if direction in ("down","up","right") else -amount
    return move_pixels(im,r,dx,0,_hair_color)

def limbs(im,direction,leg=0,arm=0):
    r=regions(direction); out=im
    if leg:
        amt=max(-2,min(2,int(leg)))
        out=move_pixels(out,r["leg_l"],-amt,0,_leg_color)
        out=move_pixels(out,r["leg_r"], amt,0,_leg_color)
    if arm:
        amt=max(-2,min(2,int(arm)))
        if direction in ("down","up"):
            out=move_pixels(out,r["arm_l"],-abs(amt)//2,-amt,_arm_color)
            out=move_pixels(out,r["arm_r"], abs(amt)//2,amt//2,_arm_color)
        else:
            out=move_pixels(out,r["arm_l"],-amt,0,_arm_color)
            out=move_pixels(out,r["arm_r"], amt,0,_arm_color)
    return out

def expressive_arms(im,direction,amount,up=0):
    r=regions(direction); out=im
    amt=max(0,min(2,int(amount)))
    lift=max(0,min(2,int(up)))
    if direction in ("down","up"):
        out=move_pixels(out,r["arm_l"],-amt,-lift,_arm_color)
        out=move_pixels(out,r["arm_r"], amt,-lift,_arm_color)
    else:
        sign=1 if direction=="right" else -1
        box=r["arm_r"] if sign==1 else r["arm_l"]
        out=move_pixels(out,box,sign*amt,-lift,_arm_color)
    return out

def add_face_cue(im,direction,kind):
    if direction=="up":return im
    out=im.copy(); d=ImageDraw.Draw(out)
    if direction=="down":
        if kind=="surprise":
            d.point((19,14),fill=(255,246,220,255)); d.point((29,14),fill=(255,246,220,255))
        elif kind=="laugh":
            d.line((21,18,27,18),fill=(106,45,39,255),width=1)
            d.point((24,19),fill=(231,150,130,255))
        elif kind=="talk":
            d.line((23,18,26,18),fill=(111,48,42,255),width=1)
    else:
        x=30 if direction=="right" else 18
        if kind=="laugh": d.line((x-1,18,x+1,18),fill=(106,45,39,255),width=1)
        elif kind=="talk": d.point((x,18),fill=(111,48,42,255))
        elif kind=="surprise": d.point((x,14),fill=(255,246,220,255))
    return out

def frame(anim,i,direction):
    base=load_base(direction)
    if anim=="idle":
        return nudge_hair(base,direction,(0,0,1,0)[i])

    if anim=="walk":
        phase=(-2,-1,0,2,1,0)[i]
        bob=(0,-1,0,-1,0,-1)[i]
        out=limbs(base,direction,leg=phase,arm=-phase)
        out=nudge_hair(out,direction,(1,1,0,-1,-1,0)[i])
        return translate(out,0,bob)

    if anim=="run":
        phase=(-3,-2,1,3,2,-1)[i]
        bob=(-1,0,-1,0,-1,0)[i]
        out=limbs(base,direction,leg=phase,arm=-phase)
        out=nudge_hair(out,direction,(2,2,1,-2,-2,-1)[i])
        dx=(1 if direction=="right" else -1 if direction=="left" else 0)
        return translate(out,dx,bob)

    if anim=="talk":
        amt=(0,1,2,1)[i]
        out=expressive_arms(base,direction,amt,0)
        out=nudge_hair(out,direction,(0,1,0,0)[i])
        return add_face_cue(out,direction,"talk" if i in (1,2) else "neutral")

    if anim=="surprise":
        amt=(0,1,3,1)[i]
        out=expressive_arms(base,direction,amt,up=(0,1,2,1)[i])
        out=nudge_hair(out,direction,(0,1,2,1)[i])
        out=translate(out,0,(0,-1,-2,-1)[i])
        return add_face_cue(out,direction,"surprise" if i in (1,2) else "neutral")

    if anim=="laugh":
        amt=(0,1,2,3,2,0)[i]
        out=expressive_arms(base,direction,amt,up=(0,0,1,2,1,0)[i])
        out=nudge_hair(out,direction,(0,1,2,2,1,0)[i])
        out=translate(out,0,(0,0,-1,-2,-1,0)[i])
        return add_face_cue(out,direction,"laugh" if i in (1,2,3,4) else "neutral")

    if anim=="approach":
        amt=(0,1,2,1)[i]
        out=expressive_arms(base,direction,amt,0)
        out=nudge_hair(out,direction,(0,-1,-2,-1)[i])
        dx=1 if direction=="right" else -1 if direction=="left" else 0
        dy=-1 if direction=="up" else 1 if direction=="down" else 0
        return translate(out,dx if i>=1 else 0,dy if i>=2 else 0)

    if anim=="turn":
        amt=(1,0,-1)[i]
        out=nudge_hair(base,direction,amt)
        return translate(out,0,(0,-1,0)[i])

    return base

def validate_sheet(sheet,anim,count):
    assert sheet.size==(CELL*count,CELL*4)
    alpha=sheet.getchannel("A")
    assert alpha.getbbox() is not None
    assert set(alpha.getdata()).issubset({0,255})

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--out",default="assets/characters/karen")
    args=ap.parse_args()
    out=Path(args.out); out.mkdir(parents=True,exist_ok=True)
    for anim,n in FRAMES.items():
        sheet=Image.new("RGBA",(CELL*n,CELL*4),(0,0,0,0))
        for row,direction in enumerate(DIRS):
            for i in range(n):
                sheet.alpha_composite(frame(anim,i,direction),(CELL*i,CELL*row))
        validate_sheet(sheet,anim,n)
        sheet.save(out/f"karen_{anim}.png",optimize=True)
        print(f"{anim}: {sheet.size[0]}x{sheet.size[1]}")

if __name__=="__main__":
    main()
