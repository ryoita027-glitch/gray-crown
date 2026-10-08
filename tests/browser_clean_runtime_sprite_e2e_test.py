#!/usr/bin/env python3
import contextlib,http.server,os,socketserver,threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts/clean_runtime_sprite_e2e"
OUT.mkdir(parents=True,exist_ok=True)
PORT=8771

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
        # close intro dialogue and walk enough to expose follower trail
        for _ in range(4): page.keyboard.press("Space"); page.wait_for_timeout(60)
        for key in ("ArrowRight","ArrowRight","ArrowDown","ArrowDown","ArrowRight","ArrowRight"):
            page.keyboard.press(key);page.wait_for_timeout(140)
        # actual game canvas, not a generated comparison board
        canvas=page.locator("canvas").first
        if canvas.count()!=1: raise AssertionError("game canvas missing")
        image_rendering=canvas.evaluate("e=>getComputedStyle(e).imageRendering")
        if image_rendering not in ("pixelated","crisp-edges"):
            raise AssertionError("canvas is not pixelated: "+image_rendering)
        page.screenshot(path=str(OUT/"actual_game_world.png"),full_page=True)

        # Verify browser loaded the rebuilt party sheet and exact natural size.
        dims=page.evaluate("""() => new Promise((resolve,reject)=>{
          const i=new Image(); i.onload=()=>resolve([i.naturalWidth,i.naturalHeight]);
          i.onerror=()=>reject(new Error('hero_party_walk load failed'));
          i.src='assets/hero_party_walk.png?e2e=1';
        })""")
        if dims!=[96,512]: raise AssertionError("party sheet dimensions "+repr(dims))
        if errors: raise AssertionError("browser console errors: "+repr(errors))
        browser.close()

print("CLEAN RUNTIME SPRITE BROWSER E2E PASS")
