#!/usr/bin/env python3
"""Regenerate reversible Margaret V4F directional book-grip art. Not an art approval."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets/characters/margaret/studies/margaret_walk_v4e_study.png"
OUT = ROOT / "assets/characters/margaret/studies/margaret_walk_v4f_study.png"
DARK = (51,59,70,255)
INK = (48,46,57,255)
BOOK = (88,113,108,255)
LIGHT = (140,166,156,255)
BINDING = (182,156,117,255)
SLEEVE = (76,69,94,255)
SKIN = (226,183,161,255)

def make():
    source = Image.open(SRC).convert("RGBA")
    assert source.size == (288,192)
    sheet = Image.new("RGBA", source.size)
    for d in range(4):
        for f in range(6):
            s = source.crop((f*48,d*48,(f+1)*48,(d+1)*48))
            draw = ImageDraw.Draw(s)
            # Remove only the old identical right-hand book block.
            draw.rectangle((34,33,39,39), fill=(0,0,0,0))
            sway = 1 if f in (2,3) else 0
            if d == 0:
                bx,by = 30+sway,32
                draw.rectangle((28,33,30,35),fill=SLEEVE)
                draw.point((30,34),fill=SKIN)
            elif d == 1:
                bx,by = 12+sway,32
                draw.rectangle((16,33,18,35),fill=SLEEVE)
                draw.point((16,34),fill=SKIN)
            elif d == 2:
                bx,by = 30+sway,32
                draw.rectangle((28,33,31,35),fill=SLEEVE)
                draw.point((30,34),fill=SKIN)
            else:
                bx,by = 12+sway,34
                draw.rectangle((16,34,18,36),fill=SLEEVE)
                draw.point((16,35),fill=SKIN)
            draw.rectangle((bx,by,bx+5,by+6),fill=DARK)
            draw.rectangle((bx+1,by+1,bx+4,by+5),fill=BOOK)
            draw.line((bx+1,by+1,bx+4,by+1),fill=LIGHT)
            draw.line((bx+2,by+3,bx+2,by+4),fill=BINDING)
            draw.point((bx+4,by+5),fill=INK)
            draw.point((bx if d in (0,2) else bx+5,by+2),fill=SKIN)
            assert s.getbbox()[3] == 44, (d,f,s.getbbox())
            sheet.alpha_composite(s,(f*48,d*48))
    # Indexed palette, preserving all RGBA pixels exactly (not quantization).
    colors = sorted(set(sheet.getdata()),key=lambda c:(c[3]!=0,c))
    indices = {c:i for i,c in enumerate(colors)}
    indexed = Image.new("P",sheet.size)
    indexed.putpalette([v for c in colors for v in c[:3]])
    indexed.putdata([indices[c] for c in sheet.getdata()])
    indexed.info["transparency"] = indices[(0,0,0,0)]
    indexed.save(OUT,optimize=True)
    assert Image.open(OUT).convert("RGBA").tobytes() == sheet.tobytes()
    print(OUT)

if __name__ == "__main__":
    make()
