#!/usr/bin/env python3
"""Generate Karen 48px prototype sheets — Visual Redesign v3.

This pass translates the appeal of the provisional 32px Karen into the existing
48x48 source architecture without copying the old pixels.

Locked invariants:
- Karen B — VILLAGE RUNNER
- 23-year-old healthy adult impression
- red-brown hair, low partial tie, loose hair
- warm off-white long-sleeve base + short muted-red work vest
- left-handed
- LOCK: sword is always anatomical RIGHT hip
- exactly the existing 8 animation categories
- integer-grid native; source cell remains 48x48
"""
from PIL import Image, ImageDraw
from pathlib import Path
import argparse
CELL=48
DIRS=('down','left','right','up')
FRAMES={'idle':4,'walk':6,'turn':3,'talk':4,'surprise':4,'approach':4,'laugh':6,'run':6}
P={
'o':(60,39,35,255),'o2':(82,50,42,255),'skin':(211,160,121,255),'skin2':(185,130,99,255),'skinhi':(230,181,139,255),'cheek':(192,101,83,255),
'hair':(174,76,52,255),'hair2':(132,54,45,255),'hair3':(91,38,36,255),'hairhi':(224,122,76,255),
'shirt':(236,222,192,255),'shirt2':(200,182,153,255),'shirthi':(249,237,211,255),
'vest':(157,67,59,255),'vest2':(118,47,47,255),'vesthi':(184,82,66,255),
'pants':(92,83,74,255),'pants2':(63,58,55,255),'pantshi':(119,105,90,255),
'leather':(113,76,49,255),'leather2':(71,51,39,255),'leatherhi':(141,95,58,255),
'metal':(172,177,172,255),'metal2':(95,101,101,255),'eye':(51,38,34,255)
}

def q(v): return int(round(v))
def rect(d,b,c,outline=None): d.rectangle(tuple(q(x) for x in b),fill=c,outline=outline)
def poly(d,pts,c,outline=None):
    pts=[(q(x),q(y)) for x,y in pts]; d.polygon(pts,fill=c)
    if outline:d.line(pts+[pts[0]],fill=outline,width=1)
def pt(d,x,y,c): d.point((q(x),q(y)),fill=c)
def line(d,pts,c): d.line([(q(x),q(y)) for x,y in pts],fill=c,width=1)

def motion(a,i):
    m=dict(bob=0,lean=0,stride=0,arm=0,hair=0,dy=0,mouth=False,wide=False,open=False)
    if a=='idle':m['bob']=(0,0,1,0)[i];m['hair']=(0,1,0,-1)[i]
    elif a=='walk':m['bob']=(0,1,0,1,0,1)[i];m['stride']=(-2,-1,0,2,1,0)[i];m['arm']=-m['stride'];m['hair']=(1,1,0,-2,-1,0)[i]
    elif a=='run':m['bob']=(1,0,1,0,1,0)[i];m['stride']=(-4,-2,1,4,2,-1)[i];m['arm']=-m['stride'];m['lean']=1;m['hair']=(3,2,1,-3,-2,-1)[i]
    elif a=='turn':m['hair']=(1,0,-1)[i]
    elif a=='talk':m['arm']=(0,1,2,1)[i];m['mouth']=i in (1,2);m['hair']=(0,1,0,0)[i]
    elif a=='surprise':m['dy']=(0,-1,-2,-1)[i];m['arm']=(0,2,3,2)[i];m['wide']=i in (1,2);m['mouth']=i in (1,2,3);m['hair']=(0,1,2,1)[i]
    elif a=='approach':m['lean']=(0,1,1,1)[i];m['stride']=(0,1,2,1)[i];m['arm']=(0,1,2,1)[i];m['hair']=(0,-1,-2,-1)[i]
    elif a=='laugh':m['dy']=(0,0,1,2,1,0)[i];m['lean']=(0,0,1,1,1,0)[i];m['arm']=(0,1,2,3,2,0)[i];m['hair']=(0,1,2,2,1,0)[i];m['mouth']=i in (1,2,3,4);m['open']=i in (2,3)
    return m

