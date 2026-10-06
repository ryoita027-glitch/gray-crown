#!/usr/bin/env python3
"""Build source-faithful Karen/Triton identity comparison evidence.

IMPORTANT:
- Reads committed 192x48 reference atlases directly.
- Does not redraw, recolor, interpolate, or generate either character.
- Nearest-neighbor scaling only.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "prototype_artifacts"
OUT.mkdir(exist_ok=True)

KAREN = ROOT / "docs/pixel/reference/karen_chibi_direction_v1.png"
TRITON = ROOT / "docs/pixel/reference/triton_idle_4dir_v1.png"
CELL = 48
SCALE = 10

def load_atlas(path):
    im = Image.open(path).convert("RGBA")
    if im.size != (192, 48):
        raise ValueError(f"{path} must be 192x48, got {im.size}")
    return im

def front(atlas):
    return atlas.crop((0, 0, CELL, CELL))

def nearest(im, factor=SCALE):
    return im.resize((im.width * factor, im.height * factor), Image.Resampling.NEAREST)

def gray_rgba(im):
    rgb = Image.new("RGBA", im.size, (0, 0, 0, 0))
    px_in = im.load()
    px_out = rgb.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a = px_in[x,y]
            if a == 0:
                continue
            v = round(0.299*r + 0.587*g + 0.114*b)
            px_out[x,y] = (v,v,v,a)
    return rgb

def silhouette(im):
    out = Image.new("RGBA", im.size, (0,0,0,0))
    src = im.getchannel("A")
    solid = Image.new("RGBA", im.size, (20,20,20,255))
    out.paste(solid, (0,0), src)
    return out

def panel(left, right, filename, title_left="KAREN", title_right="TRITON"):
    margin=24
    gap=36
    label_h=44
    bg=(232,226,214,255)
    W=left.width+right.width+gap+margin*2
    H=max(left.height,right.height)+label_h+margin*2
    canvas=Image.new("RGBA",(W,H),bg)
    draw=ImageDraw.Draw(canvas)
    font=ImageFont.load_default()
    x1=margin
    x2=margin+left.width+gap
    y=margin+label_h
    canvas.alpha_composite(left,(x1,y))
    canvas.alpha_composite(right,(x2,y))
    draw.text((x1,margin+8),title_left,fill=(20,20,20,255),font=font)
    draw.text((x2,margin+8),title_right,fill=(20,20,20,255),font=font)
    canvas.save(OUT/filename,optimize=False)

def alpha_bbox(im):
    return im.getchannel("A").getbbox()

def alpha_iou(a,b):
    aa=a.getchannel("A")
    bb=b.getchannel("A")
    inter=union=0
    for va,vb in zip(aa.getdata(),bb.getdata()):
        pa=va>0; pb=vb>0
        inter += 1 if pa and pb else 0
        union += 1 if pa or pb else 0
    return inter/union if union else 1.0

def main():
    k_atlas=load_atlas(KAREN)
    t_atlas=load_atlas(TRITON)
    k=front(k_atlas)
    t=front(t_atlas)

    panel(nearest(k),nearest(t),"karen_triton_source_front_x10.png")
    panel(nearest(gray_rgba(k)),nearest(gray_rgba(t)),"karen_triton_source_front_grayscale_x10.png")
    panel(nearest(silhouette(k)),nearest(silhouette(t)),"karen_triton_source_front_silhouette_x10.png")

    # Fixed face-region evidence: same crop coordinates, no semantic redraw.
    face_box=(8,3,40,26)
    panel(nearest(k.crop(face_box)),nearest(t.crop(face_box)),
          "karen_triton_source_face_region_x10.png")

    # Full four-direction committed atlases, enlarged without interpolation.
    panel(nearest(k_atlas,6),nearest(t_atlas,6),
          "karen_triton_source_atlas_x6.png",
          "KAREN SOURCE ATLAS","TRITON SOURCE ATLAS")

    metrics={
      "karen_source":str(KAREN.relative_to(ROOT)),
      "triton_source":str(TRITON.relative_to(ROOT)),
      "source_size":[192,48],
      "front_cell":[48,48],
      "karen_front_alpha_bbox":alpha_bbox(k),
      "triton_front_alpha_bbox":alpha_bbox(t),
      "front_alpha_silhouette_iou":round(alpha_iou(k,t),6),
      "exact_front_rgba_equal":list(k.getdata())==list(t.getdata()),
      "note":"Visual identity approval remains manual; these files are source-faithful evidence only."
    }
    (OUT/"karen_triton_identity_metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf-8")
    print(json.dumps(metrics,indent=2))

if __name__=="__main__":
    main()
