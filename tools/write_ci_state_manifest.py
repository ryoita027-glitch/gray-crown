#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,re,subprocess

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"; OUT.mkdir(exist_ok=True)

def sha(rel):
    p=ROOT/rel
    return hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() and p.is_file() else None

save=(ROOT/"js/core/save.js").read_text(encoding="utf-8")
m=re.search(r"\bSAVE_SCHEMA\s*=\s*(\d+)\s*;",save)

files=[
 "docs/audit/CURRENT_PROJECT_STATE.md",
 "docs/audit/NEXT_WORK_ORDER.md",
 "docs/visual/SOURCE_OF_TRUTH_STATUS.md",
 "docs/pixel/PIXEL_CHARACTER_STANDARD_v2_FOUR_PROTAGONIST.md",
 "docs/pixel/reference/karen_chibi_direction_v1.png",
 "docs/pixel/reference/triton_chibi_direction_lock_v1.png",
 "docs/pixel/reference/sophie_chibi_direction_lock_v2_48.png",
 "docs/pixel/reference/margaret_chibi_direction_lock_v5_48.png",
]
for char in ("karen","triton","sophie","margaret"):
    for anim in ("idle","walk","turn","talk","surprise","approach","laugh","run"):
        files.append(f"assets/characters/{char}/{char}_{anim}.png")

data={
 "project":"Gray Crown",
 "production_baseline":{"branch":"main","game_version":"v23","save_schema":int(m.group(1)) if m else None},
 "active_gate":"Four Protagonist Runtime Harmonization — FINAL CI / REVIEW",
 "completed_character_gates":{
   "karen":"LOCKED VISUAL REGRESSION CONTROL",
   "triton":"Triton Second Character Validation PASS",
   "sophie":"USER-APPROVED IDENTITY / DIRECTION LOCK v2 TECHNICAL CLEANUP",
   "margaret":"DIRECTION LOCK v5 / EIGHT RUNTIME CATEGORIES PROMOTED ON PROTOTYPE BRANCH"
 },
 "approved_visual_sources":{
   "karen":"docs/pixel/reference/karen_chibi_direction_v1.png",
   "triton":"docs/pixel/reference/triton_chibi_direction_lock_v1.png",
   "sophie":"docs/pixel/reference/sophie_chibi_direction_lock_v2_48.png",
   "margaret":"docs/pixel/reference/margaret_chibi_direction_lock_v5_48.png"
 },
 "next_gate_after_green":"Four Protagonist Environment Integration",
 "automation_boundary":{
   "technical_integrity_checks_are_automatic":True,
   "quality_evidence_generation_is_automatic":True,
   "environment_prototype_after_four_hero_green_is_automatic":True,
   "main_merge_is_automatic":False,
   "formal_pixel_native_adoption_is_automatic":False,
   "final_portrait_policy_is_automatic":False
 },
 "git":{
   "checked_out_head":subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip(),
   "working_tree":subprocess.check_output(["git","status","--porcelain","--untracked-files=all"],cwd=ROOT,text=True).splitlines()
 },
 "sha256":{rel:sha(rel) for rel in files}
}
(OUT/"ci_state_manifest.json").write_text(json.dumps(data,indent=2,ensure_ascii=False),encoding="utf-8")
print(json.dumps(data,indent=2,ensure_ascii=False))
