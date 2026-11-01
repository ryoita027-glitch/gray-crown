#!/usr/bin/env python3
"""Real live village canvas comparison for Margaret V13. ART HOLD; no auto-approval."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_launch import launch_chromium
import browser_vertical_slice_e2e_test as helper
import browser_margaret_headheight_v12_live_ab as base

ROOT=Path(__file__).resolve().parents[1]
base.OUT=ROOT/'prototype_artifacts/margaret_upperbody_v13_live'
base.SOURCES={
 'live_walk':None,
 'approved_idle':'assets/characters/margaret/margaret_idle.png',
 'v13B_trial':'assets/character_trials/margaret_idle_upperbody_v13B.png',
}
def main():
 base.OUT.mkdir(parents=True,exist_ok=True)
 records=[]
 with helper.served() as url,sync_playwright() as pw:
  browser=launch_chromium(pw)
  try:
   for view,width,height in base.VIEWS:
    page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    try:
     page.goto(url,wait_until='networkidle')
     page.locator('#titleNewGame').click()
     helper.clean_dialogue(page)
     page.wait_for_function("""() => ['karen','triton','sophie','margaret'].every(
       id=>GC.Render.World.heroRuntimeStatus()[id]?.ready)""",timeout=20000)
     for direction in base.DIRECTIONS:
      records.append(base.compare(view,direction,base.capture(page,direction)))
     assert not errors,errors
    finally:page.close()
  finally:browser.close()
 manifest={'type':'real game canvas: current walk / approved idle / V13B silhouette trial',
  'source_head':helper.source_head(),'art_verdict':'HOLD: human 44px review required',
  'shots':24,'full_boards':8,'detail_boards':8,'pairs':records}
 (base.OUT/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
 print(json.dumps({'shots':24,'boards':8,'art_verdict':'HOLD'}))
if __name__=='__main__':main()
