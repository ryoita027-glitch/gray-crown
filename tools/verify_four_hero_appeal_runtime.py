#!/usr/bin/env python3
"""Mechanical quality checks for the four-hero appeal candidate runtime."""
from pathlib import Path
from PIL import Image
import json, hashlib

ROOT=Path(__file__).resolve().parents[1]
CHARS=("karen","triton","sophie","margaret")
ANIMS={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
errors=[]
report={"characters":{}}

def bbox_metric(im):
    a=im.getchannel("A")
    b=a.getbbox()
    return None if b is None else [b[0],b[1],b[2],b[3],b[2]-b[0],b[3]-b[1]]

for c in CHARS:
    lock=ROOT/f"docs/pixel/reference/{c}_appeal_direction_lock_v1.png"
    if not lock.exists(): errors.append(f"missing {lock}"); continue
    lim=Image.open(lock).convert("RGBA")
    if lim.size!=(48,192): errors.append(f"{lock}: bad size {lim.size}")
    report["characters"][c]={"directions":{},"runtime":{}}
    for di,d in enumerate(("down","left","right","up")):
        cell=lim.crop((0,di*48,48,(di+1)*48))
        report["characters"][c]["directions"][d]=bbox_metric(cell)
        if cell.getchannel("A").getbbox() is None: errors.append(f"{c} {d}: empty lock")
    for anim,n in ANIMS.items():
        p=ROOT/f"assets/characters/{c}/{c}_{anim}.png"
        if not p.exists(): errors.append(f"missing {p}"); continue
        im=Image.open(p).convert("RGBA")
        if im.size!=(48*n,192): errors.append(f"{p}: {im.size} != {(48*n,192)}")
        alphas=set(im.getchannel("A").getdata())
        if any(a not in (0,255) for a in alphas): errors.append(f"{p}: non-binary alpha")
        report["characters"][c]["runtime"][anim]=hashlib.sha256(p.read_bytes()).hexdigest()

party=ROOT/"assets/hero_party_walk.png"
if not party.exists(): errors.append("missing hero_party_walk.png")
else:
    im=Image.open(party).convert("RGBA")
    if im.size!=(144,768): errors.append(f"party sheet bad size {im.size}")
    if any(a not in (0,255) for a in set(im.getchannel("A").getdata())):
        errors.append("party sheet non-binary alpha")

    # Atlas integrity: every 48x48 source rectangle used by the real world/battle
    # renderer must be byte-identical to the corresponding committed Walk frame.
    # This catches a subtle class of bugs where the atlas dimensions are correct
    # but frames were packed on a 32px grid and adjacent sprites bleed together.
    for ci,char in enumerate(CHARS):
        walk_path=ROOT/f"assets/characters/{char}/{char}_walk.png"
        if not walk_path.exists():
            continue
        walk=Image.open(walk_path).convert("RGBA")
        for di in range(4):
            for col,frame in enumerate((0,2,4)):
                expected=walk.crop((frame*48,di*48,(frame+1)*48,(di+1)*48))
                actual=im.crop((col*48,(ci*4+di)*48,(col+1)*48,(ci*4+di+1)*48))
                if actual.tobytes()!=expected.tobytes():
                    errors.append(f"party atlas mismatch: {char} dir={di} col={col} frame={frame}")

# Distinctness guard: front silhouette overlap must not collapse into near-identical sprites.
front={}
for c in CHARS:
    p=ROOT/f"assets/characters/{c}/{c}_idle.png"
    if p.exists():
        front[c]=Image.open(p).convert("RGBA").crop((0,0,48,48)).getchannel("A")
def iou(a,b):
    A={i for i,v in enumerate(a.getdata()) if v>0}; B={i for i,v in enumerate(b.getdata()) if v>0}
    return len(A&B)/max(1,len(A|B))
for i,a in enumerate(CHARS):
    for b in CHARS[i+1:]:
        if a in front and b in front:
            v=iou(front[a],front[b])
            report.setdefault("pairwise_iou",{})[f"{a}/{b}"]=round(v,4)
            if v>=0.94: errors.append(f"silhouette collision {a}/{b}: {v:.3f}")

# Real renderer contract: source atlas cells stay 48px; visual draw can be 44px.
world=(ROOT/"js/render/world.js").read_text(encoding="utf-8")
if "frameW:48,frameH:48" not in world:
    errors.append("world renderer lost 48px atlas cell contract")
if "const drawSize=44" not in world:
    errors.append("world renderer lost 44px visual draw size")

out=ROOT/"prototype_artifacts/four_hero_appeal"
out.mkdir(parents=True,exist_ok=True)
(out/"metrics.json").write_text(json.dumps(report,indent=2),encoding="utf-8")

if errors:
    raise SystemExit("FOUR HERO APPEAL VERIFY FAIL\n"+"\n".join(errors))
print("FOUR HERO APPEAL VERIFY PASS")
