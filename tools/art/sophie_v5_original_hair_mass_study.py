#!/usr/bin/env python3
"""Original-Sophie 24-frame hair-mass optical study. ART HOLD, never replaces production."""
from __future__ import annotations
import hashlib
import math
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/characters/sophie/sophie_walk.png"
OUTPUT = ROOT / "assets/characters/sophie/studies/sophie_v5_original_hair_mass_hold_walk.png"
PREVIEW = ROOT / "docs/art/evidence/sophie_v5_original_hair_mass_native44_AB.png"
EXPECTED_BLOB = "47065a719b16b3da0c3f0f2457d69ccfcf8a8a04"

def is_hair(p):
    r, g, b, a = p
    return a == 255 and r > g * 1.12 and g > b * 1.02 and 60 <= r <= 235 and 35 <= g <= 178 and b < 150

def main():
    raw = SOURCE.read_bytes()
    blob = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
    if blob != EXPECTED_BLOB:
        raise RuntimeError(f"Source drift: {blob}; expected {EXPECTED_BLOB}")
    original = Image.open(SOURCE).convert("RGBA")
    if original.size != (288, 192):
        raise RuntimeError(f"Unexpected atlas: {original.size}")
    result = original.copy()
    src = original.load()
    dst = result.load()
    changed = [0, 0, 0, 0]
    for direction in range(4):
        for frame in range(6):
            for y in range(23, 36):
                for x in range(8, 41):
                    if 17 < x < 31:
                        continue
                    px = frame * 48 + x
                    py = direction * 48 + y
                    color = src[px, py]
                    if not is_hair(color):
                        continue
                    neighbors = []
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            xx, yy = x + dx, y + dy
                            if not (8 <= xx <= 40 and 23 <= yy <= 35):
                                continue
                            c = src[frame * 48 + xx, direction * 48 + yy]
                            if is_hair(c):
                                neighbors.append(c[:3])
                    if len(neighbors) < 6:
                        continue
                    med = tuple(sorted(c[k] for c in neighbors)[len(neighbors) // 2] for k in range(3))
                    if max(abs(color[k] - med[k]) for k in range(3)) < 25:
                        continue
                    new = tuple(math.floor(color[k] * .35 + med[k] * .65 + .5) for k in range(3)) + (color[3],)
                    dst[px, py] = new
                    changed[direction] += 1
    for direction in range(4):
        for frame in range(6):
            for y in range(48):
                for x in range(48):
                    px, py = frame * 48 + x, direction * 48 + y
                    a, b = src[px, py], dst[px, py]
                    if a[3] != b[3] or ((y < 23 or y > 35) and a != b):
                        raise RuntimeError("Face, footline or alpha modified")
    if sum(changed) != 1635:
        raise RuntimeError(f"Unexpected change count: {changed}")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    result.save(OUTPUT, optimize=True)
    assert list(Image.open(OUTPUT).convert("RGBA").getdata()) == list(result.getdata())
    # Two rows: original above, isolated study below. Four directions, frame 0,
    # identical green backdrop and 48 -> 44 nearest-neighbor source sampling.
    scale, cell, gap = 4, 44, 8
    width, height = (cell * 4 + gap * 3) * scale, (cell * 2 + gap) * scale
    board = Image.new("RGBA", (width, height), (94, 105, 89, 255))
    for version, sheet in enumerate((original, result)):
        for direction in range(4):
            tile = Image.new("RGBA", (44, 44))
            for y in range(44):
                for x in range(44):
                    sx = min(47, (x * 48) // 44)
                    sy = min(47, (y * 48) // 44)
                    tile.putpixel((x, y), sheet.getpixel((sx, direction * 48 + sy)))
            board.alpha_composite(tile.resize((176, 176), Image.Resampling.NEAREST),
                                  (direction * (cell + gap) * scale, version * (cell + gap) * scale))
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    board.save(PREVIEW, optimize=True)
    print({"source_git_blob": blob, "changed_by_direction": changed,
           "changed_total": sum(changed), "alpha_and_face_and_footline": "preserved",
           "status": "ART HOLD; NOT a production replacement"})

if __name__ == "__main__":
    main()
