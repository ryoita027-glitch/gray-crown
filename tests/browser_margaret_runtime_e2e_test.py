#!/usr/bin/env python3
import contextlib, http.server, socketserver, subprocess, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
PORT=8765
URL=f"http://127.0.0.1:{PORT}/prototypes/margaret-runtime/index.html"
EVIDENCE=ROOT/"prototype_artifacts"/"margaret_runtime_e2e"
EVIDENCE.mkdir(parents=True,exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass

@contextlib.contextmanager
def server():
    old=Path.cwd()
    import os
    os.chdir(ROOT)
    httpd=socketserver.TCPServer(("127.0.0.1",PORT),Quiet)
    import threading
    th=threading.Thread(target=httpd.serve_forever,daemon=True)
    th.start()
    try:
        yield
    finally:
        httpd.shutdown();httpd.server_close();os.chdir(old)

with server():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        page=browser.new_page(viewport={"width":960,"height":760},device_scale_factor=1)
        errors=[]
        page.on("console",lambda msg: errors.append(msg.text) if msg.type=="error" else None)
        page.goto(URL,wait_until="networkidle")
        page.wait_for_function("document.documentElement.dataset.ready === 'true'",timeout=15000)
        assert page.locator("canvas#stage").count()==1
        assert page.locator("#controls button").count()==8
        assert "scale=44" in page.locator("#status").inner_text()
        page.screenshot(path=str(EVIDENCE/"margaret_runtime_idle.png"),full_page=True)

        for anim in ("walk","talk","surprise","laugh","run","turn","approach"):
            page.locator(f'button[data-anim="{anim}"]').click()
            page.wait_for_function(f"document.documentElement.dataset.animation === '{anim}'")
            page.wait_for_timeout(250)
        page.screenshot(path=str(EVIDENCE/"margaret_runtime_run.png"),full_page=True)

        if errors:
            raise AssertionError("browser console errors: "+repr(errors))
        browser.close()

print("MARGARET RUNTIME BROWSER E2E PASS")
