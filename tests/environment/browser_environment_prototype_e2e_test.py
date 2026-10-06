#!/usr/bin/env python3
from pathlib import Path
import subprocess, sys, time, urllib.request
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"prototype_artifacts/environment/browser"; OUT.mkdir(parents=True,exist_ok=True)
PORT=8137
server=subprocess.Popen([sys.executable,"-m","http.server",str(PORT),"--bind","127.0.0.1"],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
    for _ in range(50):
        try: urllib.request.urlopen(f"http://127.0.0.1:{PORT}/prototypes/environment/",timeout=.2); break
        except Exception: time.sleep(.1)
    else: raise RuntimeError("preview server did not start")
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True); page=browser.new_page(viewport={"width":900,"height":520}); errors=[]
        page.on("pageerror",lambda e: errors.append(str(e)))
        page.goto(f"http://127.0.0.1:{PORT}/prototypes/environment/",wait_until="networkidle")
        page.wait_for_function("window.GCEnvPreview && window.GCEnvPreview.state.ready")
        src=page.evaluate("window.GCEnvPreview.characterSources")
        assert src["karen"].endswith("assets/characters/karen/karen_idle.png")
        assert src["triton"].endswith("assets/characters/triton/triton_idle.png")
        cases=[]
        for scene in ("village","field","houseExterior","houseInterior"):
            cases += [(scene,"karen","48"),(scene,"karen","44"),(scene,"triton","44"),(scene,"pair","44"),(scene,"pair","41")]
        for scene,mode,scale in cases:
            page.select_option("#scene",scene); page.select_option("#mode",mode); page.select_option("#scale",scale)
            page.wait_for_function(f"window.GCEnvPreview.state.scene==='{scene}' && window.GCEnvPreview.state.mode==='{mode}' && String(window.GCEnvPreview.state.size)==='{scale}'")
            page.locator("#preview").screenshot(path=str(OUT/f"{scene}_{mode}_{scale}.png"))
        assert not errors,errors; assert page.evaluate("!window.GCEnvPreview.error"); browser.close()
    print("GRAY CROWN ENVIRONMENT PROTOTYPE v1 BROWSER PASS")
finally:
    server.terminate()
    try: server.wait(timeout=3)
    except Exception: server.kill()
