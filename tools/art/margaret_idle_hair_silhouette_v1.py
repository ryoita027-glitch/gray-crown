#!/usr/bin/env python3
"""Reversible Margaret idle hair-mass trial; source PNG is never overwritten."""
from __future__ import annotations
import argparse
import math
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/characters/margaret/margaret_idle.png'
CANDIDATE = ROOT / 'docs/art/evidence/margaret_idle_hair_silhouette_v1_48x192.png'
BOARD = ROOT / 'docs/art/evidence/margaret_idle_hair_silhouette_v1_native44_AB.png'

def remap_x(direction: int, x: int, y: int) -> int:
    taper = min(1.0, max(0.0, (y - 23) / 7)) * min(1.0, max(0.0, (42 - y) / 7))
    nearest = lambda v: math.floor(v + 0.5)
    if direction == 0 and x >= 28:
        return 28 + nearest((x - 28) * (1 - 0.28 * taper))
    if direction == 1 and x <= 18:
        return 18 - nearest((18 - x) * (1 - 0.23 * taper))
    if direction == 2 and x >= 29:
        return 29 + nearest((x - 29) * (1 - 0.23 * taper))
    if direction == 3 and x <= 15:
        return 15 - nearest((15 - x) * (1 - 0.15 * taper))
    if direction == 3 and x >= 31:
        return 31 + nearest((x - 31) * (1 - 0.15 * taper))
    return x

def make_candidate(source: Image.Image) -> Image.Image:
    if source.size != (192, 192):
        raise ValueError(f'Unexpected idle sheet size: {source.size}')
    source = source.convert('RGBA')
    output = Image.new('RGBA', source.size)
    source_px, output_px = source.load(), output.load()
    for direction in range(4):
        for frame in range(4):
            for y in range(48):
                for x in range(48):
                    color = source_px[frame * 48 + x, direction * 48 + y]
                    if color[3]:
                        target_x = remap_x(direction, x, y)
                        output_px[frame * 48 + target_x, direction * 48 + y] = color
    return output

def make_board(source: Image.Image, candidate: Image.Image) -> Image.Image:
    board = Image.new('RGBA', (88, 176), (0, 0, 0, 255))
    for direction in range(4):
        for variant, image in enumerate((source, candidate)):
            for y in range(44):
                for x in range(44):
                    sx, sy = (x * 48) // 44, (y * 48) // 44
                    r, g, b, a = image.getpixel((sx, direction * 48 + sy))
                    bg = 100 if ((x // 4 + y // 4) % 2) else 120
                    rgb = tuple(math.floor(v * a / 255 + bg * (1 - a / 255) + 0.5) for v in (r, g, b))
                    board.putpixel((variant * 44 + x, direction * 44 + y), (*rgb, 255))
    return board

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='verify trial without writing files')
    args = parser.parse_args()
    source = Image.open(SOURCE).convert('RGBA')
    candidate = make_candidate(source)
    changed = sum(source.getpixel((x, y)) != candidate.getpixel((x, y))
                  for y in range(192) for x in range(192))
    if changed != 604:
        raise AssertionError(f'Unexpected pixel change count: {changed} (expected 604)')
    for d in range(4):
        for f in range(4):
            for y in list(range(24)) + list(range(42, 48)):
                for x in range(48):
                    p = (f * 48 + x, d * 48 + y)
                    if source.getpixel(p) != candidate.getpixel(p):
                        raise AssertionError(f'Protected face/feet pixel changed: {p}')
    board = make_board(source, candidate)
    if not args.check:
        CANDIDATE.parent.mkdir(parents=True, exist_ok=True)
        candidate.save(CANDIDATE)
        board.save(BOARD)
    print(f'Margaret idle trial: {changed} changed RGBA pixels, 16 frames, protected y0-23/y42-47 PASS')

if __name__ == '__main__':
    main()
