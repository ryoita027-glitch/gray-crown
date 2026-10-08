#!/usr/bin/env python3
import contextlib,http.server,os,socketserver,threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts/commercial_polish_v1"
OUT.mkdir(parents=True,exist_ok=True)
PORT=8773

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
    page=browser.new_page(viewport={"width":1365,"height":900},device_scale_factor=1)
    errors=[]
    page.on("console",lambda m: errors.append(m.text) if m.type=="error" else None)
    page.goto(f"http://127.0.0.1:{PORT}/index.html",wait_until="networkidle")

    header=page.locator(".topbar").inner_text()
    if "ALPHA" in header.upper() or "SECOND SLICE" in header.upper() or "V22 BASE" in header.upper():
        raise AssertionError("prototype branding is still visible: "+header)

    build_display=page.locator(".build-note").evaluate("e=>getComputedStyle(e).display")
    if build_display!="none":
        raise AssertionError("build note must not occupy player-facing chrome")

    page.click("#titleNewGame")
    page.wait_for_timeout(250)
    for _ in range(4):
        page.keyboard.press("Space");page.wait_for_timeout(50)
    page.evaluate("() => GC.Dialogue.closeDialogue(false)")

    page.wait_for_function("""() => {
      const s=GC.Render?.World?.heroRuntimeStatus?.();
      return s && ['karen','triton','sophie','margaret'].every(k => s[k]?.ready);
    }""")

    image_rendering=page.locator("#game").evaluate("e=>getComputedStyle(e).imageRendering")
    if image_rendering not in ("pixelated","crisp-edges"):
        raise AssertionError("responsive canvas is blurring pixel-native art: "+image_rendering)

    objective_display=page.locator("#objectiveLabel").evaluate("e=>getComputedStyle(e).display")
    if objective_display!="none":
        raise AssertionError("duplicated statusbar objective remains visible")
    if page.locator(".journal-panel").evaluate("e=>getComputedStyle(e).display")!="none":
        raise AssertionError("empty journal panel should not occupy the commercial HUD")
    if page.locator(".controls-panel").evaluate("e=>getComputedStyle(e).display")!="none":
        raise AssertionError("desktop control cheat-sheet should not occupy the commercial HUD")
    for selector in ("#btnSave","#btnLoad","#btnRestart"):
        if page.locator(selector).evaluate("e=>getComputedStyle(e).display")!="none":
            raise AssertionError("save/load/reset must live in the adventure menu, not permanent chrome")
    page.evaluate("() => openMenu()")
    menu_text=page.locator("#modalContent").inner_text()
    if "責務分離" in menu_text or "自動回帰" in menu_text or "v19" in menu_text:
        raise AssertionError("developer architecture copy leaked into the player menu")
    for label in ("セーブ","ロード","最初から"):
        if label not in menu_text:
            raise AssertionError("adventure menu is missing "+label)
    page.locator("#modalClose").click()

    # Road: show the real four-character party at commercial gameplay scale.
    page.evaluate("""() => {
      const s=GC.State.get();
      s.map='road';s.x=13;s.y=11;s.dir='up';
      s.trail=[[13,12],[13,13],[12,13],[11,13],[10,13]];
      const v=GC.Render.World.VISUAL;v.map=null;GC.Render.World.draw();
    }""")
    page.wait_for_timeout(450)
    page.screenshot(path=str(OUT/"commercial_road_party.png"),full_page=True)

    # Village: put the player close enough to a real NPC to exercise the upgraded
    # procedural NPC renderer and its interaction label in the real scene.
    page.evaluate("""() => {
      const s=GC.State.get();
      s.map='village';s.x=7;s.y=9;s.dir='left';
      s.trail=[[8,9],[8,10],[9,10],[10,10],[11,10]];
      const v=GC.Render.World.VISUAL;v.map=null;GC.Render.World.draw();
    }""")
    page.wait_for_timeout(450)
    page.screenshot(path=str(OUT/"commercial_village_npc.png"),full_page=True)

    # Battle must use the same real protagonist source family rather than the
    # old 32px combined fallback sheet.
    page.evaluate("() => startBattle('wolves')")
    page.wait_for_timeout(760)
    battle_bg=page.locator("#battleHero0").evaluate("e=>getComputedStyle(e).backgroundImage")
    if "assets/characters/karen/karen_idle.png" not in battle_bg:
        raise AssertionError("battle hero fell back to low-fidelity party sheet: "+battle_bg)
    if page.locator(".sidebar").evaluate("e=>getComputedStyle(e).display")!="none":
        raise AssertionError("exploration sidebar should leave the stage during battle focus mode")
    if page.locator("#enemyArt .enemy-part").count()<8:
        raise AssertionError("enemy presentation regressed to a placeholder silhouette")
    if "×3" not in page.locator('[data-battle="item"]').inner_text():
        raise AssertionError("battle item command does not expose inventory count")
    if not page.locator('[data-battle="foodItem"]').is_disabled():
        raise AssertionError("zero-stock battle item must be disabled before selection")
    page.screenshot(path=str(OUT/"commercial_battle.png"),full_page=True)

    # Distinct encounters must not collapse back to the wolf placeholder.
    page.evaluate("() => startBattle('bats')")
    page.wait_for_timeout(80)
    if "bat-swarm" not in page.locator("#enemyArt").get_attribute("class"):
        raise AssertionError("bat encounter did not receive bat visual family")
    page.evaluate("() => startBattle('imperialRaid')")
    page.wait_for_timeout(80)
    if "human-empire" not in page.locator("#enemyArt").get_attribute("class"):
        raise AssertionError("imperial human encounter did not receive soldier visual family")

    if errors:
        raise AssertionError("browser console errors: "+repr(errors))
    browser.close()

print("COMMERCIAL POLISH BROWSER E2E PASS")
