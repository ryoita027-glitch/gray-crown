from browser_launch import launch_chromium
from pathlib import Path
import re, sys, base64
try:
    from playwright.sync_api import sync_playwright
except Exception as exc:
    print(f'DEVELOPER E2E: Playwright unavailable: {exc}', file=sys.stderr);sys.exit(2)

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text(encoding='utf-8')
CSS=(ROOT/'css/game.css').read_text(encoding='utf-8')
SCRIPTS=re.findall(r'<script src="([^"]+)"></script>',HTML)
BASE=re.sub(r'\s*<script src="[^"]+"></script>','',HTML)
SPRITE='data:image/png;base64,'+base64.b64encode((ROOT/'assets/hero_party_walk.png').read_bytes()).decode()
CSS=CSS.replace("url('../assets/hero_party_walk.png')",f"url('{SPRITE}')")
SHIM="""(()=>{const d=new Map();const ls={getItem:k=>d.has(String(k))?d.get(String(k)):null,setItem:(k,v)=>d.set(String(k),String(v)),removeItem:k=>d.delete(String(k)),clear:()=>d.clear(),key:i=>Array.from(d.keys())[i]??null,get length(){return d.size}};Object.defineProperty(window,'localStorage',{value:ls,configurable:true});})();"""

def load_runtime(page):
    page.set_content(BASE,wait_until='domcontentloaded');page.add_style_tag(content=CSS);page.add_script_tag(content=SHIM)
    for rel in SCRIPTS:
        path=ROOT/rel
        if not path.exists(): raise AssertionError(f'missing runtime script {rel}')
        page.add_script_tag(content=path.read_text(encoding='utf-8'))
    page.evaluate('(u)=>{if(typeof HERO_SPRITES!=="undefined"&&HERO_SPRITES.image)HERO_SPRITES.image.src=u}',SPRITE)
    page.wait_for_timeout(100)

def dismiss_dialogue(page,limit=80):
    for _ in range(limit):
        if not page.locator('#dialogueBox').is_visible(): return
        if page.evaluate('GC.Dialogue.dialogueTyping()'):
            page.keyboard.press('Enter');page.wait_for_timeout(5)
        page.keyboard.press('Enter');page.wait_for_timeout(8)
    raise AssertionError('dialogue did not finish')

with sync_playwright() as p:
    browser=launch_chromium(p)
    page=browser.new_page(viewport={'width':1440,'height':960});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    load_runtime(page)
    page.locator('#titleNewGame').click();page.wait_for_timeout(20);dismiss_dialogue(page)
    assert page.evaluate('GC.State.get().map')=='village'

    before=page.evaluate('JSON.stringify(GC.State.get())')
    page.keyboard.press('F2');page.wait_for_timeout(30)
    assert page.locator('#developerPanel').is_visible(),'F2 did not open Developer Mode'
    runtime=page.locator('#devRuntime').inner_text()
    assert 'Map: village' in runtime and 'Story: 00_village' in runtime, runtime
    # Read-only open/close must not mutate game state.
    page.keyboard.press('F2');page.wait_for_timeout(20)
    assert not page.locator('#developerPanel').is_visible(),'F2 did not close Developer Mode'
    after=page.evaluate('JSON.stringify(GC.State.get())')
    assert before==after,'opening/closing Developer Mode mutated state'

    # Clean state must validate before any debug mutation.
    clean_validation=page.evaluate('GC.Validation.runValidation()')
    assert clean_validation['ok'] is True, clean_validation

    page.keyboard.press('F2');page.wait_for_timeout(20)
    page.locator('#devMapSelect').select_option('capital')
    page.locator('#devWarp').click();page.wait_for_timeout(80)
    assert page.evaluate('GC.State.get().map')=='capital','Map Warp failed'
    assert page.evaluate('GC.Dev.isStateTainted()') is True,'Developer mutation did not taint state'

    # Normal save is protected when developer-mutated; no normal save key is created.
    saved=page.evaluate('GC.Save.save(true)')
    assert saved is False,'normal save unexpectedly succeeded after Developer mutation'
    normal=page.evaluate('localStorage.getItem(GC.Save.SAVE_KEY)')
    assert normal is None,'Developer-mutated state leaked into normal save'

    assert page.evaluate('GC.Dev.saveSnapshot("browser-dev")') is True,'Debug Snapshot save failed'
    keys=page.evaluate('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i))')
    assert 'gray-crown-dev-snapshots-v1' in keys,'Developer snapshot key missing'
    assert page.evaluate('localStorage.getItem(GC.Save.SAVE_KEY)') is None,'snapshot contaminated normal save key'

    # Raw Map Warp intentionally ignores story prerequisites. Validation must surface the
    # resulting mismatch instead of silently accepting it; the taint/save guard prevents
    # this debug state from contaminating normal saves.
    result=page.evaluate('GC.Validation.runValidation()')
    assert result['ok'] is False, result
    codes=[e.get('code') for e in result['runtime']['errors']]
    assert 'STATE_STORY_BEHIND' in codes, result
    page.locator('#devValidate').click();page.wait_for_timeout(15)
    validation_text=page.locator('#devValidation').inner_text()
    assert 'STATE_STORY_BEHIND' in validation_text,'Developer validation panel did not surface warp/story mismatch'

    page.keyboard.press('F2');page.wait_for_timeout(20)
    assert not page.locator('#developerPanel').is_visible(),'Developer panel failed to close at end'
    assert not errors,f'page errors during Developer Mode E2E: {errors}'
    browser.close()

print('DEVELOPER E2E PASS: F2 -> inspect -> close -> warp -> taint/save protection -> snapshot -> validation -> close')
