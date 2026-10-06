#!/usr/bin/env python3
"""Mechanical Karen/Triton identity evidence from committed source PNGs only."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/"prototype_artifacts";OUT.mkdir(exist_ok=True)
K=ROOT/"docs/pixel/reference/karen_chibi_direction_v1.png";T=ROOT/"docs/pixel/reference/triton_chibi_direction_lock_v1.png"
def atlas(p):
 im=Image.open(p).convert("RGBA")
 if im.size!=(192,48):raise ValueError((p,im.size))
 return im
def front(a):return a.crop((0,0,48,48))
def near(im,n):return im.resize((im.width*n,im.height*n),Image.Resampling.NEAREST)
def gray(im):
 out=Image.new("RGBA",im.size,(0,0,0,0));s=im.load();d=out.load()
 for y in range(im.height):
  for x in range(im.width):
   r,g,b,a=s[x,y]
   if a:q=round(.299*r+.587*g+.114*b);d[x,y]=(q,q,q,a)
 return out
def sil(im):
 out=Image.new("RGBA",im.size,(0,0,0,0));out.paste(Image.new("RGBA",im.size,(20,20,20,255)),(0,0),im.getchannel("A"));return out
def panel(ims,titles,name,f=10):
 ups=[near(x,f) for x in ims];m=24;g=28;lab=34;bg=(232,226,214,255)
 w=sum(x.width for x in ups)+g*(len(ups)-1)+m*2;h=max(x.height for x in ups)+lab+m*2
 c=Image.new("RGBA",(w,h),bg);dr=ImageDraw.Draw(c);font=ImageFont.load_default();x=m
 for im,title in zip(ups,titles):
  dr.text((x,m+7),title,fill=(20,20,20,255),font=font);c.alpha_composite(im,(x,m+lab));x+=im.width+g
 c.save(OUT/name,optimize=False)
def sha(im):return hashlib.sha256(im.tobytes()).hexdigest()
ka=atlas(K);ta=atlas(T);k=front(ka);t=front(ta);face=(8,3,40,27)
panel([k,t],["KAREN LOCKED","TRITON LOCK v1"],"karen_triton_lock_front_mechanical_x10.png")
panel([gray(k),gray(t)],["KAREN LOCKED","TRITON LOCK v1"],"karen_triton_lock_grayscale_mechanical_x10.png")
panel([sil(k),sil(t)],["KAREN LOCKED","TRITON LOCK v1"],"karen_triton_lock_silhouette_mechanical_x10.png")
panel([k.crop(face),t.crop(face)],["KAREN FACE","TRITON FACE"],"karen_triton_lock_face_mechanical_x10.png")
panel([gray(k.crop(face)),gray(t.crop(face))],["KAREN FACE","TRITON FACE"],"karen_triton_lock_face_grayscale_mechanical_x10.png")
panel([ka,ta],["KAREN LOCKED 4-DIR","TRITON LOCK v1 4-DIR"],"karen_triton_lock_atlas_mechanical_x6.png",6)
metrics={"method":"committed PNG mechanical composition only","nearest_neighbor_only":True,"karen_front_rgba_sha256":sha(k),"triton_front_rgba_sha256":sha(t),"exactly_equal":k.tobytes()==t.tobytes(),"visual_status":"Triton Chibi Direction Lock v1 user-approved"}
(OUT/"karen_triton_lock_identity_metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf-8");print(json.dumps(metrics,indent=2))
