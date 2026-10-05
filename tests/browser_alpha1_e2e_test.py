from browser_launch import launch_chromium
from pathlib import Path
import re, sys, base64
try:
    from playwright.sync_api import sync_playwright
except Exception as exc:
    print(f'ALPHA1 E2E: Playwright unavailable: {exc}', file=sys.stderr);sys.exit(2)
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text(encoding='utf-8')
CSS=(ROOT/'css/game.css').read_text(encoding='utf-8')
SCRIPTS=re.findall(r'<script src="([^"]+)"></script>',HTML)
BASE=re.sub(r'\s*<script src="[^"]+"></script>','',HTML)
SPRITE='data:image/png;base64,'+base64.b64encode((ROOT/'assets/hero_party_walk.png').read_bytes()).decode()
CSS=CSS.replace("url('../assets/hero_party_walk.png')",f"url('{SPRITE}')")
SHIM="""(()=>{const d=new Map();const ls={getItem:k=>d.has(String(k))?d.get(String(k)):null,setItem:(k,v)=>d.set(String(k),String(v)),removeItem:k=>d.delete(String(k)),clear:()=>d.clear(),key:i=>Array.from(d.keys())[i]??null,get length(){return d.size}};Object.defineProperty(window,'localStorage',{value:ls,configurable:true});})();"""

def load_runtime(page,preload=None):
    page.set_content(BASE,wait_until='domcontentloaded');page.add_style_tag(content=CSS);page.add_script_tag(content=SHIM)
    if preload: page.evaluate('(o)=>{for(const [k,v] of Object.entries(o)) localStorage.setItem(k,v)}',preload)
    for rel in SCRIPTS:
        path=ROOT/rel
        if not path.exists(): raise AssertionError(f'missing runtime script {rel}')
        page.add_script_tag(content=path.read_text(encoding='utf-8'))
    page.evaluate('(u)=>{if(typeof HERO_SPRITES!=="undefined"&&HERO_SPRITES.image)HERO_SPRITES.image.src=u}',SPRITE)
    page.wait_for_timeout(100)
    assert page.evaluate('typeof HERO_SPRITES==="undefined" || HERO_SPRITES.ready'), 'hero sprite PNG did not decode'

def dismiss_dialogue(page,limit=160):
    for _ in range(limit):
        if not page.locator('#dialogueBox').is_visible(): return
        if page.evaluate('GC.Dialogue.dialogueTyping()'):
            page.keyboard.press('Enter');page.wait_for_timeout(5)
        page.keyboard.press('Enter');page.wait_for_timeout(7)
    raise AssertionError('dialogue did not finish')

def bfs_keys(page,tx,ty):
    return page.evaluate('''([tx,ty])=>{const s=GC.State.get(),q=[[s.x,s.y]],prev=new Map([[s.x+','+s.y,null]]),dirs=[[0,-1,'ArrowUp'],[0,1,'ArrowDown'],[-1,0,'ArrowLeft'],[1,0,'ArrowRight']];while(q.length){const [x,y]=q.shift();if(x===tx&&y===ty){const out=[];let k=x+','+y;while(prev.get(k)){const p=prev.get(k);out.push(p[2]);k=p[0]+','+p[1]}return out.reverse()}for(const [dx,dy,key] of dirs){const nx=x+dx,ny=y+dy,kk=nx+','+ny;if(nx<0||ny<0||nx>=24||ny>=15||prev.has(kk))continue;const ox=s.x,oy=s.y;s.x=x;s.y=y;const blocked=isBlocked(nx,ny);s.x=ox;s.y=oy;if(!blocked){prev.set(kk,[x,y,key]);q.push([nx,ny])}}}return null}''',[tx,ty])

def walk_to(page,x,y):
    for _ in range(8):
        s=page.evaluate('GC.State.get()')
        if (s['x'],s['y'])==(x,y): return
        path=bfs_keys(page,x,y)
        if path is None: raise AssertionError(f'no path on {s["map"]} to {(x,y)}')
        for key in path:
            page.keyboard.press(key);page.wait_for_timeout(92)
            if page.locator('#dialogueBox').is_visible(): dismiss_dialogue(page)
            if page.locator('#battlePanel').is_visible(): return
    raise AssertionError(f'failed walking to {(x,y)}')

def target_pos(page,kind,target):
    return page.evaluate('''([kind,id])=>{const s=GC.State.get(),m=GC.Data.Maps.maps[s.map],a=kind==='npc'?m.npcs:m.objects,t=a.find(x=>x.id===id);return t?{x:t.x,y:t.y}:null}''',[kind,target])

def walk_adjacent_and_interact(page,kind,target):
    t=target_pos(page,kind,target)
    if not t: raise AssertionError(f'missing {kind} {target}')
    for x,y in [(t['x'],t['y']+1),(t['x'],t['y']-1),(t['x']+1,t['y']),(t['x']-1,t['y'])]:
        try:
            walk_to(page,x,y);s=page.evaluate('GC.State.get()');d=(t['x']-s['x'],t['y']-s['y']);key={(0,-1):'ArrowUp',(0,1):'ArrowDown',(-1,0):'ArrowLeft',(1,0):'ArrowRight'}.get(d)
            if not key: continue
            page.keyboard.press(key);page.wait_for_timeout(10);page.keyboard.press('Enter');page.wait_for_timeout(15);return
        except Exception:
            continue
    raise AssertionError(f'cannot interact with {target}')

