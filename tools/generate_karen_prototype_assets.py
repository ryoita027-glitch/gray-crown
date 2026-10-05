#!/usr/bin/env python3
"""Generate Karen 48px prototype sheets — Visual Anchor redesign.

Phase 3 redirection goal: translate the charm logic of the legacy 32px Karen
into the existing 48x48 source-cell acting architecture.

LOCKED INVARIANTS:
- Karen remains a 23-year-old adult woman.
- low partial hair tie + loose red-brown hair
- warm off-white shirt + short muted-red work vest
- left-handed identity
- sword is always anatomical RIGHT hip
- exactly eight prototype animation categories
- deterministic integer-grid pixel construction
"""
from PIL import Image, ImageDraw
from pathlib import Path
import argparse

CELL=48
DIRS=("down","left","right","up")
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
P={
 'outline':(72,43,39,255),
 'outline2':(91,52,45,255),
 'skin':(216,165,126,255),
 'skin_hi':(232,185,144,255),
 'skin_shadow':(190,136,105,255),
 'hair':(168,74,52,255),
 'hair_dark':(119,48,42,255),
 'hair_hi':(207,101,67,255),
 'shirt':(235,220,184,255),
 'shirt_shadow':(205,188,153,255),
 'vest':(177,74,72,255),
 'vest_dark':(135,54,57,255),
 'pants':(119,104,86,255),
 'pants_light':(139,120,96,255),
 'boots':(86,62,46,255),
 'boots_hi':(116,82,57,255),
 'belt':(111,74,48,255),
 'metal':(190,193,184,255),
 'eye':(67,45,40,255),
 'cheek':(196,111,91,255),
}

def rect(d,x0,y0,x1,y1,c): d.rectangle((int(x0),int(y0),int(x1),int(y1)),fill=c)
def px(d,x,y,c): d.point((int(x),int(y)),fill=c)
def poly(d,pts,c): d.polygon([(int(x),int(y)) for x,y in pts],fill=c)

def motion(anim,i):
    m={'bob':0,'lean':0,'stride':0,'arm':0,'hair':0,'lift':0,'mouth':False,'wide':False}
    if anim=='idle':
        m['bob']=(0,0,1,0)[i]; m['hair']=(0,1,0,-1)[i]
    elif anim=='walk':
        m['bob']=(0,1,0,1,0,1)[i]; m['stride']=(-2,-1,0,2,1,0)[i]; m['arm']=-m['stride']; m['hair']=(1,1,0,-1,-1,0)[i]
    elif anim=='run':
        m['bob']=(0,1,0,1,0,1)[i]; m['stride']=(-3,-2,1,3,2,-1)[i]; m['arm']=-m['stride']; m['lean']=1; m['hair']=(2,2,1,-2,-2,-1)[i]
    elif anim=='turn':
        m['hair']=(1,0,-1)[i]
    elif anim=='talk':
        m['arm']=(0,2,3,1)[i]; m['mouth']=i in (1,2)
    elif anim=='surprise':
        m['lift']=(0,1,2,1)[i]; m['arm']=(0,2,3,2)[i]; m['wide']=i in (1,2); m['mouth']=i in (1,2,3)
    elif anim=='approach':
        m['lean']=(0,1,1,1)[i]; m['stride']=(0,1,2,1)[i]; m['arm']=(0,1,2,1)[i]; m['hair']=(0,-1,-1,0)[i]
    elif anim=='laugh':
        m['lift']=(0,0,1,1,1,0)[i]; m['lean']=(0,0,1,1,1,0)[i]; m['arm']=(0,1,2,3,2,0)[i]; m['hair']=(0,1,1,2,1,0)[i]; m['mouth']=i in (1,2,3,4)
    return m

