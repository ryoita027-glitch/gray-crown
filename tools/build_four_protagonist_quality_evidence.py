#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import json, math, statistics

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"/"four_protagonist_quality"
OUT.mkdir(parents=True,exist_ok=True)
CELL=48
MEDIUM=44
CHARS=("karen","triton","sophie","margaret")
LABELS={"karen":"Karen","triton":"Triton","sophie":"Sophie","margaret":"Margaret"}
ANIMS={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
DIRS=("down","left","right","up")

def font(size=16):
    try: return ImageFont.truetype("DejaVuSans.ttf",size)
    except Exception: return ImageFont.load_default()

def runtime_frame(character,anim="idle",frame=0,direction=0):
    path=ROOT/f"assets/characters/{character}/{character}_{anim}.png"
    im=Image.open(path).convert("RGBA")
    return im.crop((frame*CELL,direction*CELL,(frame+1)*CELL,(direction+1)*CELL))

def margaret_v5_sheet():
    path=ROOT/"docs/pixel/reference/margaret_chibi_direction_lock_v5_48.png"
    if not path.exists():
        raise SystemExit("Margaret v5 candidate missing; run tools/generate_margaret_direction_v5_candidate.py first")
    return Image.open(path).convert("RGBA")

def direction_frame(character,direction):
    if character!="margaret":
        return runtime_frame(character,"idle",0,direction)
    sheet=margaret_v5_sheet()
    return sheet.crop((direction*CELL,0,(direction+1)*CELL,CELL))

def bbox_metrics(im):
    a=im.getchannel("A")
    bb=a.getbbox()
    if not bb:
        return {"bbox":None,"width":0,"height":0,"opaque":0,"occupancy":0.0,"centroid":[0,0]}
    xs=[]; ys=[]; opaque=0
    for y in range(im.height):
        for x in range(im.width):
            if im.getpixel((x,y))[3]>20:
                opaque+=1; xs.append(x); ys.append(y)
    return {
        "bbox":list(bb),
        "width":bb[2]-bb[0],
        "height":bb[3]-bb[1],
        "opaque":opaque,
        "occupancy":round(opaque/(im.width*im.height),4),
        "centroid":[round(statistics.fmean(xs),2),round(statistics.fmean(ys),2)],
    }

def face_metrics(im):
    bb=im.getchannel("A").getbbox()
    if not bb:
        return {"bbox":None}
    x0,y0,x1,y1=bb
    h=y1-y0
    # Upper 45% of the visible figure; captures face+hair without assuming identical anatomy.
    fy1=min(y1,y0+max(12,round(h*0.45)))
    face=im.crop((x0,y0,x1,fy1))
    vals=[]; dark=0; visible=0; colors=set()
    for r,g,b,a in face.getdata():
        if a<=20: continue
        visible+=1
        lum=0.2126*r+0.7152*g+0.0722*b
        vals.append(lum); colors.add((r,g,b))
        if lum<95: dark+=1
    vals.sort()
    if vals:
        p10=vals[max(0,int(len(vals)*0.10)-1)]
        p90=vals[min(len(vals)-1,int(len(vals)*0.90))]
        contrast=round(p90-p10,1)
    else:
        contrast=0.0
    return {
        "bbox":[x0,y0,x1,fy1],
        "visible_pixels":visible,
        "dark_pixels":dark,
        "unique_colors":len(colors),
        "luma_p90_p10":contrast,
    }

def quantized_palette_count(im):
    colors=set()
    for r,g,b,a in im.getdata():
        if a<=20: continue
        colors.add((r//32,g//32,b//32))
    return len(colors)

def medium_metrics(im):
    med=im.resize((MEDIUM,MEDIUM),Image.Resampling.NEAREST)
    m=bbox_metrics(med)
    m["face"]=face_metrics(med)
    m["palette_bins"]=quantized_palette_count(med)
    return m

def alpha_iou(a,b):
    def normalized(im):
        bb=im.getchannel("A").getbbox()
        if not bb: return set()
        crop=im.crop(bb).getchannel("A")
        w,h=crop.size
        canvas=Image.new("L",(40,44),0)
        nw=max(1,round(w*min(38/w,42/h)))
        nh=max(1,round(h*min(38/w,42/h)))
        rs=crop.resize((nw,nh),Image.Resampling.NEAREST)
        canvas.paste(rs,((40-nw)//2,44-nh))
        return {(x,y) for y in range(44) for x in range(40) if canvas.getpixel((x,y))>20}
    A=normalized(a);B=normalized(b)
    if not A and not B:return 1.0
    return round(len(A&B)/max(1,len(A|B)),4)

fronts={c:direction_frame(c,0) for c in CHARS}
metrics={"characters":{},"pairwise_silhouette_iou":{},"animation_runtime_authority":{"margaret":"v5 committed runtime sheets","sophie":"v2 cleaned committed runtime sheets"}}

for c in CHARS:
    dirs={}
    for di,d in enumerate(DIRS):
        frame=direction_frame(c,di)
        dirs[d]={"source":bbox_metrics(frame),"medium44":medium_metrics(frame)}
    anims={}
    for anim,count in ANIMS.items():
        path=ROOT/f"assets/characters/{c}/{c}_{anim}.png"
        im=Image.open(path).convert("RGBA")
        per=[]
        for f in range(count):
            per.append(bbox_metrics(im.crop((f*CELL,0,(f+1)*CELL,CELL))))
        anims[anim]={
            "size":list(im.size),
            "frames":count,
            "down_centroid_x_range":round(max(x["centroid"][0] for x in per)-min(x["centroid"][0] for x in per),2),
            "down_centroid_y_range":round(max(x["centroid"][1] for x in per)-min(x["centroid"][1] for x in per),2),
            "down_visible_height_range":[min(x["height"] for x in per),max(x["height"] for x in per)],
        }
    metrics["characters"][c]={"directions":dirs,"animations":anims}

for i,a in enumerate(CHARS):
    for b in CHARS[i+1:]:
        metrics["pairwise_silhouette_iou"][f"{a}__{b}"]=alpha_iou(fronts[a],fronts[b])

(OUT/"occupancy_metrics.json").write_text(json.dumps(metrics,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")

# summary CSV
lines=["character,direction,src_width,src_height,medium_width,medium_height,medium_face_visible,medium_face_dark,medium_face_contrast,palette_bins"]
for c in CHARS:
    for d in DIRS:
        x=metrics["characters"][c]["directions"][d]
        lines.append(",".join(map(str,[c,d,x["source"]["width"],x["source"]["height"],x["medium44"]["width"],x["medium44"]["height"],x["medium44"]["face"]["visible_pixels"],x["medium44"]["face"]["dark_pixels"],x["medium44"]["face"]["luma_p90_p10"],x["medium44"]["palette_bins"]])))
(OUT/"occupancy_metrics.csv").write_text("\n".join(lines)+"\n",encoding="utf-8")

# Front Medium44 board
z=8;tile=MEDIUM*z;pad=28;label_h=34
board=Image.new("RGBA",(pad+4*(tile+pad),pad+label_h+tile+pad),(236,236,236,255))
dr=ImageDraw.Draw(board)
for i,c in enumerate(CHARS):
    x=pad+i*(tile+pad)
    dr.text((x,pad),LABELS[c],fill=(20,20,20,255),font=font(18))
    med=fronts[c].resize((MEDIUM,MEDIUM),Image.Resampling.NEAREST)
    board.alpha_composite(med.resize((tile,tile),Image.Resampling.NEAREST),(x,pad+label_h))
board.save(OUT/"front_medium44_compare.png",optimize=False)

# Face crop board from exact Medium44 pixels
face_board=Image.new("RGBA",(pad+4*(240+pad),310),(242,242,242,255)); fd=ImageDraw.Draw(face_board)
for i,c in enumerate(CHARS):
    med=fronts[c].resize((MEDIUM,MEDIUM),Image.Resampling.NEAREST)
    fm=face_metrics(med); x0,y0,x1,y1=fm["bbox"]
    crop=med.crop((x0,y0,x1,y1))
    factor=max(1,min(12,220//max(1,crop.width),220//max(1,crop.height)))
    big=crop.resize((crop.width*factor,crop.height*factor),Image.Resampling.NEAREST)
    x=pad+i*(240+pad)
    fd.text((x,16),LABELS[c],fill=(20,20,20,255),font=font(18))
    face_board.alpha_composite(big,(x+(220-big.width)//2,58))
face_board.save(OUT/"face_compare_x12.png",optimize=False)

# grayscale + silhouette
for mode,name in (("gray","grayscale_compare.png"),("sil","silhouette_compare.png")):
    out=Image.new("RGBA",board.size,(236,236,236,255)); dd=ImageDraw.Draw(out)
    for i,c in enumerate(CHARS):
        x=pad+i*(tile+pad); dd.text((x,pad),LABELS[c],fill=(20,20,20,255),font=font(18))
        med=fronts[c].resize((MEDIUM,MEDIUM),Image.Resampling.NEAREST)
        if mode=="gray":
            alpha=med.getchannel("A")
            med=ImageOps.grayscale(med.convert("RGB")).convert("RGBA"); med.putalpha(alpha)
        else:
            alpha=med.getchannel("A")
            med=Image.new("RGBA",(MEDIUM,MEDIUM),(25,25,30,0)); med.putalpha(alpha.point(lambda v:255 if v>20 else 0))
        out.alpha_composite(med.resize((tile,tile),Image.Resampling.NEAREST),(x,pad+label_h))
    out.save(OUT/name,optimize=False)

# four-direction exact board
dz=6;dt=CELL*dz;left=120;top=44
four=Image.new("RGBA",(left+4*(dt+22),top+4*(dt+34)),(239,239,239,255)); d4=ImageDraw.Draw(four)
for di,d in enumerate(DIRS):
    d4.text((left+di*(dt+22)+8,10),d.capitalize(),fill=(20,20,20,255),font=font(16))
for ri,c in enumerate(CHARS):
    y=top+ri*(dt+34)
    d4.text((10,y+dt//2-10),LABELS[c],fill=(20,20,20,255),font=font(17))
    for di,d in enumerate(DIRS):
        cell=direction_frame(c,di).resize((dt,dt),Image.Resampling.NEAREST)
        four.alpha_composite(cell,(left+di*(dt+22),y))
four.save(OUT/"four_direction_compare.png",optimize=False)

# animation representative board + per-character contact sheets
az=4; at=CELL*az
anim_board=Image.new("RGBA",(160+8*(at+16),44+4*(at+30)),(238,238,238,255)); ad=ImageDraw.Draw(anim_board)
for ai,anim in enumerate(ANIMS):
    ad.text((160+ai*(at+16)+4,12),anim,fill=(20,20,20,255),font=font(14))
for ri,c in enumerate(CHARS):
    y=44+ri*(at+30); ad.text((10,y+at//2-10),LABELS[c],fill=(20,20,20,255),font=font(16))
    for ai,anim in enumerate(ANIMS):
        # Runtime authority for animations. Margaret v5 and Sophie v2 are the active prototype runtime sets.
        fr=runtime_frame(c,anim,0,0).resize((at,at),Image.Resampling.NEAREST)
        anim_board.alpha_composite(fr,(160+ai*(at+16),y))
anim_board.save(OUT/"animation_contact_sheet.png",optimize=False)

for c in CHARS:
    maxframes=max(ANIMS.values()); zc=3; ft=CELL*zc
    h=38+len(ANIMS)*(ft+30); w=150+maxframes*(ft+10)
    sh=Image.new("RGBA",(w,h),(240,240,240,255)); sd=ImageDraw.Draw(sh)
    sd.text((12,10),LABELS[c]+" — exact runtime down-direction frames",fill=(20,20,20,255),font=font(18))
    for ri,(anim,count) in enumerate(ANIMS.items()):
        y=38+ri*(ft+30);sd.text((8,y+ft//2-8),anim,fill=(20,20,20,255),font=font(15))
        for fi in range(count):
            fr=runtime_frame(c,anim,fi,0).resize((ft,ft),Image.Resampling.NEAREST)
            sh.alpha_composite(fr,(150+fi*(ft+10),y))
    sh.save(OUT/f"{c}_animation_contact.png",optimize=False)

# deterministic game-like Medium44 field comparison
field=Image.new("RGBA",(640,320),(137,159,108,255)); fd=ImageDraw.Draw(field)
for y in range(0,320,32):
    for x in range(0,640,32):
        if ((x//32)+(y//32))%2==0: fd.rectangle((x,y,x+31,y+31),fill=(145,166,115,255))
fd.rectangle((0,212,639,286),fill=(198,176,138,255))
fd.rectangle((0,250,639,252),fill=(181,157,119,255))
xs=(100,245,390,535)
for c,x in zip(CHARS,xs):
    med=fronts[c].resize((MEDIUM,MEDIUM),Image.Resampling.NEAREST)
    field.alpha_composite(med,(x-MEDIUM//2,212-MEDIUM))
    fd.rectangle((x-54,222,x+54,244),fill=(25,27,32,220))
    tw=fd.textbbox((0,0),LABELS[c],font=font(13))[2]
    fd.text((x-tw//2,225),LABELS[c],fill=(250,250,250,255),font=font(13))
field.save(OUT/"medium44_game_field.png",optimize=False)

# Human-readable metric report
md=["# Four Protagonist Quality Evidence","","> Generated mechanically from exact evaluated pixels. No AI comparison art.",""]
for c in CHARS:
    x=metrics["characters"][c]["directions"]["down"]["medium44"]
    f=x["face"]
    md += [f"## {LABELS[c]}",f"- Medium44 visible bbox: {x['width']}×{x['height']}","- Face visible pixels: "+str(f["visible_pixels"]),"- Face dark-detail pixels: "+str(f["dark_pixels"]),"- Face luma p90-p10: "+str(f["luma_p90_p10"]),"- Quantized palette bins: "+str(x["palette_bins"]),""] 
md += ["## Pairwise normalized silhouette IoU"]
for k,v in metrics["pairwise_silhouette_iou"].items(): md.append(f"- {k}: {v}")
(OUT/"quality_metrics_report.md").write_text("\n".join(md)+"\n",encoding="utf-8")
print("FOUR PROTAGONIST QUALITY EVIDENCE BUILT")
