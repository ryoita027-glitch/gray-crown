#!/usr/bin/env python3
"""Gray Crown Phase 8: normal-player route through existing Ash Road -> Serad.
This test invokes no F2/Developer Mode, state assignment, warp, scripted win or
story flag fabrication. Same-scene art toggle is a presentation-only A/B
control; a second browser context receives real game-authored Save bytes.
Requires full unchanged Phase5 + Phase7 Playwright prerequisite success.
"""
from pathlib import Path
import json
import time
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as world
import browser_capital_first_arc_e2e_test as capital

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/ashroad_serad_v1'
OUT.mkdir(parents=True,exist_ok=True)
METRICS={'status':'NOT_RUN','route':'actual_new_game_via_phase5_and_phase7',
 'screenshots':[],'checkpoints':[],'battle_ids':[],'issues':[],'mobile':None}
BEFORE=time.perf_counter()

def require(ok,name,detail=None):
 METRICS['checkpoints'].append({'check':name,'pass':bool(ok),'detail':detail})
 if not ok:raise AssertionError(name+(' — '+str(detail) if detail is not None else ''))

def snap(page):
 return world.snapshot(page)

def scene(page,name):
 page.screenshot(path=str(OUT/(name+'.png')),full_page=True)
 METRICS['screenshots'].append(name+'.png')

def compare_pixels(page,map_name):
 require(snap(page)['map']==map_name,'same-map art reference before '+map_name)
 require(page.evaluate("AshFrontierEnvironment.enabled"),'art initially enabled for '+map_name)
 page.evaluate("() => {AshFrontierEnvironment.enabled=false;GC.Render.World.drawScene()}")
 scene(page,map_name+'_before')
 page.evaluate("() => {AshFrontierEnvironment.enabled=true;GC.Render.World.drawScene()}")
 scene(page,map_name+'_after')
 require(page.evaluate("AshFrontierEnvironment.enabled"),'art restored after comparison')

def meet(page,map_name,obj,kind,expect_battle=None):
 require(snap(page)['map']==map_name,'correct map for '+obj)
 coords=page.evaluate("""([kind,id])=>{
  let m=maps[GC.State.get().map],a=(kind==='npc'?m.npcs:m.objects).find(x=>x.id===id);
  if(!a)throw Error('canonical interaction absent: '+id);return [a.x,a.y]
 }""",[kind,obj])
 world.face_and_interact(page,coords,obj)
 if expect_battle:
  # A normal battle follows an original multi-line event. Do NOT use the
  # generic interruption processor; it intentionally auto-fights battles.
  for _ in range(160):
   if snap(page)['battle']==expect_battle:return
   if page.locator('#dialogueBox').is_visible():world.clean_dialogue(page)
   else:page.wait_for_timeout(85)
  raise AssertionError('expected canonical battle did not start: '+expect_battle)
 world.process_interruptions(page)

def normal_north(page,destination,name):
 world.walk_to(page,[(11,1),(12,1)],name+' approach')
 world.cross_north_boundary(page,destination,name,max_press=5)
 world.process_interruptions(page)
 require(snap(page)['map']==destination,'crossed '+name+' via keyboard')

