#!/usr/bin/env python3
"""Browser acceptance: characters MUST be visible and pixel atlas/route assets live.

Real Chromium, not a source-only assertion; screenshots are evidence generated
by this script only after successful execution. Test NOT run by patch author.
"""
import contextlib, http.server, threading
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_launch import launch_chromium

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"/"battle_heroes_npc_atlas_motion"

@contextlib.contextmanager
def local_game():
 class Quiet(http.server.SimpleHTTPRequestHandler):
  def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
  def log_message(self,*a):pass
 server=http.server.ThreadingHTTPServer(("127.0.0.1",0),Quiet)
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:yield f"http://127.0.0.1:{server.server_port}/index.html"
 finally:server.shutdown();server.server_close()

def main():
 OUT.mkdir(parents=True,exist_ok=True)
 with local_game() as url,sync_playwright() as pw:
  browser=launch_chromium(pw)
  try:
   for width in [1280,430]:
    page=browser.new_page(viewport={"width":width,"height":850})
    errors=[]
    page.on("pageerror",lambda err:errors.append(str(err)))
    page.goto(url,wait_until="networkidle")
    page.locator("#titleNewGame").click()
    page.evaluate("GC.Dialogue.closeDialogue(false)")
    page.wait_for_timeout(400)
    village=page.evaluate("""() => ({
     names:['baker','farmer','orphan','mayor'],
     visible:!!OpeningPixelAssets.getNpcAtlas('baker'),
     house:!!OpeningPixelAssets.getHouseTile('orphanage')
    })""")
    assert village["visible"],"new baker character atlas never drawn"
    assert village["house"],"unique orphanage tile never drawn"
    page.locator("#game").screenshot(path=str(OUT/f"village_{width}.png"))
    page.evaluate("""() => {
      const s=GC.State.get();s.map='road';s.x=11;s.y=13;s.dir='up';
      s.trail=[];s.worldStepsOnMap=0;
      GC.Render.World.VISUAL.map=null;GC.Render.World.draw()
    }""")
    page.wait_for_timeout(180)
    page.evaluate("""() => {
      GC.Render.World.VISUAL.nextMoveAt=0;
      move('up')
    }""")
    page.wait_for_timeout(120)
    positions=page.evaluate("""() => ({
      player:[GC.State.get().x,GC.State.get().y],
      trail:partyTrailPoints(),
      phase:GC.Render.World.VISUAL.travelPhase
    })""")
    assert positions["player"]==[11,12],positions
    assert len(positions["trail"])==3,positions
    assert len({tuple(x) for x in positions["trail"]})==3,positions
    assert positions["phase"]>0,positions
    page.locator("#game").screenshot(path=str(OUT/f"road_walking_{width}.png"))
    page.evaluate("startBattle('wolves')")
    page.wait_for_timeout(800)
    page.wait_for_function("""() => {
      const line=document.getElementById('partyBattleLine');
      return line&&line.querySelectorAll('.battle-frame-image').length===4;
    }""",timeout=6000)
    images=page.evaluate("""() =>
      [...document.querySelectorAll('#partyBattleLine .battle-hero')].map(h=>{
       const img=h.querySelector('img'),box=h.querySelector('.battle-sprite-frame');
       const bb=box.getBoundingClientRect(),s=getComputedStyle(box);
       return {hero:h.dataset.hero,ready:h.classList.contains('asset-ready'),
         displayed:getComputedStyle(h).display,opacity:getComputedStyle(img).opacity,
         natural:[img.naturalWidth,img.naturalHeight],
         imageUrl:img.currentSrc,frame:[bb.width,bb.height],
         overflow:s.overflow}
      })""")
    assert [x["hero"] for x in images]==['karen','triton','sophie','margaret'],images
    assert all(x["ready"] for x in images),images
    assert all(x["displayed"]!="none" and x["opacity"]!="0" for x in images),images
    assert all(x["natural"][0]>=192 and x["natural"][1]>=192 for x in images),images
    assert all(x["frame"]==[48,48] and x["overflow"]=="hidden" for x in images),images
    page.locator("#battlePanel").screenshot(path=str(OUT/f"battle_all_heroes_{width}.png"))
    assert not errors,errors
    print("PASS",width,"px: NPC atlas, house tile, follower stepping, 4 non-empty images, 48px clip")
    page.close()
  finally:browser.close()

if __name__=="__main__":main()
