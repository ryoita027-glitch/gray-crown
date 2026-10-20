#!/usr/bin/env python3
"""Rebuild Karen's three unapproved 48x56 face-composition studies.

Input: 4-direction first-idle-frame sprite from Phase 1B.
4-direction rows are independently padded 8px ABOVE original 48x48 pixels.
The original body and feet keep their physical field positions when renderer
uses the original 48px width and places the padded candidate top 8px higher.

No official sprite or game save is overwritten by this generator.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'assets/character_parts/karen_face_phase1b/karen_pixel_exact_reference_4dir.png'
OUTPUT=ROOT/'assets/character_parts/karen_face_phase1b/variants'
W,OLD_H,NEW_H,PAD,DIRS=48,48,56,8,4

FRINGE={
    (24,13):(168,55,51), (25,13):(171,57,53),
    (23,14):(195,77,66), (24,14):(184,66,60),
    (25,14):(186,68,60), (24,15):(180,65,57)
}
FACE={
    (19,15):(247,229,211), (29,16):(247,231,212),
    (21,16):(144,47,39), (28,16):(145,48,40),
    (20,17):(253,212,184), (29,17):(252,210,184),
    (19,16):(248,216,188), (30,16):(250,223,197),
    (21,18):(254,220,194), (27,18):(252,227,198),
    (23,18):(255,220,189), (26,18):(255,225,195),
    (23,19):(255,228,198), (26,19):(255,231,204),
    (23,20):(244,162,128), (24,20):(244,161,130)
}
JAW={
    (22,19):(252,228,198), (27,19):(252,225,195),
    (24,18):(244,138,124), (25,18):(222,104,92)
}
NAMES={
    'reference':'karen_reference_padded_48x56_4dir.png',
    'eyes':'karen_A_eye_clarity_48x56_4dir.png',
    'crown':'karen_B_crown_space_48x56_4dir.png',
    'balanced':'karen_C_balanced_48x56_4dir.png'
}

def padded(source:Image.Image)->Image.Image:
    if source.mode!='RGBA' or source.size!=(48,192):
        raise ValueError('Expected Karen source-first-pose RGBA 48x192')
    out=Image.new('RGBA',(48,56*4))
    for direction in range(DIRS):
        row=source.crop((0,direction*48,48,(direction+1)*48))
        out.paste(row,(0,direction*56+PAD))
    return out

def recolor(im:Image.Image,patch):
    for (x,y),rgb in patch.items():
        xx,yy=x,y+PAD
        before=im.getpixel((xx,yy))
        if before[3]<120:
            raise ValueError(f'Would draw into transparent face: {(x,y)}')
        im.putpixel((xx,yy),(*rgb,before[3]))

def add_crown(im:Image.Image):
    # Extend the original crown silhouette 2px upwards, rather than
    # applying nonuniform scale to the entire character and its body.
    for d in range(DIRS):
        origin_y=d*NEW_H+PAD
        candidates=[]
        for x in range(W):
            r,g,b,a=im.getpixel((x,origin_y))
            if a>180 and r>g*1.13 and r>b*1.1:
                candidates.append(x)
        if not candidates:
            raise ValueError(f'No red-hair crown found in direction {d}')
        low,high=min(candidates),max(candidates)
        for k in (1,2):
            for x in range(low+k-1,high-k+2):
                xx=max(low,min(high,x))
                color=im.getpixel((xx,origin_y))
                if color[3]>128:
                    im.putpixel((x,origin_y-k),color)

def pixel_diff(before:Image.Image,after:Image.Image):
    a=before.tobytes();b=after.tobytes()
    coords=[]
    for i in range(0,len(a),4):
        if a[i:i+4]!=b[i:i+4]:
            coords.append(((i//4)%48,(i//4)//48))
    return coords

def run(source:Image.Image):
    original=padded(source)
    eyes=original.copy()
    recolor(eyes,{**FRINGE,**FACE})
    crown=original.copy()
    recolor(crown,FRINGE)
    add_crown(crown)
    balanced=original.copy()
    recolor(balanced,{**FRINGE,**FACE,**JAW})
    add_crown(balanced)
    out=dict(reference=original,eyes=eyes,crown=crown,balanced=balanced)
    for key,im in out.items():
        if im.size!=(48,224):raise AssertionError(key)
        for d in range(DIRS):
            # The original 48px art MUST be held in the same place in every
            # direction, apart from explicitly documented front-face edits.
            for y in range(48):
                for x in range(48):
                    if d==0 and key!='reference' and (x,y) in (
                        {**FRINGE,**FACE,**(JAW if key=='balanced' else {})}
                        if key!='crown' else FRINGE
                    ):
                        continue
                    if im.getpixel((x,d*56+PAD+y))!=source.getpixel((x,d*48+y)):
                        raise AssertionError((key,d,x,y))
    assert len(pixel_diff(original,eyes))==22
    assert len(pixel_diff(original,crown))>=28
    assert len(pixel_diff(original,balanced))>=48
    return out

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source',type=Path,default=SOURCE)
    parser.add_argument('--out',type=Path,default=OUTPUT)
    opts=parser.parse_args()
    source=Image.open(opts.source).convert('RGBA')
    output=run(source)
    opts.out.mkdir(parents=True,exist_ok=True)
    for name,image in output.items():
        image.save(opts.out/NAMES[name],optimize=True)
    manifest={
        'status':'DRAFT_NOT_APPROVED','source':str(SOURCE.relative_to(ROOT)),
        'source_sha_git_blob':'782785fd504a4baba92be4ff099a827dd1ecac81',
        'cell':[48,56],'original_source_cell':[48,48],
        'original_top_padding':PAD,'source_directions':['down','left','right','up'],
        'original_body_and_feet_aligned':True,
        'candidate_changes':{k:len(pixel_diff(output['reference'],v)) for k,v in output.items()},
        'images':NAMES,'quality_accepted':False
    }
    (opts.out/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps(manifest,ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
