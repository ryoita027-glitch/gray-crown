#!/usr/bin/env python3
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

ROOT=Path("prototype_artifacts/margaret_generated")
OUT=Path("prototype_artifacts/margaret_animation_evidence")
OUT.mkdir(parents=True,exist_ok=True)
FRAMES=(("idle",4),("walk",6),("turn",3),("talk",4),("surprise",4),("approach",4),("laugh",6),("run",6))

def font(size=18):
    try:
        return ImageFont.truetype("DejaVuSans.ttf",size)
    except Exception:
        return ImageFont.load_default()

def main():
    z=6
    tile=48*z
    width=24+6*tile
    height=len(FRAMES)*(tile+42)
    canvas=Image.new("RGBA",(width,height),(240,240,240,255))
    d=ImageDraw.Draw(canvas)
    y=0
    for name,n in FRAMES:
        d.text((6,y+8),name,fill=(20,20,20,255),font=font(16))
        with Image.open(ROOT/f"margaret_{name}.png") as im:
            im=im.convert("RGBA")
            for i in range(n):
                fr=im.crop((48*i,0,48*(i+1),48))
                big=fr.resize((tile,tile),Image.Resampling.NEAREST)
                canvas.alpha_composite(big,(24+i*tile,y+34))
        y+=tile+42
    canvas.save(OUT/"margaret_front_8animation_x6.png",optimize=False)

    # Four-direction Idle evidence from generated sheet.
    with Image.open(ROOT/"margaret_idle.png") as im:
        im=im.convert("RGBA")
        board=Image.new("RGBA",(4*48*8,48*8+34),(240,240,240,255))
        dr=ImageDraw.Draw(board)
        for row,label in enumerate(("Down","Left","Right","Up")):
            fr=im.crop((0,row*48,48,(row+1)*48))
            board.alpha_composite(fr.resize((384,384),Image.Resampling.NEAREST),(row*384,34))
            dr.text((row*384+6,7),label,fill=(20,20,20,255),font=font(16))
        board.save(OUT/"margaret_generated_idle_4dir_x8.png",optimize=False)

    print("Margaret animation evidence built")

if __name__=="__main__":
    main()
