#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

CELL = 48
OUT = Path("prototype_artifacts/margaret_front")
OUT.mkdir(parents=True, exist_ok=True)

# Test-only palette. It is deliberately neutral and is NOT a final fourth-character color decision.
TRANSPARENT=(0,0,0,0)
OUTLINE=(54,50,58,255)
HAIR_SHADOW=(184,186,196,255)
HAIR=(232,232,236,255)
SKIN_SHADOW=(205,151,130,255)
SKIN=(236,183,158,255)
EYE=(72,68,78,255)  # neutral dark placeholder; exact eye color remains unresolved.
CLOTH_DARK=(92,96,110,255)
CLOTH_MID=(124,128,140,255)
CLOTH_LIGHT=(196,190,178,255)
LEATHER=(112,78,58,255)
BOOT=(72,58,54,255)

def rect(d, box, fill):
    d.rectangle(box, fill=fill)

def px(d, x, y, fill):
    d.point((x,y), fill=fill)

def build_candidate():
    im=Image.new("RGBA",(CELL,CELL),TRANSPARENT)
    d=ImageDraw.Draw(im)

    # Hair silhouette: clean, vertical, shoulder-length mass. Provisional, not locked hairstyle.
    rect(d,(15,5,32,7),OUTLINE)
    rect(d,(12,8,35,18),OUTLINE)
    rect(d,(10,12,37,23),OUTLINE)
    rect(d,(11,20,16,30),OUTLINE)
    rect(d,(31,20,36,30),OUTLINE)
    rect(d,(14,7,33,9),HAIR_SHADOW)
    rect(d,(12,10,35,17),HAIR)
    rect(d,(11,14,36,20),HAIR)
    rect(d,(12,19,17,29),HAIR_SHADOW)
    rect(d,(30,19,35,29),HAIR_SHADOW)
    rect(d,(13,10,15,20),HAIR_SHADOW)
    rect(d,(32,10,34,20),HAIR_SHADOW)

    # Face: slightly narrower and more restrained than the other controls.
    rect(d,(16,13,31,24),SKIN_SHADOW)
    rect(d,(17,12,30,23),SKIN)
    rect(d,(18,16,21,17),OUTLINE)   # straight-ish brows
    rect(d,(26,16,29,17),OUTLINE)
    rect(d,(19,18,21,20),EYE)
    rect(d,(27,18,29,20),EYE)
    px(d,20,18,(238,238,242,255)); px(d,28,18,(238,238,242,255))
    rect(d,(23,22,25,22),SKIN_SHADOW)
    rect(d,(22,24,26,24),OUTLINE)

    # Neck / shoulders. Narrow, tidy stance; not Karen-forward or Triton-broad.
    rect(d,(21,24,27,27),SKIN_SHADOW)
    rect(d,(18,26,30,28),OUTLINE)
    rect(d,(16,28,32,37),OUTLINE)
    rect(d,(18,27,30,29),CLOTH_LIGHT)
    rect(d,(17,29,31,36),CLOTH_MID)

    # Vertical center panel emphasizes measured, upright read without heraldry.
    rect(d,(22,28,26,39),CLOTH_DARK)
    rect(d,(23,29,25,38),CLOTH_LIGHT)
    rect(d,(17,35,31,39),LEATHER)
    rect(d,(23,35,25,38),CLOTH_DARK)

    # Arms / hands held close to the body; minimal gesture.
    rect(d,(14,29,18,37),OUTLINE)
    rect(d,(15,30,18,36),CLOTH_DARK)
    rect(d,(30,29,34,37),OUTLINE)
    rect(d,(30,30,33,36),CLOTH_DARK)
    rect(d,(15,37,18,39),SKIN)
    rect(d,(30,37,33,39),SKIN)

    # Lower body: slim vertical separation, feet grounded at y=44.
    rect(d,(18,39,23,44),OUTLINE)
    rect(d,(19,39,22,43),CLOTH_DARK)
    rect(d,(25,39,30,44),OUTLINE)
    rect(d,(26,39,29,43),CLOTH_DARK)
    rect(d,(17,43,23,45),BOOT)
    rect(d,(25,43,31,45),BOOT)

    # A few outline pixels to keep the silhouette crisp at 44px.
    for x in range(17,24): px(d,x,45,OUTLINE)
    for x in range(25,32): px(d,x,45,OUTLINE)

    return im

def first_down_frame(sheet_path):
    with Image.open(sheet_path) as im:
        src=im.convert("RGBA")
        return src.crop((0,0,CELL,CELL))

def label_font():
    try:
        return ImageFont.truetype("DejaVuSans.ttf",16)
    except Exception:
        return ImageFont.load_default()

def board(cells, names, scale_px, filename):
    # First mechanically render each 48px source to requested gameplay scale using NEAREST,
    # then enlarge by 4 for phone inspection. No character pixels are redrawn.
    zoom=4
    pad=22
    label_h=28
    tile_w=scale_px*zoom
    w=pad + len(cells)*(tile_w+pad)
    h=pad + label_h + tile_w + pad
    out=Image.new("RGBA",(w,h),(242,242,242,255))
    dr=ImageDraw.Draw(out)
    font=label_font()
    for i,(cell,name) in enumerate(zip(cells,names)):
        x=pad+i*(tile_w+pad)
        dr.text((x,pad),name,fill=(20,20,20,255),font=font)
        scaled=cell.resize((scale_px,scale_px),Image.Resampling.NEAREST)
        enlarged=scaled.resize((tile_w,tile_w),Image.Resampling.NEAREST)
        out.alpha_composite(enlarged,(x,pad+label_h))
    out.save(OUT/filename,optimize=False)

def main():
    candidate=build_candidate()
    candidate_path=OUT/"margaret_front_candidate_v1_48.png"
    candidate.save(candidate_path,optimize=False)

    controls=[
        first_down_frame("assets/characters/karen/karen_idle.png"),
        first_down_frame("assets/characters/triton/triton_idle.png"),
        first_down_frame("assets/characters/sophie/sophie_idle.png"),
        candidate,
    ]
    names=["Karen","Triton","Sophie","Margaret v1"]
    board(controls,names,48,"margaret_four_character_front_compare_48.png")
    board(controls,names,44,"margaret_four_character_front_compare_medium44.png")

    assert candidate.size==(48,48)
    assert candidate.mode=="RGBA"
    bbox=candidate.getbbox()
    assert bbox is not None
    assert bbox[1] >= 4 and bbox[3] <= 47, bbox
    print("Margaret front candidate v1 generated:", candidate_path)
    print("bbox:",bbox)

if __name__=="__main__":
    main()
