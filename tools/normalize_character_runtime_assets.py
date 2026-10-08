#!/usr/bin/env python3
"""Normalize runtime sprite alpha and rebuild the world/battle party walk sheet.

This intentionally does NOT crop characters out of rendered illustrations.
It uses the committed 48x48 runtime frames as the source of truth, removes
anti-aliased alpha fringes, and mechanically derives the 32x32 world sheet.
"""
from pathlib import Path
from PIL import Image
import io

ROOT=Path(__file__).resolve().parents[1]
CHARS=("karen","triton","sophie","margaret")
ANIMS=("idle","walk","turn","talk","surprise","approach","laugh","run")
WALK_FRAMES=(0,2,4)
CELL=48
WORLD=32
ALPHA_THRESHOLD=128

def hard_alpha(im):
    src=im.convert("RGBA")
    out=Image.new("RGBA",src.size,(0,0,0,0))
    sp=src.load(); op=out.load()
    changed=False
    for y in range(src.height):
        for x in range(src.width):
            r,g,b,a=sp[x,y]
            na=255 if a>=ALPHA_THRESHOLD else 0
            if a!=na: changed=True
            op[x,y]=(r,g,b,na) if na else (0,0,0,0)
    return out,changed

def save_if_pixel_changed(path,new):
    old=Image.open(path).convert("RGBA")
    if old.size==new.size and old.tobytes()==new.tobytes():
        return False
    new.save(path,optimize=False)
    return True

def normalize_runtime():
    changed=[]
    for char in CHARS:
        for anim in ANIMS:
            path=ROOT/f"assets/characters/{char}/{char}_{anim}.png"
            if not path.exists():
                raise SystemExit(f"missing runtime sprite: {path}")
            with Image.open(path) as im:
                clean,_=hard_alpha(im)
            if save_if_pixel_changed(path,clean):
                changed.append(str(path.relative_to(ROOT)))
    return changed

def rebuild_world_sheet():
    out=Image.new("RGBA",(WORLD*3,WORLD*16),(0,0,0,0))
    for ci,char in enumerate(CHARS):
        path=ROOT/f"assets/characters/{char}/{char}_walk.png"
        walk=Image.open(path).convert("RGBA")
        expected=(CELL*6,CELL*4)
        if walk.size!=expected:
            raise SystemExit(f"{path}: {walk.size} != {expected}")
        for direction in range(4):
            for col,frame in enumerate(WALK_FRAMES):
                cell=walk.crop((frame*CELL,direction*CELL,(frame+1)*CELL,(direction+1)*CELL))
                # Whole-cell nearest-neighbour transform: no auto-crop and no halo.
                cell=cell.resize((WORLD,WORLD),Image.Resampling.NEAREST)
                out.alpha_composite(cell,(col*WORLD,(ci*4+direction)*WORLD))
    path=ROOT/"assets/hero_party_walk.png"
    save_if_pixel_changed(path,out)
    return path

def main():
    changed=normalize_runtime()
    party=rebuild_world_sheet()
    print("CLEAN RUNTIME SPRITE NORMALIZATION COMPLETE")
    print("normalized files:",len(changed))
    for p in changed: print(" -",p)
    print("rebuilt:",party.relative_to(ROOT))

if __name__=="__main__":
    main()
