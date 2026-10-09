#!/usr/bin/env python3
"""Phase 7: authentic new-game route to capital, original ceremony (two portrait
presentation modes based on a *real* saved pre-ceremony checkpoint), city
exploration, indoors, schema 23 and mobile screenshots. Never inject Story flags
or use Developer Mode. Setup-assisted A/B save duplication is explicitly labeled.
"""
import contextlib,functools,http.server,json,time,threading
from pathlib import Path
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/capital_first_arc_v1'
OUT.mkdir(parents=True,exist_ok=True)
EVIDENCE={'route':'normal_new_game_keyboard_via_phase5_vertical_slice',
 'portrait_comparison':'both contexts use bytes from game-authored pre-ceremony save; no direct Story modification',
 'screenshots':[],'checks':[],'issues':[],'real_browser':True}

def must(ok,label,detail=None):
 EVIDENCE['checks'].append({'name':label,'pass':bool(ok),'detail':detail})
 if not ok:raise AssertionError(label+(': '+str(detail) if detail else ''))

def screen(page,name):
 path=OUT/(name+'.png')
 page.screenshot(path=str(path),full_page=True)
 EVIDENCE['screenshots'].append(path.name)

def state(page):
 return first.snapshot(page)

def finish_scene(page,max_seconds=75):
 start=time.monotonic();seen=set()
 while time.monotonic()-start<max_seconds:
  running=page.evaluate("CapitalActing.isRunning()")
  if not running:
   if not page.locator('#dialogueBox').is_visible():return seen
   first.clean_dialogue(page);return seen
  scene=page.evaluate("CapitalActing.getSnapshot()")
  if scene['lineIndex'] is not None:seen.add(scene['lineIndex'])
  if page.locator('#dialogueBox').is_visible():
   page.keyboard.press('Enter');page.wait_for_timeout(65)
  else:page.wait_for_timeout(55)
 raise AssertionError('capital 12-line appointment timed out; lines='+str(sorted(seen)))

def play_ceremony(page,mode):
 must(state(page)['map']=='capital','must arrive in real capital before ceremony')
 must(state(page)['story']=='05_capital','correct preceremony Story stage')
 must(not page.evaluate("isEventComplete('alpha.capital.ceremony')"),'ceremony incomplete at entry')
 must(page.evaluate("CapitalActing.setPortraitMode("+json.dumps(mode)+")"),'A/B mode can be chosen before scene')
 official=page.evaluate("(()=>{let a=maps.capital.npcs.find(n=>n.id==='capitalOfficial');return[a.x,a.y]})()")
 first.face_and_interact(page,official,'capitalOfficial')
 page.wait_for_function("CapitalActing.isRunning()",timeout=7500)
 must(page.evaluate("GC.Save.save(true)") is False,'cannot save mid-ceremony')
 must(page.evaluate("GC.Save.load(true)") is False,'cannot load mid-ceremony')
 screen(page,'ceremony_'+mode+'_start')
 first_dialogue=page.locator('#dialogueBox').is_visible()
 must(first_dialogue,'ceremony dialogue visible with normal NPC interaction')
 page.wait_for_timeout(120)
 must(page.evaluate("CapitalActing.getSnapshot().actors.length") == 5,'five scene actors including official')
 samples={}
 start=time.monotonic()
 while page.evaluate("CapitalActing.isRunning()") and time.monotonic()-start<75:
  sample=page.evaluate("CapitalActing.getSnapshot()")
  i=sample['lineIndex']
  if i is not None and i not in samples:
   samples[i]=sample
   if i in (1,4,5,9,11):screen(page,f'ceremony_{mode}_line_{i:02}')
  if page.locator('#dialogueBox').is_visible():page.keyboard.press('Enter')
  page.wait_for_timeout(80)
 must(not page.evaluate("CapitalActing.isRunning()"),'scene must finish')
 for _ in range(35):
  if not page.evaluate("GC.Cinematic.isActive()"):break
  page.wait_for_timeout(70)
 must(page.evaluate("isEventComplete('alpha.capital.ceremony')"),'canonical ceremony completion effect')
 must(state(page)['story']=='06_ceremony','canonical 06_ceremony after ceremony')
 must(not page.evaluate("GC.Cinematic.isActive()"),'no leaked cinematic')
 must(not state(page)['locked'],'no leaked input lock')
 must(page.evaluate("GC.Cinematic.cameraTarget() === null"),'camera released')
 must(len(samples)==12,'exact 12 dialogue lines were displayed',sorted(samples))
 must(not page.locator('#battlePanel').is_visible(),'no battle accidentally triggered by ceremony')
 screen(page,'ceremony_'+mode+'_complete')
 EVIDENCE[mode]={'lines':sorted(samples),'duration_seconds':round(time.monotonic()-start,2),
                 'actors_first':samples[0]['actors'],'actors_last':samples[11]['actors']}
 return samples

def walk_and_talk(page,npc_id):
 target=page.evaluate("(id)=>{let p=maps[GC.State.get().map].npcs.find(p=>p.id===id);return [p.x,p.y]}",npc_id)
 first.face_and_interact(page,target,npc_id)
 must(page.locator('#dialogueBox').is_visible(),'NPC dialogue '+npc_id)
 first.clean_dialogue(page)

