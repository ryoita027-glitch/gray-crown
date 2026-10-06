#!/usr/bin/env python3
"""Pixel-perfect guard for Triton front repair v3.

The v3 candidate is allowed to alter ONLY the front-face patch of the committed
v2 candidate. Body, stance, clothing, blue waist mass, outer hair silhouette,
and alpha silhouette must remain pixel-identical.
"""
from pathlib import Path
from PIL import Image
import hashlib, json, sys

ROOT=Path(__file__).resolve().parents[1]
V2=ROOT/"docs/pixel/reference/triton_idle_front_repair_candidate_v2_48.png"
V3=ROOT/"docs/pixel/reference/triton_idle_front_repair_candidate_v3_48.png"
OUT=ROOT/"prototype_artifacts"
OUT.mkdir(exist_ok=True)

ALLOWED=(19,8,30,18)  # x0,y0,x1,y1 exclusive

def load(p):
    im=Image.open(p).convert("RGBA")
    if im.size!=(48,48):
        raise AssertionError(f"{p} must be 48x48, got {im.size}")
    return im

def raw_hash(im):
    return hashlib.sha256(im.tobytes()).hexdigest()

v2=load(V2);v3=load(V3)
diff=[]
outside=[]
alpha_diff=[]
x0,y0,x1,y1=ALLOWED
for y in range(48):
    for x in range(48):
        a=v2.getpixel((x,y));b=v3.getpixel((x,y))
        if a!=b:
            diff.append((x,y))
            if not (x0<=x<x1 and y0<=y<y1):
                outside.append((x,y,a,b))
        if a[3]!=b[3]:
            alpha_diff.append((x,y,a[3],b[3]))

errors=[]
if not diff: errors.append("v3 has no pixel changes from v2")
if outside: errors.append(f"{len(outside)} changed pixels exist outside allowed face patch")
if alpha_diff: errors.append(f"{len(alpha_diff)} alpha pixels changed; silhouette must remain identical")
if len(diff)>64: errors.append(f"face edit is unexpectedly broad: {len(diff)} pixels changed")

metrics={
  "v2_rgba_sha256":raw_hash(v2),
  "v3_rgba_sha256":raw_hash(v3),
  "changed_pixel_count":len(diff),
  "allowed_patch":list(ALLOWED),
  "changed_bbox":[min((x for x,y in diff),default=None),min((y for x,y in diff),default=None),max((x for x,y in diff),default=None),max((y for x,y in diff),default=None)],
  "outside_patch_changes":len(outside),
  "alpha_changes":len(alpha_diff),
  "body_outside_face_pixel_perfect":len(outside)==0,
  "alpha_silhouette_pixel_perfect":len(alpha_diff)==0
}
(OUT/"triton_v3_pixel_scope_metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf-8")
print(json.dumps(metrics,indent=2))
if errors:
    print("TRITON V3 PIXEL SCOPE FAIL",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)
print("TRITON V3 PIXEL SCOPE PASS")
