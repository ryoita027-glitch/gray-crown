#!/usr/bin/env python3
"""Generate PROTOTYPE TEMPORARY Karen 48px pixel animation sheets.

This is deliberately deterministic and grid-native. It is a prototype tool, not
final Character Reference art. Locked identity enforced here:
- Stage A VILLAGE RUNNER
- warm off-white + muted red + leather brown
- red-brown low partial hair tie
- left-handed identity; sword remains on the anatomical RIGHT hip
- 48x48 source cell on the existing 32px logical world
"""

from __future__ import annotations
from pathlib import Path
import argparse
import math
from PIL import Image, ImageDraw

CELL=48
DIRS=("down","left","right","up")
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
P={
 "outline":(45,35,31,255),"skin":(195,139,106,255),"skin_shadow":(166,109,83,255),
 "hair":(132,67,52,255),"hair_dark":(95,45,38,255),"hair_hi":(165,83,61,255),
 "shirt":(226,211,178,255),"shirt_shadow":(190,172,143,255),
 "vest":(145,66,61,255),"vest_dark":(111,48,46,255),
 "pants":(91,78,66,255),"pants_dark":(65,57,51,255),
 "leather":(102,71,47,255),"leather_dark":(62,45,34,255),
 "metal":(171,176,177,255),"metal_dark":(104,108,110,255),"eye":(55,40,34,255),
}

def rect(d,xy,c): d.rectangle(tuple(int(v) for v in xy),fill=c)
def poly(d,pts,c): d.polygon([(int(x),int(y)) for x,y in pts],fill=c)

def motion(anim,i):
    p={"bob":0,"lean":0,"arm":0,"stride":0,"head":0,"hair":0,"dy":0,"mouth":False}
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
        p["hair"]=(0,1,2,1)[i]; p["mouth"]=i in (1,2,3)
    elif anim=="approach":
        p["lean"]=(0,1,2,2)[i]; p["stride"]=(0,1,2,1)[i]
        p["arm"]=(0,1,2,1)[i]; p["hair"]=(0,-1,-2,-1)[i]
    elif anim=="laugh":
        p["dy"]=(0,0,1,2,1,0)[i]; p["lean"]=(0,1,2,3,2,0)[i]
        p["arm"]=(0,1,2,3,2,0)[i]; p["hair"]=(0,1,2,3,1,0)[i]
        p["mouth"]=i in (1,2,3,4)
    return p

