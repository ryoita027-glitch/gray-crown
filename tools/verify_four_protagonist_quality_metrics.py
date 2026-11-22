#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import json, sys

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"/"four_protagonist_quality"
DATA=json.loads((OUT/"occupancy_metrics.json").read_text(encoding="utf-8"))
CHARS=("karen","triton","sophie","margaret")
ANIMS={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
errors=[]; warnings=[]

for c in CHARS:
    down=DATA["characters"][c]["directions"]["down"]["medium44"]
    w,h=down["width"],down["height"]
    face=down["face"]
    if not (18<=w<=38): warnings.append(f"{c}: Medium44 visible width review {w}px")
    if not (34<=h<=44): errors.append(f"{c}: Medium44 visible height outside protagonist band: {h}px")
    if face["visible_pixels"]<55: errors.append(f"{c}: face region too sparse: {face['visible_pixels']} visible px")
    if face["dark_pixels"]<3: errors.append(f"{c}: insufficient dark facial/hair detail: {face['dark_pixels']} px")
    if face["luma_p90_p10"]<35: errors.append(f"{c}: face-region contrast too low: {face['luma_p90_p10']}")
    if down["palette_bins"]<5: errors.append(f"{c}: palette collapsed at Medium44: {down['palette_bins']} bins")

    for anim,count in ANIMS.items():
        rel=ROOT/f"assets/characters/{c}/{c}_{anim}.png"
        if not rel.exists():
            errors.append(f"{c}: missing {anim} runtime sheet"); continue
        with Image.open(rel) as im:
            if im.mode!="RGBA": errors.append(f"{rel}: mode {im.mode} != RGBA")
            expected=(48*count,192)
            if im.size!=expected: errors.append(f"{rel}: size {im.size} != {expected}")

for pair,iou in DATA["pairwise_silhouette_iou"].items():
    if iou>=0.90: errors.append(f"silhouette distinction too weak {pair}: IoU {iou}")
    elif iou>=0.82: warnings.append(f"silhouette distinction review {pair}: IoU {iou}")

required=(
 "front_medium44_compare.png","face_compare_x12.png","grayscale_compare.png","silhouette_compare.png",
 "four_direction_compare.png","animation_contact_sheet.png","medium44_game_field.png",
 "karen_animation_contact.png","triton_animation_contact.png","sophie_animation_contact.png","margaret_animation_contact.png",
 "occupancy_metrics.json","occupancy_metrics.csv","quality_metrics_report.md"
)
for name in required:
    if not (OUT/name).exists(): errors.append(f"missing evidence artifact: {name}")

for w in warnings: print("QUALITY REVIEW:",w)
if errors:
    print("FOUR PROTAGONIST QUALITY GATE FAIL",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)

print("FOUR PROTAGONIST QUALITY GATE PASS")
print(f"soft review flags: {len(warnings)}")
