#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import json, hashlib

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"prototype_artifacts/environment"; OUT.mkdir(parents=True,exist_ok=True)
SC=ROOT/"assets/environment/prototype/scenes"
K=ROOT/"assets/characters/karen/karen_idle.png"; T=ROOT/"assets/characters/triton/triton_idle.png"

def cell(path):
    im=Image.open(path).convert("RGBA")
    if im.width<48 or im.height<48: raise ValueError(f"{path} too small")
    return im.crop((0,0,48,48))
def pair(scene,size,name):
    bg=Image.open(scene).convert("RGBA"); k=cell(K).resize((size,size),Image.Resampling.NEAREST); t=cell(T).resize((size,size),Image.Resampling.NEAREST)
    y=bg.height-size-28; bg.alpha_composite(k,(bg.width//2-80,y)); bg.alpha_composite(t,(bg.width//2+34,y)); bg.save(OUT/name)
def one(scene,sprite,size,name):
    bg=Image.open(scene).convert("RGBA"); sp=sprite.resize((size,size),Image.Resampling.NEAREST)
    bg.alpha_composite(sp,(bg.width//2-size//2,bg.height-size-28)); bg.save(OUT/name)

k=cell(K); t=cell(T)
scenes={"village":SC/"village_micro_v1.png","field":SC/"grass_field_micro_v1.png","house_exterior":SC/"house_exterior_v1.png","house_interior":SC/"house_interior_v1.png"}
one(scenes["village"],k,44,"village_karen_medium44.png"); one(scenes["village"],t,44,"village_triton_medium44.png"); pair(scenes["village"],44,"village_pair_medium44.png")
one(scenes["field"],k,44,"field_karen_medium44.png"); one(scenes["field"],t,44,"field_triton_medium44.png"); pair(scenes["field"],44,"field_pair_medium44.png")
pair(scenes["house_exterior"],44,"house_exterior_pair_medium44.png"); pair(scenes["house_interior"],44,"house_interior_pair_medium44.png")
pair(scenes["village"],48,"village_pair_full48.png"); pair(scenes["village"],41,"village_pair_compact41.png")
metrics={"karen_source":"assets/characters/karen/karen_idle.png","triton_source":"assets/characters/triton/triton_idle.png","source_cell":[48,48],"scales":{"full":48,"medium":44,"compact":41},"scene_size":[512,320],"method":"actual committed runtime PNG mechanical composition; nearest-neighbor only","karen_sha256":hashlib.sha256(K.read_bytes()).hexdigest(),"triton_sha256":hashlib.sha256(T.read_bytes()).hexdigest()}
(OUT/"environment_character_metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf-8")
print(json.dumps(metrics,indent=2))
