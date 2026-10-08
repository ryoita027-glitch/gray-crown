#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageFilter, ImageChops

SRC=Path("docs/pixel/reference/margaret_chibi_direction_lock_v2_48.png")
OUT=Path("docs/pixel/reference/margaret_chibi_direction_lock_v4_48.png")
CELL=48
TARGET_WIDTHS=(34,35,35,33)
TARGET_H=44
DARK=(44,31,55,255)

src=Image.open(SRC).convert("RGBA")
if src.size!=(192,48):
    raise SystemExit(f"unexpected v2 size: {src.size}")

sheet=Image.new("RGBA",(192,48),(0,0,0,0))
for i,tw in enumerate(TARGET_WIDTHS):
    cell=src.crop((CELL*i,0,CELL*(i+1),CELL))
    bb=cell.getbbox()
    if not bb:
        raise SystemExit(f"empty v2 cell {i}")
    reg=cell.crop(bb).resize((tw,TARGET_H),Image.Resampling.NEAREST)

    # Larger chibi head while retaining the approved face/hair pixels.
    head_h=21
    head=reg.crop((0,0,tw,head_h)).resize((min(tw+2,40),22),Image.Resampling.NEAREST)

    # Slightly thicker torso/body mass so Margaret no longer reads as undersized.
    staged=Image.new("RGBA",(max(tw+2,40),TARGET_H),(0,0,0,0))
    body=reg.crop((0,18,tw,TARGET_H)).resize((tw+2,TARGET_H-18),Image.Resampling.NEAREST)
    cx=staged.width//2
    staged.alpha_composite(body,(cx-body.width//2,18))
    staged.alpha_composite(head,(cx-head.width//2,0))

    # Stronger one-pixel silhouette separation, important for pale hair at Medium44.
    alpha=staged.getchannel("A").point(lambda x:255 if x>20 else 0)
    dilated=alpha.filter(ImageFilter.MaxFilter(3))
    outline_mask=ImageChops.subtract(dilated,alpha)
    outlined=Image.new("RGBA",staged.size,(0,0,0,0))
    outline=Image.new("RGBA",staged.size,DARK)
    outline.putalpha(outline_mask)
    outlined.alpha_composite(outline)
    outlined.alpha_composite(staged)

    # Preserve the [24,44]-family foot anchoring while using more of the 48px cell.
    bb2=outlined.getbbox()
    crop=outlined.crop(bb2)
    if crop.width>42:
        crop=crop.resize((42,crop.height),Image.Resampling.NEAREST)
    dst=Image.new("RGBA",(CELL,CELL),(0,0,0,0))
    x=(CELL-crop.width)//2
    y=max(0,47-crop.height)
    dst.alpha_composite(crop,(x,y))
    sheet.alpha_composite(dst,(CELL*i,0))

OUT.parent.mkdir(parents=True,exist_ok=True)
sheet.save(OUT,optimize=False)
print(f"WROTE {OUT} {sheet.size}")
