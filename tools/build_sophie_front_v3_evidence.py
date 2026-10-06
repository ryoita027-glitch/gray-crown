#!/usr/bin/env python3
"""Mechanical Karen / Triton / Sophie v3 evidence using repository PNGs only."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"
OUT.mkdir(exist_ok=True)

K=ROOT/"docs/pixel/reference/karen_chibi_direction_v1.png"
T=ROOT/"docs/pixel/reference/triton_chibi_direction_lock_v1.png"
S2=ROOT/"docs/pixel/reference/sophie_steady_hands_front_candidate_v2_48.png"
S3=ROOT/"docs/pixel/reference/sophie_steady_hands_front_candidate_v3_48.png"

def load_atlas(path):
    im=Image.open(path).convert("RGBA")
    if im.size!=(192,48):
        raise SystemExit(f"{path} must be 192x48, got {im.size}")
    return im

def load_cell(path):
    im=Image.open(path).convert("RGBA")
    if im.size!=(48,48):
        raise SystemExit(f"{path} must be 48x48, got {im.size}")
    return im

def front(atlas):
    return atlas.crop((0,0,48,48))

def gray(im):
    src=im.convert("RGBA")
    out=Image.new("RGBA",im.size,(0,0,0,0))
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=src.getpixel((x,y))
            if a:
                q=round(.299*r+.587*g+.114*b)
                out.putpixel((x,y),(q,q,q,a))
    return out

def silhouette(im):
    out=Image.new("RGBA",im.size,(0,0,0,0))
    out.paste((25,25,25,255),(0,0,im.width,im.height),im.getchannel("A"))
    return out

def scale_nearest(im,size):
    return im.resize((size,size),Image.Resampling.NEAREST)

def panel(images,titles,name,scale=8,bg=(235,230,220,255)):
    font=ImageFont.load_default()
    gap=18
    margin=18
    label=28
    ims=[im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST) for im in images]
    w=sum(i.width for i in ims)+gap*(len(ims)-1)+margin*2
    h=max(i.height for i in ims)+label+margin*2
    canvas=Image.new("RGBA",(w,h),bg)
    dr=ImageDraw.Draw(canvas)
    x=margin
    for im,title in zip(ims,titles):
        dr.text((x,margin+7),title,fill=(20,20,20,255),font=font)
        canvas.alpha_composite(im,(x,margin+label))
        x+=im.width+gap
    canvas.save(OUT/name,optimize=False)

k=front(load_atlas(K))
t=front(load_atlas(T))
s2=load_cell(S2)
s3=load_cell(S3)

panel([k,t,s3],["KAREN LOCKED","TRITON LOCK v1","SOPHIE v3"],"karen_triton_sophie_v3_front_x8.png")
panel([gray(k),gray(t),gray(s3)],["KAREN","TRITON","SOPHIE v3"],"karen_triton_sophie_v3_grayscale_x8.png")
panel([silhouette(k),silhouette(t),silhouette(s3)],["KAREN","TRITON","SOPHIE v3"],"karen_triton_sophie_v3_silhouette_x8.png")

face=(8,3,40,26)
panel([k.crop(face),t.crop(face),s3.crop(face)],["KAREN FACE","TRITON FACE","SOPHIE v3 FACE"],"karen_triton_sophie_v3_face_x12.png",scale=12)
panel([gray(k.crop(face)),gray(t.crop(face)),gray(s3.crop(face))],["KAREN FACE","TRITON FACE","SOPHIE v3 FACE"],"karen_triton_sophie_v3_face_grayscale_x12.png",scale=12)

panel([scale_nearest(k,44),scale_nearest(t,44),scale_nearest(s3,44)],["KAREN 44","TRITON 44","SOPHIE v3 44"],"karen_triton_sophie_v3_medium44_x9.png",scale=9)
panel([s2,s3],["SOPHIE v2 REJECTED","SOPHIE v3 REVIEW"],"sophie_v2_v3_x10.png",scale=10)

metrics={
 "method":"committed/source PNG mechanical composition only",
 "image_generation_comparison":False,
 "nearest_neighbor_only":True,
 "karen_sha256":hashlib.sha256(K.read_bytes()).hexdigest(),
 "triton_sha256":hashlib.sha256(T.read_bytes()).hexdigest(),
 "sophie_v2_sha256":hashlib.sha256(S2.read_bytes()).hexdigest(),
 "sophie_v3_sha256":hashlib.sha256(S3.read_bytes()).hexdigest(),
 "sophie_v3_bbox":s3.getchannel("A").getbbox(),
 "front_source":[48,48],
 "medium_preview":[44,44],
 "visual_status":"USER REVIEW REQUIRED"
}
(OUT/"sophie_front_v3_metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf-8")
print(json.dumps(metrics,indent=2))
