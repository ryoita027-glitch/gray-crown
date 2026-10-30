#!/usr/bin/env python3
"""Reproducible, isolated Margaret V10 temple-contour study (ART HOLD).

Uses V9 study as source. Never writes production sprites or gameplay files.
Default invocation verifies the committed V10 PNG; --write regenerates only
that isolated study image. A passing pixel audit is not aesthetic approval.
"""
import argparse
from pathlib import Path
from build_margaret_v9 import read_png, encode_png

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'assets/characters/margaret/studies/margaret_silver_planes_v9_walk.png'
DST = ROOT / 'assets/characters/margaret/studies/margaret_temple_contour_v10_walk.png'
STRIDE = 1 + 288 * 4


def is_skin(raw, p):
    r, g, b = raw[p:p + 3]
    return r > 155 and r - g > 18 and g - b > 7 and r - b > 28


def make_v10(raw):
    out = bytearray(raw)
    removed = [[0] * 6 for _ in range(4)]
    for direction in range(4):
        for frame in range(6):
            for y in range(15, 26):
                trim = 1 if y <= 17 or y >= 23 else 2
                start = (direction * 48 + y) * STRIDE + 1 + frame * 48 * 4
                visible = [x for x in range(48) if raw[start + x * 4 + 3]]
                if not visible or visible[-1] - visible[0] < 16:
                    continue
                for edge, step in ((visible[0], 1), (visible[-1], -1)):
                    count = 0
                    for offset in range(trim):
                        p = start + (edge + step * offset) * 4
                        if is_skin(raw, p):
                            break
                        out[p:p + 4] = b'\x00\x00\x00\x00'
                        count += 1
                        removed[direction][frame] += 1
                    if count:
                        p = start + (edge + step * count) * 4
                        if raw[p + 3] and not is_skin(raw, p):
                            out[p] = min(raw[p], 145)
                            out[p + 1] = min(raw[p + 1], 123)
                            out[p + 2] = min(raw[p + 2], 143)
    changed = alpha_changed = lower_body_changed = skin_changed = 0
    for row in range(192):
        for x in range(288):
            p = row * STRIDE + 1 + x * 4
            if raw[p:p + 4] != out[p:p + 4]:
                changed += 1
                alpha_changed += raw[p + 3] != out[p + 3]
                lower_body_changed += row % 48 >= 26
                skin_changed += is_skin(raw, p)
    if (changed, alpha_changed, lower_body_changed, skin_changed) != (1218, 768, 0, 0):
        raise ValueError(f'pixel contract mismatch: {changed}, {alpha_changed}, '
                         f'{lower_body_changed}, {skin_changed}')
    if any(count != 32 for direction in removed for count in direction):
        raise ValueError(f'directional walk contour not consistent: {removed}')
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    _, source = read_png(SRC)
    expected = make_v10(source)
    if args.write:
        DST.write_bytes(encode_png(expected))
        print('V10 isolated study regenerated; ART HOLD')
    else:
        _, current = read_png(DST)
        if current != expected:
            raise ValueError('V10 PNG does not match source-derived geometry')
        print('V10 pixel contract verified; ART HOLD, not approved')


if __name__ == '__main__':
    main()
