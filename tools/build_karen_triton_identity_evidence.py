#!/usr/bin/env python3
"""Build deterministic Karen/Triton v4 visual evidence from real PNGs only.

No image-generation model is used for comparison boards.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib, json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts";OUT.mkdir(exist_ok=True)
KAREN=ROOT/"docs/pixel/reference/karen_chibi_direction_v1.png"
TRITON=ROOT/"docs/pixel/reference/triton_idle_4dir_v1.png"
V3=ROOT/"docs/pixel/reference/triton_idle_front_repair_candidate_v3_48.png"
V4=ROOT/"docs/pixel/reference/triton_idle_front_repair_candidate_v4_48.png"
CELL=48

def load_atlas(p):
    im=Image.open(p).convert("RGBA")
    if im.size!=(192,48): raise ValueError(f"{p} must be 192x48, got {im.size}")
    return im
def load_cell(p):
    im=Image.open(p).convert("RGBA")
    if im.size!=(48,48): raise ValueError(f"{p} must be 48x48, got {im.size}")
    return im
def front(a): return a.crop((0,0,CELL,CELL))
def nearest(im,f): return im.resize((im.width*f,im.height*f),Image.Resampling.NEAREST)
def raw_hash(im): return hashlib.sha256(im.tobytes()).hexdigest()
def gray(im):
    out=Image.new("RGBA",im.size,(0,0,0,0));s=im.load();d=out.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=s[x,y]
            if a:
                q=round(.299*r+.587*g+.114*b);d[x,y]=(q,q,q,a)
    return out
def silhouette(im):
    out=Image.new("RGBA",im.size,(0,0,0,0))
    out.paste(Image.new("RGBA",im.size,(20,20,20,255)),(0,0),im.getchannel("A"))
    return out
def rgba_diff(a,b):
    out=Image.new("RGBA",a.size,(0,0,0,0));pa=a.load();pb=b.load();d=out.load()
    for y in range(a.height):
        for x in range(a.width):
            ar,ag,ab,aa=pa[x,y];br,bg,bb,ba=pb[x,y]
            if aa==0 and ba==0: continue
            d[x,y]=(abs(ar-br),abs(ag-bg),abs(ab-bb),max(aa,ba))
    return out
def panel(images,titles,name,factor=10):
    ims=[nearest(i,factor) for i in images]
    margin=24;gap=28;label=34;bg=(232,226,214,255)
    w=sum(i.width for i in ims)+gap*(len(ims)-1)+2*margin
    h=max(i.height for i in ims)+label+2*margin
    c=Image.new("RGBA",(w,h),bg);dr=ImageDraw.Draw(c);font=ImageFont.load_default()
    x=margin
    for im,title in zip(ims,titles):
        dr.text((x,margin+7),title,fill=(20,20,20,255),font=font)
        c.alpha_composite(im,(x,margin+label));x+=im.width+gap
    c.save(OUT/name,optimize=False)

ka=load_atlas(KAREN);ta=load_atlas(TRITON)
k=front(ka);t=front(ta);v3=load_cell(V3);v4=load_cell(V4)
face=(8,3,40,26)
kf=k.crop(face);tf=t.crop(face);v3f=v3.crop(face);v4f=v4.crop(face)

panel([k,t,v4],["KAREN LOCKED","TRITON CURRENT","TRITON V4"],"karen_triton_v4_front_mechanical_x10.png")
panel([gray(k),gray(t),gray(v4)],["KAREN LOCKED","TRITON CURRENT","TRITON V4"],"karen_triton_v4_grayscale_mechanical_x10.png")
panel([silhouette(k),silhouette(t),silhouette(v4)],["KAREN LOCKED","TRITON CURRENT","TRITON V4"],"karen_triton_v4_silhouette_mechanical_x10.png")
panel([kf,tf,v4f],["KAREN FACE","TRITON CURRENT FACE","TRITON V4 FACE"],"karen_triton_v4_face_mechanical_x10.png")
panel([gray(kf),gray(tf),gray(v4f)],["KAREN FACE","TRITON CURRENT FACE","TRITON V4 FACE"],"karen_triton_v4_face_grayscale_mechanical_x10.png")
panel([v3,v4],["TRITON V3","TRITON V4"],"triton_v3_v4_mechanical_x10.png")
panel([gray(v3f),gray(v4f)],["TRITON V3 FACE","TRITON V4 FACE"],"triton_v3_v4_face_grayscale_mechanical_x10.png")
panel([rgba_diff(v3,v4)],["TRITON V3 -> V4 RAW PIXEL DIFFERENCE"],"triton_v3_v4_rgba_difference_x10.png")

metrics={
 "method":"committed repository PNG mechanical composition only",
 "nearest_neighbor_only":True,
 "karen_front_rgba_sha256":raw_hash(k),
 "triton_current_front_rgba_sha256":raw_hash(t),
 "triton_v3_rgba_sha256":raw_hash(v3),
 "triton_v4_rgba_sha256":raw_hash(v4),
 "v4_exactly_equals_karen":v4.tobytes()==k.tobytes(),
 "v4_exactly_equals_v3":v4.tobytes()==v3.tobytes(),
 "face_box":list(face),
 "visual_status":"USER REVIEW REQUIRED; CI does not approve attractiveness"
}
(OUT/"karen_triton_v4_identity_metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf-8")
print(json.dumps(metrics,indent=2))
