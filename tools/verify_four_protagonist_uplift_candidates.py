#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageChops
import json, sys

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"/"four_protagonist_uplift"
CHARS=("karen","triton","sophie","margaret")
ANIMS={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
errors=[]

summary=json.loads((OUT/"uplift_summary.json").read_text(encoding="utf-8"))

# Karen/Triton are expected to remain effectively unchanged unless a real detached
# micro-artifact exists. This gate prevents broad accidental edits.
for c in ("karen","triton"):
    removed=summary["characters"][c]["total_removed_pixels"]
    if removed>24: errors.append(f"{c}: cleanup touched too many pixels: {removed}")

# Sophie is allowed to remove detached rendering debris, but not rewrite the figure.
sremoved=summary["characters"]["sophie"]["total_removed_pixels"]
if sremoved<=0: errors.append("Sophie: expected detached artifact cleanup found no pixels")
# 37 animation frames × 4 directions = 148 cells. The observed debris is a
# repeated detached 3-6 px marker per cell, so use a per-cell safety budget
# rather than an arbitrary whole-sheet total.
if sremoved>1480: errors.append(f"Sophie: cleanup too destructive: {sremoved} pixels")

for c in CHARS:
    p=OUT/c/f"{c}_direction_candidate_v1.png"
    if not p.exists():errors.append(f"missing direction candidate {p}");continue
    with Image.open(p) as im:
        if im.mode!="RGBA":errors.append(f"{c} direction mode {im.mode}")
        if im.size!=(192,48):errors.append(f"{c} direction size {im.size}")
        for di in range(4):
            bb=im.crop((di*48,0,(di+1)*48,48)).getchannel("A").getbbox()
            if not bb:errors.append(f"{c} direction {di} empty")

for c in CHARS:
    for anim,count in ANIMS.items():
        p=OUT/c/f"{c}_{anim}.png"
        if not p.exists():errors.append(f"missing {c} {anim} candidate");continue
        with Image.open(p) as im:
            if im.size!=(48*count,192):errors.append(f"{c} {anim} size {im.size}")
            if im.mode!="RGBA":errors.append(f"{c} {anim} mode {im.mode}")

for name in ("uplift_before_after_four_direction.png","uplift_cast_medium44.png","uplift_game_field_medium44.png","sophie_uplift_animation_contact.png","margaret_uplift_animation_contact.png"):
    if not (OUT/name).exists():errors.append(f"missing uplift evidence {name}")

if errors:
    print("FOUR PROTAGONIST UPLIFT CANDIDATE VERIFY FAIL",file=sys.stderr)
    for e in errors:print(" -",e,file=sys.stderr)
    sys.exit(1)

print("FOUR PROTAGONIST UPLIFT CANDIDATE VERIFY PASS")
print("removed pixels:",{c:summary["characters"][c].get("total_removed_pixels",0) for c in summary["characters"]})
