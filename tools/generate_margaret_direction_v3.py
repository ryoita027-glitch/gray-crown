#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageFilter, ImageChops

SRC=Path("docs/pixel/reference/margaret_chibi_direction_lock_v2_48.png")
OUT=Path("docs/pixel/reference/margaret_chibi_direction_lock_v3_48.png")
CELL=48
TARGET_WIDTHS=(32,32,32,30)
DARK=(47,34,58,255)

src=Image.open(SRC).convert("RGBA")
if src.size!=(192,48):
    raise SystemExit(f"unexpected v2 size: {src.size}")

sheet=Image.new("RGBA",(192,48),(0,0,0,0))
for i,tw in enumerate(TARGET_WIDTHS):
    cell=src.crop((CELL*i,0,CELL*(i+1),CELL))
    bb=cell.getbbox()
    if not bb:
        raise SystemExit(f"empty v2 cell {i}")
    reg=cell.crop(bb).resize((tw,44),Image.Resampling.NEAREST)

    alpha=reg.getchannel("A").point(lambda x:255 if x>20 else 0)
    dilated=alpha.filter(ImageFilter.MaxFilter(3))
    outline_mask=ImageChops.subtract(dilated,alpha)
    outlined=Image.new("RGBA",reg.size,(0,0,0,0))
    outline=Image.new("RGBA",reg.size,DARK)
    outline.putalpha(outline_mask)
    outlined.alpha_composite(outline)
    outlined.alpha_composite(reg)

    dst=Image.new("RGBA",(CELL,CELL),(0,0,0,0))
    dst.alpha_composite(outlined,((CELL-tw)//2,3))
    sheet.alpha_composite(dst,(CELL*i,0))

OUT.parent.mkdir(parents=True,exist_ok=True)
sheet.save(OUT,optimize=False)
print(f"WROTE {OUT} {sheet.size}")
