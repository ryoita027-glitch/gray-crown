#!/usr/bin/env python3
"""Gray Crown Phase 5: real keyboard/pointer from New Game to fort boss and
canonical capital route. NO Dev Mode, teleport, direct battle-win, artificial
equipment, story flags or manipulated RNG. Test only observes state and screen.
"""
import contextlib
import functools
import http.server
import json
import time
import threading
from collections import deque
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/vertical_slice_v1'
OUT.mkdir(parents=True,exist_ok=True)
SAVE_KEY='gray-crown-vslice-save-v1'
STATS={'play_seconds':0,'battles':[],'steps':0,'dialogue_advance_keys':0,
 'checkpoints':[],'screenshots':[],'blocked_steps':[],'warnings':[], 'viewport':[]}
EVENT='alpha.village.appointment'
DIRECTIONS=((0,-1,'ArrowUp'),(1,0,'ArrowRight'),(0,1,'ArrowDown'),(-1,0,'ArrowLeft'))
WAIT_MS=145

class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass

@contextlib.contextmanager
def served():
 srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
 thread=threading.Thread(target=srv.serve_forever,daemon=True);thread.start()
 try:yield f'http://127.0.0.1:{srv.server_port}/index.html'
 finally:srv.shutdown();srv.server_close()

def check(value,message):
 if not value:raise AssertionError(message)

def snapshot(page):
 return page.evaluate("""() => {let s=GC.State.get();return {
  map:s.map,x:s.x,y:s.y,dir:s.dir,story:s.story.stage,schema:s.schema,
  locked:s.locked,battle:s.battle?.id||null,
  encounterSteps:s.encounterSteps,completed:Object.keys(s.events.completed).filter(k=>s.events.completed[k]),
  defeated:Object.keys(s.world.defeatedSymbols).filter(k=>s.world.defeatedSymbols[k]),
  switches:{...s.world.switches},treasures:{...s.world.treasures},
  inventory:{...s.inventory},hp:s.party.map(p=>p.hp),mp:s.party.map(p=>p.mp),
  objective:s.story.objective,trail:s.trail
 }}""")

def checkpoint(page,label):
 info=snapshot(page);STATS['checkpoints'].append({'name':label,'state':info})
 return info

def shot(page,name):
 page.screenshot(path=str(OUT/(name+'.png')),full_page=True)
 STATS['screenshots'].append(name+'.png')

def clean_dialogue(page,limit=145):
 for _ in range(limit):
  in_scene=page.evaluate("GC.RyuneActing?.isRunning?.()||false")
  dlg=page.locator('#dialogueBox').is_visible()
  if not in_scene and not dlg:return
  if dlg:
   page.keyboard.press('Enter');STATS['dialogue_advance_keys']+=1
  page.wait_for_timeout(60)
 raise AssertionError('dialogue or SceneRunner never unlocked')

def settle(page):
 # During normal map transitions / encounter intros wait for existing locks to release.
 for i in range(60):
  if page.locator('#levelUpContinue').is_visible():
   page.locator('#levelUpContinue').click()
  if page.locator('#dialogueBox').is_visible() or page.evaluate("GC.RyuneActing?.isRunning?.()||false"):
   clean_dialogue(page);continue
  if snapshot(page)['battle']:return
  if not page.evaluate("GC.State.get().locked"):return
  page.wait_for_timeout(110)
 raise AssertionError('world input remained locked >6s')

def battle(page,limit=170):
 s=snapshot(page);check(s['battle'],'battle() called outside battle')
 battle_id=s['battle'];start=time.perf_counter();commands=0
 # Natural battle buttons only, including ordinary AI turns.
 for i in range(limit):
  if not snapshot(page)['battle']:break
  page.wait_for_timeout(150)
  if page.locator('#levelUpContinue').is_visible():
   page.locator('#levelUpContinue').click()
  if page.locator('#battleResult').is_visible():
   page.wait_for_timeout(500);continue
  if page.evaluate("GC.State.get().locked"):
   page.wait_for_timeout(170);continue
  actor=page.evaluate("(()=>{const s=GC.State.get();return s.party[s.battle.actor]})()")
  if not actor:continue
  actions={'karen':'attack','triton':'heavy','sophie':'staffSophie','margaret':'fire'}
  if actor['id']=='sophie' and actor['mp']>=6:
   needs=page.evaluate("GC.State.get().party.some(x=>x.hp>0&&x.hp/x.maxHp<0.53)")
   if needs:actions['sophie']='heal'
  if actor['id']=='margaret' and actor['mp']<7:actions['margaret']='staffMargaret'
  chosen=actions[actor['id']]
  btn=page.locator(f'#battleActions [data-battle="{chosen}"]')
  if not btn.count() or btn.is_disabled():
   btn=page.locator('#battleActions button:not([disabled])').first
  check(btn.count()>0,'no usable battle command '+battle_id)
  btn.click(timeout=3500);commands+=1
  page.wait_for_timeout(180)
 else:raise AssertionError('battle stuck: '+battle_id+', commands='+str(commands))
 for _ in range(45):
  if page.locator('#levelUpContinue').is_visible():
   page.locator('#levelUpContinue').click()
  if not page.locator('#battlePanel').is_visible():break
  page.wait_for_timeout(180)
 check(not page.locator('#battlePanel').is_visible(),'battle did not visually close: '+battle_id)
 settle(page)
 out={'id':battle_id,'commands':commands,'seconds':round(time.perf_counter()-start,2),
      'result':snapshot(page)['defeated'],'party_hp':snapshot(page)['hp']}
 STATS['battles'].append(out)
 check(any(v>0 for v in snapshot(page)['hp']),'party wiped after supposed victory')
 return out

