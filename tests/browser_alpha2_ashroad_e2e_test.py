from browser_launch import launch_chromium
from pathlib import Path
import re,sys,base64
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text(encoding='utf-8');CSS=(ROOT/'css/game.css').read_text(encoding='utf-8')
SCRIPTS=re.findall(r'<script src="([^"]+)"></script>',HTML);BASE=re.sub(r'\s*<script src="[^"]+"></script>','',HTML)
SPRITE='data:image/png;base64,'+base64.b64encode((ROOT/'assets/hero_party_walk.png').read_bytes()).decode();CSS=CSS.replace("url('../assets/hero_party_walk.png')",f"url('{SPRITE}')")
SHIM="""(()=>{const d=new Map();const ls={getItem:k=>d.has(String(k))?d.get(String(k)):null,setItem:(k,v)=>d.set(String(k),String(v)),removeItem:k=>d.delete(String(k)),clear:()=>d.clear(),key:i=>Array.from(d.keys())[i]??null,get length(){return d.size}};Object.defineProperty(window,'localStorage',{value:ls,configurable:true});})();"""
def load_runtime(page,preload=None):
    page.set_content(BASE,wait_until='domcontentloaded');page.add_style_tag(content=CSS);page.add_script_tag(content=SHIM)
    if preload: page.evaluate('(o)=>{for(const [k,v] of Object.entries(o))localStorage.setItem(k,v)}',preload)
    for rel in SCRIPTS: page.add_script_tag(content=(ROOT/rel).read_text(encoding='utf-8'))
    page.evaluate('(u)=>{if(typeof HERO_SPRITES!=="undefined"&&HERO_SPRITES.image)HERO_SPRITES.image.src=u}',SPRITE);page.wait_for_timeout(80)
def dismiss(page,limit=200):
    for _ in range(limit):
        if not page.locator('#dialogueBox').is_visible():return
        if page.evaluate('GC.Dialogue.dialogueTyping()'):page.keyboard.press('Enter');page.wait_for_timeout(3)
        page.keyboard.press('Enter');page.wait_for_timeout(5)
    raise AssertionError('dialogue stuck')
def bfs(page,tx,ty):
    return page.evaluate('''([tx,ty])=>{const s=GC.State.get(),q=[[s.x,s.y]],prev=new Map([[s.x+','+s.y,null]]),ds=[[0,-1,'ArrowUp'],[0,1,'ArrowDown'],[-1,0,'ArrowLeft'],[1,0,'ArrowRight']];while(q.length){const [x,y]=q.shift();if(x===tx&&y===ty){let out=[],k=x+','+y;while(prev.get(k)){const p=prev.get(k);out.push(p[2]);k=p[0]+','+p[1]}return out.reverse()}for(const [dx,dy,key] of ds){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=24||ny>=15||prev.has(k))continue;const ox=s.x,oy=s.y;s.x=x;s.y=y;const b=isBlocked(nx,ny);s.x=ox;s.y=oy;if(!b){prev.set(k,[x,y,key]);q.push([nx,ny])}}}return null}''',[tx,ty])
def walk(page,x,y):
    for _ in range(8):
        s=page.evaluate('GC.State.get()')
        if (s['x'],s['y'])==(x,y):return
        path=bfs(page,x,y)
        if path is None:raise AssertionError(f'no path {s["map"]} -> {(x,y)}')
        for key in path:
            page.keyboard.press(key);page.wait_for_timeout(85)
            if page.locator('#dialogueBox').is_visible():dismiss(page)
            if page.locator('#battlePanel').is_visible():return
    raise AssertionError('walk failed')
def target(page,kind,id):return page.evaluate('''([k,id])=>{const m=GC.Data.Maps.maps[GC.State.get().map],a=k==='npc'?m.npcs:m.objects,t=a.find(x=>x.id===id);return t?{x:t.x,y:t.y}:null}''',[kind,id])
def interact(page,kind,id):
    t=target(page,kind,id);assert t,f'missing {id}'
    for x,y in [(t['x'],t['y']+1),(t['x'],t['y']-1),(t['x']+1,t['y']),(t['x']-1,t['y'])]:
        try:
            walk(page,x,y);s=page.evaluate('GC.State.get()');d=(t['x']-s['x'],t['y']-s['y']);key={(0,-1):'ArrowUp',(0,1):'ArrowDown',(-1,0):'ArrowLeft',(1,0):'ArrowRight'}.get(d)
            if not key:continue
            page.keyboard.press(key);page.keyboard.press('Enter');page.wait_for_timeout(20);return
        except Exception:pass
    raise AssertionError('cannot interact '+id)
