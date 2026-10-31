"""Field worker V3b: restrained hand-selected material/face pixel study (ART HOLD).
Run from repo root: python tools/art/field_worker_v3b_face_material_pilot.py
Requires free Pillow. No production files are overwritten.
"""
from pathlib import Path
from hashlib import sha1
from PIL import Image
import json

SRC = Path("assets/npc/field_worker_style_study_v2_48x192.png")
V5 = Path("assets/npc/featured_residents_charm_v5.png")
DST = Path("assets/npc/studies/field_worker_v3b_face_material_HOLD_48x192.png")
BOARD = Path("docs/art/evidence/field_worker_v2_v3b_farmer_mayor_native44_HOLD.png")
SOURCE_BLOB = "a39fd00215fb227c4031d3fbf53f2ebe182ca2c9"
V5_BLOB = "b169b58a846e1812dc42f566ca1843a6088e901f"
PALETTE = {"a":[215,187,137,255],"b":[174,139,94,255],"c":[85,68,55,255],"d":[68,82,66,255],"e":[100,120,94,255],"f":[156,170,135,255],"g":[218,204,170,255],"h":[169,139,109,255],"i":[193,144,114,255],"j":[119,81,66,255],"k":[91,73,59,255]}
EDITS = [[[5,18,"aaa"],[6,16,"aab"],[8,15,"bb"],[9,20,"ddd"],[10,19,"cc"],[15,19,"kk"],[15,26,"k"],[18,19,"i"],[18,27,"i"],[20,24,"j"],[22,22,"hh"],[23,23,"k"],[24,20,"gg"],[25,20,"g"],[26,21,"hg"],[27,22,"ge"],[28,20,"dd"],[29,20,"ef"],[30,19,"de"],[31,18,"dd"],[31,29,"ee"],[32,29,"dd"],[33,17,"bbb"],[34,20,"kk"],[36,18,"b"],[38,18,"b"],[39,27,"b"],[43,16,"cc"],[43,29,"cc"]],[[5,20,"aa"],[8,20,"bb"],[10,21,"cc"],[15,20,"k"],[19,21,"i"],[22,21,"j"],[24,20,"f"],[26,21,"g"],[27,21,"e"],[29,22,"d"],[30,22,"d"],[31,22,"e"],[32,23,"h"],[34,21,"bb"],[39,20,"b"],[40,27,"c"]],[[5,20,"aa"],[8,22,"bb"],[10,23,"cc"],[15,27,"k"],[18,27,"i"],[20,25,"j"],[24,27,"f"],[26,27,"g"],[28,25,"d"],[29,24,"e"],[30,24,"e"],[32,24,"d"],[34,25,"bb"],[38,27,"b"],[40,19,"c"]],[[5,19,"aa"],[8,16,"bb"],[9,21,"cc"],[23,18,"dd"],[24,19,"ee"],[25,20,"ff"],[26,21,"ed"],[27,22,"dd"],[28,24,"ee"],[29,26,"d"],[30,20,"h"],[32,20,"bb"],[33,21,"b"],[37,18,"b"],[39,27,"b"],[43,20,"cc"]]]
def git_blob(path):
    data = path.read_bytes()
    return sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
if git_blob(SRC) != SOURCE_BLOB or git_blob(V5) != V5_BLOB:
    raise RuntimeError("Reference PNG changed; abort without writing")
source = Image.open(SRC).convert("RGBA")
v5 = Image.open(V5).convert("RGBA")
assert source.size == (48, 192) and v5.size == (432, 192)
candidate = source.copy()
for direction, rows in enumerate(EDITS):
    for y, x, keys in rows:
        for dx, key in enumerate(keys):
            pos = (x + dx, direction * 48 + y)
            if source.getpixel(pos)[3] == 255:
                candidate.putpixel(pos, tuple(PALETTE[key]))
for y in range(192):
    for x in range(48):
        assert source.getpixel((x,y))[3] == candidate.getpixel((x,y))[3]
DST.parent.mkdir(parents=True, exist_ok=True)
candidate.save(DST)
board = Image.new("RGB", (176, 176), (98,98,98))
for direction in range(4):
    for column in range(4):
        image = source if column == 0 else candidate if column == 1 else v5
        sx = 0 if column < 2 else (48 if column == 2 else 144)
        for yy in range(44):
            for xx in range(44):
                px = sx + (xx * 2 + 1) * 48 // 88
                py = direction * 48 + (yy * 2 + 1) * 48 // 88
                rgba = image.getpixel((px,py))
                a = rgba[3] / 255
                rgb = tuple(round(rgba[i]*a + 98*(1-a)) for i in range(3))
                board.putpixel((column*44+xx,direction*44+yy), rgb)
BOARD.parent.mkdir(parents=True, exist_ok=True)
board.save(BOARD)
print("Wrote unapproved four-direction art study and 44px A/B board")