def visit_door(page,door,map_name):
 coords=page.evaluate("(id)=>{let o=maps.capital.objects.find(x=>x.id===id);return [o.x,o.y]}",door)
 first.face_and_interact(page,coords,door)
 first.process_interruptions(page)
 must(state(page)['map']==map_name,'door transitions to '+map_name,state(page)['map'])
 screen(page,'inside_'+map_name)
 must(page.evaluate("GC.Save.save(true)"),'schema23 save possible in '+map_name)
 must(page.evaluate("JSON.parse(localStorage.getItem('gray-crown-vslice-save-v1')).schema===23"),
      'schema stays 23 in '+map_name)
 first.reload_continue(page,map_name)
 must(state(page)['map']==map_name,'Continue restores '+map_name)
 # Do not trigger inn-night story event: verify separate pre-night room.
 door_exit=page.evaluate("(()=>{let o=maps[GC.State.get().map].objects.find(x=>x.id==='indoorExit');return[o.x,o.y]})()")
 first.face_and_interact(page,door_exit,'indoorExit')
 first.process_interruptions(page)
 must(state(page)['map']=='capital','leave '+map_name+' to capital')

def run_mode_b(browser,url,raw):
 b=browser.new_context(viewport={'width':1365,'height':900},device_scale_factor=1)
 b.add_init_script("(raw)=>localStorage.setItem('gray-crown-vslice-save-v1', raw)",raw)
 # Chromium add_init_script data use: string embedding eliminates accidental expression injection
 b.add_init_script("localStorage.setItem('gray-crown-vslice-save-v1',"+json.dumps(raw)+")")
 page=b.new_page()
 try:
  page.goto(url,wait_until='networkidle')
  must(page.locator('#titleContinue').is_enabled(),'B saved Continue available')
  page.locator('#titleContinue').click()
  first.clean_dialogue(page)
  play_ceremony(page,'portraitOff')
 finally:b.close()

def main():
 errors=[]
 try:
  with first.served() as url:
   with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    try:
     page=browser.new_page(viewport={'width':1365,'height':900})
     page.on('pageerror',lambda e:errors.append(str(e)))
     start=time.monotonic()
     first.play(page,url) # Normal title -> village -> wolf -> both levers -> boss -> northroad -> capital.
     must(state(page)['map']=='capital','normal Phase 5 route reached capital')
     must(not page.evaluate("isEventComplete('alpha.capital.ceremony')"),'premature ceremony state')
     screen(page,'capital_arrival_before')
     real=first.save_via_menu(page,'capital-before-ceremony')
     raw=page.evaluate("localStorage.getItem('gray-crown-vslice-save-v1')")
     must(bool(raw),'original preceremony save available')
     EVIDENCE['entry_seconds']=round(time.monotonic()-start,1)
     play_ceremony(page,'portraitOn')
     # Visit early capital NPCs in original positions; no invented quest branches.
     for npc in ('capitalCitizen','capitalRecruit'):
      walk_and_talk(page,npc)
     visit_door(page,'capitalInnDoor','capitalinn')
     visit_door(page,'capitalArmoryDoor','capitalarmory')
     must(page.evaluate("isEventComplete('alpha.capital.ceremony')"),'no appointment replay after interior roundtrips')
     must(page.evaluate("GC.Save.save(true)"),'capital return save')
     page.reload(wait_until='networkidle')
     must(page.locator('#titleContinue').is_enabled(),'capital Continue exists')
     page.locator('#titleContinue').click();first.clean_dialogue(page)
     must(page.evaluate("isEventComplete('alpha.capital.ceremony')"),'ceremony flag persisted across restart')
     must(state(page)['schema']==23,'schema preserved on royal capital revisit')
     screen(page,'capital_after_continue')
     page.close()
     # Independent context with *actual game-created preceremony save*, not a planted story fixture.
     context=browser.new_context(viewport={'width':1365,'height':900},device_scale_factor=1)
     context.add_init_script("localStorage.setItem('gray-crown-vslice-save-v1',"+json.dumps(raw)+")")
     alt=context.new_page()
     alt.goto(url,wait_until='networkidle')
     must(alt.locator('#titleContinue').is_enabled(),'B original save readable')
     alt.locator('#titleContinue').click();first.clean_dialogue(alt)
     play_ceremony(alt,'portraitOff')
     context.close()
     # 390px phone and small-PC real screen, based on the same preceremony save.
     for w,h in ((390,844),(1024,768)):
      ctx=browser.new_context(viewport={'width':w,'height':h})
      ctx.add_init_script("localStorage.setItem('gray-crown-vslice-save-v1',"+json.dumps(raw)+")")
      v=ctx.new_page();v.goto(url,wait_until='networkidle')
      v.locator('#titleContinue').click();first.clean_dialogue(v)
      info=v.evaluate("() => ({vw:innerWidth,scroll:document.documentElement.scrollWidth,render:getComputedStyle(document.querySelector('#game')).imageRendering})")
      must(info['scroll']<=w+2,'capital mobile no horizontal overflow',info)
      screen(v,'capital_view_'+str(w));ctx.close()
     must(not errors,'no uncaught JS exceptions',errors[:5])
     EVIDENCE['status']='PASS'
    finally:browser.close()
 except Exception as e:
  EVIDENCE['status']='FAIL';EVIDENCE['failure']=str(e)
  raise
 finally:
  (OUT/'capital_e2e_results.json').write_text(json.dumps(EVIDENCE,ensure_ascii=False,indent=2),encoding='utf8')

if __name__=='__main__':main()
