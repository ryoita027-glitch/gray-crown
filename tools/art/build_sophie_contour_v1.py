#!/usr/bin/env python3
"""Reproduce reversible Sophie silhouette diagnostic; do not overwrite production."""
from pathlib import Path
from PIL import Image
import sys

def cuts(d, y):
    if d == 0:
        if 14 <= y <= 25: return (1, 1)
        if 26 <= y <= 30: return (1, 2)
    if d == 1:
        if 10 <= y <= 28: return (0, 2)
        if 29 <= y <= 31: return (0, 1)
    if d == 2:
        if 10 <= y <= 28: return (2, 0)
        if 29 <= y <= 31: return (1, 0)
    if d == 3:
        if 12 <= y <= 20: return (1, 1)
        if 21 <= y <= 29: return (2, 2)
        if 30 <= y <= 31: return (1, 1)
    return (0, 0)

def build(source, output):
    original = Image.open(source).convert("RGBA")
    assert original.size == (288, 192)
    edited = original.copy()
    src, dst = original.load(), edited.load()
    for d in range(4):
        for f in range(6):
            for y in range(48):
                lc, rc = cuts(d, y)
                if not (lc or rc): continue
                ry, fx = d * 48 + y, f * 48
                xs = [x for x in range(48) if src[fx + x, ry][3] > 127]
                if not xs or xs[-1] - xs[0] < 21: continue
                left, right = xs[0], xs[-1]
                for amount, side in ((lc, "left"), (rc, "right")):
                    if not amount: continue
                    outer = left if side == "left" else right
                    inner = left + amount if side == "left" else right - amount
                    outline = src[fx + outer, ry]
                    for step in range(amount):
                        x = left + step if side == "left" else right - step
                        dst[fx + x, ry] = (0, 0, 0, 0)
                    dst[fx + inner, ry] = outline
    output.parent.mkdir(parents=True, exist_ok=True)
    edited.save(output)

if __name__ == "__main__":
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("assets/characters/sophie/sophie_walk.png")
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("assets/characters/sophie/studies/sophie_contour_v1_walk.png")
    build(src, dst)
