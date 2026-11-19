#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib, json, sys

ROOT=Path(__file__).resolve().parents[1]
V3=ROOT/"docs/pixel/reference/triton_idle_front_repair_candidate_v3_48.png"
V4=ROOT/"prototype_artifacts/triton_idle_front_repair_candidate_v4_48.png"
OUT=ROOT/"prototype_artifacts"
ALLOWED=(18,8,31,18)

def load(p):
    im=Image.open(p).convert("RGBA")
    if im.size!=(48,48): raise AssertionError(f"{p} must be 48x48, got {im.size}")
    return im

v3=load(V3);v4=load(V4)
diff=[];outside=[];alpha=[]
x0,y0,x1,y1=ALLOWED
for y in range(48):
    for x in range(48):
        a=v3.getpixel((x,y));b=v4.getpixel((x,y))
        if a!=b:
            diff.append((x,y))
            if not (x0<=x<x1 and y0<=y<y1): outside.append((x,y))
        if a[3]!=b[3]: alpha.append((x,y))

rgba=hashlib.sha256(v4.tobytes()).hexdigest()
errors=[]
if len(diff)!=76: errors.append(f"expected 76 changed pixels, got {len(diff)}")
if outside: errors.append(f"{len(outside)} changes outside face patch")
if alpha: errors.append(f"{len(alpha)} alpha changes")
if rgba!="ed42a5fcada5e77989e452d2870faf80ebc851515c6ae7bfb87f4fbaeadbc0a8": errors.append("v4 RGBA hash mismatch")

metrics={
 "changed_pixel_count":len(diff),
 "allowed_patch":list(ALLOWED),
 "changed_bbox":[min(x for x,y in diff),min(y for x,y in diff),max(x for x,y in diff),max(y for x,y in diff)],
 "outside_patch_changes":len(outside),
 "alpha_changes":len(alpha),
 "v4_rgba_sha256":rgba,
 "body_outside_face_pixel_perfect":not outside,
 "outer_alpha_silhouette_pixel_perfect":not alpha
}
(OUT/"triton_v4_pixel_scope_metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf-8")
print(json.dumps(metrics,indent=2))
if errors:
    print("TRITON V4 PIXEL SCOPE FAIL",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)
print("TRITON V4 PIXEL SCOPE PASS")
