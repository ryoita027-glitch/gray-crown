#!/usr/bin/env python3
"""Build mechanical Karen/Triton completion evidence from approved PNG sources."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib
import json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"
OUT.mkdir(exist_ok=True)
KAREN=ROOT/"docs/pixel/reference/karen_chibi_direction_v1.png"
TRITON=ROOT/"docs/pixel/reference/triton_chibi_direction_lock_v1.png"
CELL=48
DIRS=("down","left","right","up")

def load(path):
    im=Image.open(path).convert("RGBA")
    if im.size!=(192,48):
        raise SystemExit(f"{path} must be 192x48, got {im.size}")
    return im

def cell(atlas,i):
    return atlas.crop((i*CELL,0,(i+1)*CELL,CELL))

def gray(im):
    rgb=im.convert("L")
    out=Image.new("RGBA",im.size,(0,0,0,0))
    rgba=im.convert("RGBA")
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=rgba.getpixel((x,y))
            if a:
                q=rgb.getpixel((x,y));out.putpixel((x,y),(q,q,q,a))
    return out

def silhouette(im):
    out=Image.new("RGBA",im.size,(0,0,0,0))
    out.paste((25,25,25,255),(0,0,im.width,im.height),im.getchannel("A"))
    return out

def render_pairs(k,t,transform,name,scale=8):
    font=ImageFont.load_default()
    row_h=CELL*scale+24
    col_w=CELL*scale+24
    canvas=Image.new("RGBA",(col_w*2+36,row_h*4+28),(235,230,220,255))
    draw=ImageDraw.Draw(canvas)
    draw.text((20,8),"KAREN LOCKED",fill=(20,20,20,255),font=font)
    draw.text((col_w+36,8),"TRITON LOCK v1",fill=(20,20,20,255),font=font)
    for i,d in enumerate(DIRS):
        y=28+i*row_h
        draw.text((4,y+4),d.upper(),fill=(20,20,20,255),font=font)
        for col,src in enumerate((cell(k,i),cell(t,i))):
            im=transform(src).resize((CELL*scale,CELL*scale),Image.Resampling.NEAREST)
            x=20+col*(col_w+16)
            canvas.alpha_composite(im,(x,y+20))
    canvas.save(OUT/name,optimize=False)

k=load(KAREN);t=load(TRITON)
render_pairs(k,t,lambda x:x,"karen_triton_completion_four_direction_x8.png")
render_pairs(k,t,gray,"karen_triton_completion_grayscale_x8.png")
render_pairs(k,t,silhouette,"karen_triton_completion_silhouette_x8.png")

metrics={
    "method":"approved committed PNG sources only; nearest-neighbor mechanical composition",
    "karen_source_sha256":hashlib.sha256(KAREN.read_bytes()).hexdigest(),
    "triton_lock_sha256":hashlib.sha256(TRITON.read_bytes()).hexdigest(),
    "same_file":KAREN.read_bytes()==TRITON.read_bytes(),
    "directions":list(DIRS),
    "status":"TECHNICAL EVIDENCE ONLY"
}
(OUT/"karen_triton_completion_metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf-8")
print(json.dumps(metrics,indent=2))