def process_interruptions(page):
 # Unplanned map random encounters are part of the actual playthrough.
 for _ in range(25):
  st=snapshot(page)
  if st['battle']:battle(page);continue
  if page.locator('#dialogueBox').is_visible() or page.evaluate("GC.RyuneActing?.isRunning?.()||false"):
   clean_dialogue(page);continue
  if st['locked']:settle(page);continue
  return
 raise AssertionError('recursive encounter/dialogue loop')

def board(page):
 return page.evaluate("""() => ({
  cols:COLS, rows:ROWS, blocked:Array.from({length:ROWS},(_,y)=>
    Array.from({length:COLS},(_,x)=>isBlocked(x,y)))
 })""")

def bfs(page,target_set):
 s=snapshot(page);b=board(page);origin=(s['x'],s['y'])
 q=deque([origin]);prev={origin:None}
 while q:
  x,y=q.popleft()
  if (x,y) in target_set:
   keys=[];end=(x,y)
   while (x,y)!=origin:
    parent,key=prev[(x,y)];keys.append(key);x,y=parent
   return list(reversed(keys)),end
  for dx,dy,key in DIRECTIONS:
   k=(x+dx,y+dy)
   if 0<=k[0]<b['cols'] and 0<=k[1]<b['rows'] and not b['blocked'][k[1]][k[0]] and k not in prev:
    prev[k]=((x,y),key);q.append(k)
 raise AssertionError('no legal route '+str(origin)+' -> '+str(sorted(target_set))+' in '+s['map'])

def walk_to(page,targets,name,limit=170):
 targets=set(tuple(p) for p in targets)
 for count in range(limit):
  process_interruptions(page)
  st=snapshot(page)
  if (st['x'],st['y']) in targets:return
  keys,goal=bfs(page,targets)
  check(bool(keys),'nonzero route expected for '+name)
  page.keyboard.press(keys[0])
  page.wait_for_timeout(WAIT_MS)
  STATS['steps']+=1
  after=snapshot(page)
  check(after['map']==st['map'],f'unexpected map transition in {name}: {st["map"]}->{after["map"]}')
  if after['battle']:continue
  if (after['x'],after['y'])==(st['x'],st['y']) and not page.locator('#dialogueBox').is_visible():
   STATS['blocked_steps'].append({'at':name,'x':st['x'],'y':st['y'],'key':keys[0]})
   raise AssertionError('stuck on walk to '+name+' '+str(st))
 raise AssertionError('route too long: '+name)

def face_and_interact(page,target,id):
 tx,ty=target
 spots={(tx-dx,ty-dy):(key) for dx,dy,key in DIRECTIONS}
 # facing key from player cell -> target: each direction vector leads to target
 b=board(page)
 legal=[p for p in spots if 0<=p[0]<b['cols'] and 0<=p[1]<b['rows'] and not b['blocked'][p[1]][p[0]]]
 check(legal,'object has no legal adjacent cell: '+id)
 walk_to(page,legal,'approach '+id)
 st=snapshot(page);dx,dy=tx-st['x'],ty-st['y']
 key=next((z for x,y,z in DIRECTIONS if (x,y)==(dx,dy)),None)
 check(key, 'no adjacent facing for '+id)
 page.keyboard.press(key);page.wait_for_timeout(WAIT_MS)
 # If turning/movement steps onto target (unblocked), user reaches it normally.
 # Interact only while stationary and facing expected object tile.
 now=snapshot(page)
 if (now['x'],now['y'])!=(st['x'],st['y']):
  # This is a legal transition trigger, so handle separately at the caller.
  check(id in ('caveEntrance','northRoadExit','villageGate','caveNorth'),f'object {id} was not blocking')
  return
 page.keyboard.press('Enter');page.wait_for_timeout(100)