def draw_down(anim,i):
    m=motion(anim,i); im=Image.new('RGBA',(CELL,CELL),(0,0,0,0)); d=ImageDraw.Draw(im)
    cy=-m['bob']-m['lift']; stride=m['stride']; arm=m['arm']; hair=m['hair']
    poly(d,[(18,9+cy),(20,6+cy),(28,6+cy),(30,9+cy),(31,15+cy),(29,20+cy),(27,22+cy),(21,22+cy),(18,19+cy),(17,14+cy)],P['hair_dark'])
    rect(d,28+hair,16+cy,30+hair,18+cy,P['belt'])
    poly(d,[(29+hair,18+cy),(32+hair,19+cy),(31+hair,25+cy),(28+hair,24+cy)],P['hair'])
    px(d,31+hair,20+cy,P['hair_hi'])
    lx=21+stride//2; rx=27-stride//2
    poly(d,[(lx-2,30+cy),(lx+1,30+cy),(lx+1,38+cy),(lx-2,38+cy)],P['pants'])
    poly(d,[(rx-1,30+cy),(rx+2,30+cy),(rx+2,38+cy),(rx-1,38+cy)],P['pants_light'])
    rect(d,lx-2,38+cy,lx+1,43+cy,P['boots']); rect(d,rx-1,38+cy,rx+2,43+cy,P['boots'])
    px(d,lx+1,39+cy,P['boots_hi']); px(d,rx+2,39+cy,P['boots_hi'])
    poly(d,[(19,20+cy),(29,20+cy),(30,28+cy),(28,31+cy),(20,31+cy),(18,28+cy)],P['shirt'])
    poly(d,[(20,20+cy),(28,20+cy),(28,26+cy),(27,28+cy),(21,28+cy),(20,26+cy)],P['vest'])
    rect(d,23,21+cy,24,26+cy,P['vest_dark'])
    rect(d,20,29+cy,28,30+cy,P['belt']); px(d,24,29+cy,P['metal'])
    rect(d,28,29+cy,31,33+cy,P['belt']); px(d,29,30+cy,P['boots_hi'])
    rect(d,16,28+cy,19,31+cy,P['belt'])
    poly(d,[(17,31+cy),(19,31+cy),(16,41+cy),(14,41+cy)],P['boots']); px(d,17,31+cy,P['metal'])
    if anim in ('talk','surprise','approach','laugh'):
        poly(d,[(19,21+cy),(17,22+cy),(16,29+cy),(18,30+cy),(20,25+cy)],P['shirt_shadow'])
        rect(d,16,28+cy,18,31+cy,P['skin_shadow'])
        ex=30+arm; ey=24+cy-arm//2
        poly(d,[(29,21+cy),(31,22+cy),(ex,ey),(ex-1,ey+3),(28,25+cy)],P['shirt'])
        rect(d,ex-1,ey+2,ex+1,ey+4,P['skin'])
    else:
        poly(d,[(19,21+cy),(17,22+cy),(17,29+cy),(19,30+cy),(20,24+cy)],P['shirt_shadow']); rect(d,17,29+cy,19,31+cy,P['skin_shadow'])
        poly(d,[(29,21+cy),(31,22+cy),(31,29+cy),(29,30+cy),(28,24+cy)],P['shirt']); rect(d,29,29+cy,31,31+cy,P['skin'])
    rect(d,22,18+cy,26,21+cy,P['skin_shadow'])
    poly(d,[(20,9+cy),(22,8+cy),(27,8+cy),(29,10+cy),(29,15+cy),(27,18+cy),(22,18+cy),(20,16+cy),(19,12+cy)],P['skin'])
    poly(d,[(19,10+cy),(20,7+cy),(23,6+cy),(28,7+cy),(30,9+cy),(29,12+cy),(27,11+cy),(26,13+cy),(23,11+cy),(22,13+cy),(20,12+cy)],P['hair'])
    rect(d,22,7+cy,26,8+cy,P['hair_hi'])
    px(d,22,13+cy,P['eye']); px(d,27,13+cy,P['eye'])
    if m['wide']: px(d,22,12+cy,P['eye']); px(d,27,12+cy,P['eye'])
    px(d,21,15+cy,P['cheek']); px(d,28,15+cy,P['cheek'])
    if m['mouth']: rect(d,23,16+cy,26,16+cy,P['outline'])
    else: px(d,25,16+cy,P['outline2'])
    return im

