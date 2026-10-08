#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib

ROOT=Path(__file__).resolve().parents[1]
ANIMS={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
LOCKED={
 "karen":{
  "idle":"bf7a390fc2c67e42b59f2def7001b1108e7bc79d750fd9ff8fceb76240941eec",
  "walk":"e0a45ea82cb2c166318714dcf00145d8db2ebff3438a54243feeb973e756306e",
  "turn":"0406d87e564fcc68ed4b7f1a6b690bc08e25f21e85f3f3a9c338b8cd2acabb7e",
  "talk":"30111a65aba8d8a6c9fc897eb433ee977815754670be13083cbe2c193c1ce4d1",
  "surprise":"bbc6efa67e3933034497fad0322be6d5cc612d780bba55b2174743f9c796a369",
  "approach":"e002cee2c4e75d88f423ddc64b9ed49a07e3640759bb7292773a01fd1b56cdbc",
  "laugh":"bfa4f169ebef57fc95d6b6be33c82f61153b76786afe79cd8df6fe70297c4c3a",
  "run":"937c86f0bff73d3fcb112121cf49f29ac535abd743677b95f930e434c8e815be"},
 "triton":{
  "idle":"38a931c402cc539903d24876ac396705c19ddc510dc0fde04df9aadb0998c12c",
  "walk":"b63bab9ba2c382b41a3eacce029962764331fe861469f9ad98f639a667d8a048",
  "turn":"888886fa2705cf624bbb8a9155b48a923bfc116c63aecfce8c8604c0f841414a",
  "talk":"de65ded566cd36aebef5d0aeee621e97327f7f98466fc178b75ea7353d58f49f",
  "surprise":"5a85e74ccaa4cc4c1256dbb365e574520c28b4b3213a846fdba4f60faa2443c5",
  "approach":"1066c4df939a7d6775abf91d2466d5bbacdb4194935e059c3537ee04f1738417",
  "laugh":"2e9e4c5bdfb1c5999ea07e209ec3f95603a2e4dc1bf4b2991976aa97577cc1b9",
  "run":"1a59d7fea868fa10aca112a8a19d15c52c991fb7de671d8cbd37c89a2b9dfea7"}
}
errors=[]

for char,hashes in LOCKED.items():
    for anim,expected in hashes.items():
        p=ROOT/f"assets/characters/{char}/{char}_{anim}.png"
        if not p.exists():
            errors.append(f"missing locked {p.relative_to(ROOT)}");continue
        got=hashlib.sha256(p.read_bytes()).hexdigest()
        if got!=expected: errors.append(f"{char} {anim} changed: {got}")

for char in ("sophie","margaret"):
    ref=ROOT/f"docs/pixel/reference/{'sophie_chibi_direction_appeal_v3_48.png' if char=='sophie' else 'margaret_chibi_direction_appeal_v7_48.png'}"
    r=Image.open(ref).convert("RGBA")
    for anim,n in ANIMS.items():
        p=ROOT/f"assets/characters/{char}/{char}_{anim}.png"
        if not p.exists():
            errors.append(f"missing {p.relative_to(ROOT)}");continue
        im=Image.open(p).convert("RGBA")
        if im.size!=(48*n,192): errors.append(f"{char} {anim} size {im.size}")
        bad=[a for a in set(im.getchannel("A").getdata()) if a not in (0,255)]
        if bad: errors.append(f"{char} {anim} semitransparent alpha {sorted(bad)[:8]}")
        for row in range(4):
            for f in range(n):
                cell=im.crop((48*f,48*row,48*(f+1),48*(row+1)))
                if not cell.getbbox(): errors.append(f"{char} {anim} row {row} frame {f} empty")
        # Idle frame 0 in each row must be the appeal direction source exactly.
        if anim=="idle":
            for row in range(4):
                actual=im.crop((0,48*row,48,48*(row+1)))
                expected=r.crop((48*row,0,48*(row+1),48))
                if actual.tobytes()!=expected.tobytes():
                    errors.append(f"{char} idle direction {row} != appeal source")

party=ROOT/"assets/hero_party_walk.png"
if not party.exists():
    errors.append("hero_party_walk missing")
else:
    im=Image.open(party).convert("RGBA")
    if im.size!=(96,512): errors.append(f"hero_party_walk size {im.size}")
    bad=[a for a in set(im.getchannel("A").getdata()) if a not in (0,255)]
    if bad: errors.append(f"hero_party_walk semitransparent alpha {sorted(bad)[:8]}")

meta=(ROOT/"js/data/animations.js").read_text(encoding="utf-8")
for token in ("sophie-chibi-direction-appeal-v3","margaret-chibi-direction-appeal-v7"):
    if token not in meta: errors.append(f"animations.js missing {token}")

if errors:
    raise SystemExit("FOUR PROTAGONIST APPEAL RUNTIME FAIL\n"+"\n".join(errors))
print("FOUR PROTAGONIST APPEAL RUNTIME PASS")
print("Karen/Triton exact bytes preserved; Sophie/Margaret appeal sources fully propagated.")