def fight(page):
    for _ in range(120):
        if page.locator('#levelUpPanel').is_visible():page.locator('#levelUpContinue').click();page.wait_for_timeout(60);continue
        if not page.locator('#battlePanel').is_visible():return
        if page.evaluate('GC.State.get().locked'):page.wait_for_timeout(100);continue
        if page.locator('#battleActions button').count():page.locator('#battleActions button').nth(0).click();page.wait_for_timeout(470)
        else:page.wait_for_timeout(70)
    raise AssertionError('battle stuck')
def dump(page):return page.evaluate('Object.fromEntries(Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).map(k=>[k,localStorage.getItem(k)]))')
with sync_playwright() as p:
    browser=launch_chromium(p)
    p1=browser.new_page(viewport={'width':1365,'height':900});err1=[];p1.on('pageerror',lambda e:err1.append(str(e)));load_runtime(p1);p1.locator('#titleNewGame').click();dismiss(p1)
    p1.evaluate('''()=>{const s=GC.State.get();GC.Story.applyCanonicalAlphaStage(s,GC.Story.STORY_STAGES.ALPHA_COMPLETE);GC.Movement.setMap('capital',11,13,'up',[[12,13],[13,13],[14,13]]);renderHud();draw()}''')
    assert p1.evaluate('GC.Save.save(true)');saved=dump(p1)
    p2=browser.new_page(viewport={'width':1365,'height':900});err2=[];p2.on('pageerror',lambda e:err2.append(str(e)));load_runtime(p2,saved);assert p2.locator('#titleContinue').is_enabled();p2.locator('#titleContinue').click();p2.wait_for_timeout(30);dismiss(p2)
    assert p2.evaluate('GC.State.get().story.stage')=='08_alpha_complete'
    interact(p2,'npc','granz');dismiss(p2);assert p2.evaluate('GC.State.get().story.stage')=='09_ash_road_order'
    walk(p2,11,0);p2.keyboard.press('ArrowUp');p2.wait_for_timeout(1500);dismiss(p2);assert p2.evaluate('GC.State.get().map')=='ashroad';assert p2.evaluate('GC.State.get().story.stage')=='10_ash_road'
    interact(p2,'npc','refugee');dismiss(p2);interact(p2,'object','burnedCart');dismiss(p2)
    assert p2.evaluate('GC.Save.save(true)');mid=dump(p2)
    p3=browser.new_page(viewport={'width':1365,'height':900});err3=[];p3.on('pageerror',lambda e:err3.append(str(e)));load_runtime(p3,mid);p3.locator('#titleContinue').click();p3.wait_for_timeout(30);dismiss(p3)
    assert p3.evaluate('GC.State.get().map')=='ashroad';assert p3.evaluate('GC.State.get().events.completed["alpha2.ashroad.refugee"]') is True
    interact(p3,'object','scorchedOrders');dismiss(p3);interact(p3,'npc','fieldPriest');dismiss(p3)
    interact(p3,'object','ashCache');dismiss(p3);assert p3.evaluate('GC.State.get().world.treasures.ashCache') is True
    interact(p3,'object','imperialPatrol');dismiss(p3);assert p3.locator('#battlePanel').is_visible();assert p3.evaluate('GC.State.get().battle.id')=='imperialRaid';fight(p3);p3.wait_for_timeout(250)
    if p3.locator('#dialogueBox').is_visible():dismiss(p3)
    assert p3.evaluate('GC.State.get().events.completed["alpha2.ashroad.patrolVictory"]') is True
    walk(p3,11,0);p3.keyboard.press('ArrowUp');p3.wait_for_timeout(30);dismiss(p3)
    assert p3.evaluate('GC.State.get().story.stage')=='11_ash_road_complete';assert p3.evaluate('GC.State.get().events.completed["alpha2.ashroad.complete"]') is True
    assert not err1 and not err2 and not err3,f'page errors {err1}/{err2}/{err3}'
    browser.close()
print('ALPHA2 ASHROAD E2E PASS: 08 -> briefing -> ashroad -> save/reload/continue -> exploration -> patrol battle -> 11 complete')
