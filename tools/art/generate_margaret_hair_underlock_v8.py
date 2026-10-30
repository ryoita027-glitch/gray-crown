#!/usr/bin/env python3
"""Rebuild reversible Margaret V8 under-lock hair-shadow study (no production asset changes)."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/characters/margaret/studies/margaret_neck_collar_v7_front_study.png"
V2 = ROOT / "assets/characters/margaret/studies/margaret_original_contour_v2_walk.png"
TARGET = ROOT / "assets/characters/margaret/studies/margaret_hair_underlock_v8_walk.png"
EVIDENCE = ROOT / "docs/art/evidence"
SHADES = {
    (242, 238, 247): (216, 207, 229),
    (232, 216, 219): (201, 191, 195),
    (216, 207, 229): (184, 170, 205),
    (201, 191, 195): (184, 170, 205),
    (184, 170, 205): (139, 121, 166),
    (157, 145, 160): (139, 121, 166),
    (139, 121, 166): (83, 64, 110),
}


def in_underlock(direction, x, y):
    if direction == 0:
        return 28 <= y <= 34 and (
            11 + (y - 28) // 4 <= x <= 15 + (y - 28) // 4
            or 32 - (y - 28) // 5 <= x <= 36 - (y - 28) // 5
        )
    if direction == 1:
        return 29 <= y <= 37 and 29 - (y - 29) // 3 <= x <= 35 - (y - 29) // 4
    if direction == 2:
        return 29 <= y <= 37 and 13 + (y - 29) // 4 <= x <= 19 + (y - 29) // 3
    return 30 <= y <= 37 and (
        16 <= x <= 19 + (y - 30) // 3
        or 28 - (y - 30) // 3 <= x <= 32
    )


def native44(source, direction, frame):
    result = Image.new("RGBA", (44, 44), (94, 117, 87, 255))
    p = source.load()
    out = result.load()
    for y in range(44):
        for x in range(44):
            sx, sy = x * 48 // 44, y * 48 // 44
            r, g, b, a = p[frame * 48 + sx, direction * 48 + sy]
            bg = (94, 117, 87)
            out[x, y] = tuple((c * a + b0 * (255 - a) + 127) // 255 for c, b0 in zip((r, g, b), bg)) + (255,)
    return result


def contact(sources, directions, frames, filename):
    pad, cell = 8, 44
    width = len(sources) * cell + (len(sources) + 1) * pad
    height = len(directions) * cell + (len(directions) + 1) * pad
    sheet = Image.new("RGBA", (width, height), (94, 117, 87, 255))
    for row, direction in enumerate(directions):
        for col, source in enumerate(sources):
            sheet.paste(native44(source, direction, frames[row]),
                        (pad + col * (cell + pad), pad + row * (cell + pad)))
    sheet.save(EVIDENCE / filename)


def main():
    source = Image.open(SOURCE).convert("RGBA")
    assert source.size == (288, 192), source.size
    candidate = source.copy()
    pixels = candidate.load()
    counts = [0] * 4
    frame_counts = [[0] * 6 for _ in range(4)]
    for direction in range(4):
        for frame in range(6):
            for y in range(26, 39):
                for x in range(8, 40):
                    if not in_underlock(direction, x, y):
                        continue
                    px = frame * 48 + x
                    py = direction * 48 + y
                    r, g, b, a = pixels[px, py]
                    replacement = SHADES.get((r, g, b))
                    if replacement is None or a != 255:
                        continue
                    pixels[px, py] = replacement + (a,)
                    counts[direction] += 1
                    frame_counts[direction][frame] += 1
    assert counts == [226, 263, 316, 257], counts
    assert sum(counts) == 1062
    assert all(source.getchannel("A").tobytes() == candidate.getchannel("A").tobytes() for _ in (0,))
    assert all(n > 0 for row in frame_counts for n in row)
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    candidate.save(TARGET)
    assert Image.open(TARGET).convert("RGBA").tobytes() == candidate.tobytes()
    v2 = Image.open(V2).convert("RGBA")
    contact([v2, source, candidate], [0, 1, 2, 3], [0] * 4,
            "margaret_v2_v7_v8_44px_20261031.png")
    contact([source, candidate], [0] * 6, list(range(6)),
            "margaret_v7_v8_walk6_44px_20261031.png")
    print("V8 RGBA verified, alpha preserved, changed per direction:", counts)
    print("Changed per frame:", frame_counts)
    print("Art status: HOLD; Chromium and all-eight-action validation not performed")


if __name__ == "__main__":
    main()
