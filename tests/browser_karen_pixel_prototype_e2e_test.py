from pathlib import Path
import re, sys, base64
try:
    from playwright.sync_api import sync_playwright
except Exception as exc:
    print(f'KAREN PIXEL PROTOTYPE E2E: Playwright unavailable: {exc}', file=sys.stderr);sys.exit(2)

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts'
OUT.mkdir(exist_ok=True)
HTML=(ROOT/'index.html').read_text(encoding='utf-8')
CSS=(ROOT/'css/game.css').read_text(encoding='utf-8')
SCRIPTS=re.findall(r'<script src="([^"]+)"></script>',HTML)
BASE=re.sub(r'\s*<script src="[^"]+"></script>','',HTML)
LEGACY='data:image/png;base64,'+base64.b64encode((ROOT/'assets/hero_party_walk.png').read_bytes()).decode()
ANIMS=['idle','walk','turn','talk','surprise','approach','laugh','run']
PIXEL={f'assets/characters/karen/karen_{n}.png':'data:image/png;base64,'+base64.b64encode((ROOT/f'assets/characters/karen/karen_{n}.png').read_bytes()).decode() for n in ANIMS}
CSS=CSS.replace("url('../assets/hero_party_walk.png')",f"url('{LEGACY}')")
SHIM="""(()=>{const d=new Map();const ls={getItem:k=>d.has(String(k))?d.get(String(k)):null,setItem:(k,v)=>d.set(String(k),String(v)),removeItem:k=>d.delete(String(k)),clear:()=>d.clear(),key:i=>Array.from(d.keys())[i]??null,get length(){return d.size}};Object.defineProperty(window,'localStorage',{value:ls,configurable:true});})();"""

def load_runtime(page):
    page.set_content(BASE,wait_until='domcontentloaded');page.add_style_tag(content=CSS);page.add_script_tag(content=SHIM)
    for rel in SCRIPTS:
        path=ROOT/rel
        if not path.exists(): raise AssertionError(f'missing runtime script {rel}')
        page.add_script_tag(content=path.read_text(encoding='utf-8'))
    page.evaluate('(u)=>{if(typeof HERO_SPRITES!=="undefined"&&HERO_SPRITES.image)HERO_SPRITES.image.src=u}',LEGACY)
    for src,url in PIXEL.items():
        page.evaluate('([src,url])=>GC.Animation.overrideImage(src,url)',[src,url])
    page.wait_for_timeout(120)

def dismiss_dialogue(page,limit=100):
    for _ in range(limit):
        if not page.locator('#dialogueBox').is_visible(): return
        if page.evaluate('GC.Dialogue.dialogueTyping()'):
            page.keyboard.press('Enter');page.wait_for_timeout(5)
        page.keyboard.press('Enter');page.wait_for_timeout(10)
    raise AssertionError('dialogue did not finish')

def open_dev(page):
    if not page.locator('#developerPanel').is_visible():
        page.keyboard.press('F2');page.wait_for_timeout(30)
    assert page.locator('#developerPanel').is_visible()

def finish_scene(page,limit=1000):
    for _ in range(limit):
        if not page.evaluate('GC.Cinematic.isActive()'): return
        if page.locator('#dialogueBox').is_visible():
            page.keyboard.press('Enter');page.wait_for_timeout(8)
        else:
            page.wait_for_timeout(20)
    raise AssertionError('prototype scene did not finish')

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':960});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    load_runtime(page)
    page.locator('#titleNewGame').click();page.wait_for_timeout(30);dismiss_dialogue(page)
    assert page.evaluate('GC.State.get().map')=='village'
    start_pos=page.evaluate('({map:GC.State.get().map,x:GC.State.get().x,y:GC.State.get().y,dir:GC.State.get().dir})')

    def capture_motion(button,filename,expected_mode,expected_scale=None):
        open_dev(page);page.locator(button).click()
        page.wait_for_function("()=>GC.Cinematic.state.currentCommand && GC.Cinematic.state.currentCommand.animation==='laugh'",timeout=15000)
        assert page.evaluate('GC.Cinematic.actor("karen").renderMode')==expected_mode
        if expected_scale is not None:
            scale=page.evaluate('GC.Cinematic.actor("karen").renderScale')
            assert abs(scale-expected_scale)<0.0001,(expected_mode,scale)
        page.wait_for_timeout(180)
        page.locator('.game-stage').screenshot(path=str(OUT/filename))
        finish_scene(page)
        assert page.evaluate('GC.Cinematic.isActive()') is False
        assert page.evaluate('GC.State.get().locked') is False
        assert page.evaluate('GC.Dialogue.isInputLocked()') is False
        assert page.evaluate('({map:GC.State.get().map,x:GC.State.get().x,y:GC.State.get().y,dir:GC.State.get().dir})')==start_pos

    # Phase 3 scale integration: same scene, camera and laugh timing.
    capture_motion('#devKaren48Motion','karen_phase3_full_laugh.png','pixel48-full',1.0)
    capture_motion('#devKaren44Motion','karen_phase3_medium_laugh.png','pixel48-medium',44/48)
    capture_motion('#devKaren41Motion','karen_phase3_compact_laugh.png','pixel48-compact',41/48)
    capture_motion('#devKaren32Baseline','karen_phase3_32_baseline_laugh.png','legacy32',1.0)

    # Medium is the primary integration candidate: compare dialogue presentation without changing scene/timing.
    open_dev(page);page.locator('#devKaren44NoPortrait').click()
    page.wait_for_function("()=>GC.Cinematic.isActive() && !document.getElementById('dialogueBox').classList.contains('hidden')",timeout=12000)
    assert page.evaluate('GC.Cinematic.actor("karen").renderMode')=='pixel48-medium'
    assert abs(page.evaluate('GC.Cinematic.actor("karen").renderScale')-(44/48))<0.0001
    assert page.locator('#dialogueBox').evaluate("el=>el.classList.contains('no-portrait')") is True
    assert page.locator('#speakerPortrait').inner_html()==''
    page.locator('.game-stage').screenshot(path=str(OUT/'karen_phase3_medium_portrait_off.png'))
    finish_scene(page)

    open_dev(page);page.locator('#devKaren44Portrait').click()
    page.wait_for_function("()=>GC.Cinematic.isActive() && !document.getElementById('dialogueBox').classList.contains('hidden')",timeout=12000)
    assert page.evaluate('GC.Cinematic.actor("karen").renderMode')=='pixel48-medium'
    assert abs(page.evaluate('GC.Cinematic.actor("karen").renderScale')-(44/48))<0.0001
    assert page.locator('#dialogueBox').evaluate("el=>el.classList.contains('no-portrait')") is False
    assert 'hero-portrait-svg' in page.locator('#speakerPortrait').inner_html()
    page.locator('.game-stage').screenshot(path=str(OUT/'karen_phase3_medium_portrait_on.png'))
    finish_scene(page)

    assert page.evaluate('GC.State.get().locked') is False
    assert page.evaluate('GC.Dialogue.isInputLocked()') is False
    assert not errors,f'page errors during Karen Phase 3 prototype: {errors}'
    browser.close()

print('KAREN PIXEL PROTOTYPE PHASE 3 E2E PASS: full -> medium -> compact -> 32 baseline -> medium portrait OFF/ON -> control restored')
