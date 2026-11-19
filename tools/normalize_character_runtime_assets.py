#!/usr/bin/env python3
"""Rebuild the world/battle party sheet from locked 48x48 runtime sources.

Approved source PNGs are NEVER rewritten here. Anti-aliased alpha is normalized
only in the derived world/battle sheet. 48x48 cinematic rendering is cleaned
at image-load time in js/systems/animation.js.
"""
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
CHARS=("karen","triton","sophie","margaret")
WALK_FRAMES=(0,2,4)
CELL=48
WORLD=32
ALPHA_THRESHOLD=128

def hard_alpha(im):
    src=im.convert("RGBA")
    out=Image.new("RGBA",src.size,(0,0,0,0))
    sp=src.load();op=out.load()
    for y in range(src.height):
        for x in range(src.width):
            r,g,b,a=sp[x,y]
            if a>=ALPHA_THRESHOLD: op[x,y]=(r,g,b,255)
            else: op[x,y]=(0,0,0,0)
    return out

def main():
    out=Image.new("RGBA",(WORLD*3,WORLD*16),(0,0,0,0))
    for ci,char in enumerate(CHARS):
        folder=ROOT/"assets"/"characters"/char
        source=folder if char=="karen" else folder/"acting"
        path=source/f"{char}_walk.png"
        if not path.exists(): raise SystemExit(f"missing runtime walk sheet: {path}")
        walk=Image.open(path).convert("RGBA")
        source_cell=walk.height//4
        if source_cell % CELL or walk.size!=(source_cell*6,source_cell*4):
            raise SystemExit(f"{path}: invalid six-frame, four-direction atlas {walk.size}")
        for direction in range(4):
            for col,frame in enumerate(WALK_FRAMES):
                cell=walk.crop((frame*source_cell,direction*source_cell,(frame+1)*source_cell,(direction+1)*source_cell))
                cell=hard_alpha(cell)
                # Whole-cell nearest-neighbour transform. No trim/cutout pass.
                cell=cell.resize((WORLD,WORLD),Image.Resampling.NEAREST)
                out.alpha_composite(cell,(col*WORLD,(ci*4+direction)*WORLD))

    path=ROOT/"assets/hero_party_walk.png"
    old=Image.open(path).convert("RGBA") if path.exists() else None
    if old is None or old.size!=out.size or old.tobytes()!=out.tobytes():
        out.save(path,optimize=False)
        print("UPDATED",path.relative_to(ROOT))
    else:
        print("UNCHANGED",path.relative_to(ROOT))
    print("LOCKED 48x48 CHARACTER PNGS WERE NOT MODIFIED")

if __name__=="__main__":
    main()