def save_via_menu(page,label):
 process_interruptions(page)
 page.keyboard.press('m');page.wait_for_timeout(90)
 check(page.locator('#modal').is_visible(),'menu not accessible at '+label)
 page.locator('.menu-actions button').first.click()
 clean_dialogue(page)
 raw=page.evaluate("localStorage.getItem("+json.dumps(SAVE_KEY)+")")
 check(raw,'no persisted save at '+label)
 stored=json.loads(raw)
 check(stored['schema']==23,'save schema changed')
 STATS['checkpoints'].append({'name':'save '+label,'state':{'map':stored['map'],'stage':stored['story']['stage'],
       'defeated':stored['world']['defeatedSymbols'],'treasures':stored['world']['treasures']}})
 return stored

def reload_continue(page,label):
 page.reload(wait_until='networkidle')
 check(page.locator('#titleContinue').is_enabled(),'Continue missing on '+label)
 page.locator('#titleContinue').click()
 clean_dialogue(page)
 check(snapshot(page)['schema']==23,'Continue schema mismatch')

def play(page,url):
 start=time.perf_counter()
 page.goto(url,wait_until='networkidle');check(page.locator('#titleNewGame').is_visible(),'no title')
 shot(page,'00_title')
 page.locator('#titleNewGame').click();clean_dialogue(page)
 check(snapshot(page)['story']=='00_village','new game progression start invalid')
 shot(page,'01_village')
 save_via_menu(page,'village')
 # Full appointment from ordinary walking + facing and action. A no-Dev-mode cutscene.
 walk_to(page,[(12,7)],'envoy');page.keyboard.press('ArrowUp');page.wait_for_timeout(WAIT_MS)
 page.keyboard.press('Enter')
 page.wait_for_function("() => GC.RyuneActing.isRunning()",timeout=8000)
 shot(page,'02_appointment')
 clean_dialogue(page)
 check('alpha.village.appointment' in snapshot(page)['completed'],'appointment did not complete')
 check(snapshot(page)['story']=='01_appointed','stage failed at appointment')
 save_via_menu(page,'appointed')
 # Follow the prescribed village north gate, no warps.
 walk_to(page,[(11,1),(12,1)],'village north gate')
 page.keyboard.press('ArrowUp');page.wait_for_timeout(180);process_interruptions(page)
 check(snapshot(page)['map']=='road','north gate failed')
 check(snapshot(page)['story']=='02_road','road story stage missing')
 checkpoint(page,'road arrival');shot(page,'03_road')
 save_via_menu(page,'road before wolf')
 # Wolf proximity starts its actual battle, not injected via script.
 walk_to(page,[(11,7)],'wolf approach')
 for _ in range(3):
  if snapshot(page)['battle']:break
  page.keyboard.press('ArrowUp');page.wait_for_timeout(WAIT_MS);STATS['steps']+=1
 check(snapshot(page)['battle']=='wolves','story wolf encounter missing')
 shot(page,'04_wolf_battle')
 battle(page)
 check('wolf' in snapshot(page)['defeated'],'wolf did not persist as defeated')
 save_via_menu(page,'road after wolf')
 expected=snapshot(page);reload_continue(page,'road after wolf')
 check('wolf' in snapshot(page)['defeated'] and snapshot(page)['map']=='road','road save/Continue did not hold')
 shot(page,'05_road_restored')
 # Existing optional branch. The path contains a real entrance object at (13,1).
 walk_to(page,[(13,2)],'fort entrance path')
 page.keyboard.press('ArrowUp');page.wait_for_timeout(175);process_interruptions(page)
 check(snapshot(page)['map']=='cave','fort side-path entrance failed')
 checkpoint(page,'fort entrance');shot(page,'06_fort')
 save_via_menu(page,'cave arrival')
 # In-cave mechanics: both side combat symbols and mechanisms through normal input.
 for obj in ('leverWest','leverEast'):
  target=page.evaluate("(id)=>{let o=maps.cave.objects.find(o=>o.id===id);return [o.x,o.y]}",obj)
  face_and_interact(page,target,obj)
  process_interruptions(page)
  check(snapshot(page)['switches'].get(obj) is True,'lever interaction did not set '+obj)
  shot(page,'07_'+obj)
  # Interact again: toggle must not revert; no duplicated rewards.
  before=snapshot(page)
  face_and_interact(page,target,obj)
  process_interruptions(page)
  check(snapshot(page)['switches'].get(obj) is True,'repeat lever toggled '+obj)
  check(snapshot(page)['inventory']==before['inventory'],'lever yielded duplicate items')
 check('bats' in snapshot(page)['defeated'] and 'crawler' in snapshot(page)['defeated'],
       'puzzle skipped cave guardian encounters')
 save_via_menu(page,'both levers')
 # Chests only once via actual contact; visited, world and inventory survive saving.
 for obj in ('chest1','chest2'):
  target=page.evaluate("(id)=>{let o=maps.cave.objects.find(o=>o.id===id);return [o.x,o.y]}",obj)
  face_and_interact(page,target,obj)
  process_interruptions(page)
  first=snapshot(page)
  check(first['treasures'].get(obj) is True,'chest unopened '+obj)
  face_and_interact(page,target,obj)
  process_interruptions(page)
  check(snapshot(page)['inventory']==first['inventory'],'duplicate treasure '+obj)
 shot(page,'08_fort_puzzle_complete')
 save_via_menu(page,'puzzle complete')
 checkpoint(page,'boss ready')
 # Real approach to blocked boss at (12,3) and actual displayed choice -> battle.
 boss=page.evaluate("(()=>{let o=maps.cave.objects.find(o=>o.id==='boss');return[o.x,o.y]})()")
 face_and_interact(page,boss,'boss')
 if page.locator('#choiceBox button').count():
  option=page.locator('#choiceBox button').filter(has_text='戦う').first
  check(option.count(),'boss fight choice missing')
  option.click();page.wait_for_timeout(130)
 if not snapshot(page)['battle']:
  # On approach handleStep may have shown the same battle choice automatically.
  process_interruptions(page)
 check(snapshot(page)['battle']=='boss','boss did not trigger through normal interaction')
 shot(page,'09_boss_battle')
 battle(page)
 check('boss' in snapshot(page)['defeated'],'boss victory did not persist')
 shot(page,'10_boss_won')
 save_via_menu(page,'boss defeated')
 state_after_boss=snapshot(page)
 reload_continue(page,'boss defeated')
 check('boss' in snapshot(page)['defeated'],'boss respawned on reload')
 check(snapshot(page)['switches'].get('leverWest') and snapshot(page)['switches'].get('leverEast'),
       'levers reset on reload')
 check(all(snapshot(page)['treasures'].get(x) for x in ('chest1','chest2')),
       'treasures reset after boss')
 shot(page,'11_boss_continue')
 # North cave gate -> northroad -> capital: actual canonical Story 04/05.
 walk_to(page,[(11,1),(12,1)],'fort northern exit')
 page.keyboard.press('ArrowUp');page.wait_for_timeout(160);process_interruptions(page)
 check(snapshot(page)['map']=='northroad','boss-to-old-road transition failed')
 shot(page,'12_northroad')
 walk_to(page,[(11,1),(12,1)],'northroad capital direction')
 page.keyboard.press('ArrowUp');page.wait_for_timeout(170);process_interruptions(page)
 check(snapshot(page)['map']=='capital','fort victory failed to connect to canonical capital')
 check(snapshot(page)['story']=='05_capital','canonical story stage missing after capital entry')
 shot(page,'13_capital')
 checkpoint(page,'canonical capital transition')
 STATS['play_seconds']=round(time.perf_counter()-start,1)

