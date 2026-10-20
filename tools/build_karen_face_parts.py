#!/usr/bin/env python3
"""Source-faithful Karen FACE-PART pilot (unapproved art, isolated assets).

Usage:
  python tools/build_karen_face_parts.py
  python tools/build_karen_face_parts.py --out prototype_artifacts/karen_face_parts

Only idle frame zero of each direction is decomposed. Every nontransparent
pixel belongs to EXACTLY ONE independent layer. This deliberately avoids a
generic square crop, and guarantees the unedited reconstruction equals source.
Additional expression/beauty retouch is a separate approval step.
"""
from __future__ import annotations
import argparse
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/characters/karen/karen_idle.png'
PARTS = ('hairBack', 'body', 'head', 'eyes', 'mouth', 'hairFront')
DIRECTIONS = ('down', 'left', 'right', 'up')
CELL = 48

def skin(r,g,b):
    # The existing PNG contains variable anti-aliased colours, not flat fills.
    return r >= 176 and g >= 101 and b >= 74 and g >= r*.53 and b >= g*.60

def hair(r,g,b):
    return r >= 50 and r > g*1.12 and r > b*1.07 and g < 125 and b < 125

def classify(x,y,pixel,direction):
    """Non-overlapping source assignment; not a claim of perfect anatomy."""
    r,g,b,a=pixel
    if a == 0:
        return None
    central = direction=='down' and 17 <= x <= 33
    if central and 13 <= y <= 19 and skin(r,g,b):
        # Eyes and mouth sublayers retain *authored pixels*; no new eye colour.
        if 14 <= y <= 17 and 20 <= x <= 30:
            return 'eyes'
        if 18 <= y <= 20 and 21 <= x <= 30:
            return 'mouth'
        return 'head'
    if central and 10 <= y <= 24 and skin(r,g,b):
        return 'head'
    if y < 16 and hair(r,g,b):
        return 'hairFront' if 17<=x<=32 else 'hairBack'
    if y < 34 and hair(r,g,b):
        return 'hairBack' if (x<=18 or x>=31 or y>=20) else 'hairFront'
    # Back-facing and side views have no universal visible-eye geometry.
    if direction in ('left','right') and y < 22 and skin(r,g,b) and 15<=x<=33:
        return 'head'
    if direction=='up' and y < 26 and hair(r,g,b):
        return 'hairBack'
    return 'body'

def extract(source):
    assert source.size==(192,192),f'Expected 192x192 original idle, got {source.size}'
    assert source.mode=='RGBA','Expected the untouched RGBA source'
    # Four 48x192 atlases; each row is an independent, editable 48px PNG.
    layers={part:Image.new('RGBA',(48,192)) for part in PARTS}
    rebuilt=Image.new('RGBA',(48,192))
    for dir_index,direction in enumerate(DIRECTIONS):
        original=source.crop((0,dir_index*48,48,(dir_index+1)*48))
        for y in range(48):
            for x in range(48):
                rgba=original.getpixel((x,y))
                part=classify(x,y,rgba,direction)
                if part is None:
                    continue
                pos=(x,y+48*dir_index)
                layers[part].putpixel(pos,rgba)
                rebuilt.putpixel(pos,rgba)
                if sum(layers[p].getpixel(pos)[3]>0 for p in PARTS)!=1:
                    raise AssertionError(f'Layer overlap at {pos}')
        assert rebuilt.crop((0,dir_index*48,48,(dir_index+1)*48)).tobytes()==original.tobytes(), f'Pixel-perfect {direction} reconstruction failed'
    return layers,rebuilt

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source',type=Path,default=SOURCE)
    parser.add_argument('--out',type=Path,default=ROOT/'prototype_artifacts/karen_face_parts')
    args=parser.parse_args()
    original=Image.open(args.source).convert('RGBA')
    layers,reconstruction=extract(original)
    args.out.mkdir(parents=True,exist_ok=True)
    for name,image in layers.items():
        image.save(args.out/f'karen_{name}_4dir.png',optimize=True)
    reconstruction.save(args.out/'karen_pixel_exact_original_pose_4dir.png',optimize=True)
    # One frontal fringe micro-study: six authored RED hair pixels only.
    # Independent hairFront layer and four-direction composite are kept in sync.
    # The rest of the face, 3 other directions and all original sheets are untouched.
    edits = {
        (24,13):(168,55,51), (25,13):(171,57,53),
        (23,14):(195,77,66), (24,14):(184,66,60),
        (25,14):(186,68,60), (24,15):(180,65,57),
    }
    face_candidate = reconstruction.copy()
    hair_candidate = layers['hairFront'].copy()
    for pos,rgb in edits.items():
        orig_rgba=hair_candidate.getpixel(pos)
        assert orig_rgba[3]>120,('Not a frontal hair pixel',pos)
        changed=(*rgb,orig_rgba[3])
        hair_candidate.putpixel(pos,changed)
        face_candidate.putpixel(pos,changed)
    face_candidate.save(args.out/'karen_fringe_readability_candidate_4dir.png',optimize=True)
    hair_candidate.save(args.out/'karen_hairFront_fringe_candidate_4dir.png',optimize=True)
    counts={name:sum(p[3]>0 for p in image.getdata()) for name,image in layers.items()}
    assert all(count>0 for count in counts.values()),counts
    print('PHASE1B SOURCE-FAITHFUL PARTS PASS: 4 dirs / 6 layers / exact visible pixels',counts)
    print('NO FINAL ART ACCEPTANCE; do not replace idle.png or walk.png.')

if __name__=='__main__':
    main()
