#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

CELL=48
OUT=Path("prototype_artifacts/margaret_direction_v2")
OUT.mkdir(parents=True, exist_ok=True)

def first_down(path):
    with Image.open(path) as im:
        return im.convert("RGBA").crop((0,0,CELL,CELL))

def font(size=18):
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except Exception:
        return ImageFont.load_default()

def main():
    with Image.open("docs/pixel/reference/margaret_chibi_direction_lock_v2_48.png") as im:
        margaret=im.convert("RGBA")

    # 4-direction exact-pixel board.
    zoom=8
    board=Image.new("RGBA",(CELL*4*zoom, CELL*zoom+36),(238,238,238,255))
    d=ImageDraw.Draw(board)
    for i,name in enumerate(("Down","Left","Right","Up")):
        cell=margaret.crop((CELL*i,0,CELL*(i+1),CELL))
        big=cell.resize((CELL*zoom,CELL*zoom),Image.Resampling.NEAREST)
        board.alpha_composite(big,(i*CELL*zoom,36))
        d.text((i*CELL*zoom+8,8),name,fill=(20,20,20,255),font=font())
    board.save(OUT/"margaret_v2_four_direction_x8.png",optimize=False)

    controls=[
        ("Karen",first_down("assets/characters/karen/karen_idle.png")),
        ("Triton",first_down("assets/characters/triton/triton_idle.png")),
        ("Sophie",first_down("assets/characters/sophie/sophie_idle.png")),
        ("Margaret",margaret.crop((0,0,CELL,CELL))),
    ]

    # Medium44 matched comparison, exact pixels only.
    scale=44
    z=7
    pad=24
    label_h=28
    tile=scale*z
    out=Image.new("RGBA",(pad+4*(tile+pad),pad+label_h+tile+pad),(240,240,240,255))
    dr=ImageDraw.Draw(out)
    for i,(name,cell) in enumerate(controls):
        x=pad+i*(tile+pad)
        dr.text((x,pad),name,fill=(20,20,20,255),font=font(16))
        med=cell.resize((scale,scale),Image.Resampling.NEAREST)
        big=med.resize((tile,tile),Image.Resampling.NEAREST)
        out.alpha_composite(big,(x,pad+label_h))
    out.save(OUT/"karen_triton_sophie_margaret_medium44.png",optimize=False)

    # Margaret scale-only comparison.
    scales=(48,44,41)
    names=("Full48","Medium44","Compact41")
    z=7
    tile=48*z
    out2=Image.new("RGBA",(24+3*(tile+24),24+28+tile+24),(240,240,240,255))
    dr2=ImageDraw.Draw(out2)
    front=margaret.crop((0,0,CELL,CELL))
    for i,(s,n) in enumerate(zip(scales,names)):
        x=24+i*(tile+24)
        dr2.text((x,24),n,fill=(20,20,20,255),font=font(16))
        scaled=front.resize((s,s),Image.Resampling.NEAREST)
        big=scaled.resize((s*z,s*z),Image.Resampling.NEAREST)
        ox=x+(tile-big.width)//2
        oy=24+28+(tile-big.height)
        out2.alpha_composite(big,(ox,oy))
    out2.save(OUT/"margaret_v2_scale_48_44_41.png",optimize=False)
    print("Margaret v2 direction evidence built")

if __name__=="__main__":
    main()