def draw_up(anim,i):
    m=motion(anim,i); im=Image.new('RGBA',(CELL,CELL),(0,0,0,0)); d=ImageDraw.Draw(im)
    cy=-m['bob']-m['lift']; stride=m['stride']; hair=m['hair']
    lx=21+stride//2; rx=27-stride//2
    poly(d,[(lx-2,30+cy),(lx+1,30+cy),(lx+1,38+cy),(lx-2,38+cy)],P['pants']); poly(d,[(rx-1,30+cy),(rx+2,30+cy),(rx+2,38+cy),(rx-1,38+cy)],P['pants_light'])
    rect(d,lx-2,38+cy,lx+1,43+cy,P['boots']); rect(d,rx-1,38+cy,rx+2,43+cy,P['boots'])
    poly(d,[(19,20+cy),(29,20+cy),(30,29+cy),(28,31+cy),(20,31+cy),(18,29+cy)],P['shirt_shadow'])
    poly(d,[(20,20+cy),(28,20+cy),(28,27+cy),(27,28+cy),(21,28+cy),(20,27+cy)],P['vest_dark'])
    rect(d,20,29+cy,28,30+cy,P['belt']); px(d,24,29+cy,P['metal'])
    rect(d,29,28+cy,32,31+cy,P['belt']); poly(d,[(30,31+cy),(32,31+cy),(35,41+cy),(33,42+cy)],P['boots']); px(d,31,31+cy,P['metal'])
    poly(d,[(19,21+cy),(17,22+cy),(17,29+cy),(19,30+cy)],P['shirt_shadow']); poly(d,[(29,21+cy),(31,22+cy),(31,29+cy),(29,30+cy)],P['shirt'])
    poly(d,[(19,9+cy),(20,7+cy),(23,6+cy),(28,7+cy),(30,9+cy),(31,15+cy),(30,20+cy),(28,23+cy),(21,23+cy),(18,20+cy),(18,14+cy)],P['hair'])
    rect(d,23+hair,18+cy,26+hair,20+cy,P['belt'])
    poly(d,[(24+hair,20+cy),(28+hair,21+cy),(28+hair,26+cy),(24+hair,25+cy)],P['hair_dark'])
    rect(d,22,7+cy,26,8+cy,P['hair_hi'])
    return im

