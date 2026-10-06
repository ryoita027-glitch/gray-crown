#!/usr/bin/env python3
"""Build source-faithful Karen/Triton identity comparison evidence.

IMPORTANT:
- Reads committed repository PNGs directly.
- Does not redraw, recolor, beautify, interpolate, or generate either locked character.
- Nearest-neighbor scaling only.
- A repair candidate may be compared, but it never replaces the locked source until user Visual PASS.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"
OUT.mkdir(exist_ok=True)

KAREN=ROOT/"docs/pixel/reference/karen_chibi_direction_v1.png"
TRITON=ROOT/"docs/pixel/reference/triton_idle_4dir_v1.png"
CANDIDATE=ROOT/"docs/pixel/reference/triton_idle_front_repair_candidate_v2_48.png"
CELL=48
SCALE=10

def load_atlas(path):
    im=Image.open(path).convert("RGBA")
    if im.size!=(192,48):
        raise ValueError(f"{path} must be 192x48, got {im.size}")
    return im

def load_cell(path):
    im=Image.open(path).convert("RGBA")
    if im.size!=(48,48):
        raise ValueError(f"{path} must be 48x48, got {im.size}")
    return im

def front(atlas):
    return atlas.crop((0,0,CELL,CELL))

def nearest(im,factor=SCALE):
    return im.resize((im.width*factor,im.height*factor),Image.Resampling.NEAREST)

def gray_rgba(im):
    out=Image.new("RGBA",im.size,(0,0,0,0))
    src=im.load(); dst=out.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=src[x,y]
            if a:
                v=round(0.299*r+0.587*g+0.114*b)
                dst[x,y]=(v,v,v,a)
    return out

def silhouette(im):
    out=Image.new("RGBA",im.size,(0,0,0,0))
    out.paste(Image.new("RGBA",im.size,(20,20,20,255)),(0,0),im.getchannel("A"))
    return out

def alpha_diff(a,b):
    out=Image.new("RGBA",a.size,(0,0,0,0))
    aa=a.getchannel("A"); bb=b.getchannel("A"); dst=out.load()
    for y in range(a.height):
        for x in range(a.width):
            av=aa.getpixel((x,y))>0
            bv=bb.getpixel((x,y))>0
            if av and bv: dst[x,y]=(90,90,90,255)
            elif av: dst[x,y]=(190,55,45,255)
            elif bv: dst[x,y]=(45,95,190,255)
    return out

def rgba_diff(a,b):
    out=Image.new("RGBA",a.size,(0,0,0,0))
    pa=a.load(); pb=b.load(); dst=out.load()
    for y in range(a.height):
        for x in range(a.width):
            ar,ag,ab,aa=pa[x,y]; br,bg,bb,ba=pb[x,y]
            if aa==0 and ba==0: continue
            dst[x,y]=(abs(ar-br),abs(ag-bg),abs(ab-bb),max(aa,ba))
    return out

def panel(left,right,filename,title_left="KAREN",title_right="TRITON"):
    margin=24; gap=36; label_h=44; bg=(232,226,214,255)
    W=left.width+right.width+gap+margin*2
    H=max(left.height,right.height)+label_h+margin*2
    canvas=Image.new("RGBA",(W,H),bg)
    draw=ImageDraw.Draw(canvas); font=ImageFont.load_default()
    x1=margin; x2=margin+left.width+gap; y=margin+label_h
    canvas.alpha_composite(left,(x1,y)); canvas.alpha_composite(right,(x2,y))
    draw.text((x1,margin+8),title_left,fill=(20,20,20,255),font=font)
    draw.text((x2,margin+8),title_right,fill=(20,20,20,255),font=font)
    canvas.save(OUT/filename,optimize=False)

def triple_panel(a,b,c,filename,titles=("KAREN","TRITON CURRENT","TRITON REPAIR V2")):
    margin=24; gap=28; label_h=44; bg=(232,226,214,255)
    W=a.width+b.width+c.width+gap*2+margin*2
    H=max(a.height,b.height,c.height)+label_h+margin*2
    canvas=Image.new("RGBA",(W,H),bg)
    draw=ImageDraw.Draw(canvas); font=ImageFont.load_default()
    xs=[margin,margin+a.width+gap,margin+a.width+gap+b.width+gap]
    y=margin+label_h
    for im,x,title in zip((a,b,c),xs,titles):
        canvas.alpha_composite(im,(x,y))
        draw.text((x,margin+8),title,fill=(20,20,20,255),font=font)
    canvas.save(OUT/filename,optimize=False)

def single_panel(im,filename,title):
    margin=24; label_h=44; bg=(232,226,214,255)
    canvas=Image.new("RGBA",(im.width+margin*2,im.height+label_h+margin*2),bg)
    draw=ImageDraw.Draw(canvas); font=ImageFont.load_default()
    draw.text((margin,margin+8),title,fill=(20,20,20,255),font=font)
    canvas.alpha_composite(im,(margin,margin+label_h))
    canvas.save(OUT/filename,optimize=False)

def alpha_bbox(im):
    return im.getchannel("A").getbbox()

def alpha_iou(a,b):
    aa=a.getchannel("A"); bb=b.getchannel("A")
    inter=union=0
    for va,vb in zip(aa.getdata(),bb.getdata()):
        av=va>0; bv=vb>0
        inter+=1 if av and bv else 0
        union+=1 if av or bv else 0
    return inter/union if union else 1.0

def main():
    k_atlas=load_atlas(KAREN)
    t_atlas=load_atlas(TRITON)
    k=front(k_atlas); t=front(t_atlas)
    c=load_cell(CANDIDATE)
    face_box=(8,3,40,26)
    kf=k.crop(face_box); tf=t.crop(face_box); cf=c.crop(face_box)

    # Current committed-source evidence.
    panel(nearest(k),nearest(t),"karen_triton_source_front_x10.png")
    panel(nearest(gray_rgba(k)),nearest(gray_rgba(t)),"karen_triton_source_front_grayscale_x10.png")
    panel(nearest(silhouette(k)),nearest(silhouette(t)),"karen_triton_source_front_silhouette_x10.png")
    panel(nearest(kf),nearest(tf),"karen_triton_source_face_region_x10.png")
    panel(nearest(gray_rgba(kf)),nearest(gray_rgba(tf)),"karen_triton_source_face_region_grayscale_x10.png")
    panel(nearest(k_atlas,6),nearest(t_atlas,6),"karen_triton_source_atlas_x6.png","KAREN SOURCE ATLAS","TRITON SOURCE ATLAS")
    single_panel(nearest(alpha_diff(k,t)),"karen_triton_source_alpha_difference_x10.png","ALPHA DIFFERENCE: red=Karen only / blue=Triton only / gray=shared")
    single_panel(nearest(rgba_diff(k,t)),"karen_triton_source_rgba_difference_x10.png","RAW RGBA DIFFERENCE")

    # Repair-candidate evidence. Karen is still the exact same committed control.
    triple_panel(nearest(k),nearest(t),nearest(c),"karen_triton_repair_front_x10.png")
    triple_panel(nearest(gray_rgba(k)),nearest(gray_rgba(t)),nearest(gray_rgba(c)),"karen_triton_repair_grayscale_x10.png")
    triple_panel(nearest(silhouette(k)),nearest(silhouette(t)),nearest(silhouette(c)),"karen_triton_repair_silhouette_x10.png")
    triple_panel(nearest(kf),nearest(tf),nearest(cf),"karen_triton_repair_face_region_x10.png")
    triple_panel(nearest(gray_rgba(kf)),nearest(gray_rgba(tf)),nearest(gray_rgba(cf)),"karen_triton_repair_face_region_grayscale_x10.png")
    panel(nearest(t),nearest(c),"triton_current_vs_repair_v2_x10.png","TRITON CURRENT","TRITON REPAIR V2")
    panel(nearest(gray_rgba(tf)),nearest(gray_rgba(cf)),"triton_current_vs_repair_face_grayscale_x10.png","CURRENT FACE","REPAIR V2 FACE")
    single_panel(nearest(rgba_diff(t,c)),"triton_current_vs_repair_rgba_difference_x10.png","TRITON CURRENT vs REPAIR V2 RAW RGBA DIFFERENCE")

    metrics={
      "karen_source":str(KAREN.relative_to(ROOT)),
      "triton_source":str(TRITON.relative_to(ROOT)),
      "repair_candidate":str(CANDIDATE.relative_to(ROOT)),
      "source_size":[192,48],
      "front_cell":[48,48],
      "face_box":list(face_box),
      "karen_front_alpha_bbox":alpha_bbox(k),
      "triton_front_alpha_bbox":alpha_bbox(t),
      "candidate_front_alpha_bbox":alpha_bbox(c),
      "current_front_alpha_iou_vs_karen":round(alpha_iou(k,t),6),
      "candidate_front_alpha_iou_vs_karen":round(alpha_iou(k,c),6),
      "current_face_alpha_iou_vs_karen":round(alpha_iou(kf,tf),6),
      "candidate_face_alpha_iou_vs_karen":round(alpha_iou(kf,cf),6),
      "candidate_exactly_equals_karen":list(k.getdata())==list(c.getdata()),
      "candidate_exactly_equals_current_triton":list(t.getdata())==list(c.getdata()),
      "comparison_method":"committed PNG only; crop/grayscale/silhouette/diff; nearest-neighbor only",
      "visual_status":"USER REVIEW REQUIRED — candidate does not become source until explicit Visual PASS",
      "note":"Technical metrics never approve visual identity."
    }
    (OUT/"karen_triton_identity_metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf-8")
    print(json.dumps(metrics,indent=2))

if __name__=="__main__":
    main()