def front_back(anim,i,direction):
    m=motion(anim,i); im=Image.new("RGBA",(CELL,CELL),(0,0,0,0)); d=ImageDraw.Draw(im)
    cy=m["dy"]-m["bob"]; lean=m["lean"]; stride=m["stride"]; arm=m["arm"]; hairlag=m["hair"]
    lo=stride; ro=-stride
    # legs / practical boots
    rect(d,(17+lo//2,38+cy,21+lo//2,44+cy),P["leather_dark"])
    rect(d,(27+ro//2,38+cy,31+ro//2,44+cy),P["leather_dark"])
    rect(d,(16+lo//2,43+cy,21+lo//2,45+cy),P["outline"])
    rect(d,(27+ro//2,43+cy,32+ro//2,45+cy),P["outline"])
    rect(d,(17+lo//3,30+cy,22+lo//3,39+cy),P["pants"])
    rect(d,(26+ro//3,30+cy,31+ro//3,39+cy),P["pants"])
    rect(d,(21,29+cy,27,34+cy),P["pants_dark"])
    # torso: compact short outer garment over warm off-white shirt
    poly(d,((15+lean,17+cy),(33+lean,17+cy),(35+lean,30+cy),(13+lean,30+cy)),P["outline"])
    rect(d,(16+lean,18+cy,32+lean,29+cy),P["shirt"])
    rect(d,(15+lean,19+cy,18+lean,28+cy),P["shirt_shadow"])
    rect(d,(30+lean,19+cy,33+lean,28+cy),P["shirt_shadow"])
    rect(d,(18+lean,18+cy,30+lean,28+cy),P["vest"])
    rect(d,(18+lean,25+cy,30+lean,29+cy),P["vest_dark"])
    if direction=="down": rect(d,(23+lean,18+cy,24+lean,28+cy),P["shirt"])
    rect(d,(15+lean,28+cy,33+lean,30+cy),P["leather_dark"])
    rect(d,(23+lean,28+cy,25+lean,30+cy),P["metal_dark"])
    # hands/arms. Dominant left arm carries most gestures.
    if anim in ("talk","surprise","approach","laugh"):
        g=arm
        if direction=="down":
            poly(d,((31+lean,20+cy),(35+lean,21+cy),(37+lean+g,25+cy-g//2),(34+lean+g,28+cy-g//2)),P["shirt_shadow"])
            rect(d,(35+lean+g,25+cy-g//2,38+lean+g,28+cy-g//2),P["skin"])
            poly(d,((17+lean,20+cy),(13+lean,21+cy),(11+lean-g//2,26+cy),(14+lean-g//2,28+cy)),P["shirt_shadow"])
            rect(d,(9+lean-g//2,25+cy,13+lean-g//2,28+cy),P["skin"])
        else:
            poly(d,((17+lean,20+cy),(13+lean,21+cy),(11+lean-g,25+cy-g//2),(14+lean-g,28+cy-g//2)),P["shirt_shadow"])
            rect(d,(9+lean-g,25+cy-g//2,13+lean-g,28+cy-g//2),P["skin"])
            rect(d,(31+lean,20+cy,35+lean,29+cy),P["shirt_shadow"])
    else:
        rect(d,(12+lean,20+cy+arm//2,16+lean,29+cy+arm//2),P["shirt_shadow"])
        rect(d,(33+lean,20+cy-arm//2,36+lean,29+cy-arm//2),P["shirt_shadow"])
        rect(d,(12+lean,28+cy+arm//2,15+lean,31+cy+arm//2),P["skin"])
        rect(d,(34+lean,28+cy-arm//2,37+lean,31+cy-arm//2),P["skin"])
    rect(d,(21+lean,14+cy,27+lean,19+cy),P["skin_shadow"])
    # LOCK: sword is always anatomical RIGHT hip.
    if direction=="down": # viewer-left
        rect(d,(12+lean,28+cy,15+lean,31+cy),P["leather"])
        poly(d,((13+lean,30+cy),(16+lean,30+cy),(12+lean,42+cy),(9+lean,41+cy)),P["leather_dark"])
        rect(d,(12+lean,31+cy,14+lean,33+cy),P["metal_dark"])
    else: # back view => viewer-right
        rect(d,(33+lean,28+cy,36+lean,31+cy),P["leather"])
        poly(d,((33+lean,30+cy),(36+lean,30+cy),(39+lean,41+cy),(36+lean,42+cy)),P["leather_dark"])
        rect(d,(34+lean,31+cy,36+lean,33+cy),P["metal_dark"])
    if direction=="down":
        rect(d,(31+lean+hairlag//2,11+cy,36+lean+hairlag,20+cy),P["hair_dark"])
        rect(d,(33+lean+hairlag,16+cy,37+lean+hairlag,22+cy),P["hair"])
        rect(d,(18+lean+m["head"],7+cy,30+lean+m["head"],17+cy),P["skin"])
        rect(d,(17+lean+m["head"],9+cy,31+lean+m["head"],15+cy),P["skin"])
        rect(d,(17+lean+m["head"],5+cy,31+lean+m["head"],10+cy),P["hair"])
        rect(d,(16+lean+m["head"],8+cy,20+lean+m["head"],15+cy),P["hair_dark"])
        rect(d,(28+lean+m["head"],7+cy,32+lean+m["head"],14+cy),P["hair"])
        rect(d,(20+lean+m["head"],5+cy,24+lean+m["head"],7+cy),P["hair_hi"])
        rect(d,(20+lean+m["head"],11+cy,21+lean+m["head"],12+cy),P["eye"])
        rect(d,(27+lean+m["head"],11+cy,28+lean+m["head"],12+cy),P["eye"])
        rect(d,(23+lean+m["head"],14+cy,25+lean+m["head"],15 if m["mouth"] else 14),P["outline"] if m["mouth"] else P["skin_shadow"])
    else:
        rect(d,(17+lean,6+cy,31+lean,17+cy),P["hair"])
        rect(d,(16+lean,9+cy,20+lean,18+cy),P["hair_dark"])
        rect(d,(28+lean,8+cy,32+lean,19+cy),P["hair_dark"])
        rect(d,(20+lean,14+cy,29+lean,23+cy),P["hair"])
        rect(d,(21+lean,16+cy,27+lean,18+cy),P["leather_dark"])
        rect(d,(22+lean+hairlag//2,18+cy,28+lean+hairlag,24+cy),P["hair_dark"])
        rect(d,(23+lean+hairlag,22+cy,29+lean+hairlag,26+cy),P["hair"])
    return im

def side(anim,i,direction):
    m=motion(anim,i); im=Image.new("RGBA",(CELL,CELL),(0,0,0,0)); d=ImageDraw.Draw(im)
    cy=m["dy"]-m["bob"]; face=1 if direction=="right" else -1; l=m["lean"]*face; stride=m["stride"]; g=m["arm"]
    rect(d,(20+stride//2+l,31+cy,24+stride//2+l,40+cy),P["pants_dark"])
    rect(d,(25-stride//2+l,30+cy,30-stride//2+l,40+cy),P["pants"])
    rect(d,(20+stride//2+l,39+cy,24+stride//2+l,44+cy),P["leather_dark"])
    rect(d,(25-stride//2+l,39+cy,31-stride//2+l,44+cy),P["leather_dark"])
    poly(d,((18+l,17+cy),(31+l,18+cy),(33+l,30+cy),(17+l,30+cy)),P["outline"])
    rect(d,(19+l,18+cy,31+l,29+cy),P["shirt"])
    rect(d,(20+l,18+cy,29+l,28+cy),P["vest"])
    rect(d,(20+l,25+cy,30+l,29+cy),P["vest_dark"])
    rect(d,(17+l,28+cy,32+l,30+cy),P["leather_dark"])
    if direction=="right":
        poly(d,((28+l,20+cy),(32+l,21+cy),(34+l+g,26+cy-g//2),(31+l+g,28+cy-g//2)),P["shirt_shadow"])
        rect(d,(33+l+g,25+cy-g//2,37+l+g,28+cy-g//2),P["skin"])
        rect(d,(16+l,28+cy,19+l,31+cy),P["leather"])
        poly(d,((17+l,30+cy),(20+l,30+cy),(16+l,41+cy),(13+l,40+cy)),P["leather_dark"]) # right hip, far side
    else:
        poly(d,((19+l,20+cy),(15+l,21+cy),(13+l-g,26+cy-g//2),(16+l-g,28+cy-g//2)),P["shirt_shadow"])
        rect(d,(11+l-g,25+cy-g//2,15+l-g,28+cy-g//2),P["skin"])
        rect(d,(29+l,28+cy,32+l,31+cy),P["leather"])
        poly(d,((30+l,30+cy),(33+l,30+cy),(36+l,42+cy),(33+l,42+cy)),P["leather_dark"]) # right hip, near side
    hx=24+l+m["head"]*face; trail=m["hair"]*(-face)
    rect(d,(hx-5+trail//2,11+cy,hx+1+trail,20+cy),P["hair_dark"])
    rect(d,(hx-7+trail,16+cy,hx-2+trail,23+cy),P["hair"])
    if direction=="right":
        rect(d,(hx-4,7+cy,hx+5,16+cy),P["skin"]); rect(d,(hx-3,6+cy,hx+3,9+cy),P["hair"])
        rect(d,(hx-5,7+cy,hx-2,15+cy),P["hair_dark"]); rect(d,(hx+3,10+cy,hx+4,11+cy),P["eye"])
        rect(d,(hx+5,14+cy,hx+6,15 if m["mouth"] else 14),P["outline"] if m["mouth"] else P["skin_shadow"])
    else:
        rect(d,(hx-5,7+cy,hx+4,16+cy),P["skin"]); rect(d,(hx-3,6+cy,hx+3,9+cy),P["hair"])
        rect(d,(hx+2,7+cy,hx+5,15+cy),P["hair_dark"]); rect(d,(hx-4,10+cy,hx-3,11+cy),P["eye"])
        rect(d,(hx-6,14+cy,hx-5,15 if m["mouth"] else 14),P["outline"] if m["mouth"] else P["skin_shadow"])
    rect(d,(hx-2,6+cy,hx,7+cy),P["hair_hi"])
    rect(d,(hx-4+trail//2,16+cy,hx-1+trail//2,18+cy),P["leather_dark"])
    return im

def frame(anim,i,direction):
    return side(anim,i,direction) if direction in ("left","right") else front_back(anim,i,direction)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--out",default="assets/characters/karen")
    args=ap.parse_args()
    out=Path(args.out); out.mkdir(parents=True,exist_ok=True)
    for anim,n in FRAMES.items():
        sheet=Image.new("RGBA",(CELL*n,CELL*len(DIRS)),(0,0,0,0))
        for row,direction in enumerate(DIRS):
            for i in range(n):
                sheet.alpha_composite(frame(anim,i,direction),(CELL*i,CELL*row))
        sheet.save(out/f"karen_{anim}.png",optimize=False)
        print(f"{anim}: {sheet.size[0]}x{sheet.size[1]}")

if __name__=="__main__":
    main()
