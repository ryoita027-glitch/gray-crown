#!/usr/bin/env python3
"""Rebuild isolated Margaret V7 front-neck/collar art from the V2 source (Pillow).
Not a production asset or a visual acceptance test.
"""
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/characters/margaret/studies/margaret_original_contour_v2_walk.png'
OUT = ROOT / 'assets/characters/margaret/studies/margaret_neck_collar_v7_front_study.png'
AB = ROOT / 'docs/art/evidence/margaret_v7_neck_collar_native44_ab_20261031.png'
FRONT = ROOT / 'docs/art/evidence/margaret_v7_neck_collar_front6_native44_20261031.png'
COLORS = {"K":[49,37,73],"P":[83,64,110],"M":[139,121,166],"L":[184,170,205],"S":[226,198,186],"T":[181,148,149],"G":[220,177,86]}
PATCH = [[22,24,"T"],[25,24,"T"],[21,25,"K"],[22,25,"T"],[23,25,"S"],[24,25,"S"],[25,25,"T"],[26,25,"K"],[21,26,"P"],[22,26,"K"],[23,26,"S"],[24,26,"S"],[25,26,"K"],[26,26,"P"],[20,27,"P"],[21,27,"L"],[22,27,"M"],[23,27,"K"],[24,27,"K"],[25,27,"M"],[26,27,"L"],[27,27,"P"],[19,28,"K"],[20,28,"M"],[21,28,"L"],[22,28,"P"],[23,28,"K"],[24,28,"K"],[25,28,"P"],[26,28,"L"],[27,28,"M"],[28,28,"K"],[19,29,"P"],[20,29,"L"],[21,29,"M"],[22,29,"P"],[23,29,"G"],[24,29,"G"],[25,29,"P"],[26,29,"M"],[27,29,"L"],[28,29,"P"],[18,30,"K"],[19,30,"M"],[20,30,"L"],[21,30,"P"],[26,30,"P"],[27,30,"L"],[28,30,"M"],[29,30,"K"]]
def compare(original, candidate, frames):
    gap=6
    sheet=Image.new('RGBA',(106,len(frames)*44+(len(frames)+1)*gap),(94,117,87,255))
    for row,(direction,frame) in enumerate(frames):
        for col,atlas in enumerate((original,candidate)):
            for y in range(44):
                for x in range(44):
                    pixel=atlas.getpixel((frame*48+x*48//44,direction*48+y*48//44))
                    if pixel[3]:
                        target=(gap+col*50+x,gap+row*50+y)
                        bg=sheet.getpixel(target)
                        a=pixel[3]/255
                        sheet.putpixel(target,tuple(round(pixel[k]*a+bg[k]*(1-a)) for k in range(3))+(255,))
    return sheet
def main():
    source=Image.open(SOURCE).convert('RGBA')
    assert source.size==(288,192)
    out=source.copy()
    count=0
    for frame in range(6):
        for x,y,key in PATCH:
            pos=(frame*48+x,y)
            original=source.getpixel(pos)
            if original[3]<128: continue
            out.putpixel(pos,tuple(COLORS[key])+(original[3],))
            count+=1
    assert count==300,count
    assert source.getchannel('A').tobytes()==out.getchannel('A').tobytes()
    for direction in (1,2,3):
        assert source.crop((0,direction*48,288,(direction+1)*48)).tobytes()==out.crop((0,direction*48,288,(direction+1)*48)).tobytes()
    for d in range(4):
        for f in range(6):
            assert out.crop((f*48,d*48,(f+1)*48,(d+1)*48)).getbbox()
    for path in (OUT,AB,FRONT): path.parent.mkdir(parents=True,exist_ok=True)
    out.save(OUT)
    compare(source,out,[(d,0) for d in range(4)]).save(AB)
    compare(source,out,[(0,f) for f in range(6)]).save(FRONT)
    assert Image.open(OUT).convert('RGBA').tobytes()==out.tobytes()
    print('V7 front collar candidate generated; art acceptance HOLD')
if __name__=='__main__': main()
