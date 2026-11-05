#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib,subprocess,sys

ROOT=Path(__file__).resolve().parents[1]
P=ROOT/"docs/pixel/reference/triton_chibi_direction_lock_v1.png"
EXPECTED="e8ec4ffd3061ad2b3bad1d465b6199a32bf5ab9ea18027ac26426acda0920060"
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
errors=[]

if not P.exists():
 errors.append("missing Triton Chibi Direction Lock v1")
else:
 data=P.read_bytes()
 if hashlib.sha256(data).hexdigest()!=EXPECTED:errors.append("direction-lock PNG hash changed")
 with Image.open(P) as im:
  if im.mode!="RGBA":errors.append(f"mode {im.mode} != RGBA")
  if im.size!=(192,48):errors.append(f"size {im.size} != (192,48)")
  else:
   for i,name in enumerate(("down","left","right","up")):
    box=im.crop((i*48,0,(i+1)*48,48)).getchannel("A").getbbox()
    if not box:errors.append(f"{name} cell empty")
    elif box[3]>46:errors.append(f"{name} feet exceed normalized bound: {box}")

tracked=set(subprocess.check_output(["git","ls-files","assets/characters/triton/*.png"],cwd=ROOT,text=True).splitlines())
for name,count in FRAMES.items():
 rel=f"assets/characters/triton/triton_{name}.png"
 p=ROOT/rel
 if rel not in tracked:errors.append(f"runtime sheet is not tracked: {rel}")
 if not p.exists():errors.append(f"missing runtime sheet: {rel}");continue
 with Image.open(p) as im:
  if im.mode!="RGBA":errors.append(f"{rel} mode {im.mode} != RGBA")
  expected=(48*count,192)
  if im.size!=expected:errors.append(f"{rel} size {im.size} != {expected}")

if errors:
 print("TRITON DIRECTION LOCK FAIL",file=sys.stderr)
 for e in errors:print(" -",e,file=sys.stderr)
 sys.exit(1)

print("TRITON CHIBI DIRECTION LOCK v1 PASS")
print("sha256",EXPECTED)
print("tracked runtime sheets",len(FRAMES))
