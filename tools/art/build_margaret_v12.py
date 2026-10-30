#!/usr/bin/env python3
"""Reproducible Margaret V12 *diagnostic only*. ART NO-GO, never runtime."""
import argparse
from pathlib import Path
from build_margaret_v9 import read_png, encode_png

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'assets/characters/margaret/studies/margaret_shoulder_mass_v11_walk.png'
DST = ROOT / 'assets/characters/margaret/studies/margaret_proportion_v12_diagnostic_walk.png'
STRIDE = 1153
SKIP_CROWN = (11, 14, 17)
DUPLICATE_TORSO = (28, 33, 37)
ROW_MAP = tuple([y for y in range(27) if y not in SKIP_CROWN] +
                [v for y in range(27, 48) for v in ([y, y] if y in DUPLICATE_TORSO else [y])])

def remap(source):
    if len(ROW_MAP) != 48:
        raise AssertionError('bad row mapping')
    out = bytearray(source)
    for direction in range(4):
        for frame in range(6):
            for dst_y, src_y in enumerate(ROW_MAP):
                a = (direction*48 + src_y)*STRIDE + 1 + frame*192
                b = (direction*48 + dst_y)*STRIDE + 1 + frame*192
                out[b:b+192] = source[a:a+192]
    return out

def audit(source, candidate):
    count = 0
    frame_changes = [0]*24
    for row in range(192):
        for x in range(288):
            p = row*STRIDE + 1 + x*4
            if source[p:p+4] != candidate[p:p+4]:
                count += 1
                frame_changes[(row//48)*6+x//48] += 1
                if row%48 >= 42:
                    raise AssertionError('footline was changed')
    if count != 11081 or not all(frame_changes):
        raise AssertionError(f'pixel contract: {count}, {frame_changes}')
    for direction in range(4):
        for frame in range(6):
            for y in range(18, 27):
                dst_y = ROW_MAP.index(y)
                a = (direction*48+y)*STRIDE+1+frame*192
                b = (direction*48+dst_y)*STRIDE+1+frame*192
                if source[a:a+192] != candidate[b:b+192]:
                    raise AssertionError('face row lost')
    return count

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--write', action='store_true')
    args = p.parse_args()
    _, source = read_png(SRC)
    expected = remap(source)
    count = audit(source, expected)
    if args.write:
        DST.write_bytes(encode_png(expected))
        print(f'Wrote V12 diagnostic; {count} pixels; ART NO-GO')
    else:
        _, existing = read_png(DST)
        if existing != expected:
            raise AssertionError('V12 candidate PNG not reproducible')
        print(f'V12 diagnostic verified; {count} pixels; ART NO-GO')
if __name__ == '__main__':
    main()
