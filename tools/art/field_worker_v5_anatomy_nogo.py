#!/usr/bin/env python3
"""Field-worker four-direction anatomy experiment (ART NO-GO; never switches live art).
Run: python tools/art/field_worker_v5_anatomy_nogo.py [output-dir]
Requires Pillow. The input is verified against the original V2 Git blob.
"""
from pathlib import Path
import hashlib
import sys
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/npc/field_worker_style_study_v2_48x192.png'
OUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / 'prototype_artifacts/field_worker_v5_anatomy_nogo'
EXPECTED = 'a39fd00215fb227c4031d3fbf53f2ebe182ca2c9'
data = SOURCE.read_bytes()
blob = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
if blob != EXPECTED:
    raise SystemExit(f'V2 source changed ({blob}); inspect before rebuilding')
source = Image.open(SOURCE).convert('RGBA')
assert source.size == (48, 192)
art = source.copy()
draw = ImageDraw.Draw(art)
INK=(60,52,54,255); SKIN=(213,170,139,255); LIGHT=(228,185,154,255)
LINEN=(214,194,165,255); SHADE=(174,153,129,255)
VEST=(104,117,100,255); VEST_SHADE=(73,88,76,255); BELT=(135,99,76,255)

def polygon(points, color, direction):
    draw.polygon([(x,y+48*direction) for x,y in points], fill=color)
def stroke(points, color, direction):
    draw.line([(x,y+48*direction) for x,y in points], fill=color, width=1)

for direction in (0,3):
    offset=direction*48
    # Keep the tool shaft and original face; erase the old hanging hand.
    for y in range(35,42):
        for x in range(36,40):
            art.putpixel((x,offset+y),(0,0,0,0))
    polygon([(35,27),(37,27),(39,29),(39,32),(37,34),(34,32),(34,30)],INK,direction)
    polygon([(35,28),(37,28),(38,30),(38,32),(36,33),(35,31)],SHADE,direction)
    stroke([(35,28),(37,29),(37,31)],LINEN,direction)
    polygon([(37,30),(39,29),(40,30),(40,32),(38,33),(37,32)],INK,direction)
    polygon([(38,30),(40,30),(40,31),(39,32),(38,31)],SKIN,direction)
    art.putpixel((39,offset+30),LIGHT)
    if direction==3:
        art.putpixel((37,offset+30),VEST_SHADE)

for direction in (1,2):
    offset=direction*48
    flip=lambda x:x if direction==1 else 47-x
    for y in range(31,36):
        for x in range(25,30):
            xx=flip(x)
            if source.getpixel((xx,offset+y)) in ((213,170,139,255),(228,185,154,255),(172,121,102,255)):
                art.putpixel((xx,offset+y), VEST if y<=32 else BELT if y>=34 else VEST_SHADE)
    p=lambda coords:[(flip(x),y) for x,y in coords]
    polygon(p([(28,25),(31,26),(34,29),(34,32),(32,34),(29,32),(28,29)]),INK,direction)
    polygon(p([(29,26),(31,27),(33,29),(33,32),(31,32),(30,30)]),SHADE,direction)
    stroke(p([(29,27),(31,29),(32,31)]),LINEN,direction)
    polygon(p([(32,31),(35,28),(38,28),(40,29),(40,32),(37,33),(34,33)]),INK,direction)
    polygon(p([(35,30),(37,29),(39,29),(39,31),(37,32),(35,32)]),SKIN,direction)
    art.putpixel((flip(37),offset+29),LIGHT)

changes=[]
for direction in range(4):
    count=0
    for y in range(48):
        for x in range(48):
            before=source.getpixel((x,48*direction+y))
            after=art.getpixel((x,48*direction+y))
            if y<23 or y>=42:
                assert before==after, (direction,x,y,'protected head or footline')
            count+=before!=after
    assert count>0
    changes.append(count)
OUT.mkdir(parents=True,exist_ok=True)
art.save(OUT/'field_worker_v5_anatomy_NO_GO_48x192.png',optimize=True)
board=Image.new('RGB',(88,176),(94,94,94))
for direction in range(4):
    for column,im in enumerate((source,art)):
        frame=im.crop((0,48*direction,48,48*(direction+1))).resize((44,44),Image.Resampling.NEAREST)
        board.paste(frame,(column*44,direction*44),frame)
board.save(OUT/'field_worker_v2_v5_anatomy_native44_AB.png',optimize=True)
print('ART NO-GO; changed RGBA pixels by direction (down/left/right/up):',changes)
print('Saved 48px study and native 44px A/B:',OUT)