def main():
 errors=[]
 try:
  with served() as url:
   with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    try:
     page=browser.new_page(viewport={'width':1365,'height':900},device_scale_factor=1)
     page.on('pageerror',lambda e:errors.append(str(e)))
     play(page,url)
     for w,h in ((1024,768),(390,844)):
      mobile=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
      mobile.on('pageerror',lambda e:errors.append(str(e)))
      mobile.goto(url,wait_until='networkidle')
      mobile.locator('#titleNewGame').click()
      clean_dialogue(mobile)
      metrics=mobile.evaluate("""() => ({
        width:innerWidth,scroll:document.documentElement.scrollWidth,
        image:getComputedStyle(document.querySelector('#game')).imageRendering,
        action:!!document.querySelector('#mobileAct')?.getBoundingClientRect().width
      })""")
      check(metrics['scroll']<=w+2,f'responsive width overflow {w}: {metrics}')
      STATS['viewport'].append(metrics)
      shot(mobile,'14_view_'+str(w))
      mobile.close()
     check(not errors,'uncaught JS exceptions '+str(errors[:6]))
     page.close()
    finally:browser.close()
  STATS['status']='PASS';print('VERTICAL SLICE FULL NORMAL PLAY PASS: '+json.dumps({'seconds':STATS['play_seconds'],'battles':len(STATS['battles']),'steps':STATS['steps']},ensure_ascii=False))
 except Exception as e:
  STATS['status']='FAIL';STATS['failure']=str(e)
  raise
 finally:
  (OUT/'vertical_slice_e2e_metrics.json').write_text(json.dumps(STATS,ensure_ascii=False,indent=2),encoding='utf8')

if __name__=='__main__':main()
