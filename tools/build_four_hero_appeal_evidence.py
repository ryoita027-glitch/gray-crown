#!/usr/bin/env python3
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts/four_hero_appeal"; OUT.mkdir(parents=True,exist_ok=True)
CHARS=("karen","triton","sophie","margaret")
DIRS=("down","left","right","up")
ANIMS=(("idle",4),("walk",6),("turn",3),("talk",4),("surprise",4),("approach",4),("laugh",6),("run",6))

def font(n=16):
    try:return ImageFont.truetype("DejaVuSans.ttf",n)
    except:return ImageFont.load_default()

def lock_cells(path):
    im=Image.open(path).convert("RGBA")
    if im.size==(48,192):
        return [im.crop((0,i*48,48,(i+1)*48)) for i in range(4)]
    if im.size==(192,48):
        return [im.crop((i*48,0,(i+1)*48,48)) for i in range(4)]
    raise ValueError(f"{path}: unsupported direction lock size {im.size}")

# Exact 44px gameplay lineup.
board=Image.new("RGBA",(4*180,150),(236,236,236,255));d=ImageDraw.Draw(board)
for i,c in enumerate(CHARS):
    im=Image.open(ROOT/f"assets/characters/{c}/{c}_idle.png").convert("RGBA").crop((0,0,48,48)).resize((44,44),Image.Resampling.NEAREST)
    board.alpha_composite(im,(i*180+68,30)); d.text((i*180+55,92),c,fill=(20,20,20),font=font(16))
board.save(OUT/"four_hero_medium44.png")

# Four-direction evidence from exact committed locks.
board=Image.new("RGBA",(4*240,4*240+45),(236,236,236,255)); d=ImageDraw.Draw(board)
for ri,c in enumerate(CHARS):
    cells=lock_cells(ROOT/f"docs/pixel/reference/{c}_appeal_direction_lock_v1.png")
    for di,name in enumerate(DIRS):
        cell=cells[di].resize((192,192),Image.Resampling.NEAREST)
        board.alpha_composite(cell,(di*240+24,ri*240+10))
        d.text((di*240+20,ri*240+205),f"{c} {name}",fill=(20,20,20),font=font(14))
board.save(OUT/"four_hero_4direction.png")

# Face/head crop at nearest-neighbour zoom. This is intentionally diagnostic,
# not a separate art source.
board=Image.new("RGBA",(4*260,260),(236,236,236,255));d=ImageDraw.Draw(board)
for i,c in enumerate(CHARS):
    cell=Image.open(ROOT/f"assets/characters/{c}/{c}_idle.png").convert("RGBA").crop((0,0,48,48))
    head=cell.crop((7,1,41,29)).resize((238,196),Image.Resampling.NEAREST)
    board.alpha_composite(head,(i*260+11,10))
    d.text((i*260+88,220),c,fill=(20,20,20),font=font(15))
board.save(OUT/"four_hero_face_zoom.png")

# Animation first-frame overview.
board=Image.new("RGBA",(8*150,4*150),(236,236,236,255));d=ImageDraw.Draw(board)
for ri,c in enumerate(CHARS):
    for ci,(a,n) in enumerate(ANIMS):
        im=Image.open(ROOT/f"assets/characters/{c}/{c}_{a}.png").convert("RGBA").crop((0,0,48,48)).resize((96,96),Image.Resampling.NEAREST)
        board.alpha_composite(im,(ci*150+25,ri*150+5));d.text((ci*150+12,ri*150+105),a,fill=(20,20,20),font=font(12))
board.save(OUT/"four_hero_animation_fronts.png")

# Every down-facing frame, per character. This makes repeated/static motion or
# broken split-body animation obvious instead of hiding it behind one frame.
for c in CHARS:
    max_frames=6; cell=92; label_w=105
    board=Image.new("RGBA",(label_w+max_frames*cell,8*cell),(236,236,236,255));d=ImageDraw.Draw(board)
    for row,(a,n) in enumerate(ANIMS):
        d.text((8,row*cell+35),a,fill=(20,20,20),font=font(13))
        sheet=Image.open(ROOT/f"assets/characters/{c}/{c}_{a}.png").convert("RGBA")
        for fi in range(n):
            fr=sheet.crop((fi*48,0,(fi+1)*48,48)).resize((80,80),Image.Resampling.NEAREST)
            board.alpha_composite(fr,(label_w+fi*cell+6,row*cell+5))
            d.text((label_w+fi*cell+38,row*cell+78),str(fi+1),fill=(70,70,70),font=font(9))
    board.save(OUT/f"{c}_animation_sequences.png")

# Walk/run motion comparison at actual 44px display scale, magnified only after
# the exact gameplay resize.
board=Image.new("RGBA",(6*74+120,8*74),(236,236,236,255));d=ImageDraw.Draw(board)
row=0
for c in CHARS:
    for a in ("walk","run"):
        d.text((8,row*74+27),f"{c} {a}",fill=(20,20,20),font=font(12))
        sheet=Image.open(ROOT/f"assets/characters/{c}/{c}_{a}.png").convert("RGBA")
        n=6
        for fi in range(n):
            fr=sheet.crop((fi*48,0,(fi+1)*48,48)).resize((44,44),Image.Resampling.NEAREST).resize((66,66),Image.Resampling.NEAREST)
            board.alpha_composite(fr,(120+fi*74+4,row*74+3))
        row+=1
board.save(OUT/"four_hero_walk_run_sequences.png")
print("FOUR HERO APPEAL EVIDENCE BUILT")
