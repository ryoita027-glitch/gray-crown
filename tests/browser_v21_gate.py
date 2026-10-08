from browser_launch import launch_chromium
from pathlib import Path
import re,base64,sys
try:
    from playwright.sync_api import sync_playwright
except Exception as exc:
    print(f'V21 BROWSER GATE: Playwright unavailable: {exc}',file=sys.stderr);sys.exit(2)
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text(encoding='utf-8');CSS=(ROOT/'css/game.css').read_text(encoding='utf-8')
SCRIPTS=re.findall(r'<script src="([^"]+)"></script>',HTML);BASE=re.sub(r'\s*<script src="[^"]+"></script>','',HTML)
SPRITE='data:image/png;base64,'+base64.b64encode((ROOT/'assets/hero_party_walk.png').read_bytes()).decode();CSS=CSS.replace("url('../assets/hero_party_walk.png')",f"url('{SPRITE}')")
SHIM="""(()=>{const d=new Map();const ls={getItem:k=>d.has(String(k))?d.get(String(k)):null,setItem:(k,v)=>d.set(String(k),String(v)),removeItem:k=>d.delete(String(k)),clear:()=>d.clear(),key:i=>Array.from(d.keys())[i]??null,get length(){return d.size}};Object.defineProperty(window,'localStorage',{value:ls,configurable:true});})();"""
def load(page,preload=None):
    page.set_content(BASE,wait_until='domcontentloaded');page.add_style_tag(content=CSS);page.add_script_tag(content=SHIM)
    if preload: page.evaluate('(o)=>{for(const [k,v] of Object.entries(o))localStorage.setItem(k,v)}',preload)
    for rel in SCRIPTS:
        path=ROOT/rel
        if not path.exists():raise AssertionError('missing '+rel)
        page.add_script_tag(content=path.read_text(encoding='utf-8'))
    page.evaluate('(u)=>{if(typeof HERO_SPRITES!=="undefined"&&HERO_SPRITES.image)HERO_SPRITES.image.src=u}',SPRITE);page.wait_for_timeout(70)
def dismiss(page,limit=220):
    for _ in range(limit):
        if not page.locator('#dialogueBox').is_visible():return
        if page.evaluate('GC.Dialogue.dialogueTyping()'):page.keyboard.press('Enter');page.wait_for_timeout(2)
        page.keyboard.press('Enter');page.wait_for_timeout(4)
    raise AssertionError('dialogue stuck')
def bfs(page,tx,ty):
    return page.evaluate("""([tx,ty])=>{const s=GC.State.get(),q=[[s.x,s.y]],p=new Map([[s.x+','+s.y,null]]),ds=[[0,-1,'ArrowUp'],[0,1,'ArrowDown'],[-1,0,'ArrowLeft'],[1,0,'ArrowRight']];while(q.length){const [x,y]=q.shift();if(x===tx&&y===ty){let out=[],k=x+','+y;while(p.get(k)){const a=p.get(k);out.push(a[2]);k=a[0]+','+a[1]}return out.reverse()}for(const [dx,dy,key] of ds){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=24||ny>=15||p.has(k))continue;const ox=s.x,oy=s.y;s.x=x;s.y=y;const b=isBlocked(nx,ny);s.x=ox;s.y=oy;if(!b){p.set(k,[x,y,key]);q.push([nx,ny])}}}return null}""",[tx,ty])
def walk(page,x,y):
    for _ in range(10):
        s=page.evaluate('GC.State.get()')
        if (s['x'],s['y'])==(x,y):return
        path=bfs(page,x,y)
        if path is None:raise AssertionError(f'no path on {s["map"]} to {(x,y)}')
        for key in path:
            page.keyboard.press(key);page.wait_for_timeout(80)
            if page.locator('#dialogueBox').is_visible():dismiss(page)
            if page.locator('#battlePanel').is_visible():return
    raise AssertionError('walk failed')
