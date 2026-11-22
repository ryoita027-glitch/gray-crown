#!/usr/bin/env python3
"""Optional village west fields / east brook: REAL keyboard exploration and saving.
No teleport, developer state writes, seeded rewards or invented screenshots.
"""
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/ryune_outskirts_v1'
OUT.mkdir(parents=True,exist_ok=True)

def shot(page,label):
 page.screenshot(path=str(OUT/(label+'.png')),full_page=True)

def cross(page,from_map,to_map,point,key,label):
 first.walk_to(page,[point],label)
 page.keyboard.press(key)
 page.wait_for_timeout(first.WAIT_MS+80)
 first.check(first.snapshot(page)['map']==to_map,
  from_map+' must transition to '+to_map+' after '+label)

def interact(page,entity_id,npc=False):
 data=page.evaluate("""(id)=>{
  const m=maps[GC.State.get().map];
  const e=[...(m.npcs||[]),...(m.objects||[])].find(o=>o.id===id);
  return e?{x:e.x,y:e.y}:null;
 }""",entity_id)
 first.check(data is not None,'missing real map entity '+entity_id)
 first.face_and_interact(page,(data['x'],data['y']),entity_id)
 first.clean_dialogue(page)

def save_from_menu(page):
 # Use the player-facing Save action, not GC.Save.save() or Dev Mode.
 page.keyboard.press('m')
 page.wait_for_timeout(120)
 first.check(page.locator('#modal').is_visible(),'adventure menu opens')
 btn=page.locator('#modalContent button').filter(has_text='セーブ').first
 first.check(btn.count()==1,'player-facing Save option exists')
 btn.click()
 first.clean_dialogue(page)
 raw=page.evaluate("localStorage.getItem('gray-crown-vslice-save-v1')")
 first.check(raw is not None,'save written by player-facing UI')
 return json.loads(raw)

def main():
 start_clock=time.perf_counter()
 with first.served() as url:
  with sync_playwright() as pw:
   browser=pw.chromium.launch(headless=True)
   page=browser.new_page(viewport={'width':1365,'height':900})
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(url,wait_until='networkidle')
   page.locator('#titleNewGame').click()
   first.clean_dialogue(page)
   start=first.snapshot(page)
   first.check(start['map']=='village' and start['story']=='00_village','new-game starting village')
   shot(page,'01_original_village')
   cross(page,'village','ryunefields',(1,8),'ArrowLeft','west hedge')
   shot(page,'02_west_fields')
   interact(page,'fieldFurrows')
   first.check('ryune.fields.inspect' in first.snapshot(page)['completed'],'field investigation finished')
   interact(page,'fieldCache')
   first.check(first.snapshot(page)['treasures'].get('fieldCache'),'one-time field find stored')
   interact(page,'fieldWorker',npc=True)
   cross(page,'ryunefields','village',(22,8),'ArrowRight','back from fields')
   cross(page,'village','ryunebrook',(22,8),'ArrowRight','east hedge')
   shot(page,'03_east_brook')
   interact(page,'brookWater')
   first.check('ryune.brook.inspect' in first.snapshot(page)['completed'],'brook investigation finished')
   interact(page,'brookCache')
   first.check(first.snapshot(page)['treasures'].get('brookCache'),'one-time brook find stored')
   interact(page,'brookKeeper',npc=True)
   cross(page,'ryunebrook','village',(1,8),'ArrowLeft','back from brook')
   food_before=first.snapshot(page)['inventory'].get('携帯食',0)
   interact(page,'farmer',npc=True)
   snap=first.snapshot(page)
   first.check('ryune.outskirts.reward' in snap['completed'],'reward event completed')
   first.check(snap['inventory'].get('携帯食',0)==food_before+1,'single ration awarded')
   shot(page,'04_farmer_reward')
   # Revisit under NORMAL player keyboard navigation, not by moving state.
   # The physical markers must be subtle: no instantly repaired irrigation.
   cross(page,'village','ryunefields',(1,8),'ArrowLeft','fields revisited after report')
   shot(page,'06_fields_after_report')
   first.check(page.evaluate("GC.Events.findTriggeredEvent('npc','fieldWorker',{map:'ryunefields'}).id")
    =='ryune.fields.worker.afterReport','field hand remembers the joint report')
   interact(page,'fieldWorker',npc=True)
   cross(page,'ryunefields','village',(22,8),'ArrowRight','return with observations')
   cross(page,'village','ryunebrook',(22,8),'ArrowRight','brook revisited after report')
   shot(page,'07_brook_after_report')
   first.check(page.evaluate("GC.Events.findTriggeredEvent('npc','brookKeeper',{map:'ryunebrook'}).id")
    =='ryune.brook.keeper.afterReport','brook watcher remembers measurement')
   interact(page,'brookKeeper',npc=True)
   cross(page,'ryunebrook','village',(1,8),'ArrowLeft','return to village')
   interact(page,'farmer',npc=True)
   first.check(first.snapshot(page)['inventory'].get('携帯食',0)==food_before+1,
    'no repeated optional quest payout')
   saved=save_from_menu(page)
   first.check(saved['schema']==23 and saved['map']=='village','v23 save from new content')
   page.reload(wait_until='networkidle')
   page.locator('#titleContinue').click()
   first.clean_dialogue(page)
   final=first.snapshot(page)
   first.check(final['treasures'].get('fieldCache') and final['treasures'].get('brookCache'),
    'both found supplies persist across fresh page Continue')
   first.check('ryune.outskirts.reward' in final['completed'],'optional quest persists')
   first.check(final['story']==start['story'],'original appointment stage not forced')
   first.check(not errors,'no browser exceptions: '+repr(errors[:4]))
   shot(page,'05_continue_with_both_areas')
   (OUT/'results.json').write_text(json.dumps({'status':'PASS','story':final['story'],
    'maps':['village','ryunefields','ryunebrook'],'save_schema':saved['schema'],
    'screenshots':7,'real_play_elapsed_seconds':round(time.perf_counter()-start_clock,2),
    'real_keyboard_walk_steps':first.STATS['steps'],
    'tested_commit':first.source_head(),
    'optional_event_count':3,'after_report_revisits':2,
    'notes':'No Dev Mode, seeded wins, teleporting or mandatory side quest',
    'errors':errors},ensure_ascii=False,indent=2),encoding='utf-8')
   browser.close()
if __name__=='__main__':main()
