#!/usr/bin/env python3
"""Verify the exact approved hero sprite sheets contain no frame-edge clipping.

The sole purpose is mechanical preservation of four existing pixel identities.
This does NOT invent, recolor, alter, or regenerate any game image.
"""
from pathlib import Path
from PIL import Image
import hashlib, json, sys

ROOT=Path(__file__).resolve().parents[1]
HEROES=('karen','triton','sophie','margaret')
FRAMES={'idle':4,'walk':6,'turn':3,'talk':4,'surprise':4,
        'approach':4,'laugh':6,'run':6}

def verify():
    report={'characters':list(HEROES),'sprite_sheets':0,
            'frames_inspected':0,'clipped_frames':[],'errors':[],
            'sha256':{}}
    for hero in HEROES:
        for action,count in FRAMES.items():
            path=ROOT/'assets'/'characters'/hero/(hero+'_'+action+'.png')
            rel=path.relative_to(ROOT).as_posix()
            if not path.is_file():
                report['errors'].append('MISSING '+rel)
                continue
            data=path.read_bytes()
            report['sha256'][rel]=hashlib.sha256(data).hexdigest()
            with Image.open(path) as original:
                im=original.convert('RGBA')
                if original.mode!='RGBA':
                    report['errors'].append('NOT_RGBA '+rel)
                expected=(count*48,4*48)
                if im.size!=expected:
                    report['errors'].append('WRONG_GRID '+rel+' expected='+str(expected)
                                            +' actual='+str(im.size))
                    continue
                report['sprite_sheets']+=1
                for row in range(4):
                    for col in range(count):
                        cell=im.crop((col*48,row*48,(col+1)*48,(row+1)*48))
                        bounds=cell.getchannel('A').getbbox()
                        report['frames_inspected']+=1
                        if not bounds:
                            report['errors'].append('EMPTY_FRAME '+rel+f' [{row},{col}]')
                        elif bounds[0]==0 or bounds[2]==48:
                            report['clipped_frames'].append(
                                rel+f' row={row} frame={col} bbox={bounds}')
    if report['clipped_frames']:
        report['errors'].append('LEFT_OR_RIGHT_SPRITE_EDGE_TOUCH')
    report['ok']=not report['errors'] and report['sprite_sheets']==32 and report['frames_inspected']==592
    return report

if __name__=='__main__':
    result=verify()
    print(json.dumps({k:v for k,v in result.items() if k!='sha256'},ensure_ascii=False,indent=2))
    sys.exit(0 if result['ok'] else 1)
