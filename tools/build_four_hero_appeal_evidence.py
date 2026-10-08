#!/usr/bin/env python3
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts/four_hero_appeal"; OUT.mkdir(parents=True,exist_ok=True)
CHARS=("karen","triton","sophie","margaret")
DIRS=("down","left","right","up")
def font(n=16):
    try:return ImageFont.truetype("DejaVuSans.ttf",n)
    except:return ImageFont.load_default()
# exact 44px gameplay lineup
board=Image.new("RGBA",(4*180,150),(236,236,236,255));d=ImageDraw.Draw(board)
for i,c in enumerate(CHARS):
    im=Image.open(ROOT/f"assets/characters/{c}/{c}_idle.png").convert("RGBA").crop((0,0,48,48)).resize((44,44),Image.Resampling.NEAREST)
    board.alpha_composite(im,(i*180+68,30)); d.text((i*180+55,92),c,fill=(20,20,20),font=font(16))
board.save(OUT/"four_hero_medium44.png")
# four direction evidence
board=Image.new("RGBA",(4*240,4*240+45),(236,236,236,255)); d=ImageDraw.Draw(board)
for ri,c in enumerate(CHARS):
    lock=Image.open(ROOT/f"docs/pixel/reference/{c}_appeal_direction_lock_v1.png").convert("RGBA")
    for di,name in enumerate(DIRS):
        cell=lock.crop((0,di*48,48,(di+1)*48)).resize((192,192),Image.Resampling.NEAREST)
        board.alpha_composite(cell,(di*240+24,ri*240+10))
        d.text((di*240+20,ri*240+205),f"{c} {name}",fill=(20,20,20),font=font(14))
board.save(OUT/"four_hero_4direction.png")
# animation fronts
board=Image.new("RGBA",(8*150,4*150),(236,236,236,255));d=ImageDraw.Draw(board)
for ri,c in enumerate(CHARS):
    for ci,a in enumerate(("idle","walk","turn","talk","surprise","approach","laugh","run")):
        im=Image.open(ROOT/f"assets/characters/{c}/{c}_{a}.png").convert("RGBA").crop((0,0,48,48)).resize((96,96),Image.Resampling.NEAREST)
        board.alpha_composite(im,(ci*150+25,ri*150+5));d.text((ci*150+12,ri*150+105),a,fill=(20,20,20),font=font(12))
board.save(OUT/"four_hero_animation_fronts.png")
print("FOUR HERO APPEAL EVIDENCE BUILT")
