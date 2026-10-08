#!/usr/bin/env python3
"""Generate the four-protagonist appeal-upgrade runtime from approved candidate direction locks.

The source of truth for this experimental branch is four exact 48x192 RGBA
direction-lock PNGs (down/left/right/up, 48x48 each). Runtime animation sheets
are generated mechanically without AI cropping, resampling, or background
removal. All output coordinates are integral pixels and alpha remains binary.
"""
from pathlib import Path
from PIL import Image
import math

ROOT=Path(__file__).resolve().parents[1]
CELL=48
CHARS=("karen","triton","sophie","margaret")
ANIMS={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
LOCKS={c:ROOT/f"docs/pixel/reference/{c}_appeal_direction_lock_v1.png" for c in CHARS}

def binary_clean(im):
    im=im.convert("RGBA")
    p=im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=p[x,y]
            if a<128:
                p[x,y]=(0,0,0,0)
            else:
                p[x,y]=(r,g,b,255)
    return im

def load_directions(char):
    p=LOCKS[char]
    if not p.exists():
        raise SystemExit(f"missing appeal direction lock: {p}")
    im=binary_clean(Image.open(p))
    if im.size!=(48,192):
        raise SystemExit(f"{p}: expected (48,192), got {im.size}")
    return [im.crop((0,i*48,48,(i+1)*48)) for i in range(4)]

def shifted(base, dx=0, dy=0, lower_dx=0, upper_dx=0):
    out=Image.new("RGBA",(48,48),(0,0,0,0))
    if lower_dx or upper_dx:
        split=29
        upper=base.crop((0,0,48,split))
        lower=base.crop((0,split,48,48))
        out.alpha_composite(upper,(dx+upper_dx,dy))
        out.alpha_composite(lower,(dx+lower_dx,split+dy))
    else:
        out.alpha_composite(base,(dx,dy))
    return out

def make_frames(base, char, anim, n, direction):
    # Acting amplitude encodes personality while preserving the exact face/design.
    if anim=="idle":
        seq=[(0,0),(0,-1),(0,0),(0,0)]
    elif anim=="walk":
        seq=[(-1,0,1,-1),(0,-1,-1,0),(1,0,1,0),(0,1,-1,0),(-1,0,1,0),(0,-1,-1,0)]
    elif anim=="run":
        seq=[(-1,-1,2,-1),(0,-2,-2,1),(1,-1,2,1),(1,0,-2,0),(0,-2,2,0),(-1,-1,-2,-1)]
    elif anim=="turn":
        seq=[(0,0),(1,0),(-1,0)]
    elif anim=="talk":
        seq=[(0,0),(0,-1),(1,0),(-1,0)]
    elif anim=="surprise":
        seq=[(0,0),(0,-2),(0,-3),(0,-1)]
    elif anim=="approach":
        s=1 if direction in (0,2) else -1
        seq=[(0,0),(s,0),(s,0),(0,0)]
    elif anim=="laugh":
        seq=[(0,0),(0,-1),(1,-1),(0,0),(-1,-1),(0,0)]
    else:
        seq=[(0,0)]*n

    out=[]
    for item in seq[:n]:
        if len(item)==2:
            dx,dy=item
            # Sophie and Margaret keep a calmer center of mass.
            if char in ("sophie","margaret") and anim in ("talk","laugh"):
                dx=0
            out.append(shifted(base,dx,dy))
        else:
            dx,dy,ldx,udx=item
            if char in ("sophie","margaret"):
                ldx=0 if ldx==0 else (1 if ldx>0 else -1)
                udx=0
            elif char=="triton":
                # planted upper body, heavier step language
                udx=0
            out.append(shifted(base,dx,dy,ldx,udx))
    return out

def save_runtime(char, dirs):
    d=ROOT/f"assets/characters/{char}"
    d.mkdir(parents=True,exist_ok=True)
    for anim,n in ANIMS.items():
        sheet=Image.new("RGBA",(48*n,192),(0,0,0,0))
        for di,base in enumerate(dirs):
            for fi,fr in enumerate(make_frames(base,char,anim,n,di)):
                sheet.alpha_composite(fr,(fi*48,di*48))
        sheet=binary_clean(sheet)
        sheet.save(d/f"{char}_{anim}.png",optimize=False)

def rebuild_party_walk():
    out=Image.new("RGBA",(144,768),(0,0,0,0))
    for ci,char in enumerate(CHARS):
        walk=Image.open(ROOT/f"assets/characters/{char}/{char}_walk.png").convert("RGBA")
        for di in range(4):
            for col,frame in enumerate((0,2,4)):
                cell=walk.crop((frame*48,di*48,(frame+1)*48,(di+1)*48))
                cell=cell.resize((32,32),Image.Resampling.NEAREST)
                out.alpha_composite(cell,(col*32,(ci*4+di)*32))
    binary_clean(out).save(ROOT/"assets/hero_party_walk.png",optimize=False)

def main():
    for char in CHARS:
        save_runtime(char,load_directions(char))
        print("generated",char)
    rebuild_party_walk()
    print("FOUR HERO APPEAL RUNTIME GENERATED")

if __name__=="__main__":
    main()
