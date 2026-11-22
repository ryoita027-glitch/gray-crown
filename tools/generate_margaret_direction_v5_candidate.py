#!/usr/bin/env python3
from collections import deque
from pathlib import Path
from PIL import Image

SRC=Path("docs/pixel/reference/margaret_chibi_direction_lock_v2_48.png")
OUT=Path("prototype_artifacts/margaret_face_v5/margaret_chibi_direction_candidate_v5_48.png")
CELL=48
BODY_EXPAND=3
OUTLINE=(44,31,55,255)

def external_outline(im):
    px=im.load()
    w,h=im.size
    opaque=[[px[x,y][3] > 20 for x in range(w)] for y in range(h)]
    outside=[[False]*w for _ in range(h)]
    q=deque()
    for x in range(w):
        for y in (0,h-1):
            if not opaque[y][x] and not outside[y][x]:
                outside[y][x]=True; q.append((x,y))
    for y in range(h):
        for x in (0,w-1):
            if not opaque[y][x] and not outside[y][x]:
                outside[y][x]=True; q.append((x,y))
    dirs=((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1))
    while q:
        x,y=q.popleft()
        for dx,dy in dirs:
            xx,yy=x+dx,y+dy
            if 0<=xx<w and 0<=yy<h and not opaque[yy][xx] and not outside[yy][xx]:
                outside[yy][xx]=True; q.append((xx,yy))
    out=im.copy()
    op=out.load()
    for y in range(h):
        for x in range(w):
            if not outside[y][x]:
                continue
            if any(0<=x+dx<w and 0<=y+dy<h and opaque[y+dy][x+dx] for dx,dy in dirs):
                op[x,y]=OUTLINE
    return out

def main():
    src=Image.open(SRC).convert("RGBA")
    if src.size != (192,48):
        raise SystemExit(f"unexpected source size: {src.size}")

    sheet=Image.new("RGBA",(192,48),(0,0,0,0))
    for i in range(4):
        cell=src.crop((CELL*i,0,CELL*(i+1),CELL))
        bb=cell.getbbox()
        if not bb:
            raise SystemExit(f"empty source direction {i}")
        reg=cell.crop(bb)
        rw,rh=reg.size

        # Critical v5 change: preserve the approved v2 head/face pixels at 1:1.
        # v4 resized the head horizontally, which crushed the eyes/face at Medium44.
        head=reg.crop((0,0,rw,23))

        # Increase body occupancy only below the face so the four-character scale match
        # is retained without resampling the facial pixels.
        body=reg.crop((0,18,rw,rh)).resize((rw+BODY_EXPAND,rh-18),Image.Resampling.NEAREST)

        stage=Image.new("RGBA",(rw+7,rh),(0,0,0,0))
        cx=stage.width//2
        stage.alpha_composite(body,(cx-body.width//2,18))
        stage.alpha_composite(head,(cx-rw//2,0))

        # External silhouette outline only: do not fill internal face/hair gaps.
        stage=external_outline(stage)
        crop=stage.crop(stage.getbbox())

        dst=Image.new("RGBA",(CELL,CELL),(0,0,0,0))
        dst.alpha_composite(crop,((CELL-crop.width)//2,47-crop.height))
        sheet.alpha_composite(dst,(CELL*i,0))

    OUT.parent.mkdir(parents=True,exist_ok=True)
    sheet.save(OUT,optimize=False)
    print(f"WROTE {OUT} {sheet.size}")

if __name__=="__main__":
    main()
