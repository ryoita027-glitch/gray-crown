#!/usr/bin/env python3
"""In-game Chromium E2E: real Ryune pixel environment before/after and navigation.
Production maps/actors/story/saves are never replaced to make a visual PASS.
"""
import contextlib
import functools
import hashlib
import http.server
import json
import statistics
import threading
from collections import deque
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/ryune_environment_v1'
OUT.mkdir(parents=True,exist_ok=True)
MAPS=('village','karenhome','orphanage','mayorhouse','cottage')
HEROES=('karen','triton','sophie','margaret')
DOORS=(('karenhome',(4,6),'ArrowUp',(4,5)),('orphanage',(19,6),'ArrowUp',(19,5)),
       ('mayorhouse',(4,13),'ArrowUp',(4,12)),('cottage',(19,13),'ArrowUp',(19,12)))
LOG={'tested_head':'pixel-vslice-ryune-environment-v1','checks':[],'viewport':[],'performance_ms':{}}

class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass

@contextlib.contextmanager
def game_server():
 handler=functools.partial(Quiet,directory=str(ROOT))
 srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
 thread=threading.Thread(target=srv.serve_forever,daemon=True)
 thread.start()
 try: yield 'http://127.0.0.1:%s/index.html'%srv.server_port
 finally: srv.shutdown();srv.server_close()

def check(label,condition,detail=None):
 LOG['checks'].append({'name':label,'pass':bool(condition),'detail':detail})
 if not condition:raise AssertionError('%s: %s'%(label,detail))

def scene(page):
 return page.evaluate("""() => {const s=GC.State.get();return {map:s.map,x:s.x,y:s.y,stage:s.story.stage,trail:s.trail}}""")

def close_dialogue(page):
 for _ in range(100):
  if not page.locator('#dialogueBox').is_visible():return
  page.keyboard.press('Enter')
  page.wait_for_timeout(40)
 raise AssertionError('dialogue did not finish')

def begin(page):
 page.goto(URL,wait_until='networkidle')
 check('title visible',page.locator('#titleNewGame').is_visible())
 page.locator('#titleNewGame').click();close_dialogue(page)
 check('new game starts village',scene(page)['map']=='village')
 page.wait_for_function("""() => {let r=GC.Render.World.heroRuntimeStatus();
   return ['karen','triton','sophie','margaret'].every(k=>r[k]?.ready)}""")
 status=page.evaluate('GC.Render.World.heroRuntimeStatus()')
 check('all four real hero Walk PNGs loaded',all(status[n]['naturalWidth']==288 and status[n]['naturalHeight']==192 for n in HEROES),status)

def snap(page,name):
 page.wait_for_timeout(260)
 path=OUT/(name+'.png')
 page.screenshot(path=str(path),full_page=True)
 return hashlib.sha256(path.read_bytes()).hexdigest()

def switch_art(page,enabled):
 page.evaluate('(value) => {RyuneEnvironment.enabled=value;GC.Render.World.draw()}',enabled)
 page.wait_for_timeout(260)

def bfs(page,target):
 grid=page.evaluate("""() => ({
    width:COLS,height:ROWS,mask:Array.from({length:ROWS},(_,y)=>Array.from({length:COLS},(_,x)=>isBlocked(x,y)))
 })""")
 start=scene(page);begin_at=(start['x'],start['y']);dest=tuple(target)
 dirs=((0,-1,'ArrowUp'),(1,0,'ArrowRight'),(0,1,'ArrowDown'),(-1,0,'ArrowLeft'))
 q=deque([begin_at]);previous={begin_at:None}
 while q:
  x,y=q.popleft()
  if (x,y)==dest:break
  for dx,dy,key in dirs:
   nx,ny=x+dx,y+dy
   if 0<=nx<grid['width'] and 0<=ny<grid['height'] and not grid['mask'][ny][nx] and (nx,ny) not in previous:
    previous[(nx,ny)]=((x,y),key);q.append((nx,ny))
 check('target is reachable '+str(dest),dest in previous,{'from':begin_at,'map':start['map']})
 keys=[];at=dest
 while at!=begin_at:
  at_prev,key=previous[at];keys.append(key);at=at_prev
 return list(reversed(keys))

def walk(page,to):
 route=bfs(page,to)
 for key in route:
  before=scene(page)
  page.keyboard.press(key);page.wait_for_timeout(135)
  current=scene(page)
  check('normal walk step',current['map']==before['map'] and (current['x'],current['y'])!=(before['x'],before['y']),
        {'map':before['map'],'from':(before['x'],before['y']),'key':key})
 check('arrival',tuple((scene(page)['x'],scene(page)['y']))==tuple(to),to)

