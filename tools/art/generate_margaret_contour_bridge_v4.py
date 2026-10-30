#!/usr/bin/env python3
"""Rebuild Margaret V4 contour/shoulder bridge experiment from the actual V2 PNG.

Requires Pillow. This is a reversible ART HOLD candidate, not production art.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/characters/margaret/studies/margaret_original_contour_v2_walk.png"
V3 = ROOT / "assets/characters/margaret/studies/margaret_pose_face_v3_walk.png"
OUTPUT = ROOT / "assets/characters/margaret/studies/margaret_contour_bridge_v4_walk.png"
EVIDENCE = ROOT / "docs/art/evidence/margaret_v2_v3_contour_v4_44px_ab_20261030.png"

def build():
    v2 = Image.open(SOURCE).convert("RGBA")
    v3 = Image.open(V3).convert("RGBA")
    assert v2.size == v3.size == (288, 192)
    out = v2.copy()
    removed = added = shadow = 0
    per_direction = []
    for direction in range(4):
        changed = 0
        for frame in range(6):
            ox, oy = frame * 48, direction * 48
            def pix(x, y):
                return out.getpixel((ox+x, oy+y))
            def put(x, y, rgba):
                out.putpixel((ox+x, oy+y), rgba)
            bounds = {}
            for y in range(12, 29):
                xs = [x for x in range(8, 40) if pix(x, y)[3] > 160]
                bounds[y] = (xs[0], xs[-1]) if xs else None
            for y in range(14, 23):
                if not bounds[y]:
                    continue
                sides = ("left", "right") if direction in (0, 3) else (
                    ("right",) if direction == 1 else ("left",))
                for side in sides:
                    x = bounds[y][0] if side == "left" else bounds[y][1]
                    dx = 1 if side == "left" else -1
                    if x < 9 or x > 38 or pix(x+dx, y)[3] == 0:
                        continue
                    if y <= 18 or (y <= 21 and (y+frame) % 2 == 0):
                        old, inside = pix(x, y), pix(x+dx, y)
                        if old[3]:
                            put(x, y, (0, 0, 0, 0))
                            removed += 1
                            changed += 1
                        if inside[3] > 180 and inside[0] > 150 and inside[1] > 140:
                            put(x+dx, y, (max(85, int(inside[0]*0.77+0.5)),
                                          max(80, int(inside[1]*0.77+0.5)),
                                          max(92, int(inside[2]*0.80+0.5)), inside[3]))
                            shadow += 1
                            changed += 1
            for y in range(23, 28):
                if not bounds[y]:
                    continue
                sides = ("left", "right") if direction in (0, 3) else (
                    ("right",) if direction == 1 else ("left",))
                for side in sides:
                    if (y+frame) % 3 == 0:
                        continue
                    x = bounds[y][0] if side == "left" else bounds[y][1]
                    dx = -1 if side == "left" else 1
                    if x < 11 or x > 36:
                        continue
                    inside = pix(x, y)
                    nx = x + dx
                    if pix(nx, y)[3] != 0:
                        continue
                    if pix(nx, y+1)[3] == 0 and pix(nx, y-1)[3] == 0:
                        continue
                    put(nx, y, (max(72, int(inside[0]*0.62+0.5)),
                                max(67, int(inside[1]*0.62+0.5)),
                                max(83, int(inside[2]*0.69+0.5)), inside[3]))
                    added += 1
                    changed += 1
        per_direction.append(changed)
    diff = sum(a != b for a, b in zip(v2.getdata(), out.getdata()))
    alpha_diff = sum(a[3] != b[3] for a, b in zip(v2.getdata(), out.getdata()))
    # Match the offline JS pixel transform's positive-number Math.round exactly.
    assert (diff, alpha_diff, removed, added, shadow) == (452, 300, 234, 66, 152), (
        diff, alpha_diff, removed, added, shadow)
    assert per_direction == [144, 88, 76, 144], per_direction
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUTPUT)
    return v2, v3, out

def make_evidence(images):
    bg = Image.new("RGBA", (204, 248))
    px = bg.load()
    for y in range(248):
        for x in range(204):
            px[x, y] = (90, 114, 86, 255) if ((x>>4)+(y>>4)) % 2 else (96, 122, 92, 255)
    for d in range(4):
        for col, im in enumerate(images):
            for y in range(44):
                for x in range(44):
                    rgba = im.getpixel((int(x*48/44), d*48+int(y*48/44)))
                    if rgba[3]:
                        px[8+col*64+x, 10+d*58+y] = rgba
    EVIDENCE.parent.mkdir(parents=True, exist_ok=True)
    bg.save(EVIDENCE)

if __name__ == "__main__":
    make_evidence(build())
    print("Margaret V4 288x192 + native 44px V2/V3/V4 comparison generated; ART HOLD.")
