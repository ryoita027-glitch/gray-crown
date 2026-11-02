#!/usr/bin/env python3
"""Reversible Margaret V27 48px key-pose study. Requires Pillow; never touches production art."""
from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[2]
src=Image.open(ROOT/"assets/character_trials/margaret_idle_adult_mage_v22_structural_trial.png").convert("RGBA")
assert src.size==(192,192)
out=Image.new("RGBA",src.size)
for direction in range(4):
    for frame in range(4):
        im=src.crop((frame*48,direction*48,(frame+1)*48,(direction+1)*48)).copy()
        dr=ImageDraw.Draw(im)
        if direction==0:
            dr.polygon([(22,27),(27,27),(30,31),(29,35),(27,38),(21,38),(20,34)],fill="#443a4c")
            dr.polygon([(23,27),(27,28),(28,32),(27,35),(23,35),(22,32)],fill="#5d5061")
            dr.line([(23,28),(23,32),(24,34)],fill="#857487",width=1)
            dr.polygon([(24,24),(26,24),(28,28),(26,30),(23,28)],fill="#e6d8c2")
            dr.line([(25,25),(26,27)],fill="#bda478",width=1)
            dr.rectangle((21,33,29,34),fill="#3c3441")
            dr.rectangle((24,33,26,34),fill="#c7a776")
            dr.point((25,33),fill="#e5c98c")
            dr.polygon([(23,35),(26,35),(27,40),(25,42),(23,41)],fill="#d4c2ac")
            dr.line([(24,36),(25,40)],fill="#a99585")
            dr.line([(20,36),(20,39)],fill="#a08a9a")
            dr.line([(29,35),(30,39)],fill="#a08a9a")
            dr.polygon([(18,41),(22,41),(22,43),(23,44),(17,44),(17,43)],fill="#3b343e")
            dr.line([(18,42),(21,42)],fill="#70606b")
            dr.polygon([(27,41),(31,41),(32,43),(31,44),(26,44),(26,43)],fill="#3b343e")
            dr.line([(28,42),(30,42)],fill="#70606b")
            dr.point((24,43),fill=(0,0,0,0))
            dr.line([(19,29),(20,31)],fill="#a18b9a")
            dr.point((30,29),fill="#b49b76")
        elif direction==1:
            dr.line([(20,30),(21,34)],fill="#b69b73")
            dr.rectangle((19,35,23,35),fill="#443a4b")
            dr.line([(21,36),(22,40)],fill="#9d8a9a")
            dr.polygon([(17,42),(20,42),(21,44),(16,44)],fill="#3b343e")
            dr.polygon([(23,42),(27,42),(28,44),(23,44)],fill="#3b343e")
            dr.point((22,44),fill=(0,0,0,0))
        elif direction==2:
            dr.line([(27,30),(26,34)],fill="#b69b73")
            dr.rectangle((24,35,28,35),fill="#443a4b")
            dr.line([(26,36),(25,40)],fill="#9d8a9a")
            dr.polygon([(20,42),(24,42),(24,44),(19,44)],fill="#3b343e")
            dr.polygon([(27,42),(31,42),(32,44),(27,44)],fill="#3b343e")
            dr.point((26,44),fill=(0,0,0,0))
        else:
            dr.polygon([(18,42),(22,42),(23,44),(17,44)],fill="#3b343e")
            dr.polygon([(26,42),(30,42),(31,44),(25,44)],fill="#3b343e")
            dr.point((24,44),fill=(0,0,0,0))
        out.alpha_composite(im,(frame*48,direction*48))
dst=ROOT/"assets/character_trials/margaret_idle_v27_tailored_keypose_indexed.png"
# Index with exact RGBA pixel preservation; transparency is palette entry zero.
colors=sorted({px for px in out.getdata() if px[3]})
assert len(colors)<255 and {px[3] for px in out.getdata()}=={0,255}
lookup={(0,0,0,0):0}
lookup.update({rgba:i+1 for i,rgba in enumerate(colors)})
palette=Image.new("P",out.size)
rgb=[0,0,0]+[v for rgba in colors for v in rgba[:3]]
palette.putpalette(rgb+[0]*(768-len(rgb)))
palette.putdata([lookup[px] for px in out.getdata()])
palette.info["transparency"]=0
assert palette.convert("RGBA").tobytes()==out.tobytes(), "indexed PNG must preserve every RGBA pixel"
palette.save(dst,optimize=True)
print(dst)
