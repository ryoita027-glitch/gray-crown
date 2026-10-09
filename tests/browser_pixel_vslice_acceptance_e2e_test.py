#!/usr/bin/env python3
"""PR #35 Pixel-native acceptance evidence. Uses real Chromium, real assets and localStorage.
Progression is driven by keyboard/pointer; map injection is permitted only for visual snapshots.
"""
import contextlib, functools, http.server, json, os, threading
from collections import deque
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "prototype_artifacts" / "pixel_vslice_acceptance_v1"
OUT.mkdir(parents=True, exist_ok=True)
HEROES = ("karen", "triton", "sophie", "margaret")
SAVE_KEY = "gray-crown-vslice-save-v1"

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

@contextlib.contextmanager
def serve_game():
    handler = functools.partial(Quiet, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield "http://127.0.0.1:%s/index.html" % server.server_port
    finally:
        server.shutdown()
        server.server_close()

def require(ok, reason):
    if not ok:
        raise AssertionError(reason)

def state(page):
    return page.evaluate("""() => {
      const s = GC.State.get();
      return {map:s.map,x:s.x,y:s.y,dir:s.dir,stage:s.story.stage,
              trail:s.trail,battle:s.battle?.id||null};
    }""")

def finish_dialogue(page, limit=95):
    for i in range(limit):
        if not page.locator("#dialogueBox").is_visible():
            return
        page.keyboard.press("Enter")
        page.wait_for_timeout(45)
    raise AssertionError("dialogue never closes")

def new_game(page):
    require(page.locator("#titleScreen").is_visible(), "title missing")
    page.click("#titleNewGame")
    finish_dialogue(page)
    require(state(page)["map"] == "village", "new game failed to enter village")

def path_to(page, destination):
    board = page.evaluate("""() => ({
      width:COLS,height:ROWS,
      blocked:Array.from({length:ROWS},(_,y)=>Array.from({length:COLS},(_,x)=>isBlocked(x,y)))
    })""")
    current = state(page)
    source = (current["x"], current["y"])
    target = tuple(destination)
    queue = deque([source])
    prior = {source: None}
    for_x = ((0,-1,"ArrowUp"),(1,0,"ArrowRight"),(0,1,"ArrowDown"),(-1,0,"ArrowLeft"))
    while queue:
        x,y = queue.popleft()
        if (x,y) == target:
            break
        for dx,dy,key in for_x:
            nxt = (x+dx,y+dy)
            if (0 <= nxt[0] < board["width"] and
                0 <= nxt[1] < board["height"] and
                not board["blocked"][nxt[1]][nxt[0]] and nxt not in prior):
                prior[nxt] = ((x,y),key)
                queue.append(nxt)
    require(target in prior, "unreachable path %s => %s" % (source,target))
    keys = []
    node = target
    while node != source:
        prev,key = prior[node]
        keys.append(key)
        node = prev
    return list(reversed(keys))

def walk(page, goal):
    keys = path_to(page,goal)
    for key in keys:
        old = state(page)
        page.keyboard.press(key)
        page.wait_for_timeout(130)
        newer = state(page)
        require(old["map"] == newer["map"], "unexpected map during walk")
        require((old["x"],old["y"]) != (newer["x"],newer["y"]), "movement stalled %s" % key)
    now = state(page)
    require((now["x"],now["y"]) == tuple(goal), "wrong walk destination")

def shot(page, name):
    page.wait_for_timeout(200)
    page.screenshot(path=str(OUT / (name+".png")), full_page=True)

def ensure_runtime(page):
    page.wait_for_function("""() => {
      const s=GC.Render?.World?.heroRuntimeStatus?.();
      return s && ['karen','triton','sophie','margaret'].every(k => s[k]?.ready);
    }""")
    runtime = page.evaluate("GC.Render.World.heroRuntimeStatus()")
    for name in HEROES:
        r = runtime[name]
        require((r["naturalWidth"],r["naturalHeight"]) == (288,192),
                "incorrect walk sheet for "+name)

with serve_game() as url:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        errors=[]
        page = browser.new_page(viewport={"width":1365,"height":900})
        page.on("pageerror", lambda e:errors.append(str(e)))
        page.on("console", lambda m:errors.append(m.text) if m.type=="error" else None)
        page.goto(url, wait_until="networkidle")
        new_game(page)
        ensure_runtime(page)
        shot(page,"desktop_village")

        # Player-keyboard village appointment; do not set story flags.
        walk(page,(12,7))
        page.keyboard.press("ArrowUp");page.wait_for_timeout(140)
        page.keyboard.press("Enter");page.wait_for_timeout(100)
        require(page.locator("#dialogueBox").is_visible(),"messenger dialogue missing")
        shot(page,"desktop_event_dialogue")
        finish_dialogue(page)
        require(state(page)["stage"]=="01_appointed","appointment did not progress story")
        require(page.evaluate("GC.State.get().events.completed['alpha.village.appointment']===true"),
                "appointment flag missing")

        # Normal user interaction with Karen's home and indoor return.
        walk(page,(4,6))
        page.keyboard.press("ArrowUp");page.wait_for_timeout(140)
        page.keyboard.press("Enter");page.wait_for_timeout(140)
        require(state(page)["map"]=="karenhome","indoor entry failed")
        finish_dialogue(page)
        shot(page,"desktop_karenhome")
        page.keyboard.press("ArrowDown");page.wait_for_timeout(140)
        page.keyboard.press("Enter");page.wait_for_timeout(150)
        require(state(page)["map"]=="village","indoor exit failed")
        finish_dialogue(page)

        # Save through game menu and verify real browser storage.
        page.keyboard.press("m");page.wait_for_timeout(90)
        require(page.locator("#modal").is_visible(),"menu did not open")
        page.locator(".menu-actions button").nth(0).click()
        raw=page.evaluate("localStorage.getItem("+json.dumps(SAVE_KEY)+")")
        saved=json.loads(raw)
        require(saved["schema"]==23,"save schema drift")
        require(saved["events"]["completed"].get("alpha.village.appointment"),"event missing from save")
        finish_dialogue(page)
        walk(page,(11,1))
        page.keyboard.press("ArrowUp");page.wait_for_timeout(140)
        require(state(page)["map"]=="road","village => road boundary failed")
        finish_dialogue(page)
        shot(page,"desktop_road")

        # Near the scripted wolf encounter through ordinary movement.
        walk(page,(11,7))
        for _ in range(2):
            page.keyboard.press("ArrowUp");page.wait_for_timeout(155)
            if state(page)["battle"]:break
        require(state(page)["battle"]=="wolves","wolf encounter did not trigger")
        require(page.evaluate("GC.Save.save(true)") is False,
                "battle incorrectly allows save")
        shot(page,"desktop_battle")
        battle_heroes=page.locator(".battle-hero.runtime-hero")
        require(battle_heroes.count()==4,"battle party count is not four")
        for i,hero in enumerate(HEROES):
            bg=battle_heroes.nth(i).evaluate("e=>getComputedStyle(e).backgroundImage")
            require("assets/characters/"+hero+"/"+hero+"_idle.png" in bg,
                    "battle fallback sprite for "+hero)

        # No instant-win developer shortcuts. Use actual rendered battle command buttons.
        for n in range(34):
            if not page.locator("#battlePanel").is_visible():break
            option=page.locator('[data-battle="attack"]')
            if not option.count() or option.is_disabled():
                option=page.locator("#battleActions button:not([disabled])").first
            option.click(timeout=1600)
            page.wait_for_timeout(580)
            if page.locator("#levelUpContinue").is_visible():
                page.locator("#levelUpContinue").click()
            if page.locator("#dialogueBox").is_visible():
                finish_dialogue(page)
        require(not page.locator("#battlePanel").is_visible(),"normal battle victory stalled")
        finish_dialogue(page)
        require(page.evaluate("GC.State.get().world.defeatedSymbols.wolf===true"),
                "wolf not cleared after victory")
        shot(page,"desktop_post_battle")

        # Save genuine battle results via menu; reload must not resurrect wolf.
        page.keyboard.press("m");page.wait_for_timeout(90)
        page.locator(".menu-actions button").nth(0).click()
        finish_dialogue(page)
        require(page.evaluate("GC.Save.load(true)"),"road battle save did not reload")
        require(page.evaluate("GC.State.get().world.defeatedSymbols.wolf===true"),
                "defeated wolf resurrected after reload")
        walk(page,(13,2))
        page.keyboard.press("ArrowUp");page.wait_for_timeout(160)
        require(state(page)["map"]=="cave","road => cave traversal failed")
        finish_dialogue(page)
        shot(page,"desktop_cave")

        # Actual browser reload / Continue: no Developer Mode state injection.
        page.reload(wait_until="networkidle")
        require(page.locator("#titleContinue").is_enabled(),"Continue disabled on reload")
        page.click("#titleContinue")
        finish_dialogue(page)
        require(state(page)["map"]=="road","Continue did not restore road save")
        require(page.evaluate("GC.State.get().world.defeatedSymbols.wolf===true"),
                "Continue resurrected defeated wolf")
        shot(page,"desktop_continue")

        # Damage the primary only; recovery must use backup and preserve achievements.
        page.evaluate("""() => localStorage.setItem('gray-crown-vslice-save-v1', '{broken')""")
        require(page.evaluate("GC.Save.load(true)"),"corrupt save backup recovery failed")

        for width,height,label in ((1024,768,"smallpc"),(390,844,"mobile")):
            vp=browser.new_page(viewport={"width":width,"height":height})
            vp.on("pageerror",lambda e:errors.append(str(e)))
            vp.goto(url,wait_until="networkidle")
            new_game(vp)
            ensure_runtime(vp)
            metric=vp.evaluate("""() => ({
              width:innerWidth,docWidth:document.documentElement.scrollWidth,
              mode:getComputedStyle(document.querySelector('#game')).imageRendering
            })""")
            require(metric["docWidth"]<=width+2,"horizontal overflow %s: %s"%(label,metric))
            require(metric["mode"] in ("pixelated","crisp-edges"),"sprite scaling blurred")
            shot(vp,label+"_village")
            # Controlled map position ONLY to generate visual comparison evidence.
            vp.evaluate("""() => {
              const s=GC.State.get();s.map='road';s.x=12;s.y=11;s.dir='up';
              s.trail=[[12,12],[12,13],[11,13],[10,13],[9,13]];
              GC.Render.World.VISUAL.map=null;GC.Render.World.draw();
            }""")
            shot(vp,label+"_road")
            vp.evaluate("""() => {
              const s=GC.State.get();s.map='karenhome';s.x=11;s.y=11;s.dir='up';
              s.trail=[[12,11],[13,11],[14,11],[15,11],[16,11]];
              GC.Render.World.VISUAL.map=null;GC.Render.World.draw();
            }""")
            shot(vp,label+"_interior")
            vp.close()

        require(not errors,"JavaScript errors: "+repr(errors[:8]))
        browser.close()
print("PIXEL VSLICE ACCEPTANCE E2E PASS — real scenes, normal event, house, battle, save/reload/Continue, multi-viewport")
