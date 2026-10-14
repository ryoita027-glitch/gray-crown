#!/usr/bin/env python3
"""Real Chromium: first inspect text is preserved; second inspect unlocks a
short authored character moment without forcing the player to complete it.
This script does not fabricate screenshots, Dev Mode flags, or story changes.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as helper

OUT=Path(__file__).resolve().parents[1]/'prototype_artifacts/ryune_microacting_v1'
OUT.mkdir(parents=True,exist_ok=True)

def main():
 with helper.served() as url:
  with sync_playwright() as pw:
   browser=pw.chromium.launch(headless=True)
   page=browser.new_page(viewport={'width':1280,'height':800})
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(url,wait_until='networkidle')
   page.locator('#titleNewGame').click()
   helper.clean_dialogue(page)
   start=helper.snapshot(page)
   helper.check(start['map']=='village' and start['story']=='00_village','expected opening')
   # First visit MUST show the existing well description, not a fabricated memory.
   helper.face_and_interact(page,(12,9),'well')
   helper.check(page.locator('#speaker').inner_text()=='村の井戸','original lore is first')
   helper.check(page.evaluate("GC.CommercialActing.inspect().moment") is None,
                'first inspection is not a micro-cinematic')
   helper.clean_dialogue(page)
   helper.check(page.evaluate("GC.State.get().world.switches['ryune.baseViewed.well']===true"),
                'original inspection preserved as a passive visited bit')
   # A player CHOOSES to inspect the same well again, no auto cutscene.
   helper.face_and_interact(page,(12,9),'well')
   moment=page.evaluate("GC.CommercialActing.inspect()")
   helper.check(moment['moment']=='ryune.memory.well','only optional second look reacts')
   helper.check(moment['hero']=='karen','Karen starts the brief exchange')
   page.wait_for_timeout(330)
   page.screenshot(path=str(OUT/'01_well_karen_short_talk.png'),full_page=True)
   helper.clean_dialogue(page)
   final=helper.snapshot(page)
   helper.check('ryune.memory.well' in final['completed'],'memory finishes once')
   helper.check(final['story']==start['story'],'optional banter cannot advance quest')
   helper.check(page.evaluate('GC.CommercialActing.inspect().moment') is None,
                'no trapped active or stuck animation state')
   page.screenshot(path=str(OUT/'02_village_restored_idle.png'),full_page=True)
   helper.check(not errors,repr(errors))
   print('RYUNE MICROACTING CHROMIUM PASS: original-first, one-time follow-up, idle recovery')
   browser.close()

if __name__=='__main__':
 main()
