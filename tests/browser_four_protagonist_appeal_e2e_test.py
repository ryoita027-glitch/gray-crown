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
    eyebrow=page.locator(".eyebrow").inner_text().strip()
    build_note=page.locator(".build-note").inner_text().strip()
    if eyebrow!="2D FANTASY RPG":
        raise AssertionError("prototype eyebrow leaked: "+repr(eyebrow))
    if any(token in build_note.lower() for token in ("alpha","v23","v22","second slice")):
        raise AssertionError("prototype build metadata leaked into player UI: "+repr(build_note))
    image_rendering=page.locator("canvas").evaluate("e=>getComputedStyle(e).imageRendering")
    if image_rendering not in ("pixelated","crisp-edges"):
        raise AssertionError("canvas CSS scaling is not crisp pixel mode: "+repr(image_rendering))
    if page.locator(".controls-panel").evaluate("e=>getComputedStyle(e).display")!="none":
        raise AssertionError("desktop controls help still occupies product sidebar")
    page.click("#titleNewGame")
    page.wait_for_timeout(350)
    for _ in range(4):
        page.keyboard.press("Space");page.wait_for_timeout(80)
    # Visual evidence must show the party itself, not a dialogue overlay.
    page.evaluate("() => GC.Dialogue.closeDialogue(false)")
    page.wait_for_timeout(120)

    # Protagonist dialogue defaults to portraitless Pixel-native presentation.
    page.evaluate("() => GC.Dialogue.say('カレン','表示統合テスト')")
    page.wait_for_timeout(80)
    hero_dialogue=page.locator("#dialogueBox")
    if "no-portrait" not in (hero_dialogue.get_attribute("class") or ""):
        raise AssertionError("hero dialogue did not default to portraitless mode")
    if page.locator("#speakerPortrait").evaluate("e=>getComputedStyle(e).display")!="none":
        raise AssertionError("hero portrait still visible in commercial presentation")
    page.evaluate("() => GC.Dialogue.closeDialogue(false)")
    page.wait_for_timeout(80)

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

    # The world renderer must use the real 48px Walk assets for all four heroes,
    # displayed at Medium44. The old 32px combined sheet remains fallback only.
    page.wait_for_function("""() => {
      const s=GC.Render?.World?.heroRuntimeStatus?.();
      return s && ['karen','triton','sophie','margaret'].every(k => s[k]?.ready);
    }""")
    runtime=page.evaluate("() => GC.Render.World.heroRuntimeStatus()")
    for hero,meta in runtime.items():
        if meta["naturalWidth"]!=288 or meta["naturalHeight"]!=192:
            raise AssertionError(f"{hero} direct walk sheet size {meta}")
        if meta.get("display")!=42:
            raise AssertionError(f"{hero} commercial world display scale {meta}")

    # Give motion a few steps; this exercises the direct 48px walk sheets at Medium44.
    for key in ("ArrowRight","ArrowRight","ArrowUp","ArrowDown"):
        page.keyboard.press(key);page.wait_for_timeout(160)

    # A quick reverse used to make a follower land on Karen's tile and disappear.
    # The spaced five-step history must keep all four occupied positions distinct.
    distinct=page.evaluate("""() => {
      const s=GC.State.get(), pts=[[s.x,s.y],s.trail[0],s.trail[2],s.trail[4]].filter(Boolean);
      return {trail:s.trail.map(p=>[p[0],p[1]]), count:new Set(pts.map(p=>p.join(','))).size};
    }""")
    if distinct["count"]!=4:
        raise AssertionError("four protagonist positions overlap after reversal: "+repr(distinct))

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

    page.screenshot(path=str(OUT/"actual_game_commercial_road.png"),full_page=True)

    # A second screenshot in the village gives a softer green/brown contrast context.
    page.evaluate("""() => {
      const s=GC.State.get();
      s.map='village'; s.x=12; s.y=12; s.dir='up';
      s.trail=[[11,12],[10,12],[9,12]];
      GC.Render.World.VISUAL.map=null;
      GC.Render.World.draw();
    }""")
    page.wait_for_timeout(500)
    page.screenshot(path=str(OUT/"actual_game_commercial_village.png"),full_page=True)

    # Battle must also use the real character runtime sheets, not the old combined 32px fallback.
    page.evaluate("() => startBattle('wolves')")
    page.wait_for_timeout(760)
    heroes=page.locator(".battle-hero.runtime-hero")
    if heroes.count()!=4:
        raise AssertionError("battle runtime heroes missing: "+str(heroes.count()))
    expected=("karen","triton","sophie","margaret")
    for i,hero in enumerate(expected):
        el=heroes.nth(i)
        bg=el.evaluate("e=>getComputedStyle(e).backgroundImage")
        if f"assets/characters/{hero}/{hero}_idle.png" not in bg:
            raise AssertionError(f"{hero} battle sprite is not direct runtime art: {bg}")
    page.screenshot(path=str(OUT/"actual_game_commercial_battle.png"),full_page=True)

    if errors: raise AssertionError("console errors: "+repr(errors))
    browser.close()

print("GRAY CROWN COMMERCIAL PRESENTATION BROWSER E2E PASS")
