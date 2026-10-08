#!/usr/bin/env python3
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
specs={
 "sophie":ROOT/"docs/pixel/reference/sophie_chibi_direction_appeal_v3_48.png",
 "margaret":ROOT/"docs/pixel/reference/margaret_chibi_direction_appeal_v7_48.png",
}
errors=[]
for name,p in specs.items():
    if not p.exists():
        errors.append(f"missing {p.relative_to(ROOT)}"); continue
    im=Image.open(p).convert("RGBA")
    if im.size!=(192,48): errors.append(f"{name} source size {im.size}")
    bad=sorted(a for a in set(im.getchannel("A").getdata()) if a not in (0,255))
    if bad: errors.append(f"{name}: semitransparent alpha {bad[:12]}")
    for i,d in enumerate(("down","left","right","up")):
        c=im.crop((48*i,0,48*(i+1),48));bb=c.getbbox()
        if not bb: errors.append(f"{name} {d}: empty"); continue
        w=bb[2]-bb[0];h=bb[3]-bb[1]
        if not (20<=w<=34): errors.append(f"{name} {d}: width {w}")
        if not (34<=h<=45): errors.append(f"{name} {d}: height {h}")

# Margaret should now match the other protagonists' physical screen mass, not v5's tall/narrow read.
m=Image.open(specs["margaret"]).convert("RGBA")
front=m.crop((0,0,48,48));bb=front.getbbox()
if bb and (bb[2]-bb[0],bb[3]-bb[1])!=(28,40):
    errors.append(f"Margaret front occupancy expected 28x40, got {(bb[2]-bb[0],bb[3]-bb[1])}")
# Explicit role-color/readability pixels: violet eye + old-gold ornament.
eye=m.getpixel((19,17)); ornament=m.getpixel((23,4))
if eye[:3]!=(139,93,182): errors.append(f"Margaret eye accent drifted: {eye}")
if ornament[:3]!=(220,177,86): errors.append(f"Margaret hair ornament drifted: {ornament}")

if errors:
    raise SystemExit("APPEAL SOURCE VERIFY FAIL\n"+"\n".join(errors))
print("FOUR PROTAGONIST APPEAL SOURCE VERIFY PASS")
print("Karen/Triton unchanged; Sophie/Margaret candidate sources structurally valid")
