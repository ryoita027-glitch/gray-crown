#!/usr/bin/env python3
"""Reversible Margaret V22 walk motion experiment; never edits production."""
from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'assets/character_trials/margaret_idle_adult_mage_v22_structural_trial.png'
OUT=ROOT/'assets/character_trials/margaret_walk_adult_mage_v22_motion_trial.png'
EVIDENCE=ROOT/'docs/art/evidence/margaret_v22_idle_walk_native44_contact.png'
STEPS=[(0,0,0,0),(-2,1,-1,-1),(-1,0,0,0),(2,-1,1,1),(1,0,0,0),(0,-1,-1,-1)]
FOOT_SPLITS=[26,27,26,26]
src=Image.open(SOURCE).convert('RGBA')
assert src.size==(192,192)
out=Image.new('RGBA',(288,192))
for d in range(4):
    base=src.crop((0,48*d,48,48*(d+1)))
    for f,(left_dx,right_dx,hem_dx,upper_dx) in enumerate(STEPS):
        dst=base.copy()
        if f:
            if upper_dx:
                for y in range(4,38):
                    for x in range(8,44): dst.putpixel((x,y),(0,0,0,0))
                    for x in range(8,44):
                        rgba=base.getpixel((x,y))
                        if rgba[3] and 0<=x+upper_dx<48:dst.putpixel((x+upper_dx,y),rgba)
            for y in range(38,43):
                shift=upper_dx if y<40 else hem_dx
                if not shift:continue
                for x in range(10,42):dst.putpixel((x,y),(0,0,0,0))
                for x in range(10,42):
                    rgba=base.getpixel((x,y))
                    if rgba[3] and 0<=x+shift<48:dst.putpixel((x+shift,y),rgba)
            for y in (43,44):
                for x in range(10,42):dst.putpixel((x,y),(0,0,0,0))
                for x in range(10,42):
                    p=base.getpixel((x,y))
                    if not p[3]:continue
                    nx=x+(left_dx if x<FOOT_SPLITS[d] else right_dx)
                    if 0<=nx<48:dst.putpixel((nx,y),p)
        out.paste(dst,(48*f,48*d))
OUT.parent.mkdir(parents=True,exist_ok=True)
out.quantize(colors=32,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).save(OUT,optimize=True)
assert out.crop((0,0,48,48)).tobytes()==src.crop((0,0,48,48)).tobytes()
for d in range(4):
    frames=[]
    for f in range(6):
        im=out.crop((48*f,48*d,48*(f+1),48*(d+1)))
        assert im.getchannel('A').getbbox()[3]==45
        frames.append(im.tobytes())
    assert len(set(frames))>=4
board=Image.new('RGBA',(800,496),(29,37,36,255))
draw=ImageDraw.Draw(board)
for d,label in enumerate(('FRONT','LEFT','RIGHT','BACK')):
    draw.text((10,18+116*d),label,fill=(235,236,227))
    cells=[src.crop((0,d*48,48,(d+1)*48))]
    cells += [out.crop((f*48,d*48,(f+1)*48,(d+1)*48)) for f in range(6)]
    for i,cell in enumerate(cells):
        x=85+i*98;y=12+d*116
        draw.rectangle((x,y+18,x+69,y+91),fill=(56,70,61,255))
        draw.line((x,y+81,x+69,y+81),fill=(122,143,113))
        board.alpha_composite(cell.resize((44,44),Image.Resampling.NEAREST),(x+13,y+37))
        draw.text((x+6,y+1),'IDLE' if i==0 else f'WALK {i-1}',fill=(236,228,215))
EVIDENCE.parent.mkdir(parents=True,exist_ok=True)
board.convert('RGB').save(EVIDENCE,optimize=True)
print('sprite',OUT,'bytes',OUT.stat().st_size)
print('evidence',EVIDENCE,'bytes',EVIDENCE.stat().st_size)