def target(page,kind,id):return page.evaluate("""([k,id])=>{const m=GC.Data.Maps.maps[GC.State.get().map],a=k==='npc'?m.npcs:m.objects,t=a.find(x=>x.id===id);return t?{x:t.x,y:t.y}:null}""",[kind,id])
def interact(page,kind,id):
    t=target(page,kind,id);assert t,f'missing {kind}:{id}'
    for x,y in [(t['x'],t['y']+1),(t['x'],t['y']-1),(t['x']+1,t['y']),(t['x']-1,t['y'])]:
        try:
            walk(page,x,y);s=page.evaluate('GC.State.get()');d=(t['x']-s['x'],t['y']-s['y']);key={(0,-1):'ArrowUp',(0,1):'ArrowDown',(-1,0):'ArrowLeft',(1,0):'ArrowRight'}.get(d)
            if not key:continue
            page.keyboard.press(key);page.keyboard.press('Enter');page.wait_for_timeout(18);return
        except Exception:pass
    raise AssertionError('cannot interact '+id)
def fight(page):
    for _ in range(130):
        if page.locator('#levelUpPanel').is_visible():page.locator('#levelUpContinue').click();page.wait_for_timeout(50);continue
        if not page.locator('#battlePanel').is_visible():return
        if page.evaluate('GC.State.get().locked'):page.wait_for_timeout(90);continue
        buttons=page.locator('#battleActions button:visible')
        if buttons.count():
            buttons.first.click(timeout=5000);page.wait_for_timeout(450)
        else:
            page.wait_for_timeout(70)
    raise AssertionError('battle stuck')
def dump(page):return page.evaluate('Object.fromEntries(Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).map(k=>[k,localStorage.getItem(k)]))')
def new_page(browser,preload=None):
    pg=browser.new_page(viewport={'width':1365,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));load(pg,preload);return pg,errs
