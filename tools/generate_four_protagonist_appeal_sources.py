#!/usr/bin/env python3
"""Generate appeal-upgrade direction sources for Sophie and Margaret.

Karen and Triton are already the visual quality controls and are not redrawn.
Sophie receives a readability/role-color polish without changing her approved
identity. Margaret receives the larger upgrade: v2 face-readable source,
stronger violet/gold mage palette, explicit readable eyes, clearer high
ponytail ornament, shorter chibi body and a small book/arcane accessory cue.

All outputs remain exact 48x48-cell pixel sources.
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageChops

ROOT=Path(__file__).resolve().parents[1]
CELL=48

SOPHIE_SRC=ROOT/"docs/pixel/reference/sophie_chibi_direction_lock_v2_48.png"
SOPHIE_OUT=ROOT/"docs/pixel/reference/sophie_chibi_direction_appeal_v3_48.png"
MARGARET_SRC=ROOT/"docs/pixel/reference/margaret_chibi_direction_lock_v2_48.png"
MARGARET_OUT=ROOT/"docs/pixel/reference/margaret_chibi_direction_appeal_v7_48.png"

def binary_alpha(im):
    im=im.convert("RGBA")
    out=Image.new("RGBA",im.size,(0,0,0,0))
    sp=im.load();op=out.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=sp[x,y]
            if a>=128: op[x,y]=(r,g,b,255)
    return out

def external_outline(cell,color):
    alpha=cell.getchannel("A")
    dil=alpha.filter(ImageFilter.MaxFilter(3))
    mask=ImageChops.subtract(dil,alpha)
    ol=Image.new("RGBA",cell.size,color)
    ol.putalpha(mask)
    out=Image.new("RGBA",cell.size,(0,0,0,0))
    out.alpha_composite(ol)
    out.alpha_composite(cell)
    return out

def build_sophie():
    src=binary_alpha(Image.open(SOPHIE_SRC))
    if src.size!=(192,48):
        raise SystemExit(f"unexpected Sophie source size: {src.size}")
    out=src.copy()
    for di in range(4):
        xo=di*48
        for y in range(48):
            for x in range(48):
                r,g,b,a=src.getpixel((xo+x,y))
                if not a: continue
                # muted green -> clearer healer/herbal accent
                if g>=b+8 and g>=r-25 and r<125 and g<135 and b<100:
                    lum=(r+g+b)/3
                    col=(67,88,58) if lum<85 else (92,112,76)
                    out.putpixel((xo+x,y),(*col,255))
                # dark leather/edge -> slightly crisper warm contour
                elif r<100 and g<80 and b<65:
                    col=(67,45,37) if r>55 else (50,33,30)
                    out.putpixel((xo+x,y),(*col,255))
                # cream clothing lift
                elif r>190 and g>175 and b>150 and y>20:
                    out.putpixel((xo+x,y),(241,229,204,255))

    staged=Image.new("RGBA",(192,48),(0,0,0,0))
    for di in range(4):
        c=out.crop((di*48,0,(di+1)*48,48))
        staged.alpha_composite(external_outline(c,(73,49,39,255)),(di*48,0))
    out=staged

    def p(d,x,y,c): out.putpixel((d*48+x,y),(*c,255))
    deep=(61,54,39); green=(74,104,68); green2=(108,139,88)
    eyehi=(244,236,208); blush=(211,126,111)

    # Front readable calm eyes + tiny warm mouth.
    for x,y,c in [
        (19,18,deep),(20,18,green2),(20,17,eyehi),
        (27,18,deep),(26,18,green2),(26,17,eyehi),
        (23,22,blush),(24,22,(185,96,88)),
        (34,15,green2),(35,16,green),(34,17,green),
    ]: p(0,x,y,c)
    for x,y,c in [(18,18,deep),(19,18,green2),(19,17,eyehi),(35,16,green2)]:
        p(1,x,y,c)
    for x,y,c in [(29,18,deep),(28,18,green2),(28,17,eyehi),(13,16,green2)]:
        p(2,x,y,c)
    for x,y,c in [(22,18,green),(23,19,green2),(24,19,green2),(25,18,green)]:
        p(3,x,y,c)

    out=binary_alpha(out)
    SOPHIE_OUT.parent.mkdir(parents=True,exist_ok=True)
    out.save(SOPHIE_OUT,optimize=False)
    return out

def build_margaret():
    src=binary_alpha(Image.open(MARGARET_SRC))
    if src.size!=(192,48):
        raise SystemExit(f"unexpected Margaret source size: {src.size}")
    recolor=src.copy()

    # Stronger silver-lavender + indigo/plum + old-gold palette.
    for di in range(4):
        xo=di*48
        for y in range(48):
            for x in range(48):
                r,g,b,a=src.getpixel((xo+x,y))
                if not a: continue
                skin=r>220 and g>165 and b>145 and r>g+15
                goldish=r>120 and g>70 and g<170 and b<100 and r>g
                pale=r>145 and b>145 and abs(r-b)<45 and g>120
                lum=(r+g+b)/3
                if goldish:
                    col=(210,165,82) if lum>120 else (133,94,47)
                    recolor.putpixel((xo+x,y),(*col,255))
                elif pale and not skin:
                    if lum>220: col=(242,238,247)
                    elif lum>190: col=(216,207,229)
                    elif lum>160: col=(184,170,205)
                    else: col=(139,121,166)
                    recolor.putpixel((xo+x,y),(*col,255))
                elif y>=22 and not skin and lum<145:
                    if lum<45: col=(35,27,52)
                    elif lum<75: col=(49,37,73)
                    elif lum<105: col=(66,49,91)
                    else: col=(83,64,110)
                    recolor.putpixel((xo+x,y),(*col,255))

    def p(im,d,x,y,c): im.putpixel((d*48+x,y),(*c,255))
    deep=(45,30,65); iris=(139,93,182); hi=(245,232,255)
    gold=(220,177,86); gold2=(151,105,49); blush=(220,135,139)
    plum=(74,48,102)

    # Front: readable violet eyes, friendly mouth, hair ornament, brooch and book cue.
    for x in (19,20): p(recolor,0,x,16,deep)
    p(recolor,0,19,17,iris);p(recolor,0,20,17,hi)
    for x in (27,28): p(recolor,0,x,16,deep)
    p(recolor,0,27,17,hi);p(recolor,0,28,17,iris)
    p(recolor,0,19,14,(108,85,124));p(recolor,0,28,14,(108,85,124))
    p(recolor,0,23,21,blush);p(recolor,0,24,21,(194,105,120))
    for x,y in [(23,4),(24,4),(23,5),(24,5)]: p(recolor,0,x,y,gold)
    p(recolor,0,22,5,gold2);p(recolor,0,25,5,gold2)
    for x,y in [(22,24),(25,24),(23,25),(24,25)]: p(recolor,0,x,y,gold2)
    p(recolor,0,23,24,(132,75,175));p(recolor,0,24,24,(178,110,220))
    p(recolor,0,23,31,gold);p(recolor,0,24,31,gold)
    for x in range(15,18):
        for y in range(31,35):
            p(recolor,0,x,y,plum if x<17 else deep)
    p(recolor,0,15,31,gold);p(recolor,0,16,31,gold);p(recolor,0,17,33,gold2)

    for x,y,c in [
        (17,17,deep),(18,17,iris),(18,16,hi),(22,5,gold),(23,5,gold),
        (18,25,gold2),(19,25,(153,91,196)),(16,32,gold)
    ]: p(recolor,1,x,y,c)
    for x,y,c in [
        (29,17,deep),(28,17,iris),(28,16,hi),(25,5,gold),(24,5,gold),
        (29,25,gold2),(28,25,(153,91,196)),(31,32,gold)
    ]: p(recolor,2,x,y,c)
    for x,y,c in [
        (23,5,gold),(24,5,gold),(22,6,gold2),(25,6,gold2),
        (23,30,gold2),(24,30,gold2),(20,35,gold),(27,35,gold)
    ]: p(recolor,3,x,y,c)

    # More charming chibi proportion: preserve face/head pixels 1:1, shorten lower body.
    final=Image.new("RGBA",(192,48),(0,0,0,0))
    for di in range(4):
        cell=recolor.crop((di*48,0,(di+1)*48,48))
        bb=cell.getbbox()
        reg=cell.crop(bb)
        head_h=22
        head=reg.crop((0,0,reg.width,head_h))
        body=reg.crop((0,18,reg.width,reg.height))
        body=body.resize((body.width+2,max(1,body.height-4)),Image.Resampling.NEAREST)
        stage=Image.new("RGBA",(max(head.width,body.width)+2,40),(0,0,0,0))
        cx=stage.width//2
        stage.alpha_composite(body,(cx-body.width//2,40-body.height))
        stage.alpha_composite(head,(cx-head.width//2,0))
        crop=stage.crop(stage.getbbox())
        dst=Image.new("RGBA",(48,48),(0,0,0,0))
        dst.alpha_composite(crop,((48-crop.width)//2,47-crop.height))
        final.alpha_composite(dst,(di*48,0))

    final=binary_alpha(final)
    MARGARET_OUT.parent.mkdir(parents=True,exist_ok=True)
    final.save(MARGARET_OUT,optimize=False)
    return final

def main():
    s=build_sophie()
    m=build_margaret()
    print("FOUR PROTAGONIST APPEAL SOURCES GENERATED")
    for name,im,path in [
        ("Sophie",s,SOPHIE_OUT),("Margaret",m,MARGARET_OUT)
    ]:
        print(name,path.relative_to(ROOT),im.size)
        for i,d in enumerate(("down","left","right","up")):
            bb=im.crop((i*48,0,(i+1)*48,48)).getbbox()
            print(" ",d,bb)

if __name__=="__main__":
    main()
