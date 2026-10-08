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
    page=browser.new_page(viewport={"width":1440,"height":1000},device_scale_factor=1)
    console_errors=[]
    page.on("console",lambda m: console_errors.append(m.text) if m.type=="error" else None)
    page.goto(f"http://127.0.0.1:{PORT}/index.html",wait_until="networkidle")

    title=page.title()
    if title!="灰冠の勇者たち":
        raise AssertionError("player title still exposes build metadata: "+title)
    if page.locator(".sidebar").evaluate("e=>getComputedStyle(e).display")!="none":
        raise AssertionError("desktop prototype sidebar is still permanently visible")
    if page.locator(".topbar").evaluate("e=>getComputedStyle(e).display")!="none":
        raise AssertionError("outer webpage header is visible on the title screen")
    for sel in (".world-hud",".story-context",".statusbar"):
        if page.locator(sel).evaluate("e=>getComputedStyle(e).visibility")!="hidden":
            raise AssertionError("gameplay HUD leaks behind title screen: "+sel)
    if "ALPHA" in page.locator("body").inner_text().upper():
        raise AssertionError("normal player shell exposes ALPHA wording")

    page.screenshot(path=str(OUT/"title_desktop.png"),full_page=True)
    page.click("#titleNewGame")
    page.wait_for_timeout(400)
    if "playing" not in page.locator("body").get_attribute("class", timeout=1000):
        raise AssertionError("focused play mode was not enabled")
    if page.locator("#btnMenu").count()!=1:
        raise AssertionError("player menu button missing")
    for _ in range(4):
        page.keyboard.press("Space");page.wait_for_timeout(70)
    page.evaluate("() => GC.Dialogue.closeDialogue(false)")
    page.evaluate("""() => {
      const s=GC.State.get();
      s.map='road'; s.x=12; s.y=11; s.dir='right';
      s.trail=[[11,11],[10,11],[9,11],[8,11],[7,11]];
      GC.Render.World.VISUAL.map=null;
      GC.Render.World.draw();
    }""")
    page.wait_for_timeout(650)
    for key in ("ArrowRight","ArrowRight","ArrowUp","ArrowRight"):
        page.keyboard.press(key);page.wait_for_timeout(150)

    canvas=page.locator("#game")
    box=canvas.bounding_box()
    if not box or box["width"]<1000:
        raise AssertionError("commercial desktop playfield too small: "+repr(box))
    if page.locator("#objectiveLabel").evaluate("e=>getComputedStyle(e).display")!="none":
        raise AssertionError("duplicate objective remains in bottom status bar")
    page.screenshot(path=str(OUT/"road_desktop.png"),full_page=True)

    # Player menu must be a real game menu, not an architecture/debug information dump.
    page.click("#btnMenu")
    page.wait_for_timeout(180)
    menu_text=page.locator("#modal").inner_text()
    for banned in ("v19","責務分離","自動回帰テスト","アーキテクチャ版"):
        if banned in menu_text:
            raise AssertionError("development text leaked into player menu: "+banned)
    if page.locator("#menuSave").count()!=1 or page.locator("#menuLoad").count()!=1:
        raise AssertionError("save/load are not available from the player menu")
    page.screenshot(path=str(OUT/"menu_desktop.png"),full_page=True)
    page.locator("#modalClose").click()
    page.wait_for_timeout(100)

    # Battle is part of the commercial surface too: capture the real battle presentation.
    page.evaluate("() => GC.Battle.startBattle('wolves')")
    page.wait_for_timeout(900)
    if page.locator("#battlePanel").evaluate("e=>getComputedStyle(e).display")=="none":
        raise AssertionError("battle panel failed to open")
    if page.locator(".battle-hero.sprite.direct").count()!=4:
        raise AssertionError("battle is not using the four direct 48px hero sheets")
    enemy_bg=page.locator("#enemyArt").evaluate("e=>getComputedStyle(e).backgroundImage")
    if "wolf_battle.png" not in enemy_bg:
        raise AssertionError("battle still uses the smooth CSS enemy placeholder: "+enemy_bg)
    overflow=page.locator("#battlePanel").evaluate("e=>({scroll:e.scrollHeight,client:e.clientHeight})")
    if overflow["scroll"]>overflow["client"]+3:
        raise AssertionError("desktop battle still requires scrolling: "+repr(overflow))
    stage_h=page.locator("#battleStage").evaluate("e=>e.getBoundingClientRect().height")
    if stage_h<245:
        raise AssertionError("battle stage did not expand into the previously empty viewport: "+repr(stage_h))
    page.screenshot(path=str(OUT/"battle_desktop.png"),full_page=True)

    mobile=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=1)
    mobile.goto(f"http://127.0.0.1:{PORT}/index.html",wait_until="networkidle")
    if mobile.locator(".controls-panel").evaluate("e=>getComputedStyle(e).display")=="none":
        raise AssertionError("mobile controls disappeared")
    mobile.screenshot(path=str(OUT/"title_mobile.png"),full_page=True)

    if console_errors:
        raise AssertionError("desktop console errors: "+repr(console_errors))
    browser.close()

print("COMMERCIAL PRESENTATION BROWSER E2E PASS")