def play(page,url):
 page.on('pageerror',lambda e:METRICS['issues'].append(str(e)))
 # Entire inherited village + old fort + gray-horned beast mandatory route.
 world.play(page,url)
 # Asset readiness is measured from the actual Chromium Image objects, not
 # inferred from the fact that the PNG source files happen to exist.
 page.wait_for_function("""() => ['karen','triton','sophie','margaret']
  .every(k=>GC.Render.World.heroRuntimeStatus()[k]?.ready)""",timeout=10000)
 runtime=page.evaluate("GC.Render.World.heroRuntimeStatus()")
 require(all(runtime.get(k,{}).get('ready') for k in ('karen','triton','sophie','margaret')),
         'four approved hero sprite sheets actually loaded',runtime)
 METRICS['original_sprite_status']=runtime
 require(snap(page)['story']=='05_capital','capital reached from genuine village start')
 capital.play_ceremony(page,'portraitOn')
 require(snap(page)['story']=='06_ceremony','ceremony canonical')
 # White Stag event runs from the real existing interior, not fixture flags.
 meet(page,'capital','capitalInnDoor','object')
 require(snap(page)['map']=='capitalinn','White Stag inn entry')
 meet(page,'capitalinn','innRest','object')
 require(snap(page)['story']=='08_alpha_complete','13-line night completed')
 require(page.evaluate("isEventComplete('alpha.capital.whiteStagNight')"),
     'actual White Stag evening flag')
 meet(page,'capitalinn','indoorExit','object')
 require(snap(page)['map']=='capital','return to capital')
 meet(page,'capital','granz','npc')
 require(page.evaluate("isEventComplete('alpha2.capital.granzBriefing')"),
     'existing General Granz military instructions')
 normal_north(page,'ashroad','capital north gate')
 require(snap(page)['story']=='10_ash_road','canonical Ash Road stage 10')
 compare_pixels(page,'ashroad')
 # The actual narrative gate requires mother + orders + patrol; optional
 # household/priest/cart visits are deliberately not a new completion gate.
 meet(page,'ashroad','refugee','npc')
 require(page.evaluate("isEventComplete('alpha2.ashroad.refugee')"),
         'existing refugee inquiry')
 meet(page,'ashroad','burnedHomestead','object')
 meet(page,'ashroad','scorchedOrders','object')
 require(page.evaluate("isEventComplete('alpha2.ashroad.orders')"),
         'existing scorched military orders')
 world.save_via_menu(page,'ashroad before patrol')
 world.reload_continue(page,'ashroad before patrol')
 require(snap(page)['map']=='ashroad','ashroad save/Continue')
 require(page.evaluate("isEventComplete('alpha2.ashroad.refugee')"),
         'refugee and orders flags persist')
 require(page.evaluate("isEventComplete('alpha2.ashroad.orders')"),
         'orders evidence flag persists after Continue')
 require(not page.evaluate("isEventComplete('alpha2.ashroad.complete')"),
         'cannot complete Ash Road before legitimate patrol encounter')
 meet(page,'ashroad','imperialPatrol','object',expect_battle='imperialRaid')
 require(snap(page)['battle']=='imperialRaid','imperial patrol real battle started')
 scene(page,'ashroad_patrol_battle')
 METRICS['battle_ids'].append('imperialRaid')
 world.battle(page)
 require(page.evaluate("isEventComplete('alpha2.ashroad.patrolVictory')"),
         'existing battle victory processed')
 require(snap(page)['story']=='10_ash_road','no premature chapter completion')
 normal_north(page,'frontier','ashroad north gate')
 require(snap(page)['story']=='12_frontier_arrival','Serad arrival stage 12')
 require(page.evaluate("isEventComplete('alpha2.frontier.arrival')"),
         'Serad arrival 5-line event played')
 compare_pixels(page,'frontier')
 world.save_via_menu(page,'frontier arrival')
 world.reload_continue(page,'frontier arrival')
 require(snap(page)['map']=='frontier','saved Serad map restored')
 meet(page,'frontier','frontierOfficer','npc')
 require(page.evaluate("isEventComplete('alpha2.frontier.briefing')"),
         'first Serad officer briefing')
 meet(page,'frontier','frontierMedic','npc')
 require(snap(page)['story']=='13_frontier_crisis',
         'hospital event advances to Serad defense')
 scene(page,'frontier_hospital_aftermath')
 meet(page,'frontier','vanguardCaptain','npc',expect_battle='vanguardCaptain')
 require(snap(page)['battle']=='vanguardCaptain','Vark battle starts via normal NPC')
 METRICS['battle_ids'].append('vanguardCaptain')
 scene(page,'frontier_vark_battle')
 world.battle(page)
 require(snap(page)['story']=='14_frontier_battle_won',
         'Vark victory reaches Stage 14')
 meet(page,'frontier','frontierOfficer','npc')
 require(snap(page)['story']=='15_frontier_complete',
         'first Serad frontier arc completes at existing Stage 15')
 require(page.evaluate("isEventComplete('alpha2.frontier.complete')"),
         'first Serad arc completed once')
 require(page.evaluate("isEventComplete('alpha2.frontier.vanguardVictory')"),
         'Vark combat story event stored canonically')
 world.save_via_menu(page,'Serad Stage15 complete')
 world.reload_continue(page,'Serad Stage15 complete')
 require(snap(page)['story']=='15_frontier_complete','Stage 15 retained after restart')
 require(not snap(page)['battle'],'no phantom battle after Continue')
 require(page.evaluate("GC.Validation.runValidation().ok"),
         'original game runtime validation')
 scene(page,'frontier_stage15_after_continue')
 METRICS['story_after']='15_frontier_complete'
 METRICS['steps']=world.STATS['steps']
 METRICS['elapsed_automated_seconds']=round(time.perf_counter()-BEFORE,2)
 return page.evaluate("localStorage.getItem('gray-crown-vslice-save-v1')")

def main():
 try:
  with world.served() as url:
   with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    try:
     context=browser.new_context(viewport={'width':1365,'height':900})
     page=context.new_page()
     raw=play(page,url)
     require(not METRICS['issues'],'no JS page errors',METRICS['issues'])
     context.close()
     mobile=browser.new_context(viewport={'width':390,'height':844})
     # Actual game-authored save bytes, not a planted Story fixture.
     mobile.add_init_script("localStorage.setItem('gray-crown-vslice-save-v1',"+
                            json.dumps(raw)+")")
     p2=mobile.new_page()
     p2.on('pageerror',lambda e:METRICS['issues'].append(str(e)))
     p2.goto(url,wait_until='networkidle')
     require(p2.locator('#titleContinue').is_enabled(),'mobile Continue enabled')
     p2.locator('#titleContinue').click()
     world.clean_dialogue(p2)
     require(snap(p2)['story']=='15_frontier_complete','mobile schema23 Story restore')
     metrics=p2.evaluate("""() => ({width:innerWidth,
       documentWidth:document.documentElement.scrollWidth,
       pixelMode:getComputedStyle(document.querySelector('#game')).imageRendering,
       saveSchema:GC.State.get().schema})""")
     require(metrics['documentWidth']<=390+2,'no mobile horizontal overflow',metrics)
     require(metrics['saveSchema']==23,'mobile Save schema remains v23')
     METRICS['mobile']=metrics
     scene(p2,'serad_mobile_390')
     mobile.close()
     require(not METRICS['issues'],'no uncaught JS browser errors',METRICS['issues'])
     METRICS['status']='PASS'
     print('PHASE8 REAL BROWSER PASS: from untouched New Game through 15_frontier_complete')
    finally:browser.close()
 except Exception as exc:
  METRICS['status']='FAIL'
  METRICS['error']=str(exc)
  raise
 finally:
  (OUT/'ashroad_serad_results.json').write_text(
    json.dumps(METRICS,ensure_ascii=False,indent=2),encoding='utf-8')

if __name__=='__main__':
 main()
