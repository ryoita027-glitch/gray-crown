#!/usr/bin/env python3
"""Build deterministic, source-faithful Karen/Triton identity evidence.

Comparison-board image generation is forbidden.
This script ONLY composes real repository PNG pixels using crop, grayscale,
silhouette/difference transforms, and nearest-neighbor enlargement.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib, json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"
OUT.mkdir(exist_ok=True)

KAREN=ROOT/"docs/pixel/reference/karen_chibi_direction_v1.png"
TRITON=ROOT/"docs/pixel/reference/triton_idle_4dir_v1.png"
V2=ROOT/"docs/pixel/reference/triton_idle_front_repair_candidate_v2_48.png"
V3=ROOT/"docs/pixel/reference/triton_idle_front_repair_candidate_v3_48.png"
CELL=48

def load_atlas(path):
    im=Image.open(path).convert("RGBA")
    if im.size!=(192,48): raise ValueError(f"{path} must be 192x48, got {im.size}")
    return im

def load_cell(path):
    im=Image.open(path).convert("RGBA")
    if im.size!=(48,48): raise ValueError(f"{path} must be 48x48, got {im.size}")
    return im

def front(atlas): return atlas.crop((0,0,CELL,CELL))
def nearest(im,factor): return im.resize((im.width*factor,im.height*factor),Image.Resampling.NEAREST)
def raw_hash(im): return hashlib.sha256(im.tobytes()).hexdigest()

def gray(im):
    out=Image.new("RGBA",im.size,(0,0,0,0));s=im.load();d=out.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=s[x,y]
            if a:
                v=round(.299*r+.587*g+.114*b);d[x,y]=(v,v,v,a)
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

def single(im,title,name,factor=10):
    panel([im],[title],name,factor)

k_atlas=load_atlas(KAREN);t_atlas=load_atlas(TRITON)
k=front(k_atlas);t=front(t_atlas);v2=load_cell(V2);v3=load_cell(V3)
face=(8,3,40,26)
kf=k.crop(face);tf=t.crop(face);v2f=v2.crop(face);v3f=v3.crop(face)

# Real-PNG mechanical comparisons only.
panel([k,t,v3],["KAREN LOCKED","TRITON CURRENT","TRITON V3"],"karen_triton_v3_front_mechanical_x10.png")
panel([gray(k),gray(t),gray(v3)],["KAREN LOCKED","TRITON CURRENT","TRITON V3"],"karen_triton_v3_grayscale_mechanical_x10.png")
panel([silhouette(k),silhouette(t),silhouette(v3)],["KAREN LOCKED","TRITON CURRENT","TRITON V3"],"karen_triton_v3_silhouette_mechanical_x10.png")
panel([kf,tf,v3f],["KAREN FACE","TRITON CURRENT FACE","TRITON V3 FACE"],"karen_triton_v3_face_mechanical_x10.png")
panel([gray(kf),gray(tf),gray(v3f)],["KAREN FACE","TRITON CURRENT FACE","TRITON V3 FACE"],"karen_triton_v3_face_grayscale_mechanical_x10.png")
panel([v2,v3],["TRITON V2","TRITON V3"],"triton_v2_v3_mechanical_x10.png")
panel([gray(v2f),gray(v3f)],["TRITON V2 FACE","TRITON V3 FACE"],"triton_v2_v3_face_grayscale_mechanical_x10.png")
single(rgba_diff(v2,v3),"TRITON V2 -> V3 RAW PIXEL DIFFERENCE","triton_v2_v3_rgba_difference_x10.png")
panel([k_atlas,t_atlas],["KAREN LOCKED 4-DIR","TRITON CURRENT 4-DIR"],"karen_triton_source_atlas_mechanical_x6.png",6)

metrics={
  "method":"real repository PNG mechanical composition only; no image-generation model",
  "nearest_neighbor_only":True,
  "karen_front_rgba_sha256":raw_hash(k),
  "triton_current_front_rgba_sha256":raw_hash(t),
  "triton_v2_rgba_sha256":raw_hash(v2),
  "triton_v3_rgba_sha256":raw_hash(v3),
  "face_box":list(face),
  "v3_exactly_equals_karen":v3.tobytes()==k.tobytes(),
  "v3_exactly_equals_v2":v3.tobytes()==v2.tobytes(),
  "visual_status":"USER REVIEW REQUIRED; technical evidence cannot approve design"
}
(OUT/"karen_triton_v3_identity_metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf-8")
print(json.dumps(metrics,indent=2))
