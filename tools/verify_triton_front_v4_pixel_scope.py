#!/usr/bin/env python3
"""Pixel-perfect guard for Triton front repair v4.

v4 is allowed to change only the internal face / immediate face-framing patch
of the committed v3 candidate. Body, stance, clothing, waist color mass,
outer hair silhouette, and alpha silhouette must remain pixel-identical.
"""
from pathlib import Path
from PIL import Image
import hashlib, json, sys

ROOT=Path(__file__).resolve().parents[1]
V3=ROOT/"docs/pixel/reference/triton_idle_front_repair_candidate_v3_48.png"
V4=ROOT/"docs/pixel/reference/triton_idle_front_repair_candidate_v4_48.png"
OUT=ROOT/"prototype_artifacts"
OUT.mkdir(exist_ok=True)
ALLOWED=(18,8,31,18)

def load(p):
    im=Image.open(p).convert("RGBA")
    if im.size!=(48,48): raise AssertionError(f"{p} must be 48x48, got {im.size}")
    return im

def raw_hash(im): return hashlib.sha256(im.tobytes()).hexdigest()

v3=load(V3);v4=load(V4)
diff=[];outside=[];alpha=[]
x0,y0,x1,y1=ALLOWED
for y in range(48):
    for x in range(48):
        a=v3.getpixel((x,y));b=v4.getpixel((x,y))
        if a!=b:
            diff.append((x,y))
            if not (x0<=x<x1 and y0<=y<y1): outside.append((x,y,a,b))
        if a[3]!=b[3]: alpha.append((x,y,a[3],b[3]))

errors=[]
if not diff: errors.append("v4 has no pixel changes from v3")
if outside: errors.append(f"{len(outside)} changed pixels exist outside the allowed face patch")
if alpha: errors.append(f"{len(alpha)} alpha pixels changed; outer silhouette must remain identical")
if len(diff)>120: errors.append(f"v4 face edit too broad: {len(diff)} changed pixels")

metrics={
 "v3_rgba_sha256":raw_hash(v3),
 "v4_rgba_sha256":raw_hash(v4),
 "changed_pixel_count":len(diff),
 "allowed_patch":list(ALLOWED),
 "changed_bbox":[min((x for x,y in diff),default=None),min((y for x,y in diff),default=None),max((x for x,y in diff),default=None),max((y for x,y in diff),default=None)],
 "outside_patch_changes":len(outside),
 "alpha_changes":len(alpha),
 "body_outside_face_pixel_perfect":len(outside)==0,
 "outer_alpha_silhouette_pixel_perfect":len(alpha)==0,
 "visual_status":"technical scope only; user Visual PASS required"
}
(OUT/"triton_v4_pixel_scope_metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf-8")
print(json.dumps(metrics,indent=2))
if errors:
    print("TRITON V4 PIXEL SCOPE FAIL",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)
print("TRITON V4 PIXEL SCOPE PASS")
