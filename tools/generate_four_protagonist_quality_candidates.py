#!/usr/bin/env python3
from collections import deque
from pathlib import Path
from PIL import Image
import json, subprocess

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"/"four_protagonist_uplift"
CELL=48
CHARS=("karen","triton","sophie")
ANIMS={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
DIRS=("down","left","right","up")

def components(alpha):
    w,h=alpha.size
    seen=set(); comps=[]
    for y in range(h):
        for x in range(w):
            if (x,y) in seen or alpha.getpixel((x,y))<=20: continue
            q=deque([(x,y)]);seen.add((x,y));pts=[]
            while q:
                px,py=q.popleft();pts.append((px,py))
                for dx,dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                    xx,yy=px+dx,py+dy
                    if 0<=xx<w and 0<=yy<h and (xx,yy) not in seen and alpha.getpixel((xx,yy))>20:
                        seen.add((xx,yy));q.append((xx,yy))
            comps.append(pts)
    return sorted(comps,key=len,reverse=True)

def clean_frame(frame):
    alpha=frame.getchannel("A")
    comps=components(alpha)
    if not comps:return frame.copy(),0,[]
    main=comps[0]
    mx0=min(x for x,y in main);my0=min(y for x,y in main);mx1=max(x for x,y in main)+1;my1=max(y for x,y in main)+1
    remove=[]
    notes=[]
    for comp in comps[1:]:
        x0=min(x for x,y in comp);y0=min(y for x,y in comp);x1=max(x for x,y in comp)+1;y1=max(y for x,y in comp)+1
        area=len(comp)
        # Only remove obvious detached micro-artifacts. Do not touch real hands, hair,
        # equipment or motion if the component is substantial or near the main body.
        above = y1 <= my0+3
        tiny_far = area<=8 and (x1 < mx0-1 or x0 > mx1+1 or y1 < my0-1)
        if (area<=30 and above) or tiny_far:
            remove.extend(comp);notes.append({"area":area,"bbox":[x0,y0,x1,y1]})
    out=frame.copy(); px=out.load()
    for x,y in remove: px[x,y]=(0,0,0,0)
    return out,len(remove),notes

def clean_sheet(path,anim,count,out_path):
    im=Image.open(path).convert("RGBA")
    out=Image.new("RGBA",im.size,(0,0,0,0))
    removed=0; details=[]
    for row,d in enumerate(DIRS):
        for fi in range(count):
            fr=im.crop((fi*CELL,row*CELL,(fi+1)*CELL,(row+1)*CELL))
            cl,n,notes=clean_frame(fr)
            out.alpha_composite(cl,(fi*CELL,row*CELL))
            removed+=n
            if notes: details.append({"direction":d,"frame":fi,"removed":n,"components":notes})
    out_path.parent.mkdir(parents=True,exist_ok=True); out.save(out_path,optimize=False)
    return removed,details

def direction_from_idle(path):
    im=Image.open(path).convert("RGBA")
    sheet=Image.new("RGBA",(CELL*4,CELL),(0,0,0,0))
    for di in range(4):
        sheet.alpha_composite(im.crop((0,di*CELL,CELL,(di+1)*CELL)),(di*CELL,0))
    return sheet

OUT.mkdir(parents=True,exist_ok=True)
summary={"characters":{}}

# First pass: exact current runtime sheets for locked controls. Cleanup is deliberately
# conservative and only removes detached micro-artifacts.
for c in CHARS:
    cdir=OUT/c
    csum={"animations":{},"total_removed_pixels":0}
    for anim,count in ANIMS.items():
        src=ROOT/f"assets/characters/{c}/{c}_{anim}.png"
        dst=cdir/f"{c}_{anim}.png"
        removed,details=clean_sheet(src,anim,count,dst)
        csum["animations"][anim]={"removed_pixels":removed,"details":details}
        csum["total_removed_pixels"]+=removed
    direction_from_idle(cdir/f"{c}_idle.png").save(cdir/f"{c}_direction_candidate_v1.png",optimize=False)
    summary["characters"][c]=csum

# Margaret v5: generate the eight candidate runtime sheets from the face-preserving
# v5 direction candidate. This corrects the rejected v4 face without mutating assets/.
marg_dir=ROOT/"prototype_artifacts/margaret_face_v5/margaret_chibi_direction_candidate_v5_48.png"
marg_out=OUT/"margaret"
subprocess.run([
    "python","tools/generate_margaret_prototype_assets.py",
    "--reference",str(marg_dir.relative_to(ROOT)),
    "--out",str(marg_out.relative_to(ROOT))
],cwd=ROOT,check=True)
marg_dir_copy=marg_out/"margaret_direction_candidate_v1.png"
Image.open(marg_dir).convert("RGBA").save(marg_dir_copy,optimize=False)
summary["characters"]["margaret"]={"source":"v5 face-readability candidate","total_removed_pixels":0,"animations":"regenerated from v5 direction candidate"}

(OUT/"uplift_summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({c:summary["characters"][c].get("total_removed_pixels",0) for c in summary["characters"]},ensure_ascii=False))
print("FOUR PROTAGONIST UPLIFT CANDIDATES BUILT")
