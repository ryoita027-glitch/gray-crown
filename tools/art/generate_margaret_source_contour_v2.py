#!/usr/bin/env python3
"""Reproduce reversible Margaret V2 source-contour pixel study; Pillow only."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/characters/margaret/margaret_walk.png"
V1 = ROOT / "assets/characters/margaret/studies/margaret_original_face_planes_v1_walk.png"
OUT = ROOT / "assets/characters/margaret/studies/margaret_original_contour_v2_walk.png"
AB = ROOT / "docs/art/evidence/margaret_original_v1_contour_v2_44px_ab_20261030.png"
C = {
    "skin": (226, 198, 186, 255), "shade": (181, 148, 149, 255),
    "light": (245, 219, 207, 255), "eye": (70, 53, 67, 255),
    "hairL": (230, 224, 216, 255), "hairM": (201, 191, 195, 255),
    "hairS": (157, 145, 160, 255), "collar": (79, 63, 83, 255),
}
FRONT = [
    (21,18,"shade"),(22,18,"light"),(23,18,"light"),(24,18,"light"),(25,18,"shade"),
    (21,19,"skin"),(22,19,"eye"),(23,19,"skin"),(24,19,"eye"),(25,19,"skin"),
    (21,20,"shade"),(22,20,"skin"),(23,20,"skin"),(24,20,"skin"),(25,20,"shade"),
    (22,21,"shade"),(23,21,"skin"),(24,21,"shade"),(23,22,"shade"),
    (23,23,"skin"),(23,24,"shade"),(23,25,"skin"),(24,25,"shade"),
    (20,27,"collar"),(21,28,"collar"),(26,28,"collar"),(27,27,"collar"),
]
SIDE = [
    (19,18,"light"),(20,18,"light"),(19,19,"skin"),(20,19,"skin"),
    (21,19,"shade"),(19,20,"eye"),(20,20,"skin"),(21,20,"shade"),
    (20,21,"skin"),(21,21,"shade"),(21,22,"shade"),(22,23,"skin"),
    (22,24,"shade"),(22,25,"skin"),(21,27,"collar"),(22,28,"collar"),
]

def build():
    source = Image.open(SOURCE).convert("RGBA")
    assert source.size == (288, 192), source.size
    out = source.copy()
    for direction in range(4):
        for frame in range(6):
            ox, oy = frame * 48, direction * 48
            for y in range(11, 29):
                for x in range(13, 36):
                    r, g, b, a = source.getpixel((ox + x, oy + y))
                    if a < 220:
                        continue
                    if b > r + 9 and b > g + 8 and r > 166 and g > 150:
                        avg = (r + g + b) / 3
                        tone = "hairL" if avg > 218 else "hairM" if avg > 191 else "hairS"
                        if (x + y + frame) % 7 != 0:
                            out.putpixel((ox + x, oy + y), C[tone])
            if direction == 0:
                patches = FRONT
            elif direction in (1, 2):
                patches = [(47 - x if direction == 2 else x, y, color)
                           for x, y, color in SIDE]
            else:
                patches = []
            for x, y, color in patches:
                if source.getpixel((ox + x, oy + y))[3] > 0:
                    out.putpixel((ox + x, oy + y), C[color])
    assert list(source.getchannel("A").getdata()) == list(out.getchannel("A").getdata())
    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT)
    return source, out

def build_ab(source, out):
    v1 = Image.open(V1).convert("RGBA")
    assert v1.size == source.size == out.size
    ab = Image.new("RGBA", (200, 248))
    for y in range(248):
        for x in range(200):
            ab.putpixel((x, y), (90,114,86,255) if ((x >> 4) + (y >> 4)) % 2 else (96,122,92,255))
    for d in range(4):
        for col, im in enumerate((source, v1, out)):
            for y in range(44):
                for x in range(44):
                    c = im.getpixel((int(x*48/44), d*48 + int(y*48/44)))
                    if c[3]:
                        ab.putpixel((8 + col*60 + x, 10 + d*58 + y), c)
    AB.parent.mkdir(parents=True, exist_ok=True)
    ab.save(AB)

if __name__ == "__main__":
    src, candidate = build()
    build_ab(src, candidate)
    print("Wrote", OUT.relative_to(ROOT), AB.relative_to(ROOT))
    print("Source alpha unchanged; 4 directions x 6 walk frames retained")
