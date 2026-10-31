#!/usr/bin/env python3
"""Reproduce the Margaret V13 neck-bridge ART NO-GO PNG and native-44px A/B."""
from __future__ import annotations
import argparse
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/characters/margaret/studies/margaret_shoulder_mass_v11_walk.png"
OUTPUT = ROOT / "assets/characters/margaret/studies/margaret_neck_bridge_v13_diagnostic_walk.png"
EVIDENCE = ROOT / "docs/art/evidence/margaret_v11_v13_neck_bridge_native44_20261031.png"
SKIN, SHADE = (226, 198, 186, 255), (181, 148, 149, 255)
DARK, MID = (49, 37, 73, 255), (83, 64, 110, 255)
BACKGROUND = (64, 72, 69, 255)

def produce():
    source = Image.open(SOURCE).convert("RGBA")
    if source.size != (288, 192):
        raise ValueError(f"Expected 288x192 RGBA, got {source.size}")
    out = source.copy()
    sp, op = source.load(), out.load()
    def set_pixel(d, f, x, y, color):
        if 0 <= x < 48 and 0 <= y < 48:
            px, py = f * 48 + x, d * 48 + y
            if op[px, py][3]:
                op[px, py] = color
    def skin_xs(d, f, row):
        xs = []
        for x in range(15, 34):
            r, g, b, a = sp[f * 48 + x, d * 48 + row]
            if a and r > g + 10 and g > b + 3 and r > 175 and not (r > g + 30 and g > b + 40):
                xs.append(x)
        return xs
    for d in range(4):
        for f in range(6):
            if d == 0:
                xs = skin_xs(d, f, 26)
                c = int(sum(xs) / len(xs) + .5) if xs else 24
                edits = [(c-1,27,SKIN),(c,27,SHADE),(c-2,27,DARK),(c+1,27,DARK),
                         (c-2,28,MID),(c-1,28,DARK),(c,28,DARK),(c+1,28,MID)]
            elif d in (1, 2):
                xs = skin_xs(d, f, 23)
                c = int(sum(xs) / len(xs) + .5) if xs else (22 if d == 1 else 25)
                edits = [(c,26,SKIN),(c,27,SHADE),(c-1,27,DARK),(c+1,27,DARK),
                         (c-1,28,MID),(c,28,DARK),(c+1,28,MID)]
            else:
                edits = [(22,29,MID),(23,29,DARK),(24,29,DARK),(25,29,MID)]
            for x,y,color in edits:
                set_pixel(d, f, x, y, color)
    counts = []
    for d in range(4):
        count = 0
        for y in range(48):
            for x in range(288):
                old, new = sp[x,d*48+y], op[x,d*48+y]
                if old != new:
                    count += 1
                if old[3] != new[3] or (y < 23 or y >= 42) and old != new:
                    raise AssertionError("Alpha, upper face or footline changed")
        counts.append(count)
    if counts != [24,33,28,20]:
        raise AssertionError(f"Unexpected changes: {counts}")
    preview = Image.new("RGBA", (44*4*3,44*2*3), BACKGROUND)
    pp = preview.load()
    for variant, atlas in enumerate((source,out)):
        ap = atlas.load()
        for d in range(4):
            for y in range(44):
                sy = min(47,int((y+.5)*48/44))
                for x in range(44):
                    sx = min(47,int((x+.5)*48/44))
                    r,g,b,a = ap[sx,d*48+sy]
                    alpha = a/255
                    color = tuple(round(c*alpha+bg*(1-alpha)) for c,bg in zip((r,g,b),BACKGROUND[:3]))+(255,)
                    for dy in range(3):
                        for dx in range(3):
                            pp[(d*44+x)*3+dx,(variant*44+y)*3+dy] = color
    return out,preview,counts

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write",action="store_true",help="Write study only; never the live sprite")
    args = parser.parse_args()
    out,ab,counts = produce()
    if args.write:
        OUTPUT.parent.mkdir(parents=True,exist_ok=True)
        EVIDENCE.parent.mkdir(parents=True,exist_ok=True)
        out.save(OUTPUT,compress_level=0)
        ab.save(EVIDENCE,compress_level=0)
    else:
        for path,expected in ((OUTPUT,out),(EVIDENCE,ab)):
            if not path.is_file() or list(Image.open(path).convert("RGBA").getdata()) != list(expected.getdata()):
                raise AssertionError(f"Missing or mismatched study: {path}")
    print(f"ART NO-GO; 24 frames; changes {counts}; total {sum(counts)}; no production edits")

if __name__ == "__main__":
    main()
