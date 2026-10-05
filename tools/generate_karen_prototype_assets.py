#!/usr/bin/env python3
"""Generate PROTOTYPE TEMPORARY Karen 48px pixel animation sheets.

Visual refinement pass for Karen B — VILLAGE RUNNER.
Deterministic and integer-grid native.
Locked identity enforced here:
- Stage A village-life continuity
- healthy 23-year-old adult impression
- red-brown low partial tie with loose hair
- warm off-white long-sleeve base + short muted-red work vest
- LOCK: sword is always anatomical RIGHT hip; Karen remains left-handed
- 48x48 source cell on the existing 32px logical world
"""

from __future__ import annotations
import argparse
from pathlib import Path
from PIL import Image, ImageDraw

CELL=48
DIRS=("down","left","right","up")
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
P={
"outline":(54,38,34,255),
"outline_soft":(72,48,40,255),
"skin":(204,151,116,255),
"skin_shadow":(177,122,94,255),
"skin_light":(224,174,134,255),
"hair":(154,72,52,255),
"hair_mid":(127,57,47,255),
"hair_dark":(91,42,39,255),
"hair_hi":(193,97,67,255),
"shirt":(232,218,185,255),
"shirt_shadow":(198,180,147,255),
"shirt_light":(245,232,204,255),
"vest":(151,65,59,255),
"vest_mid":(128,52,51,255),
"vest_dark":(100,43,43,255),
"pants":(92,81,70,255),
"pants_light":(112,98,82,255),
"pants_dark":(64,58,53,255),
"leather":(111,76,48,255),
"leather_mid":(86,59,42,255),
"leather_dark":(60,45,36,255),
"metal":(177,181,177,255),
"metal_hi":(212,214,204,255),
"metal_dark":(103,108,108,255),
"eye":(54,42,37,255),
"cheek":(192,103,88,255),
}

def motion(anim,i):
    p={"bob":0,"lean":0,"arm":0,"stride":0,"head":0,"hair":0,"dy":0,"mouth":False,"wide":False}
    if anim=="idle":
        p["bob"]=(0,0,1,0)[i]; p["hair"]=(0,1,0,-1)[i]
    elif anim=="walk":
        p["bob"]=(0,1,0,1,0,1)[i]; p["stride"]=(-2,-1,0,2,1,0)[i]
        p["arm"]=-p["stride"]; p["hair"]=(2,1,0,-2,-1,0)[i]
    elif anim=="run":
        p["bob"]=(1,0,1,0,1,0)[i]; p["stride"]=(-4,-2,1,4,2,-1)[i]
        p["arm"]=-p["stride"]; p["lean"]=2; p["hair"]=(4,3,1,-3,-4,-1)[i]
    elif anim=="turn":
        p["head"]=(0,1,0)[i]; p["hair"]=(1,0,-1)[i]
    elif anim=="talk":
        p["arm"]=(0,2,3,1)[i]; p["hair"]=(0,1,0,0)[i]; p["mouth"]=i in (1,2)
    elif anim=="surprise":
        p["dy"]=(0,-1,-2,-1)[i]; p["arm"]=(0,2,4,2)[i]
        p["hair"]=(0,1,2,1)[i]; p["mouth"]=i in (1,2,3); p["wide"]=i in (1,2)
    elif anim=="approach":
        p["lean"]=(0,1,2,2)[i]; p["stride"]=(0,1,2,1)[i]
        p["arm"]=(0,1,2,1)[i]; p["hair"]=(0,-1,-2,-1)[i]
    elif anim=="laugh":
        p["dy"]=(0,0,1,2,1,0)[i]; p["lean"]=(0,1,2,3,2,0)[i]
        p["arm"]=(0,1,2,3,2,0)[i]; p["hair"]=(0,1,2,3,1,0)[i]
        p["mouth"]=i in (1,2,3,4)
    return p

def poly(d, pts, fill, outline=None):
    pts=[(int(x),int(y)) for x,y in pts]
    d.polygon(pts, fill=fill)
    if outline:
        d.line(pts+[pts[0]], fill=outline, width=1)

