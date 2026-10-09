#!/usr/bin/env python3
"""Gray Crown Phase 7 runner-independent *preflight*.

This validates the files in the CURRENT CHECKOUT only. It does not claim to
test gameplay, visual quality, browser compatibility or a GitHub runner.
No external dependencies, network access, downloads, image generation or
modification of source assets. JSON output is explicitly not an E2E result.

Usage:
  python tools/phase7_preflight.py
  python tools/phase7_preflight.py --root /path/to/exact/checkout --out /tmp/phase7.json
  python tools/phase7_preflight.py --self-test
"""
from __future__ import annotations
import argparse
import json
import re
import shutil
import struct
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ANIMS={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,
       "approach":4,"laugh":6,"run":6}
HEROES=("karen","triton","sophie","margaret")
REQUIRED_MAPS=("village","karenhome","orphanage","mayorhouse","cottage",
               "road","cave","northroad","capital","ashroad","frontier",
               "frontierfield")
REQUIRED_CHECKS=(
    "tests/browser_vertical_slice_e2e_test.py",
    "tests/browser_road_cave_quality_e2e_test.py",
    "tests/browser_ryune_acting_e2e_test.py",
    "tests/browser_ryune_environment_e2e_test.py",
    "tests/browser_phase0_remaining_e2e_test.py",
    "tests/road_cave_combat_quality.test.js",
    ".github/workflows/vertical-slice-e2e.yml",
)
def script_imports(text):
    # Script tags use literal local JS sources, no on-the-fly bundled versions.
    return re.findall(r'<script\s+src=["\x27](js/[^"\x27]+)["\x27]',text)

def harness_imports(text):
    p=re.search(r"const\s+SCRIPT_ORDER\s*=\s*\[([\s\S]*?)\]\s*;",text)
    if p is None:
        return None
    return re.findall(r"['\x27](js/[^'\x27]+)['\x27]",p.group(1))

def story_stage_keys(text):
    p=re.search(r"const\s+STORY_STAGES\s*=\s*Object\.freeze\(\s*\{([\s\S]*?)\}\s*\)",text)
    if not p:
        return []
    return re.findall(r":\s*['\x27](\d\d_[^'\x27]+)['\x27]",p.group(1))

def png_dimensions(file_path):
    # Read-only PNG IHDR: no image library, no alpha normalization/mutation.
    with file_path.open("rb") as f:
        header=f.read(24)
    if len(header)!=24 or header[:8]!=b"\x89PNG\r\n\x1a\n" or header[12:16]!=b"IHDR":
        raise ValueError("Invalid PNG IHDR")
    return struct.unpack(">II",header[16:24])