def front(a,i,back=False):
    m=motion(a,i); im=Image.new('RGBA',(48,48),(0,0,0,0)); d=ImageDraw.Draw(im)
    cy=m['dy']-m['bob']; cx=24+m['lean']; s=m['stride']; arm=m['arm']; hm=m['hair']
    if not back:
        poly(d,[(19,10+cy),(21,7+cy),(24,6+cy),(27,7+cy),(30,10+cy),(30,16+cy),(28,20+cy),(26,21+cy),(24,19+cy),(22,21+cy),(19,20+cy),(18,16+cy)],P['hair2'],P['o'])
        rect(d,(18+hm,16+cy,20+hm,18+cy),P['leather2'])
        poly(d,[(19+hm,18+cy),(16+hm,19+cy),(14+hm,22+cy),(16+hm,23+cy),(19+hm,21+cy)],P['hair'],P['o2']);pt(d,16+hm,20+cy,P['hairhi'])
    else:
        poly(d,[(18,10+cy),(20,7+cy),(24,6+cy),(28,7+cy),(30,10+cy),(30,17+cy),(28,21+cy),(25,22+cy),(23,20+cy),(20,22+cy),(18,19+cy)],P['hair'],P['o'])
        rect(d,(27+hm,16+cy,29+hm,18+cy),P['leather2'])
        poly(d,[(28+hm,18+cy),(31+hm,19+cy),(33+hm,22+cy),(31+hm,23+cy),(28+hm,21+cy)],P['hair2'],P['o2']);pt(d,31+hm,20+cy,P['hairhi'])

    lx=cx-2+s//3; rx=cx+2-s//3
    poly(d,[(lx-2,30+cy),(lx+1,30+cy),(lx,39+cy),(lx-2,41+cy)],P['pants'],P['o2'])
    poly(d,[(rx-1,30+cy),(rx+2,30+cy),(rx+2,40+cy),(rx,41+cy)],P['pants2'],P['o2'])
    pt(d,lx,33+cy,P['pantshi']);pt(d,rx+1,34+cy,P['pants'])
    poly(d,[(lx-2,39+cy),(lx+1,39+cy),(lx+2,44+cy),(lx-3,44+cy)],P['leather'],P['o'])
    poly(d,[(rx,39+cy),(rx+3,39+cy),(rx+4,44+cy),(rx-1,44+cy)],P['leather2'],P['o'])
    pt(d,lx-1,40+cy,P['leatherhi']);pt(d,rx+1,40+cy,P['leather'])

    poly(d,[(20+cx-24,19+cy),(22+cx-24,18+cy),(26+cx-24,18+cy),(28+cx-24,19+cy),(29+cx-24,24+cy),(27+cx-24,29+cy),(21+cx-24,29+cy),(19+cx-24,24+cy)],P['shirt'],P['o2'])
    if not back:
        poly(d,[(20+cx-24,19+cy),(22+cx-24,19+cy),(22+cx-24,27+cy),(20+cx-24,26+cy)],P['vest'],P['o2'])
        poly(d,[(26+cx-24,19+cy),(28+cx-24,19+cy),(28+cx-24,26+cy),(26+cx-24,27+cy)],P['vest'],P['o2'])
        pt(d,21+cx-24,20+cy,P['vesthi']);pt(d,27+cx-24,25+cy,P['vest2']);pt(d,24+cx-24,20+cy,P['shirthi'])
    else:
        poly(d,[(20+cx-24,20+cy),(28+cx-24,20+cy),(27+cx-24,27+cy),(21+cx-24,27+cy)],P['vest'],P['o2']);line(d,[(22+cx-24,25+cy),(26+cx-24,25+cy)],P['vesthi'])
    line(d,[(21+cx-24,29+cy),(27+cx-24,29+cy)],P['leather2']);rect(d,(23+cx-24,28+cy,25+cx-24,30+cy),P['leatherhi'])

    if a in ('talk','surprise','approach','laugh'):
        poly(d,[(20+cx-24,20+cy),(18+cx-24,21+cy),(17+cx-24-arm*.4,26+cy-arm*.2),(19+cx-24-arm*.3,27+cy)],P['shirt2'],P['o2'])
        rect(d,(16+cx-24-arm*.4,26+cy-arm*.2,18+cx-24-arm*.4,28+cy-arm*.2),P['skin2'],P['o2'])
        poly(d,[(28+cx-24,20+cy),(30+cx-24,21+cy),(31+cx-24+arm,25+cy-arm*.3),(29+cx-24+arm,27+cy-arm*.2)],P['shirt'],P['o2'])
        rect(d,(30+cx-24+arm,25+cy-arm*.3,32+cx-24+arm,27+cy-arm*.3),P['skin'],P['o2'])
    else:
        poly(d,[(20+cx-24,20+cy),(18+cx-24,21+cy),(18+cx-24,28+cy),(20+cx-24,28+cy)],P['shirt2'],P['o2']);rect(d,(17+cx-24,27+cy,19+cx-24,30+cy),P['skin2'],P['o2'])
        poly(d,[(28+cx-24,20+cy),(30+cx-24,21+cy),(30+cx-24,28+cy),(28+cx-24,28+cy)],P['shirt'],P['o2']);rect(d,(29+cx-24,27+cy,31+cx-24,30+cy),P['skin'],P['o2'])

    rect(d,(28+cx-24,29+cy,31+cx-24,33+cy),P['leather'],P['o2']);pt(d,29+cx-24,30+cy,P['leatherhi'])
    sx=(19+cx-24) if not back else (29+cx-24); sign=-1 if not back else 1
    rect(d,(min(sx,sx+2*sign),29+cy,max(sx,sx+2*sign),31+cy),P['leatherhi'],P['o2'])
    poly(d,[(sx,31+cy),(sx+2*sign,31+cy),(sx+4*sign,41+cy),(sx+2*sign,42+cy)],P['leather2'],P['o2']);pt(d,sx+sign,31+cy,P['metal'])

    rect(d,(22+cx-24,16+cy,26+cx-24,19+cy),P['skin2'],P['o2'])
    if not back:
        poly(d,[(21+cx-24,10+cy),(22+cx-24,8+cy),(26+cx-24,8+cy),(28+cx-24,10+cy),(28+cx-24,13+cy),(27+cx-24,15+cy),(25+cx-24,17+cy),(23+cx-24,17+cy),(21+cx-24,15+cy),(20+cx-24,13+cy),(20+cx-24,11+cy)],P['skin'],P['o2'])
        poly(d,[(19+cx-24,10+cy),(20+cx-24,8+cy),(22+cx-24,6+cy),(25+cx-24,6+cy),(28+cx-24,7+cy),(30+cx-24,10+cy),(29+cx-24,12+cy),(27+cx-24,10+cy),(26+cx-24,13+cy),(24+cx-24,11+cy),(22+cx-24,13+cy),(20+cx-24,12+cy),(20+cx-24,15+cy)],P['hair'],P['o'])
        line(d,[(22+cx-24,7+cy),(25+cx-24,7+cy),(28+cx-24,9+cy)],P['hairhi'])
        pt(d,22+cx-24,12+cy,P['eye']);pt(d,26+cx-24,12+cy,P['eye'])
        if m['wide']:pt(d,22+cx-24,11+cy,P['eye']);pt(d,26+cx-24,11+cy,P['eye'])
        pt(d,21+cx-24,14+cy,P['cheek']);pt(d,27+cx-24,13+cy,P['cheek'])
        if m['mouth']:
            line(d,[(23+cx-24,15+cy),(25+cx-24,15+cy)],P['o2'])
            if m['open']:pt(d,24+cx-24,16+cy,P['skin2'])
        else:pt(d,24+cx-24,15+cy,P['o2'])
    else:
        poly(d,[(19+cx-24,10+cy),(20+cx-24,8+cy),(22+cx-24,6+cy),(25+cx-24,6+cy),(28+cx-24,7+cy),(30+cx-24,10+cy),(29+cx-24,17+cy),(27+cx-24,20+cy),(24+cx-24,19+cy),(21+cx-24,20+cy),(19+cx-24,17+cy)],P['hair'],P['o']);line(d,[(22+cx-24,7+cy),(25+cx-24,7+cy),(28+cx-24,9+cy)],P['hairhi'])
    return im

