#!/usr/bin/env python3
import contextlib,http.server,os,socketserver,threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts/four_protagonist_appeal_v1"
OUT.mkdir(parents=True,exist_ok=True)
PORT=8772

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

@contextlib.contextmanager
def server():
    old=os.getcwd();os.chdir(ROOT)
    httpd=socketserver.TCPServer(("127.0.0.1",PORT),Quiet)
    t=threading.Thread(target=httpd.serve_forever,daemon=True);t.start()
    try: yield
    finally: httpd.shutdown();httpd.server_close();os.chdir(old)

with server():
  with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1280,"height":900},device_scale_factor=1)
    errors=[]
    page.on("console",lambda m: errors.append(m.text) if m.type=="error" else None)
    page.goto(f"http://127.0.0.1:{PORT}/index.html",wait_until="networkidle")
    page.click("#titleNewGame")
    page.wait_for_timeout(350)
    for _ in range(4):
        page.keyboard.press("Space");page.wait_for_timeout(80)
    # Visual evidence must show the party itself, not a dialogue overlay.
    page.evaluate("() => GC.Dialogue.closeDialogue(false)")
    page.wait_for_timeout(120)

    # Put the real runtime party on an open path so all four are visible.
    page.evaluate("""() => {
      const s=GC.State.get();
      s.map='road'; s.x=12; s.y=11; s.dir='right';
      s.trail=[[11,11],[10,11],[9,11]];
      const v=GC.Render.World.VISUAL;
      v.map=null;
      GC.Render.World.draw();
    }""")
    page.wait_for_timeout(500)

    # Give motion a few steps; this exercises the rebuilt 32px walk sheet.
    for key in ("ArrowRight","ArrowRight","ArrowUp","ArrowDown"):
        page.keyboard.press(key);page.wait_for_timeout(160)

    canvas=page.locator("canvas").first
    if canvas.count()!=1: raise AssertionError("game canvas missing")
    # Nearest-neighbour is set immediately around hero-sheet draw calls in world.js.
    # The canvas property may be changed by later unrelated drawing, so final-state
    # imageSmoothingEnabled is not a valid assertion here.

    # Ensure the current party sheet really contains all four character rows.
    dims=page.evaluate("""() => new Promise((resolve,reject)=>{
      const i=new Image();i.onload=()=>resolve([i.naturalWidth,i.naturalHeight]);
      i.onerror=()=>reject(new Error('party sheet load failed'));
      i.src='assets/hero_party_walk.png?appeal=1';
    })""")
    if dims!=[96,512]: raise AssertionError("party sheet dimensions "+repr(dims))

    page.screenshot(path=str(OUT/"actual_game_four_party.png"),full_page=True)

    # A second screenshot in the village gives a softer green/brown contrast context.
    page.evaluate("""() => {
      const s=GC.State.get();
      s.map='village'; s.x=12; s.y=12; s.dir='up';
      s.trail=[[11,12],[10,12],[9,12]];
      GC.Render.World.VISUAL.map=null;
      GC.Render.World.draw();
    }""")
    page.wait_for_timeout(500)
    page.screenshot(path=str(OUT/"actual_game_four_party_village.png"),full_page=True)

    if errors: raise AssertionError("console errors: "+repr(errors))
    browser.close()

print("FOUR PROTAGONIST APPEAL BROWSER E2E PASS")
