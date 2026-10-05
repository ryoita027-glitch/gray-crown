from pathlib import Path
import re,base64
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text(encoding='utf-8');CSS=(ROOT/'css/game.css').read_text(encoding='utf-8')
SCRIPTS=re.findall(r'<script src="([^"]+)"></script>',HTML);BASE=re.sub(r'\s*<script src="[^"]+"></script>','',HTML)
SPRITE='data:image/png;base64,'+base64.b64encode((ROOT/'assets/hero_party_walk.png').read_bytes()).decode();CSS=CSS.replace("url('../assets/hero_party_walk.png')",f"url('{SPRITE}')")
SHIM="""(()=>{const d=new Map();const ls={getItem:k=>d.has(String(k))?d.get(String(k)):null,setItem:(k,v)=>d.set(String(k),String(v)),removeItem:k=>d.delete(String(k)),clear:()=>d.clear(),key:i=>Array.from(d.keys())[i]??null,get length(){return d.size}};Object.defineProperty(window,'localStorage',{value:ls,configurable:true});})();"""
def load_runtime(page):
    page.set_content(BASE,wait_until='domcontentloaded');page.add_style_tag(content=CSS);page.add_script_tag(content=SHIM)
    for rel in SCRIPTS: page.add_script_tag(content=(ROOT/rel).read_text(encoding='utf-8'))
    page.evaluate('(u)=>{if(typeof HERO_SPRITES!=="undefined"&&HERO_SPRITES.image)HERO_SPRITES.image.src=u}',SPRITE);page.wait_for_timeout(80)
def dismiss(page,limit=180):
    for _ in range(limit):
        if not page.locator('#dialogueBox').is_visible():return
        if page.evaluate('GC.Dialogue.dialogueTyping()'):page.keyboard.press('Enter');page.wait_for_timeout(3)
        page.keyboard.press('Enter');page.wait_for_timeout(5)
    raise AssertionError('dialogue stuck')
def bfs(page,tx,ty):
    return page.evaluate("""([tx,ty])=>{const s=GC.State.get(),q=[[s.x,s.y]],prev=new Map([[s.x+','+s.y,null]]),ds=[[0,-1,'ArrowUp'],[0,1,'ArrowDown'],[-1,0,'ArrowLeft'],[1,0,'ArrowRight']];while(q.length){const [x,y]=q.shift();if(x===tx&&y===ty){let out=[],k=x+','+y;while(prev.get(k)){const p=prev.get(k);out.push(p[2]);k=p[0]+','+p[1]}return out.reverse()}for(const [dx,dy,key] of ds){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=24||ny>=15||prev.has(k))continue;const ox=s.x,oy=s.y;s.x=x;s.y=y;const b=isBlocked(nx,ny);s.x=ox;s.y=oy;if(!b){prev.set(k,[x,y,key]);q.push([nx,ny])}}}return null}""",[tx,ty])
def walk(page,x,y):
    for _ in range(8):
        s=page.evaluate('GC.State.get()')
        if (s['x'],s['y'])==(x,y):return
        path=bfs(page,x,y);assert path is not None,f'no path on {s["map"]}'
        for key in path:
            page.keyboard.press(key);page.wait_for_timeout(85)
            if page.locator('#dialogueBox').is_visible():dismiss(page)
            if page.locator('#battlePanel').is_visible():return
    raise AssertionError('walk failed')
def interact_npc(page,id):
    t=page.evaluate("""id=>{const m=GC.Data.Maps.maps[GC.State.get().map],n=m.npcs.find(x=>x.id===id);return n?{x:n.x,y:n.y}:null}""",id);assert t
    for x,y in [(t['x'],t['y']+1),(t['x'],t['y']-1),(t['x']+1,t['y']),(t['x']-1,t['y'])]:
        try:
            walk(page,x,y);s=page.evaluate('GC.State.get()');d=(t['x']-s['x'],t['y']-s['y']);key={(0,-1):'ArrowUp',(0,1):'ArrowDown',(-1,0):'ArrowLeft',(1,0):'ArrowRight'}.get(d)
            if key: page.keyboard.press(key);page.keyboard.press('Enter');page.wait_for_timeout(15);return
        except Exception: pass
    raise AssertionError('cannot interact '+id)
def fight(page):
    for _ in range(100):
        if page.locator('#levelUpPanel').is_visible():page.locator('#levelUpContinue').click();page.wait_for_timeout(60);continue
        if not page.locator('#battlePanel').is_visible():return
        if page.evaluate('GC.State.get().locked'):page.wait_for_timeout(100);continue
        if page.locator('#battleActions button').count():page.locator('#battleActions button').nth(0).click();page.wait_for_timeout(470)
        else:page.wait_for_timeout(80)
    raise AssertionError('battle stuck')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1365,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));load_runtime(page)
    page.locator('#titleNewGame').click();page.wait_for_timeout(20)
    start=page.evaluate('({x:GC.State.get().x,y:GC.State.get().y,stage:GC.State.get().story.stage})')
    page.evaluate("""()=>{for(let i=0;i<25;i++){document.dispatchEvent(new KeyboardEvent('keydown',{key:i%2?'ArrowUp':'ArrowLeft',bubbles:true,repeat:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,repeat:true}))}}""")
    page.wait_for_timeout(60);assert page.evaluate('({x:GC.State.get().x,y:GC.State.get().y,stage:GC.State.get().story.stage})')==start
    dismiss(page);interact_npc(page,'messenger');pos=page.evaluate('({x:GC.State.get().x,y:GC.State.get().y})')
    page.evaluate("""()=>{for(let i=0;i<35;i++){for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,repeat:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,repeat:true}))}}""")
    page.wait_for_timeout(80);assert page.evaluate('({x:GC.State.get().x,y:GC.State.get().y})')==pos;assert page.evaluate('GC.State.get().story.stage')=='00_village'
    dismiss(page);assert page.evaluate('GC.State.get().story.stage')=='01_appointed'
    walk(page,11,1);page.keyboard.press('ArrowUp');page.wait_for_timeout(30);dismiss(page);walk(page,11,6);page.wait_for_timeout(100);assert page.locator('#battlePanel').is_visible()
    bpos=page.evaluate('({map:GC.State.get().map,x:GC.State.get().x,y:GC.State.get().y,battle:GC.State.get().battle.id})')
    page.evaluate("""()=>{for(let i=0;i<25;i++){document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,repeat:true}))}}""")
    page.wait_for_timeout(80);assert page.evaluate('({map:GC.State.get().map,x:GC.State.get().x,y:GC.State.get().y,battle:GC.State.get().battle.id})')==bpos
    fight(page)
    if page.locator('#dialogueBox').is_visible():dismiss(page)
    assert page.evaluate('GC.State.get().story.stage')=='03_first_battle';assert not errors,f'page errors {errors}'
    browser.close()
print('ALPHA1 STRESS PASS: repeat/irregular input cannot move or double-advance during dialogue/battle')
