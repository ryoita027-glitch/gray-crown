#!/usr/bin/env python3
"""Rebuild the reversible Margaret V3 head/neck experiment (Pillow only).

The experiment is intentionally NOT approved for runtime.
"""
from pathlib import Path
from math import floor
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ORIGINAL = ROOT / "assets/characters/margaret/margaret_walk.png"
V2 = ROOT / "assets/characters/margaret/studies/margaret_original_contour_v2_walk.png"
OUTPUT = ROOT / "assets/characters/margaret/studies/margaret_pose_face_v3_walk.png"
EVIDENCE = ROOT / "docs/art/evidence/margaret_original_v2_pose_v3_44px_ab_20261030.png"
COLORS = {
    "skin": (223, 194, 181), "light": (241, 213, 200),
    "shade": (174, 141, 144), "eye": (73, 54, 68),
    "hair": (177, 167, 177), "edge": (109, 91, 113),
    "collar": (84, 67, 88),
}
FRONT = [
    (21,18,"hair"),(22,18,"light"),(23,18,"light"),(24,18,"light"),(25,18,"hair"),
    (21,19,"shade"),(22,19,"skin"),(23,19,"skin"),(24,19,"skin"),(25,19,"shade"),
    (21,20,"shade"),(22,20,"eye"),(23,20,"skin"),(24,20,"eye"),(25,20,"shade"),
    (21,21,"hair"),(22,21,"skin"),(23,21,"skin"),(24,21,"skin"),(25,21,"hair"),
    (22,22,"shade"),(23,22,"skin"),(24,22,"shade"),
    (22,23,"hair"),(23,23,"shade"),(24,23,"hair"),
    (23,24,"skin"),(23,25,"shade"),
    (22,26,"collar"),(23,26,"collar"),(24,26,"collar"),
]
SIDE = [
    (19,18,"light"),(20,18,"light"),(21,18,"hair"),
    (19,19,"skin"),(20,19,"skin"),(21,19,"shade"),
    (19,20,"skin"),(20,20,"eye"),(21,20,"shade"),
    (19,21,"hair"),(20,21,"skin"),(21,21,"shade"),
    (20,22,"shade"),(21,22,"skin"),(22,22,"hair"),
    (21,23,"skin"),(22,23,"shade"),
    (22,24,"skin"),(22,25,"shade"),
    (21,26,"collar"),(22,26,"collar"),
]

def build():
    original = Image.open(ORIGINAL).convert("RGBA")
    v2 = Image.open(V2).convert("RGBA")
    assert original.size == v2.size == (288, 192)
    candidate = v2.copy()
    for direction in range(3):  # back silhouette/face deliberately untouched
        for frame in range(6):
            ox, oy = frame * 48, direction * 48
            xs = [x for y in range(9, 19) for x in range(17, 31)
                  if original.getpixel((ox+x, oy+y))[3] > 180]
            shift = max(-1, min(1, floor(sum(xs) / len(xs) - 23.5 + 0.5))) if xs else 0
            patches = FRONT if direction == 0 else (
                SIDE if direction == 1 else [(47-x, y, c) for x,y,c in SIDE]
            )
            for x, y, name in patches:
                x += shift
                px, py = ox+x, oy+y
                if original.getpixel((px, py))[3] == 0:
                    continue
                r, g, b = COLORS[name]
                candidate.putpixel((px, py), (r, g, b, candidate.getpixel((px, py))[3]))
    assert original.getchannel("A").tobytes() == candidate.getchannel("A").tobytes()
    changes = sum(original.getpixel((x,y)) != candidate.getpixel((x,y))
                  for y in range(192) for x in range(288))
    assert changes > 0
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    candidate.save(OUTPUT)
    return original, v2, candidate

def evidence(images):
    bg = Image.new("RGBA", (200,248))
    for y in range(248):
        for x in range(200):
            bg.putpixel((x,y), (90,114,86,255) if ((x>>4)+(y>>4))%2 else (96,122,92,255))
    for direction in range(4):
        for col, img in enumerate(images):
            for y in range(44):
                for x in range(44):
                    c = img.getpixel((int(x*48/44), direction*48 + int(y*48/44)))
                    if c[3]:
                        bg.putpixel((8+col*60+x,10+direction*58+y),c)
    EVIDENCE.parent.mkdir(parents=True, exist_ok=True)
    bg.save(EVIDENCE)

if __name__ == "__main__":
    imgs = build()
    evidence(imgs)
    print("Generated experimental V3 and 44px A/B; ART NO-GO, not runtime-approved.")
