#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"/"four_protagonist_uplift"
CELL=48; MEDIUM=44
CHARS=("karen","triton","sophie","margaret")
LABELS={"karen":"Karen","triton":"Triton","sophie":"Sophie","margaret":"Margaret"}
ANIMS={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}

def font(size=16):
    try:return ImageFont.truetype("DejaVuSans.ttf",size)
    except Exception:return ImageFont.load_default()

def current_dir(c):
    if c=="margaret":
        return Image.open(ROOT/"prototype_artifacts/margaret_face_v5/margaret_chibi_direction_candidate_v5_48.png").convert("RGBA")
    im=Image.open(ROOT/f"assets/characters/{c}/{c}_idle.png").convert("RGBA")
    sh=Image.new("RGBA",(192,48),(0,0,0,0))
    for d in range(4): sh.alpha_composite(im.crop((0,d*48,48,(d+1)*48)),(d*48,0))
    return sh

def candidate_dir(c):
    return Image.open(OUT/c/f"{c}_direction_candidate_v1.png").convert("RGBA")

# Before/after four-direction board.
z=5;tile=48*z; left=110; top=54
board=Image.new("RGBA",(left+8*(tile+14),top+4*(tile+30)),(239,239,239,255));d=ImageDraw.Draw(board)
cols=[]
for state in ("Before","Candidate"):
    for direction in ("D","L","R","U"): cols.append(f"{state} {direction}")
for i,lab in enumerate(cols): d.text((left+i*(tile+14)+3,14),lab,fill=(20,20,20,255),font=font(13))
for ri,c in enumerate(CHARS):
    y=top+ri*(tile+30);d.text((8,y+tile//2-8),LABELS[c],fill=(20,20,20,255),font=font(16))
    for state_i,sh in enumerate((current_dir(c),candidate_dir(c))):
        for di in range(4):
            fr=sh.crop((di*48,0,(di+1)*48,48)).resize((tile,tile),Image.Resampling.NEAREST)
            col=state_i*4+di
            board.alpha_composite(fr,(left+col*(tile+14),y))
board.save(OUT/"uplift_before_after_four_direction.png",optimize=False)

# Cast Medium44 candidate board.
z=8;tile=MEDIUM*z;pad=28;label_h=34
cast=Image.new("RGBA",(pad+4*(tile+pad),pad+label_h+tile+pad),(236,236,236,255));cd=ImageDraw.Draw(cast)
for i,c in enumerate(CHARS):
    sh=candidate_dir(c);fr=sh.crop((0,0,48,48)).resize((MEDIUM,MEDIUM),Image.Resampling.NEAREST)
    x=pad+i*(tile+pad);cd.text((x,pad),LABELS[c],fill=(20,20,20,255),font=font(18))
    cast.alpha_composite(fr.resize((tile,tile),Image.Resampling.NEAREST),(x,pad+label_h))
cast.save(OUT/"uplift_cast_medium44.png",optimize=False)

# Candidate game-field board.
field=Image.new("RGBA",(640,320),(137,159,108,255));fd=ImageDraw.Draw(field)
for y in range(0,320,32):
    for x in range(0,640,32):
        if ((x//32)+(y//32))%2==0:fd.rectangle((x,y,x+31,y+31),fill=(145,166,115,255))
fd.rectangle((0,212,639,286),fill=(198,176,138,255));fd.rectangle((0,250,639,252),fill=(181,157,119,255))
for c,x in zip(CHARS,(100,245,390,535)):
    fr=candidate_dir(c).crop((0,0,48,48)).resize((MEDIUM,MEDIUM),Image.Resampling.NEAREST)
    field.alpha_composite(fr,(x-MEDIUM//2,212-MEDIUM))
    fd.rectangle((x-50,222,x+50,244),fill=(25,27,32,220))
    name=LABELS[c];bb=fd.textbbox((0,0),name,font=font(13));fd.text((x-(bb[2]-bb[0])//2,225),name,fill=(250,250,250,255),font=font(13))
field.save(OUT/"uplift_game_field_medium44.png",optimize=False)

# Runtime candidate contact sheets for Sophie and Margaret, the two characters with
# actual source/runtime changes in this pass.
for c in ("sophie","margaret"):
    maxframes=6;z=3;tile=48*z
    sh=Image.new("RGBA",(150+maxframes*(tile+10),38+8*(tile+30)),(240,240,240,255));sd=ImageDraw.Draw(sh)
    sd.text((12,10),LABELS[c]+" quality-uplift runtime candidate",fill=(20,20,20,255),font=font(18))
    for ri,(anim,count) in enumerate(ANIMS.items()):
        im=Image.open(OUT/c/f"{c}_{anim}.png").convert("RGBA");y=38+ri*(tile+30);sd.text((8,y+tile//2-8),anim,fill=(20,20,20,255),font=font(15))
        for fi in range(count):
            fr=im.crop((fi*48,0,(fi+1)*48,48)).resize((tile,tile),Image.Resampling.NEAREST)
            sh.alpha_composite(fr,(150+fi*(tile+10),y))
    sh.save(OUT/f"{c}_uplift_animation_contact.png",optimize=False)

print("FOUR PROTAGONIST UPLIFT EVIDENCE BUILT")
