from browser_launch import launch_chromium
from pathlib import Path
import re,sys,base64
try:
    from playwright.sync_api import sync_playwright
except Exception as exc:
    print(f'SOPHIE PIXEL VALIDATION E2E: Playwright unavailable: {exc}',file=sys.stderr);sys.exit(2)

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts';OUT.mkdir(exist_ok=True)
HTML=(ROOT/'index.html').read_text(encoding='utf-8')
CSS=(ROOT/'css/game.css').read_text(encoding='utf-8')
SCRIPTS=re.findall(r'<script src="([^"]+)"></script>',HTML)
BASE=re.sub(r'\s*<script src="[^"]+"></script>','',HTML)
ANIMS=['idle','walk','turn','talk','surprise','approach','laugh','run']
PIXEL={}
for char in ['karen','triton','sophie']:
    for n in ANIMS:
        p=ROOT/f'assets/characters/{char}/{char}_{n}.png'
        PIXEL[f'assets/characters/{char}/{char}_{n}.png']='data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode()
LEGACY='data:image/png;base64,'+base64.b64encode((ROOT/'assets/hero_party_walk.png').read_bytes()).decode()
CSS=CSS.replace("url('../assets/hero_party_walk.png')",f"url('{LEGACY}')")
SHIM="""(()=>{const d=new Map();const ls={getItem:k=>d.has(String(k))?d.get(String(k)):null,setItem:(k,v)=>d.set(String(k),String(v)),removeItem:k=>d.delete(String(k)),clear:()=>d.clear(),key:i=>Array.from(d.keys())[i]??null,get length(){return d.size}};Object.defineProperty(window,'localStorage',{value:ls,configurable:true});})();"""

def load_runtime(page):
    page.set_content(BASE,wait_until='domcontentloaded');page.add_style_tag(content=CSS);page.add_script_tag(content=SHIM)
    for rel in SCRIPTS:
        page.add_script_tag(content=(ROOT/rel).read_text(encoding='utf-8'))
    page.evaluate('(u)=>{if(typeof HERO_SPRITES!=="undefined"&&HERO_SPRITES.image)HERO_SPRITES.image.src=u}',LEGACY)
    for src,url in PIXEL.items(): page.evaluate('([src,url])=>GC.Animation.overrideImage(src,url)',[src,url])
    page.wait_for_timeout(120)

def dismiss_dialogue(page,limit=100):
    for _ in range(limit):
        if not page.locator('#dialogueBox').is_visible(): return
        if page.evaluate('GC.Dialogue.dialogueTyping()'): page.keyboard.press('Enter');page.wait_for_timeout(5)
        page.keyboard.press('Enter');page.wait_for_timeout(10)
    raise AssertionError('dialogue did not finish')

def scene(mode='pixel48-medium',sequence=False):
    scale={'pixel48-full':1,'pixel48-medium':44/48,'pixel48-compact':41/48}[mode]
    actors=[
      {'id':'karen','character':'karen','x':12.5,'y':7,'facing':'right','animation':'idle','renderMode':mode,'renderScale':scale,'layer':2},
      {'id':'triton','character':'triton','x':15.5,'y':7,'facing':'right','animation':'idle','renderMode':mode,'renderScale':scale,'layer':2},
      {'id':'sophie','character':'sophie','x':18.5,'y':7,'facing':'left','animation':'idle','renderMode':mode,'renderScale':scale,'layer':2},
    ]
    commands=[{'type':'camera','actors':['karen','triton','sophie'],'scale':1.34}]
    if sequence:
        for name in ANIMS:
            commands.append({'type':'animate','actor':'sophie','animation':name,'duration':650,'after':'idle'})
    commands.append({'type':'wait','ms':250 if sequence else 700})
    return {'id':'prototype.sophie.third-character','prototypeTemporary':True,'actors':actors,'commands':commands}

def start_scene(page,mode='pixel48-medium',sequence=False):
    page.evaluate('([s,m])=>{window.__sophieRun=GC.Cinematic.startScene(s,{mode:"motionOnly",renderMode:m});return true}',[scene(mode,sequence),mode])

with sync_playwright() as p:
    browser=launch_chromium(p)
    page=browser.new_page(viewport={'width':1440,'height':960})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    load_runtime(page)
    defs=page.evaluate('()=>Object.keys(GC.Data.Animations.definitions)')
    assert all(x in defs for x in ['karen','triton','sophie']),defs
    sophie_rules=page.evaluate('()=>GC.Data.Animations.sophieVisualRules')
    assert sophie_rules['identity']=='STEADY HANDS'

    page.locator('#titleNewGame').click();page.wait_for_timeout(30);dismiss_dialogue(page)
    start_pos=page.evaluate('({map:GC.State.get().map,x:GC.State.get().x,y:GC.State.get().y,dir:GC.State.get().dir})')

    start_scene(page,'pixel48-medium',False)
    page.wait_for_function("()=>GC.Cinematic.isActive()&&GC.Cinematic.actor('sophie')&&GC.Cinematic.actor('triton')&&GC.Cinematic.actor('karen')")
    scales=page.evaluate("()=>({k:GC.Cinematic.actor('karen').renderScale,t:GC.Cinematic.actor('triton').renderScale,s:GC.Cinematic.actor('sophie').renderScale})")
    for v in scales.values(): assert abs(v-(44/48))<0.0001,scales
    page.locator('.game-stage').screenshot(path=str(OUT/'sophie_karen_triton_idle_medium.png'))
    page.wait_for_function("()=>!GC.Cinematic.isActive()")

    start_scene(page,'pixel48-medium',True)
    for name in ANIMS:
        page.wait_for_function(f"()=>GC.Cinematic.isActive()&&GC.Cinematic.state.currentCommand&&GC.Cinematic.state.currentCommand.animation==='{name}'")
        if name in ['walk','talk','laugh','run']:
            page.locator('.game-stage').screenshot(path=str(OUT/f'sophie_medium_{name}.png'))
    page.wait_for_function("()=>!GC.Cinematic.isActive()")

    for mode,label,scale in [('pixel48-full','full',1),('pixel48-medium','medium',44/48),('pixel48-compact','compact',41/48)]:
        start_scene(page,mode,False)
        page.wait_for_function("()=>GC.Cinematic.isActive()&&GC.Cinematic.actor('sophie')")
        actual=page.evaluate("()=>GC.Cinematic.actor('sophie').renderScale")
        assert abs(actual-scale)<0.0001,(mode,actual)
        page.locator('.game-stage').screenshot(path=str(OUT/f'sophie_scale_{label}_idle.png'))
        page.wait_for_function("()=>!GC.Cinematic.isActive()")

    assert page.evaluate('GC.Save.SAVE_SCHEMA')==23
    assert page.evaluate('GC.State.get().locked') is False
    assert page.evaluate('GC.Dialogue.isInputLocked()') is False
    assert page.evaluate('({map:GC.State.get().map,x:GC.State.get().x,y:GC.State.get().y,dir:GC.State.get().dir})')==start_pos
    assert not errors,f'page errors during Sophie validation: {errors}'
    browser.close()
print('SOPHIE PIXEL VALIDATION E2E PASS: Karen/Triton comparison -> eight animations -> 48/44/41 scale -> control restored')
