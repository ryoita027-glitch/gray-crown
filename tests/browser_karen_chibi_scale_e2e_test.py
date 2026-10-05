from browser_launch import launch_chromium
from pathlib import Path
import re, sys, base64
try:
    from playwright.sync_api import sync_playwright
except Exception as exc:
    print(f'KAREN CHIBI SCALE E2E: Playwright unavailable: {exc}', file=sys.stderr);sys.exit(2)

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

def capture(page,button,filename,expected_mode,expected_scale=None):
    open_dev(page);page.locator(button).click()
    page.wait_for_function("()=>GC.Cinematic.state.currentCommand && GC.Cinematic.state.currentCommand.animation==='laugh'",timeout=15000)
    actor=page.evaluate("()=>{const a=GC.Cinematic.actor('karen');return a?{mode:a.renderMode,scale:a.renderScale,x:a.x,y:a.y}:null}")
    assert actor and actor['mode']==expected_mode,(expected_mode,actor)
    if expected_scale is not None:
        assert abs(actor['scale']-expected_scale)<0.0001,(expected_mode,actor['scale'])
    page.wait_for_timeout(120)
    page.locator('.game-stage').screenshot(path=str(OUT/filename))
    finish_scene(page)

with sync_playwright() as p:
    browser=launch_chromium(p)
    page=browser.new_page(viewport={'width':1440,'height':960});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    load_runtime(page)
    page.locator('#titleNewGame').click();page.wait_for_timeout(30);dismiss_dialogue(page)
    assert page.evaluate('GC.State.get().map')=='village'
    start_pos=page.evaluate('({map:GC.State.get().map,x:GC.State.get().x,y:GC.State.get().y,dir:GC.State.get().dir})')

    capture(page,'#devKaren48Motion','karen_chibi_scale_full_laugh.png','pixel48-full',1.0)
    capture(page,'#devKaren44Motion','karen_chibi_scale_medium_laugh.png','pixel48-medium',44/48)
    capture(page,'#devKaren41Motion','karen_chibi_scale_compact_laugh.png','pixel48-compact',41/48)
    capture(page,'#devKaren32Baseline','karen_chibi_scale_32_baseline_laugh.png','legacy32',1.0)

    assert page.evaluate('GC.Cinematic.isActive()') is False
    assert page.evaluate('GC.State.get().locked') is False
    assert page.evaluate('GC.Dialogue.isInputLocked()') is False
    assert page.evaluate('GC.Save.SAVE_SCHEMA')==23
    assert page.evaluate('({map:GC.State.get().map,x:GC.State.get().x,y:GC.State.get().y,dir:GC.State.get().dir})')==start_pos
    assert not errors,f'page errors during Karen Chibi scale integration: {errors}'
    browser.close()

print('KAREN CHIBI SCALE E2E PASS: 48 full -> 44 medium -> 41 compact -> 32 baseline -> control restored')
