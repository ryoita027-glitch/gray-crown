#!/usr/bin/env python3
"""Rebuild reversible Margaret crown-to-shoulder V5 trial from actual V4 PNG. Requires Pillow."""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
V2=ROOT/"assets/characters/margaret/studies/margaret_original_contour_v2_walk.png"
V4=ROOT/"assets/characters/margaret/studies/margaret_contour_bridge_v4_walk.png"
NPC=ROOT/"assets/npc/featured_residents_charm_v5.png"
OUT=ROOT/"assets/characters/margaret/studies/margaret_crown_shoulder_v5_walk.png"
AB=ROOT/"docs/art/evidence/margaret_v2_v4_crown_v5_44px_ab_20261030.png"
SVG=ROOT/"docs/art/evidence/margaret_v2_v4_crown_v5_mayor_envoy_44px_20261030.svg"
def build():
    src=Image.open(V4).convert("RGBA")
    assert src.size==(288,192)
    out=src.copy()
    for d in range(4):
        for f in range(6):
            ox,oy=f*48,d*48
            for y in range(7,19):
                for x in range(48):
                    p=(0,0,0,0) if y<9 else src.getpixel((ox+x,oy+7+round((y-9)*11/9)))
                    out.putpixel((ox+x,oy+y),p)
            for y in range(24,30):
                for x in range(7,41):
                    side=(x<=17 or x>=31) if d in (0,3) else (x>=29 if d==1 else x<=19)
                    if not side: continue
                    r,g,b,a=src.getpixel((ox+x,oy+y))
                    if a<180: continue
                    color=None
                    if r==242 and g==238: color=(201,191,195)
                    elif r==216 and g==207: color=(184,170,205)
                    elif r==201 and g==191: color=(184,170,205)
                    if color: out.putpixel((ox+x,oy+y),(*color,a))
    OUT.parent.mkdir(parents=True,exist_ok=True)
    out.save(OUT)
    return out
def evidence(candidate):
    images=[Image.open(V2).convert("RGBA"),Image.open(V4).convert("RGBA"),candidate]
    bg=Image.new("RGBA",(204,248))
    for y in range(248):
        for x in range(204):
            bg.putpixel((x,y),(90,114,86,255) if ((x>>4)+(y>>4))%2 else (96,122,92,255))
    for d in range(4):
        for col,im in enumerate(images):
            for y in range(44):
                for x in range(44):
                    p=im.getpixel((int(x*48/44),d*48+int(y*48/44)))
                    if p[3]: bg.putpixel((8+col*64+x,10+d*58+y),p)
    AB.parent.mkdir(parents=True,exist_ok=True)
    bg.save(AB)
    import base64,html
    files=[V2,V4,OUT,NPC]
    b64=[base64.b64encode(p.read_bytes()).decode("ascii") for p in files]
    parts=['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="344" height="298" viewBox="0 0 344 298"><title>44px Margaret and V5 NPC static source A/B</title><defs>']
    for i,data in enumerate(b64):
        parts.append(f'<image id="atlas{i}" width="{432 if i==3 else 288}" height="192" xlink:href="data:image/png;base64,{data}"/>')
    parts.append('</defs><rect width="344" height="298" fill="#5d765a"/><g font-size="9" font-family="sans-serif" fill="#fff"><text x="10" y="14">V2 original</text><text x="78" y="14">V4</text><text x="146" y="14">V5 trial</text><text x="215" y="14">Mayor V5</text><text x="279" y="14">Envoy V5</text></g>')
    for d in range(4):
        yy=27+d*64
        parts.append(f'<text x="1" y="{yy+23}" fill="#fff" font-size="7">{["F","L","R","B"][d]}</text>')
        for c in range(5):
            xx=10+c*67
            parts.append(f'<rect x="{xx-2}" y="{yy-2}" width="48" height="48" fill="{("#617d5c" if d%2 else "#5c7658")}"/><svg x="{xx}" y="{yy}" width="44" height="44" viewBox="0 0 48 48" overflow="hidden"><use xlink:href="#atlas{min(c,3)}" x="{(-144 if c==3 else -192 if c==4 else 0)}" y="{-d*48}"/></svg><path d="M{xx-2} {yy+45}h48" stroke="#b7d1a8" stroke-width=".5"/>')
    parts.append('<text x="8" y="291" font-size="9" fill="#fff">Same 44px crop/pose; static source PNG comparison. ART HOLD.</text></svg>')
    SVG.write_text("".join(parts),encoding="utf-8")
if __name__=="__main__":
    evidence(build())
    print("Margaret V5 reversible crown/shoulder study generated; ART HOLD, not production.")
