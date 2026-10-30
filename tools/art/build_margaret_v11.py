#!/usr/bin/env python3
"""Rebuild isolated Margaret V11 shoulder-hair study. ART HOLD."""
import argparse
from pathlib import Path
from build_margaret_v9 import read_png, encode_png
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'assets/characters/margaret/studies/margaret_silver_planes_v9_walk.png'
DST=ROOT/'assets/characters/margaret/studies/margaret_shoulder_mass_v11_walk.png'
STRIDE=1153
def make_v11(raw):
    out=bytearray(raw)
    recolor=removed=0
    for direction in range(4):
        for frame in range(6):
            for y in range(7,36):
                start=(direction*48+y)*STRIDE+1+frame*48*4
                for x in range(48):
                    p=start+x*4
                    r,g,b,a=raw[p:p+4]
                    if a and r>125 and g>100 and b>r+6 and b>g+12:
                        out[p+2]=min(255,r+3)
                        out[p+1]=min(255,g+2)
                        recolor+=1
                if not 25<=y<=34:continue
                visible=[x for x in range(48) if raw[start+x*4+3]]
                if not visible:continue
                if direction==0:left,right=(1 if y>=31 else 0),(3 if y<=30 else 2)
                elif direction==1:left,right=(1 if y>=28 else 0),2
                elif direction==2:left,right=2,(1 if y>=28 else 0)
                else:left,right=1,1
                for edge,step,limit in ((visible[0],1,left),(visible[-1],-1,right)):
                    for offset in range(limit):
                        p=start+(edge+step*offset)*4
                        r,g,b,a=raw[p:p+4]
                        if not(a and r>135 and g>105 and b>120):break
                        out[p:p+4]=bytes(4)
                        removed+=1
    changed=alpha=body=skin=0
    frames=[0]*24
    for row in range(192):
        for x in range(288):
            p=row*STRIDE+1+x*4
            if raw[p:p+4]==out[p:p+4]:continue
            changed+=1
            frames[(row//48)*6+x//48]+=1
            alpha+=raw[p+3]!=out[p+3]
            body+=row%48>=36
            r,g,b=raw[p:p+3]
            skin+=r>155 and r-g>18 and g-b>7 and r-b>28
    if (recolor,removed,changed,alpha,body,skin)!=(866,533,1399,533,0,0):
        raise ValueError('V11 source pixel contract mismatch')
    if not all(frames):raise ValueError('Missing directional walk frame')
    return out
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--write',action='store_true')
    args=parser.parse_args()
    _,source=read_png(SRC)
    expected=make_v11(source)
    if args.write:
        DST.write_bytes(encode_png(expected))
        print('V11 study written, ART HOLD')
    else:
        _,current=read_png(DST)
        if current!=expected:raise ValueError('V11 output mismatch')
        print('V11 source-derived pixel verification PASS, ART HOLD')
if __name__=='__main__':main()
