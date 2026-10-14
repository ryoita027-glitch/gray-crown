#!/usr/bin/env python3
"""Measured UI proof of the smallest useful optional detour.

Both cases start separately from New Game and walk to ONE place only.
Technical PASS is not player-quality approval. No state injection,
teleportation, extra loot, RNG patching or fictitious screenshots.
"""
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright
import browser_ryune_outskirts_e2e_test as ryune
import browser_vertical_slice_e2e_test as first

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/ryune_one_trip_value_v1'
CASES=[
 ('field','ryunefields',(1,8),'ArrowLeft',(22,8),'ArrowRight',
  'fieldFurrows','ryune.fields.inspect','ryune.outskirts.reported.fields',
  'ryune.outskirts.reported.brook'),
 ('brook','ryunebrook',(22,8),'ArrowRight',(1,8),'ArrowLeft',
  'brookWater','ryune.brook.inspect','ryune.outskirts.reported.brook',
  'ryune.outskirts.reported.fields')
]

def play(browser,url,case):
 kind,map_name,entry,direction,exit_point,exit_key,target,inspect,report,other=case
 page=browser.new_page(viewport={'width':1280,'height':800})
 errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 started=time.perf_counter()
 initial_steps=first.STATS['steps']
 try:
  page.goto(url,wait_until='networkidle')
  page.locator('#titleNewGame').click()
  first.clean_dialogue(page)
  before=first.snapshot(page)
  first.check(before['story']=='00_village','must start in the original village')
  ryune.cross(page,'village',map_name,entry,direction,kind+' outbound footpath')
  ryune.interact(page,target)
  seen=first.snapshot(page)
  first.check(inspect in seen['completed'],kind+' real investigation completed')
  other_map='ryunebrook' if kind=='field' else 'ryunefields'
  first.check(not page.evaluate("(m)=>!!GC.State.get().world.visited[m]",other_map),
    'the reward must not require visiting the other map')
  ryune.cross(page,map_name,'village',exit_point,exit_key,kind+' return to village')
  before_food=first.snapshot(page)['inventory'].get('携帯食',0)
  # The player notices an actionable report near the old named NPC.
  ryune.interact(page,'farmer',npc=True)
  after=first.snapshot(page)
  first.check('ryune.outskirts.reward' in after['completed'],'single-place report is accepted')
  first.check(report in after['completed'] and other not in after['completed'],
    'no false work done at the unvisited region')
  first.check(after['inventory'].get('携帯食',0)==before_food+1,
    'same single original ration reward, not double loot')
  first.check(after['story']=='00_village','royal story and exit remain independent')
  OUT.mkdir(parents=True,exist_ok=True)
  page.locator('#game').screenshot(path=str(OUT/(kind+'_report_village.png')))
  # Real save and real Continue, no direct GC.Save injection.
  saved=ryune.save_from_menu(page)
  first.check(saved['schema']==23,'new content preserves old Save schema')
  page.reload(wait_until='networkidle')
  page.locator('#titleContinue').click()
  first.clean_dialogue(page)
  result=first.snapshot(page)
  first.check(report in result['completed'] and other not in result['completed'],
    'reported region must persist accurately after browser reload')
  first.check(result['inventory'].get('携帯食',0)==before_food+1,
    'no duplicate food on Save/Continue')
  first.check(not errors,'JavaScript exceptions: '+repr(errors[:4]))
  page.locator('#game').screenshot(path=str(OUT/(kind+'_restored.png')))
  return {'location':kind,'keyboard_steps':first.STATS['steps']-initial_steps,
    'elapsed_seconds':round(time.perf_counter()-started,2),'report':report,
    'unvisited_region':other_map,'food_gained':1,
    'story_unchanged':result['story']=='00_village',
    'schema':saved['schema'],'errors':errors}
 finally:
  page.close()

def main():
 OUT.mkdir(parents=True,exist_ok=True)
 with first.served() as url,sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  try:
   rows=[play(browser,url,c) for c in CASES]
  finally:
   browser.close()
 report={'status':'PASS','tested_commit':first.source_head(),
  'technical_scope':'two independent genuine New Game one-region walks + UI reward + Save/Continue',
  'cases':rows,'screenshots':4,
  'human_quality_review':'PENDING: are these regions interesting enough to keep?',
  'player_visible_approved':False,'retail_ready':False}
 (OUT/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({'status':report['status'],'tested_commit':report['tested_commit'],
  'cases':[(x['location'],x['keyboard_steps'],x['elapsed_seconds']) for x in rows],
  'human_review':report['human_quality_review']},ensure_ascii=False))

if __name__=='__main__':main()
