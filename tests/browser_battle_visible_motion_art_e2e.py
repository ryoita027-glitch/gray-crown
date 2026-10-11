#!/usr/bin/env python3
"""Browser acceptance: characters MUST be visible and pixel atlas/route assets live.

Real Chromium, not a source-only assertion; screenshots are evidence generated
by this script only after successful execution. Test NOT run by patch author.
"""
import contextlib, http.server, threading, base64, json, mimetypes, re
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


def bundled_offline_game():
 """Run the exact checkout without local HTTP, which restricted browsers can block."""
 html=(ROOT/"index.html").read_text(encoding="utf-8")
 css=(ROOT/"css/game.css").read_text(encoding="utf-8")
 assets={}
 for file in (ROOT/"assets").rglob("*"):
  if file.is_file() and file.suffix.lower() in {".png",".jpg",".jpeg",".webp",".svg",".wav",".ogg"}:
   rel=file.relative_to(ROOT).as_posix()
   mime=mimetypes.guess_type(file.name)[0] or "application/octet-stream"
   assets[rel]="data:"+mime+";base64,"+base64.b64encode(file.read_bytes()).decode()
 for rel,data in assets.items():
  css=css.replace("../"+rel,data)
 html=re.sub(r'<link[^>]*href="css/game\.css"[^>]*>',lambda _: "<style>"+css+"</style>",html)
 setup="""
 <script>
 const offlineImages=__IMAGE_MAP__;
 const oldSrc=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
 Object.defineProperty(HTMLImageElement.prototype,'src',{
  get(){return oldSrc.get.call(this)},
  set(url){return oldSrc.set.call(this,offlineImages[url]||url)}
 });
 const rewriteImages=()=>{
  for(const img of document.images){
   const name=img.getAttribute('src');
   if(offlineImages[name])img.src=offlineImages[name];
  }
 };
 new MutationObserver(rewriteImages).observe(document,{subtree:true,childList:true,
   attributes:true,attributeFilter:['src']});
 </script>
 """.replace("__IMAGE_MAP__",json.dumps(assets,ensure_ascii=False))
 html=html.replace("<body>","<body>"+setup,1)
 def script_sub(match):
  rel=match.group(1)
  script=(ROOT/rel).read_text(encoding="utf-8")
  return "<script>\n"+script.replace("</script>","<\\/script>")+"\n</script>"
 html=re.sub(r'<script src="([^"]+)"></script>',script_sub,html)
 return html

def main():
 OUT.mkdir(parents=True,exist_ok=True)
 with local_game() as url,sync_playwright() as pw:
  browser=launch_chromium(pw)
  try:
   for width in [1280,430]:
    page=browser.new_page(viewport={"width":width,"height":850})
    errors=[]
    page.on("pageerror",lambda err:errors.append(str(err)))
    try:
     page.goto(url,wait_until="networkidle",timeout=8000)
    except Exception:
     # Works in admin-restricted Chrome and uses the same repository files.
     page.set_content(bundled_offline_game(),wait_until="load",timeout=45000)
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
    # Show real city architecture, population and palette in the same UI.
    page.evaluate("""() => {
      const s=GC.State.get();s.map='capital';s.x=12;s.y=9;s.dir='up';
      s.trail=[];s.worldStepsOnMap=0;
      GC.Render.World.VISUAL.map=null;GC.Render.World.draw()
    }""")
    page.wait_for_timeout(260)
    assert page.evaluate("!!OpeningPixelAssets.getNpcAtlas('capitalVendor')"),"capital merchant art not painted"
    page.locator("#game").screenshot(path=str(OUT/f"capital_{width}.png"))
    # Catalog all NPC drawings at original 32px pixels (4x visual scale):
    # no stock portraits or recolored single picture may pass as unique.
    page.evaluate("""() => {
      let gallery=document.getElementById('npcReviewGrid');
      if(gallery)gallery.remove();
      gallery=document.createElement('canvas');
      gallery.id='npcReviewGrid';gallery.width=7*42;gallery.height=5*42;
      gallery.style.cssText='width:1176px;height:840px;image-rendering:pixelated;background:#243039;display:block';
      const g=gallery.getContext('2d');g.imageSmoothingEnabled=false;
      Object.keys(OpeningPixelAssets.designs).forEach((id,i)=>{
        OpeningPixelAssets.drawNpc(g,{id,x:(i%7)*42/32,y:Math.floor(i/7)*42/32},'down',0);
      });
      document.body.appendChild(gallery)
    }""")
    page.locator("#npcReviewGrid").screenshot(path=str(OUT/f"npc_all_35_{width}.png"))
    page.evaluate("document.getElementById('npcReviewGrid').remove()")
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
    # Each hero must be separately visible and not touch the adjacent cell.
    hero_boxes=[]
    for i in range(4):
     hero=page.locator(f"#battleHero{i}")
     bb=hero.bounding_box()
     assert bb and bb["width"]==48 and bb["height"]==48,(i,bb)
     hero.screenshot(path=str(OUT/f"battle_hero{i}_{width}.png"))
     hero_boxes.append(bb)
    assert all(hero_boxes[i]["x"]+hero_boxes[i]["width"]<=hero_boxes[i+1]["x"] for i in range(3)),hero_boxes
    page.locator("#battlePanel").screenshot(path=str(OUT/f"battle_all_heroes_{width}.png"))
    assert not errors,errors
    print("PASS",width,"px: NPC atlas, house tile, follower stepping, 4 non-empty images, 48px clip")
    page.close()
  finally:browser.close()

if __name__=="__main__":main()
