#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

CELL=48
OUT=Path("prototype_artifacts/margaret_face_v5")
CANDIDATE=OUT/"margaret_chibi_direction_candidate_v5_48.png"
OUT.mkdir(parents=True,exist_ok=True)

def first_down(path):
    with Image.open(path) as im:
        return im.convert("RGBA").crop((0,0,CELL,CELL))

def font(size=18):
    try:
        return ImageFont.truetype("DejaVuSans.ttf",size)
    except Exception:
        return ImageFont.load_default()

margaret=Image.open(CANDIDATE).convert("RGBA")

zoom=8
board=Image.new("RGBA",(CELL*4*zoom,CELL*zoom+36),(238,238,238,255))
d=ImageDraw.Draw(board)
for i,name in enumerate(("Down","Left","Right","Up")):
    cell=margaret.crop((CELL*i,0,CELL*(i+1),CELL))
    board.alpha_composite(cell.resize((CELL*zoom,CELL*zoom),Image.Resampling.NEAREST),(i*CELL*zoom,36))
    d.text((i*CELL*zoom+8,8),name,fill=(20,20,20,255),font=font())
board.save(OUT/"margaret_v5_four_direction_x8.png",optimize=False)

controls=[
    ("Karen",first_down("assets/characters/karen/karen_idle.png")),
    ("Triton",first_down("assets/characters/triton/triton_idle.png")),
    ("Sophie",first_down("assets/characters/sophie/sophie_idle.png")),
    ("Margaret v5",margaret.crop((0,0,CELL,CELL))),
]
scale=44
z=7
pad=24
label_h=28
tile=scale*z
cmp=Image.new("RGBA",(pad+4*(tile+pad),pad+label_h+tile+pad),(240,240,240,255))
dr=ImageDraw.Draw(cmp)
for i,(name,cell) in enumerate(controls):
    x=pad+i*(tile+pad)
    dr.text((x,pad),name,fill=(20,20,20,255),font=font(16))
    med=cell.resize((scale,scale),Image.Resampling.NEAREST)
    cmp.alpha_composite(med.resize((tile,tile),Image.Resampling.NEAREST),(x,pad+label_h))
cmp.save(OUT/"karen_triton_sophie_margaret_v5_medium44.png",optimize=False)

print("Margaret v5 exact-pixel face evidence built")