def draw_side(anim,i,direction):
    m=motion(anim,i); im=Image.new('RGBA',(CELL,CELL),(0,0,0,0)); d=ImageDraw.Draw(im)
    face=1 if direction=='right' else -1
    cy=-m['bob']-m['lift']; lean=m['lean']*face; stride=m['stride']; arm=m['arm']; hair=m['hair']
    cx=24+lean
    backx=cx-3*face+stride//3*face; frontx=cx+3*face-stride//3*face
    poly(d,[(backx-2,30+cy),(backx+1,30+cy),(backx+1,38+cy),(backx-2,38+cy)],P['pants'])
    poly(d,[(frontx-1,30+cy),(frontx+2,30+cy),(frontx+2,38+cy),(frontx-1,38+cy)],P['pants_light'])
    rect(d,backx-2,38+cy,backx+1,43+cy,P['boots']); rect(d,frontx-1,38+cy,frontx+2,43+cy,P['boots'])
    poly(d,[(cx-5,20+cy),(cx+5,20+cy),(cx+5+face,28+cy),(cx+3,31+cy),(cx-4,31+cy),(cx-5-face,28+cy)],P['shirt'])
    poly(d,[(cx-4,20+cy),(cx+4,20+cy),(cx+4+face,26+cy),(cx+2,28+cy),(cx-3,28+cy),(cx-4-face,26+cy)],P['vest'])
    rect(d,cx-5,29+cy,cx+5,30+cy,P['belt'])
    rear=cx-5*face; front=cx+5*face
    poly(d,[(rear,21+cy),(rear-2*face,22+cy),(rear-2*face,29+cy),(rear,30+cy)],P['shirt_shadow'])
    if anim in ('talk','surprise','approach','laugh'):
        ex=front+(2+arm)*face; ey=23+cy-arm//2
        poly(d,[(front,21+cy),(front+2*face,22+cy),(ex,ey),(ex-face,ey+3)],P['shirt'])
        rect(d,min(ex-face,ex+face),ey+2,max(ex-face,ex+face),ey+4,P['skin'])
    else:
        poly(d,[(front,21+cy),(front+2*face,22+cy),(front+2*face,29+cy),(front,30+cy)],P['shirt'])
        rect(d,min(front+face,front+2*face),29+cy,max(front+face,front+2*face),31+cy,P['skin'])
    sword_side=-face; hip=cx+6*sword_side
    rect(d,min(hip,hip+2*sword_side),28+cy,max(hip,hip+2*sword_side),31+cy,P['belt'])
    poly(d,[(hip,31+cy),(hip+2*sword_side,31+cy),(hip-1*sword_side,41+cy),(hip-3*sword_side,41+cy)],P['boots']); px(d,hip+sword_side,31+cy,P['metal'])
    rect(d,cx-2,18+cy,cx+2,21+cy,P['skin_shadow'])
    poly(d,[(cx-4*face,9+cy),(cx-5*face,7+cy),(cx+1*face,6+cy),(cx+4*face,8+cy),(cx+5*face,13+cy),(cx+3*face,19+cy),(cx-2*face,22+cy),(cx-5*face,19+cy)],P['hair_dark'])
    tiex=cx-5*face+hair
    rect(d,min(tiex,tiex+2*face),17+cy,max(tiex,tiex+2*face),19+cy,P['belt'])
    poly(d,[(tiex,19+cy),(tiex-3*face,20+cy),(tiex-3*face,25+cy),(tiex-1*face,24+cy)],P['hair'])
    hx=cx
    if face==1:
        poly(d,[(hx-3,9+cy),(hx+2,8+cy),(hx+4,10+cy),(hx+4,15+cy),(hx+3,17+cy),(hx-2,18+cy),(hx-3,16+cy)],P['skin'])
        poly(d,[(hx-4,10+cy),(hx-3,7+cy),(hx+2,6+cy),(hx+4,8+cy),(hx+3,11+cy),(hx+1,10+cy),(hx,12+cy),(hx-2,11+cy),(hx-3,15+cy)],P['hair'])
        rect(d,hx-2,7+cy,hx+1,8+cy,P['hair_hi'])
        px(d,hx+2,12+cy,P['eye']); px(d,hx+4,14+cy,P['skin_shadow'])
        if m['mouth']: px(d,hx+4,16+cy,P['outline'])
    else:
        poly(d,[(hx+3,9+cy),(hx-2,8+cy),(hx-4,10+cy),(hx-4,15+cy),(hx-3,17+cy),(hx+2,18+cy),(hx+3,16+cy)],P['skin'])
        poly(d,[(hx+4,10+cy),(hx+3,7+cy),(hx-2,6+cy),(hx-4,8+cy),(hx-3,11+cy),(hx-1,10+cy),(hx,12+cy),(hx+2,11+cy),(hx+3,15+cy)],P['hair'])
        rect(d,hx-1,7+cy,hx+2,8+cy,P['hair_hi'])
        px(d,hx-2,12+cy,P['eye']); px(d,hx-4,14+cy,P['skin_shadow'])
        if m['mouth']: px(d,hx-4,16+cy,P['outline'])
    return im

def frame(anim,i,direction):
    if direction=='down': return draw_down(anim,i)
    if direction=='up': return draw_up(anim,i)
    return draw_side(anim,i,direction)

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--out',default='assets/characters/karen'); args=ap.parse_args()
    out=Path(args.out); out.mkdir(parents=True,exist_ok=True)
    for anim,n in FRAMES.items():
        sheet=Image.new('RGBA',(CELL*n,CELL*4),(0,0,0,0))
        for row,direction in enumerate(DIRS):
            for i in range(n): sheet.alpha_composite(frame(anim,i,direction),(CELL*i,CELL*row))
        sheet.save(out/f'karen_{anim}.png',optimize=False)
        print(anim,sheet.size)

if __name__=='__main__': main()