def fight_to_end(page):
    for _ in range(100):
        if page.locator('#levelUpPanel').is_visible(): page.locator('#levelUpContinue').click();page.wait_for_timeout(60);continue
        if not page.locator('#battlePanel').is_visible(): return
        if page.evaluate('GC.State.get().locked'): page.wait_for_timeout(110);continue
        count=page.locator('#battleActions button').count()
        if count:
            page.locator('#battleActions button').nth(0).click();page.wait_for_timeout(500)
        else: page.wait_for_timeout(80)
    raise AssertionError('battle failed to end')

def local_storage_dump(page):
    return page.evaluate('Object.fromEntries(Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).map(k=>[k,localStorage.getItem(k)]))')

with sync_playwright() as p:
    browser=launch_chromium(p)
    page=browser.new_page(viewport={'width':1365,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    load_runtime(page)
    assert page.locator('#titleScreen').is_visible();assert page.locator('#titleNewGame').is_enabled()
    page.locator('#titleNewGame').click();page.wait_for_timeout(20)
    start_locked=page.evaluate('({x:GC.State.get().x,y:GC.State.get().y,stage:GC.State.get().story.stage})')
    page.evaluate("""()=>{for(let i=0;i<20;i++){document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,repeat:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,repeat:true}))}}""")
    page.wait_for_timeout(50);assert page.evaluate('({x:GC.State.get().x,y:GC.State.get().y,stage:GC.State.get().story.stage})')==start_locked
    dismiss_dialogue(page)
    assert page.evaluate('GC.State.get().map')=='village';assert page.evaluate('GC.State.get().story.stage')=='00_village'
    walk_adjacent_and_interact(page,'npc','messenger');dismiss_dialogue(page)
    assert page.evaluate('GC.State.get().story.stage')=='01_appointed'
    walk_to(page,11,1);page.keyboard.press('ArrowUp');page.wait_for_timeout(25);dismiss_dialogue(page)
    assert page.evaluate('GC.State.get().map')=='road';assert page.evaluate('GC.State.get().story.stage')=='02_road'
    walk_to(page,11,6);page.wait_for_timeout(80)
    assert page.locator('#battlePanel').is_visible();assert page.evaluate('GC.State.get().battle.id')=='wolves'
    fight_to_end(page)
    if page.locator('#dialogueBox').is_visible(): dismiss_dialogue(page)
    assert page.evaluate('GC.State.get().story.stage')=='03_first_battle';assert page.evaluate('GC.State.get().world.defeatedSymbols.wolf') is True
    # stable-world Save and full page recreation
    page.locator('#btnSave').click();page.wait_for_timeout(20);dismiss_dialogue(page);saved=local_storage_dump(page);before=page.evaluate('GC.State.get()')
    page2=browser.new_page(viewport={'width':1365,'height':900});errors2=[];page2.on('pageerror',lambda e:errors2.append(str(e)));load_runtime(page2,saved)
    assert page2.locator('#titleContinue').is_enabled();page2.locator('#titleContinue').focus();page2.keyboard.press('Enter');page2.wait_for_timeout(35);dismiss_dialogue(page2)
    loaded=page2.evaluate('GC.State.get()');assert loaded['map']==before['map'];assert (loaded['x'],loaded['y'])==(before['x'],before['y']);assert loaded['story']['stage']=='03_first_battle';assert page2.evaluate('GC.Audio.AUDIO.theme')=='road'
    # Continue through the rest of Alpha 1.0.
    walk_to(page2,11,0);page2.keyboard.press('ArrowUp');page2.wait_for_timeout(25);dismiss_dialogue(page2);assert page2.evaluate('GC.State.get().map')=='northroad'
    walk_to(page2,11,0);page2.keyboard.press('ArrowUp');page2.wait_for_timeout(1500)
    if page2.locator('#dialogueBox').is_visible():dismiss_dialogue(page2)
    assert page2.evaluate('GC.State.get().map')=='capital';assert page2.evaluate('GC.State.get().story.stage')=='05_capital'
    walk_adjacent_and_interact(page2,'npc','capitalOfficial');dismiss_dialogue(page2);assert page2.evaluate('GC.State.get().story.stage')=='06_ceremony'
    walk_adjacent_and_interact(page2,'object','capitalInnDoor');dismiss_dialogue(page2);assert page2.evaluate('GC.State.get().map')=='capitalinn';assert page2.evaluate('GC.State.get().story.stage')=='07_white_stag'
    walk_adjacent_and_interact(page2,'object','innRest');dismiss_dialogue(page2)
    assert page2.evaluate('GC.State.get().story.stage')=='08_alpha_complete';assert page2.evaluate('GC.State.get().events.completed["alpha.complete"]') is True
    # Developer Mode v1 must remain isolated from the shipping path.
    before_dev=page2.evaluate('JSON.stringify(GC.State.get())');page2.keyboard.press('F2');page2.wait_for_timeout(20);assert page2.locator('#developerPanel').is_visible();page2.keyboard.press('F2');page2.wait_for_timeout(15);assert page2.evaluate('JSON.stringify(GC.State.get())')==before_dev
    assert page2.evaluate('GC.Validation.runValidation().ok') is True;page2.evaluate("GC.Dev.warp('capital')");assert page2.evaluate('GC.Dev.isStateTainted()') is True;assert page2.evaluate('GC.Save.save(true)') is False;assert page2.evaluate("GC.Dev.saveSnapshot('alpha1-e2e')") is True
    assert not errors and not errors2, f'page errors: {errors} / {errors2}'
    browser.close()
print('ALPHA1 E2E PASS: Startup + input stress + Alpha1 full route + Save/Continue + Developer Mode isolation')
