#!/usr/bin/env python3
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts/four_protagonist_appeal_v1"
OUT.mkdir(parents=True,exist_ok=True)
CELL=48

def font(n=16):
    try:return ImageFont.truetype("DejaVuSans.ttf",n)
    except OSError:return ImageFont.load_default()

def first_idle(name):
    im=Image.open(ROOT/f"assets/characters/{name}/{name}_idle.png").convert("RGBA")
    return im.crop((0,0,48,48))

controls=[("Karen",first_idle("karen")),("Triton",first_idle("triton"))]
s=Image.open(ROOT/"docs/pixel/reference/sophie_chibi_direction_appeal_v3_48.png").convert("RGBA").crop((0,0,48,48))
m=Image.open(ROOT/"docs/pixel/reference/margaret_chibi_direction_appeal_v7_48.png").convert("RGBA").crop((0,0,48,48))
cells=controls+[("Sophie v3",s),("Margaret v7",m)]

# Exact Medium44, enlarged only after 44px rasterization.
z=9; tile=48*z
board=Image.new("RGBA",(4*tile,tile+42),(32,33,38,255))
d=ImageDraw.Draw(board)
for i,(label,c) in enumerate(cells):
    med=c.resize((44,44),Image.Resampling.NEAREST)
    stage=Image.new("RGBA",(48,48),(0,0,0,0));stage.alpha_composite(med,(2,2))
    board.alpha_composite(stage.resize((tile,tile),Image.Resampling.NEAREST),(i*tile,42))
    d.text((i*tile+10,12),label,fill=(255,255,255),font=font())
board.save(OUT/"four_protagonist_appeal_medium44.png")

# Direction sheets for the two revised characters.
for label,path in [
    ("sophie",ROOT/"docs/pixel/reference/sophie_chibi_direction_appeal_v3_48.png"),
    ("margaret",ROOT/"docs/pixel/reference/margaret_chibi_direction_appeal_v7_48.png"),
]:
    im=Image.open(path).convert("RGBA")
    im.resize((192*8,48*8),Image.Resampling.NEAREST).save(OUT/f"{label}_appeal_four_direction_x8.png")

print("FOUR PROTAGONIST APPEAL EVIDENCE BUILT")