def rect(d,xy,fill,outline=None):
    xy=tuple(int(v) for v in xy)
    d.rectangle(xy, fill=fill, outline=outline)

def px(d,x,y,c):
    d.point((int(x),int(y)),fill=c)

def draw_side(anim,i,direction):
    m=motion(anim,i)
    im=Image.new("RGBA",(CELL,CELL),(0,0,0,0)); d=ImageDraw.Draw(im)
    face=1 if direction=="right" else -1
    cy=m["dy"]-m["bob"]
    lean=m["lean"]*face
    stride=m["stride"]
    arm=m["arm"]
    cx=24+lean

    fx = cx-3 + (stride//2)*face
    poly(d, [(fx-2,30+cy),(fx+2,30+cy),(fx+1,40+cy),(fx-2,40+cy)], P["pants_dark"], P["outline"])
    poly(d, [(fx-2,39+cy),(fx+1,39+cy),(fx+2,44+cy),(fx-3,44+cy)], P["leather_mid"], P["outline"])
    nx = cx+2 - (stride//2)*face
    poly(d, [(nx-2,29+cy),(nx+3,29+cy),(nx+3,40+cy),(nx-1,40+cy)], P["pants"], P["outline"])
    rect(d,(nx+1,30+cy,nx+2,36+cy),P["pants_light"])
    poly(d, [(nx-1,39+cy),(nx+3,39+cy),(nx+5*face,44+cy),(nx-2,44+cy)], P["leather"], P["outline"])
    d.line([(min(nx-2,nx+5*face),44+cy),(max(nx-2,nx+5*face),44+cy)],fill=P["outline"],width=1)

    poly(d,[(cx-6,18+cy),(cx+5,18+cy),(cx+7*face,29+cy),(cx-6*face,30+cy)],P["shirt"],P["outline"])
    if face==1:
        poly(d,[(cx-5,18+cy),(cx+3,18+cy),(cx+5,26+cy),(cx-4,27+cy)],P["vest"],P["outline_soft"])
        rect(d,(cx-4,24+cy,cx+4,27+cy),P["vest_mid"])
        px(d,cx+3,20+cy,P["shirt_light"])
    else:
        poly(d,[(cx-3,18+cy),(cx+5,18+cy),(cx+4,27+cy),(cx-5,26+cy)],P["vest"],P["outline_soft"])
        rect(d,(cx-4,24+cy,cx+4,27+cy),P["vest_mid"])
    rect(d,(cx-7,28+cy,cx+7,30+cy),P["leather_dark"],P["outline"])
    rect(d,(cx-1,28+cy,cx+1,30+cy),P["metal_dark"])

    back_x=cx-5*face
    if anim in ("talk","surprise","approach","laugh"):
        elbow_y=23+cy-int(arm*0.3)
        hand_y=26+cy-int(arm*0.55)
        pts=[(back_x,20+cy),(back_x-3*face,21+cy),(back_x-4*face,elbow_y),(back_x-2*face,27+cy)]
        poly(d,pts,P["shirt_shadow"],P["outline"])
        rect(d,(min(back_x-5*face,back_x-3*face),hand_y,max(back_x-5*face,back_x-3*face),hand_y+2),P["skin_shadow"],P["outline"])
    else:
        poly(d,[(back_x,20+cy),(back_x-3*face,21+cy),(back_x-2*face,29+cy),(back_x,29+cy)],P["shirt_shadow"],P["outline"])
        rect(d,(min(back_x-2*face,back_x),28+cy,max(back_x-2*face,back_x),31+cy),P["skin_shadow"])

    front_x=cx+5*face
    if anim in ("talk","surprise","approach","laugh"):
        ex=front_x+2*face+int(arm*0.55)*face
        ey=22+cy-int(abs(arm)*0.25)
        hx=ex+2*face+int(arm*0.35)*face
        hy=25+cy-int(arm*0.45)
        poly(d,[(front_x,20+cy),(front_x+3*face,21+cy),(ex,ey),(ex-face,ey+3)],P["shirt"],P["outline"])
        poly(d,[(ex,ey),(hx,hy),(hx-face,hy+2),(ex-face,ey+3)],P["skin"],P["outline"])
        px(d,hx+face,hy+1,P["skin_light"])
    else:
        ex=front_x+2*face-int(stride*0.25)*face
        poly(d,[(front_x,20+cy),(front_x+3*face,21+cy),(ex,29+cy),(ex-2*face,29+cy)],P["shirt"],P["outline"])
        rect(d,(min(ex-2*face,ex),28+cy,max(ex-2*face,ex),31+cy),P["skin"],P["outline"])

    pouch_x=cx-7*face
    rect(d,(min(pouch_x,pouch_x+3*face),29+cy,max(pouch_x,pouch_x+3*face),33+cy),P["leather_mid"],P["outline"])
    px(d,pouch_x+face,30+cy,P["leather"])

    sword_side = -face
    hipx = cx + 7*sword_side
    rect(d,(min(hipx,hipx+2*sword_side),28+cy,max(hipx,hipx+2*sword_side),31+cy),P["leather"],P["outline"])
    poly(d,[(hipx,31+cy),(hipx+2*sword_side,31+cy),(hipx-2*sword_side,42+cy),(hipx-4*sword_side,42+cy)],P["leather_dark"],P["outline"])
    px(d,hipx+sword_side,31+cy,P["metal"])

    rect(d,(cx-2,15+cy,cx+2,19+cy),P["skin_shadow"],P["outline_soft"])

    trail=m["hair"]*(-face)
    poly(d,[(cx-5*face+trail//2,9+cy),(cx-8*face+trail,13+cy),(cx-7*face+trail,22+cy),
            (cx-4*face+trail,25+cy),(cx-2*face,19+cy)],P["hair_dark"],P["outline"])
    tiex=cx-7*face+trail
    rect(d,(min(tiex,tiex+2*face),16+cy,max(tiex,tiex+2*face),18+cy),P["leather_dark"])
    poly(d,[(tiex,18+cy),(tiex-3*face,20+cy),(tiex-4*face,25+cy),(tiex-1*face,23+cy)],P["hair"],P["outline"])
    px(d,tiex-2*face,20+cy,P["hair_hi"])

    hx=cx+m["head"]*face
    poly(d,[(hx-4,7+cy),(hx+3,7+cy),(hx+5*face,10+cy),(hx+5*face,15+cy),
            (hx+3*face,17+cy),(hx-2*face,17+cy),(hx-4*face,14+cy)],P["skin"],P["outline"])
    if face==1:
        rect(d,(hx+1,9+cy,hx+3,12+cy),P["skin_light"])
        px(d,hx+3,15+cy,P["cheek"])
    else:
        rect(d,(hx-3,9+cy,hx-1,12+cy),P["skin_light"])
        px(d,hx-3,15+cy,P["cheek"])

    if face==1:
        poly(d,[(hx-5,8+cy),(hx-3,5+cy),(hx+2,5+cy),(hx+4,7+cy),(hx+3,10+cy),(hx+1,8+cy),(hx-1,10+cy),(hx-3,9+cy),(hx-4,13+cy)],P["hair"],P["outline"])
        rect(d,(hx-3,6+cy,hx,7+cy),P["hair_hi"])
        px(d,hx+2,10+cy,P["outline_soft"]); px(d,hx+3,11+cy,P["eye"])
        if m["wide"]: px(d,hx+3,10+cy,P["eye"])
        px(d,hx+5,13+cy,P["skin_shadow"])
        if m["mouth"]:
            d.line([(hx+4,15+cy),(hx+6,15+cy)],fill=P["outline"],width=1)
            px(d,hx+5,16+cy,P["skin_shadow"])
        else:
            px(d,hx+5,15+cy,P["outline_soft"])
    else:
        poly(d,[(hx+5,8+cy),(hx+3,5+cy),(hx-2,5+cy),(hx-4,7+cy),(hx-3,10+cy),(hx-1,8+cy),(hx+1,10+cy),(hx+3,9+cy),(hx+4,13+cy)],P["hair"],P["outline"])
        rect(d,(hx,6+cy,hx+3,7+cy),P["hair_hi"])
        px(d,hx-2,10+cy,P["outline_soft"]); px(d,hx-3,11+cy,P["eye"])
        if m["wide"]: px(d,hx-3,10+cy,P["eye"])
        px(d,hx-5,13+cy,P["skin_shadow"])
        if m["mouth"]:
            d.line([(hx-6,15+cy),(hx-4,15+cy)],fill=P["outline"],width=1)
            px(d,hx-5,16+cy,P["skin_shadow"])
        else:
            px(d,hx-5,15+cy,P["outline_soft"])
    return im

def draw_front_back(anim,i,direction):
    m=motion(anim,i)
    im=Image.new("RGBA",(CELL,CELL),(0,0,0,0)); d=ImageDraw.Draw(im)
    cy=m["dy"]-m["bob"]; lean=m["lean"]; stride=m["stride"]; arm=m["arm"]; hair=m["hair"]
    cx=24+lean

    lx=cx-4+stride//3; rx=cx+4-stride//3
    poly(d,[(lx-2,30+cy),(lx+2,30+cy),(lx+1,40+cy),(lx-2,40+cy)],P["pants"],P["outline"])
    poly(d,[(rx-2,30+cy),(rx+2,30+cy),(rx+2,40+cy),(rx-1,40+cy)],P["pants_dark"],P["outline"])
    poly(d,[(lx-2,39+cy),(lx+1,39+cy),(lx+2,44+cy),(lx-3,44+cy)],P["leather"],P["outline"])
    poly(d,[(rx-1,39+cy),(rx+2,39+cy),(rx+3,44+cy),(rx-2,44+cy)],P["leather_mid"],P["outline"])

    poly(d,[(cx-7,18+cy),(cx+7,18+cy),(cx+8,29+cy),(cx-8,29+cy)],P["shirt"],P["outline"])
    rect(d,(cx-6,18+cy,cx+6,27+cy),P["vest"],P["outline_soft"])
    if direction=="down":
        rect(d,(cx-1,18+cy,cx+1,27+cy),P["shirt"])
        px(d,cx+4,20+cy,P["vest_mid"])
        px(d,cx-4,25+cy,P["vest_dark"])
    else:
        rect(d,(cx-5,24+cy,cx+5,27+cy),P["vest_mid"])
    rect(d,(cx-8,28+cy,cx+8,30+cy),P["leather_dark"],P["outline"])
    rect(d,(cx-1,28+cy,cx+1,30+cy),P["metal_dark"])
    rect(d,(cx+5 if direction=="down" else cx-8,30+cy,cx+8 if direction=="down" else cx-5,34+cy),P["leather_mid"],P["outline"])

    if anim in ("talk","surprise","approach","laugh"):
        g=arm
        poly(d,[(cx+6,20+cy),(cx+9,21+cy),(cx+10+g,25+cy-g//2),(cx+8+g,28+cy-g//2)],P["shirt"],P["outline"])
        rect(d,(cx+8+g,26+cy-g//2,cx+11+g,29+cy-g//2),P["skin"],P["outline"])
        poly(d,[(cx-6,20+cy),(cx-9,21+cy),(cx-10-g//2,26+cy),(cx-8-g//2,29+cy)],P["shirt_shadow"],P["outline"])
        rect(d,(cx-11-g//2,27+cy,cx-8-g//2,29+cy),P["skin_shadow"],P["outline"])
    else:
        poly(d,[(cx-6,20+cy),(cx-9,21+cy),(cx-8,29+cy),(cx-6,29+cy)],P["shirt_shadow"],P["outline"])
        poly(d,[(cx+6,20+cy),(cx+9,21+cy),(cx+8,29+cy),(cx+6,29+cy)],P["shirt"],P["outline"])
        rect(d,(cx-9,28+cy,cx-7,31+cy),P["skin_shadow"],P["outline"])
        rect(d,(cx+7,28+cy,cx+9,31+cy),P["skin"],P["outline"])

    sx=cx-9 if direction=="down" else cx+9
    sign=-1 if direction=="down" else 1
    rect(d,(min(sx,sx+2*sign),29+cy,max(sx,sx+2*sign),32+cy),P["leather"],P["outline"])
    poly(d,[(sx,31+cy),(sx+2*sign,31+cy),(sx+5*sign,42+cy),(sx+2*sign,43+cy)],P["leather_dark"],P["outline"])

    rect(d,(cx-2,15+cy,cx+2,19+cy),P["skin_shadow"],P["outline_soft"])
    if direction=="down":
        poly(d,[(cx-6,7+cy),(cx+6,7+cy),(cx+7,15+cy),(cx+4,19+cy),(cx-5,19+cy),(cx-7,15+cy)],P["hair_dark"],P["outline"])
        poly(d,[(cx-5+hair//2,14+cy),(cx-8+hair,18+cy),(cx-7+hair,25+cy),(cx-4+hair,23+cy)],P["hair"],P["outline"])
        rect(d,(cx-7+hair,17+cy,cx-5+hair,19+cy),P["leather_dark"])
        poly(d,[(cx-5,7+cy),(cx+5,7+cy),(cx+6,10+cy),(cx+5,16+cy),(cx+2,18+cy),(cx-2,18+cy),(cx-5,16+cy),(cx-6,10+cy)],P["skin"],P["outline"])
        poly(d,[(cx-6,8+cy),(cx-4,5+cy),(cx+4,5+cy),(cx+6,8+cy),(cx+4,10+cy),(cx+2,8+cy),(cx,10+cy),(cx-2,8+cy),(cx-4,11+cy)],P["hair"],P["outline"])
        rect(d,(cx-2,6+cy,cx+2,7+cy),P["hair_hi"])
        px(d,cx-3,11+cy,P["outline_soft"]); px(d,cx+3,11+cy,P["outline_soft"])
        px(d,cx-3,12+cy,P["eye"]); px(d,cx+3,12+cy,P["eye"])
        if m["wide"]:
            px(d,cx-3,11+cy,P["eye"]); px(d,cx+3,11+cy,P["eye"])
        px(d,cx+4,14+cy,P["cheek"]); px(d,cx-4,14+cy,P["cheek"])
        if m["mouth"]:
            d.line([(cx-2,16+cy),(cx+2,16+cy)],fill=P["outline"],width=1)
            px(d,cx,17+cy,P["skin_shadow"])
        else:
            d.line([(cx-1,16+cy),(cx+1,16+cy)],fill=P["outline_soft"],width=1)
    else:
        poly(d,[(cx-6,6+cy),(cx+6,6+cy),(cx+7,14+cy),(cx+5,21+cy),(cx+2,24+cy),(cx-3,23+cy),(cx-6,20+cy),(cx-7,13+cy)],P["hair"],P["outline"])
        rect(d,(cx-3,7+cy,cx+2,8+cy),P["hair_hi"])
        rect(d,(cx-3,17+cy,cx+3,19+cy),P["leather_dark"])
        poly(d,[(cx+1+hair//2,18+cy),(cx+5+hair,20+cy),(cx+6+hair,26+cy),(cx+2+hair,24+cy)],P["hair_dark"],P["outline"])
    return im

def frame(anim,i,direction):
    return draw_side(anim,i,direction) if direction in ("left","right") else draw_front_back(anim,i,direction)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--out",default="assets/characters/karen")
    args=ap.parse_args()
    out=Path(args.out)
    out.mkdir(parents=True,exist_ok=True)
    for anim,n in FRAMES.items():
        sheet=Image.new("RGBA",(CELL*n,CELL*len(DIRS)),(0,0,0,0))
        for row,direction in enumerate(DIRS):
            for i in range(n):
                sheet.alpha_composite(frame(anim,i,direction),(CELL*i,CELL*row))
        sheet.save(out/f"karen_{anim}.png",optimize=False)
        print(f"{anim}: {sheet.size[0]}x{sheet.size[1]}")

if __name__=="__main__":
    main()