with sync_playwright() as p:
    browser=launch_chromium(p)
    # Gate 1: real startup + Alpha 1 with irregular input and Save/Continue.
    a,e1=new_page(browser);assert a.locator('#titleScreen').is_visible();a.locator('#titleNewGame').click();a.wait_for_timeout(15)
    start=a.evaluate('({x:GC.State.get().x,y:GC.State.get().y,stage:GC.State.get().story.stage})')
    a.evaluate("""()=>{for(let i=0;i<20;i++){document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,repeat:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,repeat:true}))}}""");a.wait_for_timeout(40)
    assert a.evaluate('({x:GC.State.get().x,y:GC.State.get().y,stage:GC.State.get().story.stage})')==start;dismiss(a);assert a.evaluate('GC.State.get().map')=='village'
    interact(a,'npc','messenger');lockedpos=a.evaluate('({x:GC.State.get().x,y:GC.State.get().y})');a.evaluate("""()=>{for(let i=0;i<20;i++)for(const key of ['ArrowLeft','ArrowRight','Enter'])document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,repeat:true}))}""");a.wait_for_timeout(50);assert a.evaluate('({x:GC.State.get().x,y:GC.State.get().y})')==lockedpos;dismiss(a);assert a.evaluate('GC.State.get().story.stage')=='01_appointed'
    walk(a,11,1);a.keyboard.press('ArrowUp');a.wait_for_timeout(20);dismiss(a);walk(a,11,6);a.wait_for_timeout(80);assert a.locator('#battlePanel').is_visible();fight(a);dismiss(a) if a.locator('#dialogueBox').is_visible() else None;assert a.evaluate('GC.State.get().story.stage')=='03_first_battle'
    assert a.evaluate('GC.Save.save(true)');saved=dump(a);a.close()
    b,e2=new_page(browser,saved);assert b.locator('#titleContinue').is_enabled();b.locator('#titleContinue').click();b.wait_for_timeout(25);dismiss(b);assert b.evaluate('GC.State.get().story.stage')=='03_first_battle'
    walk(b,11,0);b.keyboard.press('ArrowUp');b.wait_for_timeout(20);dismiss(b);walk(b,11,0);b.keyboard.press('ArrowUp');b.wait_for_timeout(1400);dismiss(b) if b.locator('#dialogueBox').is_visible() else None;assert b.evaluate('GC.State.get().map')=='capital'
    interact(b,'npc','capitalOfficial');dismiss(b);interact(b,'object','capitalInnDoor');dismiss(b);interact(b,'object','innRest');dismiss(b);assert b.evaluate('GC.State.get().story.stage')=='08_alpha_complete';assert b.evaluate('GC.Save.save(true)');alpha1_save=dump(b)
    assert not e1 and not e2,(e1,e2)
    print('GATE 1 PASS: startup + Alpha1 + stress + Save/Continue',flush=True)
    # Gate 2: Developer Mode remains isolated and protects normal save.
    d,e3=new_page(browser);d.locator('#titleNewGame').click();dismiss(d);before=d.evaluate('JSON.stringify(GC.State.get())');d.keyboard.press('F2');d.wait_for_timeout(20);assert d.locator('#developerPanel').is_visible();d.keyboard.press('F2');assert d.evaluate('JSON.stringify(GC.State.get())')==before;assert d.evaluate('GC.Validation.runValidation().ok') is True;d.evaluate("GC.Dev.warp('capital')");assert d.evaluate('GC.Dev.isStateTainted()') is True;assert d.evaluate('GC.Save.save(true)') is False;assert d.evaluate("GC.Dev.saveSnapshot('v21-gate')") is True;assert not e3,e3;d.close();print('GATE 2 PASS: Developer Mode isolation',flush=True)
    # Gate 3: start from a stable 08 save, then complete the Gray Road slice with a mid-section reload.
    prep,e4=new_page(browser);prep.locator('#titleNewGame').click();dismiss(prep);prep.evaluate("""()=>{const s=GC.State.get();GC.Story.applyCanonicalAlphaStage(s,GC.Story.STORY_STAGES.ALPHA_COMPLETE);GC.Movement.setMap('capital',11,13,'up',[[12,13],[13,13],[14,13]]);renderHud();draw()}""");assert prep.evaluate('GC.Save.save(true)');stage08=dump(prep);prep.close();print('GATE 3A PASS: stable 08 save prepared',flush=True)
    c,e5=new_page(browser,stage08);c.locator('#titleContinue').click();c.wait_for_timeout(25);dismiss(c);assert c.evaluate('GC.State.get().story.stage')=='08_alpha_complete';interact(c,'npc','granz');dismiss(c);assert c.evaluate('GC.State.get().story.stage')=='09_ash_road_order';walk(c,11,0);c.keyboard.press('ArrowUp');c.wait_for_timeout(1400);dismiss(c);assert c.evaluate('GC.State.get().story.stage')=='10_ash_road';print('GATE 3B PASS: entered Ash Road',flush=True)
    interact(c,'npc','refugee');dismiss(c);interact(c,'object','burnedCart');dismiss(c);assert c.evaluate('GC.Save.save(true)');mid=dump(c);c.close();print('GATE 3C PASS: mid-section save created',flush=True)
    f,e6=new_page(browser,mid);f.locator('#titleContinue').click();f.wait_for_timeout(25);dismiss(f);assert f.evaluate('GC.State.get().map')=='ashroad';assert f.evaluate('GC.State.get().events.completed["alpha2.ashroad.refugee"]') is True;print('GATE 3D PASS: mid-save Continue restored',flush=True)
    interact(f,'object','scorchedOrders');dismiss(f);print('GATE 3E PASS: orders event',flush=True)
    interact(f,'object','imperialPatrol');dismiss(f);assert f.locator('#battlePanel').is_visible();assert f.evaluate('GC.State.get().battle.id')=='imperialRaid';f.evaluate("GC.Battle.battleWin('defeat')");
    for _ in range(35):
        if f.locator('#levelUpPanel').is_visible(): f.locator('#levelUpContinue').click()
        if not f.locator('#battlePanel').is_visible(): break
        f.wait_for_timeout(100)
    assert not f.locator('#battlePanel').is_visible(),'battle UI did not return to world'
    if f.locator('#dialogueBox').is_visible(): dismiss(f)
    assert f.evaluate('GC.State.get().events.completed["alpha2.ashroad.patrolVictory"]') is True;print('GATE 3F PASS: patrol battle start/win/world return',flush=True)
    assert f.evaluate("GC.Events.runTriggeredEvent('boundary','north',{map:'ashroad'})") is True;f.wait_for_timeout(20);dismiss(f);assert f.evaluate('GC.State.get().story.stage')=='11_ash_road_complete';assert f.evaluate('GC.State.get().events.completed["alpha2.ashroad.complete"]') is True;assert not e4 and not e5 and not e6,(e4,e5,e6)
    print('GATE 3 PASS: 08 save -> Gray Road -> mid-save/reload -> battle -> section complete',flush=True)
    browser.close()
print('V21 BROWSER GATE PASS')