def run(root:Path, out:Path|None=None):
    root=root.resolve()
    results=[]
    def check(name,passed,detail=None,kind="local_preflight"):
        results.append({"check":name,"passed":bool(passed),"detail":detail,"kind":kind})
    def read(rel):
        p=root/rel
        if not p.is_file():
            check("file:"+rel,False,"missing")
            return ""
        return p.read_text(encoding="utf-8")
    index=read("index.html")
    harness=read("tests/harness.js")
    imports=script_imports(index)
    ordered=harness_imports(harness)
    check("game-script-tags",bool(imports),{"count":len(imports)})
    check("node-harness-runtime-order",ordered==imports,
          {"in_html":len(imports),"in_harness":None if ordered is None else len(ordered),
           "first_mismatch":next(({"i":i,"html":a,"harness":z} for i,(a,z) in
             enumerate(zip(imports,ordered or [])) if a!=z),None)})
    check("game-script-import-unique",len(imports)==len(set(imports)))
    for rel in imports:
        check("script-present:"+rel,(root/rel).is_file())
    for rel in REQUIRED_CHECKS:
        check("required-test:"+rel,(root/rel).is_file())
    checker=shutil.which("node")
    check("node-available",checker is not None,"needed for node --check (never modifies assets)")
    if checker:
        for rel in imports:
            if not (root/rel).is_file():
                continue
            try:
                p=subprocess.run([checker,"--check",str(root/rel)],capture_output=True,
                                 text=True,timeout=12,check=False)
                check("JS-syntax:"+rel,p.returncode==0,p.stderr[-700:] if p.returncode else None)
            except (subprocess.TimeoutExpired,OSError) as exc:
                check("JS-syntax:"+rel,False,str(exc))
    story=read("js/systems/story.js")
    stage=story_stage_keys(story)
    check("Story-stage-count",len(stage)==20,stage)
    check("Story-stage-order-00-to-19",
          [int(x.split("_",1)[0]) for x in stage]==list(range(20)))
    save=read("js/core/save.js")
    check("Save-schema-23",bool(re.search(r"\bconst\s+SAVE_SCHEMA\s*=\s*23\s*;",save)))
    check("Save-primary-and-backup",bool(re.search(r"\bconst\s+SAVE_BACKUP_KEY\s*=\s*SAVE_KEY",save)))
    maps=read("js/data/maps.js")
    known=re.findall(r"^\s*([a-zA-Z][a-zA-Z0-9_]*):\s*\{\s*name\s*:",maps,re.M)
    check("required-world-maps",all(x in known for x in REQUIRED_MAPS),
          {"count":len(known),"missing":[x for x in REQUIRED_MAPS if x not in known]})
    check("road-cave-art-opt-out", "RoadCaveQuality" in read("js/render/world.js")
          and "enabled:true" in read("js/render/road_cave_quality.js"))
    check("ryune-environment-opt-out","RyuneEnvironment" in read("js/render/world.js")
          and (root/"js/render/ryune_environment.js").is_file())
    for h in HEROES:
        for animation,n in ANIMS.items():
            rel="assets/characters/"+h+"/"+h+"_"+animation+".png"
            p=root/rel
            if not p.is_file():
                check("approved-runtime-sheet:"+rel,False,"missing")
                continue
            try:
                w,ht=png_dimensions(p)
                check("runtime-sprite-dimensions:"+rel,
                      (w,ht)==(48*n,192),{"expected":[48*n,192],"actual":[w,ht]})
            except (OSError,ValueError) as exc:
                check("runtime-sprite-dimensions:"+rel,False,str(exc))
    report={
        "kind":"PRECHECK_ONLY_NOT_BROWSER_OR_RELEASE_ACCEPTANCE",
        "checked_at_utc":datetime.now(timezone.utc).isoformat(),
        "root":str(root),
        "pass":sum(x["passed"] for x in results),
        "fail":sum(not x["passed"] for x in results),
        "total":len(results),
        "checks":results,
        "disclaimer":"PASS only proves static file/run-time asset contracts here. "
            "It does NOT prove GitHub Actions, Story 00-19 playability, "
            "Save migration, boss victory, user experience or visuals.",
    }
    if out:
        out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    return report

def self_test():
    assert script_imports('<script src="js/core/dom.js"></script>')==["js/core/dom.js"]
    assert harness_imports("const SCRIPT_ORDER=['js/core/dom.js','js/game.js'];") == [
        "js/core/dom.js","js/game.js"]
    assert harness_imports("no array") is None
    assert story_stage_keys("const STORY_STAGES=Object.freeze({A:'00_village',B:'01_road'})")==[
        "00_village","01_road"]
    assert story_stage_keys("x") == []
    # Explicitly verify that missing/malformed inputs do not silently pass.
    assert script_imports("plain text") == []
    assert harness_imports("const SCRIPT_ORDER=[];") == []
    print("Phase 7 preflight parser self-test PASS (6 checks)")

if __name__=="__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root",type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument("--out",type=Path,default=None)
    parser.add_argument("--self-test",action="store_true")
    a=parser.parse_args()
    if a.self_test:
        self_test();sys.exit(0)
    report=run(a.root,a.out)
    for row in report["checks"]:
        if not row["passed"]:
            print("FAIL",row["check"],row.get("detail"),file=sys.stderr)
    print("PHASE7 STATIC PRECHECK",report["pass"],"/",report["total"],
          "passed; not an E2E/release check")
    sys.exit(0 if report["fail"]==0 else 1)
