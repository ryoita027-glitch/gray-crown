#!/usr/bin/env python3
"""Run real Gray Crown QA from an EXACT local checkout, without GitHub Actions.

No dev-mode shortcuts, no fixture data injected into a game, no 'PASS' on skip.
This is an orchestrator; all tests retain their original assertions.
Artifacts/prototype output is preserved, not committed or uploaded.

Quick: python tools/phase7_local_acceptance.py --mode quick
Full:  python tools/phase7_local_acceptance.py --mode full \
          --main-v23-dir /path/to/UNCHANGED-main-v23-checkout
"""
from __future__ import annotations
import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from datetime import datetime,timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def utc():return datetime.now(timezone.utc).isoformat()
def capture(root:Path, argv:list[str], timeout:int, label:str):
    start=time.monotonic()
    try:
        p=subprocess.run(argv,cwd=root,capture_output=True,text=True,
                         timeout=timeout,check=False)
        result={"name":label,"status":"PASS" if p.returncode==0 else "FAIL",
                "exit_code":p.returncode,
                "seconds":round(time.monotonic()-start,2),
                "command":argv,
                "stdout_tail":p.stdout[-7000:],
                "stderr_tail":p.stderr[-7000:]}
    except subprocess.TimeoutExpired as e:
        result={"name":label,"status":"FAIL","exit_code":None,
                "seconds":round(time.monotonic()-start,2),
                "command":argv,"error":"TIMEOUT",
                "stdout_tail":str(e.stdout or "")[-3500:],
                "stderr_tail":str(e.stderr or "")[-3500:]}
    except FileNotFoundError as e:
        result={"name":label,"status":"BLOCKED","exit_code":None,"command":argv,
                "seconds":round(time.monotonic()-start,2),"error":str(e)}
    return result

def run(root:Path,mode:str,main_v23_dir:Path|None,output:Path):
    root=root.resolve()
    cmds=[
      ("file imports, schema23, approved sprites", [sys.executable,"tools/phase7_preflight.py","--root",str(root)],60),
      ("original static syntax", ["node","tests/check-syntax.js"],65),
      ("source authority", [sys.executable,"tools/verify_project_authority.py"],75),
      ("repository hygiene", [sys.executable,"tools/verify_repo_hygiene.py"],75),
      ("four-hero manifest", [sys.executable,"tools/verify_phase1_asset_manifest.py"],75),
      ("Sophie source lock", [sys.executable,"tools/verify_sophie_direction_lock.py"],75),
      ("Margaret source lock", [sys.executable,"tools/verify_margaret_direction_lock.py"],75),
      ("runtime alpha/shadow checks", [sys.executable,"tools/verify_clean_runtime_sprite_assets.py"],75),
      ("four protagonist visual runtime", [sys.executable,"tools/verify_four_protagonist_appeal_runtime.py"],75),
      ("all Node tests", ["npm","test"],180),
    ]
    if mode=="full":
        cmds += [
            ("original browser chapter regression", ["npm","run","browser-test"],420),
            ("previous real pixel-world gate", [sys.executable,"tests/browser_pixel_vslice_acceptance_e2e_test.py"],360),
            ("Ryune environment + interiors", [sys.executable,"tests/browser_ryune_environment_e2e_test.py"],380),
            ("Ryune appointment acting Portrait A/B", [sys.executable,"tests/browser_ryune_acting_e2e_test.py"],380),
            ("road/cave/boss battle QA", [sys.executable,"tests/browser_road_cave_quality_e2e_test.py"],450),
            ("entire authentic village to boss to capital", [sys.executable,"tests/browser_vertical_slice_e2e_test.py"],650),
        ]
    report={"kind":"GRAY_CROWN_PHASE7_LOCAL_RUN","started_utc":utc(),"mode":mode,
            "root":str(root),"source_commit":"UNVERIFIED","steps":[],
            "main_v23_dir":str(main_v23_dir) if main_v23_dir else None,
            "warning":"Only tests actually run on the recorded local checkout can pass. "
                "This does not establish the SHA on GitHub or art acceptance.",
            "status":"INCOMPLETE"}
    git=shutil.which("git")
    if git and (root/".git").exists():
        s=subprocess.run([git,"rev-parse","HEAD"],cwd=root,capture_output=True,
                         text=True,check=False)
        if s.returncode==0:report["source_commit"]=s.stdout.strip()
    output.parent.mkdir(parents=True,exist_ok=True)
    def write():
        output.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf8")
    write()
    for name,command,limit in cmds:
        print("RUN",name,flush=True)
        step=capture(root,command,limit,name)
        report["steps"].append(step)
        write()
        if step["status"]!="PASS":
            report["status"]=step["status"]
            report["blocked_at"]=name
            report["finished_utc"]=utc()
            write()
            print("STOP",step["status"],name,"(see report JSON)",flush=True)
            return 1
    if mode=="full":
        # The production-main save check MUST use the actual v23 source, never
        # a fabricated save or a directory from this development checkout.
        if main_v23_dir is None or not main_v23_dir.resolve().is_dir():
            report["status"]="BLOCKED"
            report["blocked_at"]="real main v23 save/backup/defeat fixture missing"
            report["finished_utc"]=utc();write()
            print("STOP: full acceptance requires --main-v23-dir",flush=True)
            return 2
        env=os.environ.copy()
        env["GRAY_CROWN_MAIN_V23_DIR"]=str(main_v23_dir.resolve())
        start=time.monotonic()
        try:
            p=subprocess.run([sys.executable,"tests/browser_phase0_remaining_e2e_test.py"],
                cwd=root,env=env,capture_output=True,text=True,timeout=500,check=False)
            step={"name":"real main-v23 save compatibility","status":"PASS" if p.returncode==0 else "FAIL",
                  "exit_code":p.returncode,"seconds":round(time.monotonic()-start,2),
                  "stdout_tail":p.stdout[-7000:],"stderr_tail":p.stderr[-7000:]}
        except Exception as e:
            step={"name":"real main-v23 save compatibility","status":"FAIL","error":str(e),
                  "seconds":round(time.monotonic()-start,2)}
        report["steps"].append(step);write()
        if step["status"]!="PASS":
            report["status"]="FAIL";report["blocked_at"]=step["name"]
            report["finished_utc"]=utc();write();return 1
    report["status"]="PASS_QUICK_ONLY" if mode=="quick" else "PASS_TECHNICAL_ONLY"
    report["finished_utc"]=utc();write()
    print(report["status"],"— artistic/user acceptance still separate",flush=True)
    return 0

if __name__=="__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root",type=Path,default=ROOT)
    parser.add_argument("--mode",choices=("quick","full"),default="quick")
    parser.add_argument("--main-v23-dir",type=Path,default=None)
    parser.add_argument("--out",type=Path,default=None)
    args=parser.parse_args()
    path=args.out or args.root/"prototype_artifacts/phase7/local_acceptance.json"
    sys.exit(run(args.root,args.mode,args.main_v23_dir,path))
