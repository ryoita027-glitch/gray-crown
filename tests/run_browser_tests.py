from pathlib import Path
import os,signal,subprocess,sys,time
ROOT=Path(__file__).resolve().parents[1]
TESTS=['browser_startup_test.py','browser_alpha1_e2e_test.py','browser_alpha1_stress_test.py','browser_devmode_test.py','browser_alpha2_ashroad_e2e_test.py']
for name in TESTS:
    print(f'=== {name} ===',flush=True);started=time.monotonic()
    proc=subprocess.Popen([sys.executable,str(ROOT/'tests'/name)],cwd=ROOT,start_new_session=True)
    try: code=proc.wait(timeout=90)
    except subprocess.TimeoutExpired:
        os.killpg(proc.pid,signal.SIGKILL);proc.wait(timeout=10);print(f'BROWSER TEST TIMEOUT: {name}',file=sys.stderr);sys.exit(124)
    if code!=0: print(f'BROWSER TEST FAILED: {name} exit={code}',file=sys.stderr);sys.exit(code)
    print(f'PASS {name} ({time.monotonic()-started:.1f}s)',flush=True)
print(f'BROWSER SUITE PASS: {len(TESTS)}/{len(TESTS)}')