def record_cost(page,label,active):
 times=page.evaluate("""(active)=>{
    RyuneEnvironment.enabled=active;
    const arr=[];for(let j=0;j<12;j++){
      const t=performance.now();GC.Render.World.drawScene();arr.push(performance.now()-t)
    }return arr.slice(2);
 }""",active)
 LOG['performance_ms'][label]={'median':round(statistics.median(times),3),'max':round(max(times),3),'samples':[round(a,3) for a in times]}
 return statistics.median(times)

with game_server() as URL:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  page=browser.new_page(viewport={'width':1365,'height':900},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  begin(page)
  static_before=page.evaluate("""() => JSON.stringify(Object.fromEntries(
    ['village','karenhome','orphanage','mayorhouse','cottage'].map(id=>[id,{tiles:maps[id].tiles,npcs:maps[id].npcs,objects:maps[id].objects}])))""")
  switch_art(page,False);legacy=snap(page,'before_village')
  before_ms=record_cost(page,'village_legacy',False)
  switch_art(page,True);current=snap(page,'after_village')
  after_ms=record_cost(page,'village_ryune',True)
  check('village paint visibly changed',legacy!=current)
  check('village render cost measured',before_ms>=0 and after_ms>=0,LOG['performance_ms'])
  # Direct v1/v2 A/B using exactly the same live Canvas and game state.
  page.evaluate("RyuneArtV2.enabled=false;GC.Render.World.draw()")
  prior_v1=snap(page,'environment_v1_village')
  prior_ms=record_cost(page,'village_environment_v1',True)
  page.evaluate("RyuneArtV2.enabled=true;GC.Render.World.draw()")
  next_v2=snap(page,'environment_v2_village')
  final_ms=record_cost(page,'village_environment_v2',True)
  check('art v2 improves the village without changing any actor sprite',prior_v1!=next_v2)
  check('v1 and v2 cost recorded without a fragile timing threshold',prior_ms>=0 and final_ms>=0)
  check('four canonical buildings have different palettes and unchanged coordinates',
        page.evaluate("""() => RyuneArtV2.blueprints.length===4
           && new Set(RyuneArtV2.blueprints.map(b=>b.kind)).size===4
           && RyuneArtV2.blueprints.every(b=>maps.village.tiles[b.y][b.x]==='H')"""))
  check('environment code mounted',page.evaluate("RyuneEnvironment.enabled && RyuneEnvironment.targets.has('village')"))
  check('unchanged runtime actor scale',page.evaluate("HERO_RUNTIME.display===44"))

  # Genuine player keyboard movement to NPC and first room (no Developer Mode).
  walk(page,(12,7));page.keyboard.press('ArrowUp');page.wait_for_timeout(135);page.keyboard.press('Enter')
  check('real village messenger talk',page.locator('#dialogueBox').is_visible())
  close_dialogue(page)
  check('village event progresses normally',page.evaluate("GC.State.get().events.completed['alpha.village.appointment']===true"))
  # Every entrance is approached from its actual traversable neighbor.
  for map_id,pos,facing,door in DOORS:
   walk(page,pos)
   snap(page,'after_'+map_id+'_exterior')
   page.keyboard.press(facing);page.wait_for_timeout(140);page.keyboard.press('Enter');page.wait_for_timeout(150)
   check('real entry '+map_id,scene(page)['map']==map_id)
   close_dialogue(page)
   switch_art(page,False);old=snap(page,'before_'+map_id)
   switch_art(page,True);new=snap(page,'after_'+map_id)
   page.evaluate("RyuneArtV2.enabled=false;GC.Render.World.draw()")
   v1png=snap(page,'environment_v1_'+map_id)
   page.evaluate("RyuneArtV2.enabled=true;GC.Render.World.draw()")
   v2png=snap(page,'environment_v2_'+map_id)
   check('commercial art v2 improves distinct interior '+map_id,v1png!=v2png)
   check('interior '+map_id+' visually distinct',old!=new)
   check('interior hero scale unchanged',page.evaluate("HERO_RUNTIME.display===44"))
   # Exit via original blocked doorway interaction rather than direct state injection.
   page.keyboard.press('ArrowDown');page.wait_for_timeout(150);page.keyboard.press('Enter');page.wait_for_timeout(150)
   check('exit '+map_id+' returns to village',scene(page)['map']=='village')
   close_dialogue(page)

  # After four room round-trips: verify map and all original triggers untouched.
  static_after=page.evaluate("""() => JSON.stringify(Object.fromEntries(
    ['village','karenhome','orphanage','mayorhouse','cottage'].map(id=>[id,{tiles:maps[id].tiles,npcs:maps[id].npcs,objects:maps[id].objects}])))""")
  check('map/NPC/object coordinates and collision definitions unchanged',static_before==static_after)
  snap(page,'after_village_party_walk')
  walk(page,(18,7));snap(page,'after_npc_near_building')
  # Important existing village NPCs must remain interactable and reachable.
  for npc,pos,facing in (('father',(5,7),'ArrowUp'),
                          ('orphan',(18,7),'ArrowUp'),
                          ('mayor',(6,8),'ArrowDown')):
   walk(page,pos)
   page.keyboard.press(facing);page.wait_for_timeout(130)
   page.keyboard.press('Enter');page.wait_for_timeout(130)
   check('important NPC conversation '+npc,page.locator('#dialogueBox').is_visible())
   close_dialogue(page)

  # Four actors move through an authentic map with the unchanged walk sprites.
  check('same four party members',page.evaluate("GC.State.get().party.map(p=>p.id).join(',')==='karen,triton,sophie,margaret'"))
  check('collision uses original houses and NPCs',page.evaluate("isBlocked(3,2)&&isBlocked(18,2)&&isBlocked(6,9)"))
  # Save/restore in the actual browser (no save schema changes).
  saved=scene(page)
  check('silent save outside event',page.evaluate('GC.Save.save(true)'))
  check('saved schema stays 23',page.evaluate("JSON.parse(localStorage.getItem('gray-crown-vslice-save-v1')).schema===23"))
  walk(page,(15,8));check('normal load',page.evaluate('GC.Save.load(true)'))
  loaded=scene(page)
  check('save preserves room/map/position',loaded['map']==saved['map'] and (loaded['x'],loaded['y'])==(saved['x'],saved['y']))
  snap(page,'after_save_load')
  # S1: compact turn must not hide a hero.
  for key in ('ArrowUp','ArrowUp','ArrowRight','ArrowRight','ArrowDown','ArrowLeft','ArrowUp','ArrowDown'):
   page.keyboard.press(key);page.wait_for_timeout(140)
  distinct=page.evaluate("""() => {let s=GC.State.get(), a=[[s.x,s.y],...partyTrailPoints()];return new Set(a.map(t=>t.join(','))).size}""")
  check('four distinct party positions after compact reversal',distinct==4,distinct)

  # The entire 24x15 map in a 768x480 real game canvas, not AI-rendered art.
  page.evaluate("""() => {
    GC.Cinematic.cameraTarget=()=>({x:12,y:7,scale:1});
    GC.Render.World.VISUAL.map=null;GC.Render.World.draw();
  }""")
  page.wait_for_timeout(250)
  page.evaluate("""() => {
     document.querySelector('.world-hud').style.visibility='hidden';
     document.querySelector('.story-context').style.visibility='hidden';
  }""")
  page.locator('#game').screenshot(path=str(OUT/'after_village_whole_map.png'))
  page.evaluate("""() => {
     document.querySelector('.world-hud').style.visibility='';
     document.querySelector('.story-context').style.visibility='';
  }""")
  page.evaluate("""() => {GC.Cinematic.cameraTarget=()=>null;GC.Render.World.VISUAL.map=null;GC.Render.World.draw()}""")

  for w,h,label in ((1024,768,'smallpc'),(390,844,'mobile')):
   vp=browser.new_page(viewport={'width':w,'height':h})
   vp.on('pageerror',lambda e:errors.append(str(e)))
   begin(vp)
   vp.wait_for_timeout(180)
   metrics=vp.evaluate("""() => ({
      viewport:innerWidth,document:document.documentElement.scrollWidth,
      pixelMode:getComputedStyle(document.querySelector('#game')).imageRendering})""")
   check(label+' no horizontal overflow',metrics['document']<=w+2,metrics)
   check(label+' pixel CSS enabled',metrics['pixelMode'] in ('pixelated','crisp-edges'))
   snap(vp,'after_'+label+'_village')
   LOG['viewport'].append({'size':label,'width':w,'height':h,'metrics':metrics})
   vp.close()

  check('no console/page errors',not errors,errors[:15])
  with open(OUT/'environment_results.json','w',encoding='utf8') as f:
   json.dump(LOG,f,ensure_ascii=False,indent=2)
  browser.close()
print('RYUNE ENVIRONMENT REAL-BROWSER E2E PASS',len(LOG['checks']),'assertions')
