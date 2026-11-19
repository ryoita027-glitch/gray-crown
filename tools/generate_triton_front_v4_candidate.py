#!/usr/bin/env python3
"""Generate Triton front repair v4 deterministically from committed v3.

The v4 candidate is NOT a redrawn comparison board. It is a real 48x48 RGBA
candidate produced by applying an explicit, reviewable face-pixel patch to the
committed v3 source. Karen is never read or modified by this generator.
"""
from pathlib import Path
from PIL import Image
import hashlib, json

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"docs/pixel/reference/triton_idle_front_repair_candidate_v3_48.png"
OUT_DIR=ROOT/"prototype_artifacts"
OUT_DIR.mkdir(exist_ok=True)
OUT=OUT_DIR/"triton_idle_front_repair_candidate_v4_48.png"

EDITS=[
[23,8,[252,198,156,255]],[24,8,[30,14,19,255]],[26,8,[252,198,156,255]],
[21,9,[252,198,156,255]],[22,9,[252,198,156,255]],[23,9,[252,198,156,255]],[24,9,[30,14,19,255]],[25,9,[30,14,19,255]],[26,9,[252,198,156,255]],[27,9,[252,198,156,255]],[28,9,[252,198,156,255]],
[20,10,[79,50,53,255]],[21,10,[79,50,53,255]],[22,10,[79,50,53,255]],[23,10,[252,198,156,255]],[24,10,[252,198,156,255]],[25,10,[252,198,156,255]],[26,10,[252,198,156,255]],[27,10,[79,50,53,255]],[28,10,[79,50,53,255]],[29,10,[79,50,53,255]],
[23,11,[252,198,156,255]],[24,11,[252,198,156,255]],[25,11,[252,198,156,255]],[29,11,[252,198,156,255]],
[19,12,[41,22,27,255]],[20,12,[41,22,27,255]],[21,12,[41,22,27,255]],[22,12,[41,22,27,255]],[25,12,[252,198,156,255]],[26,12,[252,198,156,255]],[27,12,[41,22,27,255]],[28,12,[41,22,27,255]],[29,12,[41,22,27,255]],[30,12,[41,22,27,255]],
[19,13,[241,139,101,255]],[20,13,[240,227,212,255]],[21,13,[83,51,55,255]],[22,13,[240,227,212,255]],[23,13,[252,198,156,255]],[25,13,[252,198,156,255]],[26,13,[252,198,156,255]],[27,13,[240,227,212,255]],[28,13,[83,51,55,255]],[29,13,[240,227,212,255]],[30,13,[241,139,101,255]],
[19,14,[241,139,101,255]],[21,14,[252,198,156,255]],[22,14,[252,198,156,255]],[24,14,[252,198,156,255]],[25,14,[252,198,156,255]],[26,14,[252,198,156,255]],[27,14,[252,198,156,255]],[29,14,[252,198,156,255]],[30,14,[241,139,101,255]],
[20,15,[41,22,27,255]],[22,15,[252,198,156,255]],[23,15,[252,198,156,255]],[24,15,[252,198,156,255]],[25,15,[241,139,101,255]],[27,15,[252,198,156,255]],[28,15,[252,198,156,255]],[29,15,[41,22,27,255]],
[20,16,[41,22,27,255]],[21,16,[252,198,156,255]],[24,16,[145,46,44,255]],[25,16,[196,79,63,255]],[26,16,[145,46,44,255]],[27,16,[252,198,156,255]],[28,16,[252,198,156,255]],[29,16,[41,22,27,255]],
[21,17,[41,22,27,255]],[22,17,[252,198,156,255]],[26,17,[252,198,156,255]],[27,17,[252,198,156,255]],[28,17,[41,22,27,255]]
]

im=Image.open(SRC).convert("RGBA")
if im.size!=(48,48):
    raise SystemExit(f"v3 source must be 48x48, got {im.size}")
for x,y,rgba in EDITS:
    if im.getpixel((x,y))[3]==0:
        raise SystemExit(f"edit touches transparent pixel at {(x,y)}")
    im.putpixel((x,y),tuple(rgba))
im.save(OUT,optimize=True,compress_level=9)

raw=hashlib.sha256(im.tobytes()).hexdigest()
if raw!="ed42a5fcada5e77989e452d2870faf80ebc851515c6ae7bfb87f4fbaeadbc0a8":
    raise SystemExit(f"unexpected v4 RGBA hash: {raw}")

meta={
 "output":str(OUT.relative_to(ROOT)),
 "edit_count":len(EDITS),
 "rgba_sha256":raw,
 "source":"docs/pixel/reference/triton_idle_front_repair_candidate_v3_48.png",
 "note":"eye color remains provisional implementation data, not locked canon"
}
(OUT_DIR/"triton_v4_generation_metrics.json").write_text(json.dumps(meta,indent=2),encoding="utf-8")
print(json.dumps(meta,indent=2))
