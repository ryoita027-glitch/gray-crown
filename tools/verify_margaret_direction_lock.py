#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib,sys

ROOT=Path(__file__).resolve().parents[1]
PATH=ROOT/"docs/pixel/reference/margaret_chibi_direction_lock_v5_48.png"
EXPECTED_FILE_SHA256="88ee3bf7073f06d2717bab34d14a675033f4777b0bb18e2868dfe890695010b5"
EXPECTED_PIXEL_SHA256="0aacc491fde7b30b7b9dc524e59881570afa49f277e6a8718b51c1a92c0786bd"
EXPECTED_BBOX={
 "down":(9,3,39,47),
 "left":(9,3,39,47),
 "right":(9,3,39,47),
 "up":(10,3,38,47),
}
RUNTIME={
 "idle":"1650dcea48e0b09e91efb8c7feec75aae7d5003cb4114a2cd9f3ef862468ad83",
 "walk":"8a7f40356907ebfb91da86134404e9dc7c6ce8114bc635017251e7bf1bc48f52",
 "turn":"92dc87b456f732421a4ceb0ec8c937253c01cdc270aa3458f329494be9cb235d",
 "talk":"7947b369cae06f2d4ae841ab4be5189b37ab149d8b2fb92734ef5f7696229b14",
 "surprise":"448c501d2e9b34d1669ac254cb16e1bfebedff70f77b58e1c3b346ab35c093f4",
 "approach":"1e94ab24602fe82a5c23b0f7b1852aec790d0ead4709263ac60c7933b3e1560c",
 "laugh":"776f9a634eead9f0fd38741d2966aea82149853622f1545d153578bd432fbe78",
 "run":"e73eb141543296d5651ea2e1cda2a59cc4c4187425628baf99a2e3f3c27b9881",
}
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
errors=[]

if not PATH.exists():
    errors.append(f"missing Margaret direction lock: {PATH.relative_to(ROOT)}")
else:
    file_sha=hashlib.sha256(PATH.read_bytes()).hexdigest()
    if file_sha!=EXPECTED_FILE_SHA256: errors.append(f"Margaret v5 file hash mismatch: {file_sha}")
    with Image.open(PATH) as im:
        rgba=im.convert("RGBA")
        if rgba.size!=(192,48): errors.append(f"Margaret v5 size mismatch: {rgba.size}")
        pixel_sha=hashlib.sha256(rgba.tobytes()).hexdigest()
        if pixel_sha!=EXPECTED_PIXEL_SHA256: errors.append(f"Margaret v5 pixel hash mismatch: {pixel_sha}")
        for i,name in enumerate(("down","left","right","up")):
            cell=rgba.crop((48*i,0,48*(i+1),48))
            bbox=cell.getbbox()
            if bbox!=EXPECTED_BBOX[name]: errors.append(f"Margaret {name} bbox {bbox} != {EXPECTED_BBOX[name]}")

for name,expected_hash in RUNTIME.items():
    p=ROOT/f"assets/characters/margaret/margaret_{name}.png"
    if not p.exists():
        errors.append(f"missing Margaret runtime sheet: {p.relative_to(ROOT)}");continue
    h=hashlib.sha256(p.read_bytes()).hexdigest()
    if h!=expected_hash: errors.append(f"Margaret {name} runtime hash changed: {h}")
    with Image.open(p) as im:
        if im.mode!="RGBA": errors.append(f"Margaret {name} mode {im.mode} != RGBA")
        expected=(48*FRAMES[name],192)
        if im.size!=expected: errors.append(f"Margaret {name} size {im.size} != {expected}")

if errors:
    print("MARGARET DIRECTION LOCK v5 VERIFY FAIL",file=sys.stderr)
    for e in errors:print(" -",e,file=sys.stderr)
    sys.exit(1)

print("MARGARET CHIBI DIRECTION LOCK v5 PASS")
print("face-preserving source + eight runtime sheets pinned")
