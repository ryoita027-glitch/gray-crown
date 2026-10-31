#!/usr/bin/env python3
"""Original-source Sophie shoulder-plane color study. Rejected art experiment."""
from pathlib import Path
import hashlib
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/characters/sophie/sophie_walk.png"
OUTPUT = ROOT / "assets/characters/sophie/studies/sophie_v6_shoulder_plane_no_go_walk.png"
BOARD = ROOT / "docs/art/evidence/sophie_v6_shoulder_plane_native44_AB.png"
SOURCE_BLOB = "47065a719b16b3da0c3f0f2457d69ccfcf8a8a04"

def main():
    raw = SOURCE.read_bytes()
    actual = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
    if actual != SOURCE_BLOB:
        raise RuntimeError("Source drift: " + actual)
    original = Image.open(SOURCE).convert("RGBA")
    assert original.size == (288, 192)
    result = original.copy()
    src, dst = original.load(), result.load()
    changes = [0, 0, 0, 0]
    for direction in range(4):
        for frame in range(6):
            for y in range(24, 37):
                for x in range(14, 35):
                    px, py = frame * 48 + x, direction * 48 + y
                    r, g, b, a = src[px, py]
                    cream = a == 255 and r >= 135 and -10 <= r-g <= 38 and 0 <= g-b <= 55 and b >= 75
                    if not cream:
                        continue
                    shoulder = (
                        ((15 <= x <= 21) or (28 <= x <= 33)) if direction in (0, 3)
                        else (18 <= x <= 24) if direction == 1 else (25 <= x <= 31)
                    )
                    collar = direction != 3 and 21 <= x <= 27 and 25 <= y <= 28
                    factor = 0.72 if shoulder and 27 <= y <= 34 else (
                        0.77 if collar else (
                            1.10 if direction != 3 and 22 <= x <= 27 and 30 <= y <= 34 else 1.0
                        )
                    )
                    if factor == 1.0:
                        continue
                    new = tuple(min(255, int(v * factor + 0.5)) for v in (r, g, b)) + (a,)
                    if new != src[px, py]:
                        dst[px, py] = new
                        changes[direction] += 1
    assert changes == [189, 106, 107, 54], changes
    for y in range(192):
        for x in range(288):
            a, b = src[x, y], dst[x, y]
            assert a[3] == b[3]
            if y % 48 < 24 or y % 48 > 36:
                assert a == b
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    result.save(OUTPUT, optimize=True)
    assert list(Image.open(OUTPUT).convert("RGBA").getdata()) == list(result.getdata())

    board = Image.new("RGBA", (704, 352), (94, 105, 89, 255))
    for row, sheet in enumerate((original, result)):
        for direction in range(4):
            for y in range(44):
                for x in range(44):
                    sx, sy = x * 48 // 44, y * 48 // 44
                    pixel = sheet.getpixel((sx, direction * 48 + sy))
                    for dy in range(4):
                        for dx in range(4):
                            bx, by = direction * 176 + x * 4 + dx, row * 176 + y * 4 + dy
                            alpha = pixel[3] / 255
                            bg = (94, 105, 89)
                            board.putpixel((bx, by), tuple(int(pixel[c] * alpha + bg[c] * (1-alpha) + .5) for c in range(3)) + (255,))
    BOARD.parent.mkdir(parents=True, exist_ok=True)
    board.save(BOARD, optimize=True)
    print("Sophie V6 shoulder study; changed by direction:", changes, "ART NO-GO")

if __name__ == "__main__":
    main()
