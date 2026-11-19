#!/usr/bin/env python3
"""Screenshot acceptance for authored opening environments.

Uses actual browser Canvas. Before/after captures are comparable because
the same scene is drawn with only OpeningWorldLife toggled. These files are
NOT generated until this script passes on a checkout with Chromium installed.
"""
from __future__ import annotations
import contextlib
import hashlib
import http.server
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_launch import launch_chromium

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"/"opening_worldlife_review"

@contextlib.contextmanager
def web_app():
 class Quiet(http.server.SimpleHTTPRequestHandler):
  def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
  def log_message(self,*a):pass
 server=http.server.ThreadingHTTPServer(("127.0.0.1",0),Quiet)
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:yield f"http://127.0.0.1:{server.server_port}/index.html"
 finally:server.shutdown();server.server_close()

def scene(page,map_id,x,y,enabled,decision=None):
 page.evaluate("""([mapId,x,y,enabled,decision])=>{
  const s=GC.State.get();s.map=mapId;s.x=x;s.y=y;s.dir='up';
  s.trail=[];s.events.choices['early.merchantCart']=decision||undefined;
  OpeningWorldLife.enabled=enabled;
  GC.Render.World.VISUAL.map=null;
  GC.Render.World.draw();
 }""",[map_id,x,y,enabled,decision])
 page.wait_for_timeout(320)
 return page.locator("#game").screenshot()

def main():
 OUT.mkdir(parents=True,exist_ok=True)
 with web_app() as url,sync_playwright() as pw:
  browser=launch_chromium(pw)
  try:
   for viewport in [{"width":1280,"height":900},{"width":430,"height":850}]:
    page=browser.new_page(viewport=viewport,device_scale_factor=1)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(url,wait_until="networkidle")
    page.locator("#titleNewGame").click()
    page.evaluate("GC.Dialogue.closeDialogue(false)")
    for map_id,x,y in [('village',12,11),('road',11,10),('capital',12,9)]:
     original=scene(page,map_id,x,y,False)
     improved=scene(page,map_id,x,y,True)
     label=f"{map_id}_{viewport['width']}"
     (OUT/(label+"_baseline.png")).write_bytes(original)
     (OUT/(label+"_worldlife.png")).write_bytes(improved)
     assert hashlib.sha256(original).digest()!=hashlib.sha256(improved).digest(),label+": new art had no visual effect"
     assert len(improved)>1000,label+": image seems empty"
    page.evaluate("OpeningWorldLife.enabled=true")
    page.evaluate("GC.State.get().map='road';GC.Render.World.VISUAL.map=null")
    assert page.evaluate("isBlocked(5,7)") is True,"merchant cart must be solid"
    page.evaluate("GC.State.get().map='capital';GC.Render.World.VISUAL.map=null")
    assert page.evaluate("isBlocked(3,7)") is True,"market stall must be solid"
    assert page.evaluate("isBlocked(11,7)") is False,"main civic avenue must remain open"
    assert not errors,errors
    print("PASS actual Chromium scenery/collision at",viewport["width"],"px")
    page.close()
  finally:browser.close()

if __name__=="__main__":main()