def side(a,i,right=True):
    m=motion(a,i); im=Image.new('RGBA',(48,48),(0,0,0,0));d=ImageDraw.Draw(im)
    face=1 if right else -1;cy=m['dy']-m['bob'];cx=24+m['lean']*face;s=m['stride'];arm=m['arm'];hm=m['hair']
    poly(d,[(cx-2*face,7+cy),(cx-5*face,8+cy),(cx-7*face,11+cy),(cx-7*face,17+cy),(cx-5*face,21+cy),(cx-2*face,22+cy),(cx-1*face,18+cy)],P['hair2'],P['o'])
    tx=cx-6*face+hm*face;rect(d,(min(tx,tx+2*face),16+cy,max(tx,tx+2*face),18+cy),P['leather2']);poly(d,[(tx,18+cy),(tx-3*face,19+cy),(tx-5*face,22+cy),(tx-3*face,23+cy),(tx,21+cy)],P['hair'],P['o2']);pt(d,tx-3*face,20+cy,P['hairhi'])

    rear=cx-2*face+int(s*.25)*face;frontx=cx+2*face-int(s*.25)*face
    poly(d,[(rear-1,30+cy),(rear+1,30+cy),(rear,40+cy),(rear-2,41+cy)],P['pants2'],P['o2']);poly(d,[(frontx-1,30+cy),(frontx+2,30+cy),(frontx+2*face,40+cy),(frontx,41+cy)],P['pants'],P['o2'])
    poly(d,[(rear-2,39+cy),(rear+1,39+cy),(rear+2*face,44+cy),(rear-3*face,44+cy)],P['leather2'],P['o']);poly(d,[(frontx,39+cy),(frontx+3*face,39+cy),(frontx+4*face,44+cy),(frontx-1*face,44+cy)],P['leather'],P['o'])

    poly(d,[(cx-4,19+cy),(cx+3,18+cy),(cx+5*face,22+cy),(cx+3*face,29+cy),(cx-3*face,29+cy),(cx-5*face,23+cy)],P['shirt'],P['o2'])
    poly(d,[(cx-3,19+cy),(cx+2,19+cy),(cx+4*face,22+cy),(cx+3*face,27+cy),(cx-2*face,28+cy)],P['vest'],P['o2']);pt(d,cx+1*face,20+cy,P['vesthi'])
    line(d,[(cx-3,29+cy),(cx+3,29+cy)],P['leather2'])

    bx=cx-3*face;fx=cx+4*face
    poly(d,[(bx,20+cy),(bx-2*face,21+cy),(bx-2*face,28+cy),(bx,28+cy)],P['shirt2'],P['o2']);rect(d,(min(bx-2*face,bx),27+cy,max(bx-2*face,bx),30+cy),P['skin2'],P['o2'])
    if a in ('talk','surprise','approach','laugh'):
        ex=fx+(2+arm)*face;ey=22+cy-int(arm*.3);poly(d,[(fx,20+cy),(fx+2*face,21+cy),(ex,ey),(ex-face,ey+2)],P['shirt'],P['o2']);rect(d,(min(ex,ex+2*face),ey-1,max(ex,ex+2*face),ey+1),P['skin'],P['o2'])
    else:
        ex=fx+2*face-int(s*.2)*face;poly(d,[(fx,20+cy),(fx+2*face,21+cy),(ex,28+cy),(ex-face,29+cy)],P['shirt'],P['o2']);rect(d,(min(ex-face,ex+face),28+cy,max(ex-face,ex+face),30+cy),P['skin'],P['o2'])

    px0=cx+5*face;rect(d,(min(px0,px0+3*face),29+cy,max(px0,px0+3*face),33+cy),P['leather'],P['o2']);pt(d,px0+face,30+cy,P['leatherhi'])
    ss=-face;sx=cx+5*ss;rect(d,(min(sx,sx+2*ss),29+cy,max(sx,sx+2*ss),31+cy),P['leatherhi'],P['o2']);poly(d,[(sx,31+cy),(sx+2*ss,31+cy),(sx-1*ss,41+cy),(sx-3*ss,42+cy)],P['leather2'],P['o2']);pt(d,sx+ss,31+cy,P['metal'])

    rect(d,(cx-1,16+cy,cx+2,19+cy),P['skin2'],P['o2']);hx=cx
    if right:
        poly(d,[(hx-2,9+cy),(hx,8+cy),(hx+3,9+cy),(hx+4,11+cy),(hx+4,14+cy),(hx+2,17+cy),(hx-1,17+cy),(hx-3,14+cy),(hx-3,11+cy)],P['skin'],P['o2']);poly(d,[(hx-4,10+cy),(hx-3,7+cy),(hx,6+cy),(hx+3,7+cy),(hx+5,9+cy),(hx+4,11+cy),(hx+2,10+cy),(hx+1,12+cy),(hx-1,10+cy),(hx-3,13+cy)],P['hair'],P['o']);line(d,[(hx-2,7+cy),(hx+1,7+cy),(hx+3,8+cy)],P['hairhi']);pt(d,hx+2,11+cy,P['eye']);pt(d,hx+3,14+cy,P['cheek']);pt(d,hx+3,15+cy,P['o2'])
    else:
        poly(d,[(hx+2,9+cy),(hx,8+cy),(hx-3,9+cy),(hx-4,11+cy),(hx-4,14+cy),(hx-2,17+cy),(hx+1,17+cy),(hx+3,14+cy),(hx+3,11+cy)],P['skin'],P['o2']);poly(d,[(hx+4,10+cy),(hx+3,7+cy),(hx,6+cy),(hx-3,7+cy),(hx-5,9+cy),(hx-4,11+cy),(hx-2,10+cy),(hx-1,12+cy),(hx+1,10+cy),(hx+3,13+cy)],P['hair'],P['o']);line(d,[(hx+2,7+cy),(hx-1,7+cy),(hx-3,8+cy)],P['hairhi']);pt(d,hx-2,11+cy,P['eye']);pt(d,hx-3,14+cy,P['cheek']);pt(d,hx-3,15+cy,P['o2'])
    return im

def frame(a,i,dir):
    if dir=='down':return front(a,i,False)
    if dir=='up':return front(a,i,True)
    return side(a,i,dir=='right')

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--out',default='assets/characters/karen');args=ap.parse_args();out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
    for a,n in FRAMES.items():
        sh=Image.new('RGBA',(48*n,192),(0,0,0,0))
        for row,dr in enumerate(DIRS):
            for i in range(n):sh.alpha_composite(frame(a,i,dr),(48*i,48*row))
        sh.save(out/f'karen_{a}.png');print(a,sh.size)
if __name__=='__main__':main()
