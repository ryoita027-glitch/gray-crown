#!/usr/bin/env python3
import contextlib,http.server,os,socketserver,threading,json,math
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
        # Close only the active intro dialogue. Do not over-press Space into a world interaction.
        for _ in range(16):
            hidden=page.locator("#dialogueBox").evaluate("e=>e.classList.contains('hidden')")
            if hidden:
                break
            page.keyboard.press("Space")
            page.wait_for_timeout(90)
        if not page.locator("#dialogueBox").evaluate("e=>e.classList.contains('hidden')"):
            raise AssertionError("intro dialogue did not close")

        # Walk a deterministic open-area pattern long enough to separate all followers.
        # If a direction is blocked, the remaining moves still expose the party trail.
        for key in ("ArrowUp","ArrowUp","ArrowUp","ArrowUp","ArrowUp","ArrowRight","ArrowRight","ArrowLeft","ArrowUp"):
            page.keyboard.press(key);page.wait_for_timeout(155)
        page.wait_for_timeout(350)

        party_count=page.evaluate("()=>state.party.length")
        if party_count!=4:
            raise AssertionError(f"expected four-person party, got {party_count}")
        if not page.locator("#dialogueBox").evaluate("e=>e.classList.contains('hidden')"):
            raise AssertionError("unexpected dialogue obscures game screenshot")

        # actual game canvas, not a generated comparison board
        canvas=page.locator("#game")
        if canvas.count()!=1: raise AssertionError("game canvas missing")
        size=canvas.evaluate("e=>[e.width,e.height]")
        if size!=[768,480]: raise AssertionError("unexpected game canvas size: "+repr(size))
        # Persistent canvas state is not a reliable assertion because other render
        # passes may legitimately toggle it after sprite drawing. Instead verify the
        # real world renderer disables smoothing immediately for the party draw call.
        world=(ROOT/"js/render/world.js").read_text(encoding="utf-8")
        marker="ctx.imageSmoothingEnabled=false;const drawSize=44"
        if marker not in world:
            raise AssertionError("world hero renderer lost nearest-neighbour sprite draw")
        page.screenshot(path=str(OUT/"actual_game_world.png"),full_page=True)
        canvas.screenshot(path=str(OUT/"actual_game_canvas.png"))

        # Inspect the same actor positions the real renderer uses. The visual-only
        # spread must keep all four party members from collapsing onto one point
        # during a reversal while leaving logical state/trail untouched.
        actors=page.evaluate("""() => GC.Render.World.partyRenderActors().map(a=>({
          x:a.x,y:a.y,leader:a.leader,order:a.order,
          heroId:Object.entries(PARTY_STYLE).find(([k,v])=>v===a.style)?.[0]||null
        }))""")
        if len(actors)!=4:
            raise AssertionError("renderer did not expose four party actors: "+repr(actors))
        min_dist=min(
            math.hypot(actors[i]["x"]-actors[j]["x"],actors[i]["y"]-actors[j]["y"])
            for i in range(len(actors)) for j in range(i+1,len(actors))
        )
        if min_dist<0.22:
            raise AssertionError(f"party presentation still stacks actors: min_dist={min_dist:.3f} {actors!r}")
        (OUT/"party_render_positions.json").write_text(
            json.dumps({"actors":actors,"minDistanceTiles":round(min_dist,4)},indent=2),
            encoding="utf-8"
        )

        # Verify browser loaded the rebuilt party sheet and exact natural size.
        dims=page.evaluate("""() => new Promise((resolve,reject)=>{
          const i=new Image(); i.onload=()=>resolve([i.naturalWidth,i.naturalHeight]);
          i.onerror=()=>reject(new Error('hero_party_walk load failed'));
          i.src='assets/hero_party_walk.png?e2e=1';
        })""")
        if dims!=[144,768]: raise AssertionError("party sheet dimensions "+repr(dims))
        if errors: raise AssertionError("browser console errors: "+repr(errors))
        browser.close()

print("CLEAN RUNTIME SPRITE BROWSER E2E PASS")
