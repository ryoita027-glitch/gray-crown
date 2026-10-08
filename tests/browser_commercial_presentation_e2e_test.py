#!/usr/bin/env python3
import contextlib,http.server,os,socketserver,threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts/commercial_presentation_v1"
OUT.mkdir(parents=True,exist_ok=True)
PORT=8774

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
    if "ALPHA 2.0" in page.locator("body").inner_text():
        raise AssertionError("prototype ALPHA label leaked into player-facing shell")
    if page.locator(".build-note").inner_text().strip()!="GRAY CROWN":
        raise AssertionError("player-facing build note is not cleaned")
    if page.locator(".sidebar:visible").count()!=0 or page.locator(".topbar:visible").count()!=0:
        raise AssertionError("title screen still exposes dashboard chrome")
    title_box=page.locator(".game-shell").bounding_box()
    if not title_box or title_box["width"]<1000:
        raise AssertionError("title presentation is too small: "+repr(title_box))
    page.screenshot(path=str(OUT/"commercial_title_1280x900.png"),full_page=False)

    page.click("#titleNewGame")
    page.wait_for_timeout(300)
    page.evaluate("() => GC.Dialogue.closeDialogue(false)")
    page.evaluate("""() => {
      const s=GC.State.get();
      s.map='village';s.x=12;s.y=12;s.dir='up';
      s.trail=[[12,13],[12,14],[11,14],[10,14],[9,14]];
      GC.Render.World.VISUAL.map=null;
      GC.Render.World.draw();
    }""")
    page.wait_for_function("""() => {
      const s=GC.Render?.World?.heroRuntimeStatus?.();
      return s && ['karen','triton','sophie','margaret'].every(k=>s[k]?.ready)
    }""")
    page.wait_for_timeout(450)

    canvas=page.locator("#game").bounding_box()
    if not canvas or canvas["width"]<1160:
        raise AssertionError("commercial shell leaves the game viewport too small: "+repr(canvas))

    visible_panels=page.locator(".sidebar .panel:visible").count()
    if visible_panels!=0:
        raise AssertionError(f"exploration should not expose dashboard side panels, got {visible_panels}")

    objective_display=page.locator("#objectiveLabel").evaluate("e=>getComputedStyle(e).display")
    if objective_display!="none":
        raise AssertionError("duplicated statusbar objective is still visible")

    # NPC presentation: nearby NPC must face the party and expose the new renderer API.
    facing=page.evaluate("""() => {
      const n=GC.Data.Maps.maps.village.npcs.find(n=>n.id==='baker');
      const s=GC.State.get();s.x=9;s.y=6;
      return GC.Render.World.npcFacing(n);
    }""")
    if facing not in ("left","right","up","down"):
        raise AssertionError("NPC facing renderer failed")

    page.evaluate("""() => {
      const s=GC.State.get();s.x=12;s.y=12;s.dir='up';
      GC.Render.World.VISUAL.map=null;GC.Render.World.draw();
    }""")
    page.wait_for_timeout(250)
    page.screenshot(path=str(OUT/"commercial_village_1280x900.png"),full_page=False)

    # Near the baker: contextual label should be shown only in interaction range.
    page.evaluate("""() => {
      const s=GC.State.get();s.x=8;s.y=7;s.dir='up';
      s.trail=[[8,8],[8,9],[7,9],[6,9],[5,9]];
      GC.Render.World.VISUAL.map=null;GC.Render.World.draw();
    }""")
    page.wait_for_timeout(250)
    page.screenshot(path=str(OUT/"commercial_village_interaction.png"),full_page=False)

    # Environment integration must also survive a road and a furnished interior.
    page.evaluate("""() => {
      const s=GC.State.get();s.map='road';s.x=12;s.y=10;s.dir='up';
      s.trail=[[12,11],[12,12],[11,12],[10,12],[9,12]];
      GC.Render.World.VISUAL.map=null;GC.Render.World.draw();
    }""")
    page.wait_for_timeout(300)
    page.screenshot(path=str(OUT/"commercial_road_1280x900.png"),full_page=False)

    page.evaluate("""() => {
      const s=GC.State.get();s.map='karenhome';s.x=12;s.y=10;s.dir='up';
      s.trail=[[12,11],[12,12],[11,12],[10,12],[9,12]];
      GC.Render.World.VISUAL.map=null;GC.Render.World.draw();
    }""")
    page.wait_for_timeout(300)
    page.screenshot(path=str(OUT/"commercial_interior_1280x900.png"),full_page=False)

    # Battle is part of the sellable presentation too; capture the settled real panel.
    art_classes=page.evaluate("""() => ({
      bat:GC.Render.Battle.battleArtClass({id:'bats'},{name:'洞窟コウモリA'}),
      crawler:GC.Render.Battle.battleArtClass({id:'crawler'},{name:'石殻ムカデ'}),
      boss:GC.Render.Battle.battleArtClass({id:'boss'},{name:'灰角獣'}),
      soldier:GC.Render.Battle.battleArtClass({id:'imperialRaid'},{name:'帝国斥候兵A',faction:'empire'})
    })""")
    if art_classes!={'bat':'beast-bat','crawler':'beast-crawler','boss':'beast-horned','soldier':'human-soldier'}:
        raise AssertionError("enemy art classifier regressed: "+repr(art_classes))

    page.evaluate("() => GC.Battle.startBattle('wolves')")
    page.wait_for_selector("#battlePanel:not(.hidden)")
    page.wait_for_timeout(1000)
    if "beast-wolf" not in page.locator("#enemyArt").get_attribute("class"):
        raise AssertionError("wolf battle is not using the wolf presentation")
    hero_box=page.locator("#battleHero0").bounding_box()
    hero_bg=page.locator("#battleHero0").evaluate("e=>getComputedStyle(e).backgroundImage")
    if not hero_box or hero_box["width"]<90 or "assets/characters/karen/karen_idle.png" not in hero_bg:
        raise AssertionError("battle is not using full-size Karen runtime art: "+repr((hero_box,hero_bg)))
    card_boxes=[page.locator("#partyCards .card").nth(i).bounding_box() for i in range(4)]
    if any(b is None for b in card_boxes) or max(b["y"] for b in card_boxes)-min(b["y"] for b in card_boxes)>2:
        raise AssertionError("party battle cards are not a compact one-row command rail")
    page.screenshot(path=str(OUT/"commercial_battle_1280x900.png"),full_page=False)

    if errors: raise AssertionError("console errors: "+repr(errors))
    browser.close()

print("COMMERCIAL PRESENTATION V1 BROWSER E2E PASS")
