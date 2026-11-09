#!/usr/bin/env python3
"""Real Chromium keyboard path: New Game -> optional farewell -> ordinary exit.
No Dev Mode, map teleport, battle skipping, artificially completed flags or
screenshot fabrication. A single farewell is covered end-to-end; four independent
family conversations are also guarded in Node tests.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/ryune_farewell_v1'

def main():
 with first.served() as url:
  with sync_playwright() as pw:
   browser=pw.chromium.launch(headless=True)
   page=browser.new_page(viewport={'width':1280,'height':800})
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   try:
    page.goto(url,wait_until='networkidle')
    page.locator('#titleNewGame').click()
    first.clean_dialogue(page)
    assert first.snapshot(page)['story']=='00_village'
    # Before appointment, Ren offers only his original village dialogue.
    assert page.evaluate("""() => GC.Events.findTriggeredEvent(
      'npc','ren',{map:'village'})===null""")
    # Actual messenger scene reached by walking, directional input and action.
    first.walk_to(page,[(12,7)],'actual royal messenger')
    page.keyboard.press('ArrowUp');page.wait_for_timeout(first.WAIT_MS)
    page.keyboard.press('Enter')
    page.wait_for_function('() => GC.RyuneActing.isRunning()',timeout=8000)
    first.clean_dialogue(page)
    first.check(first.snapshot(page)['story']=='01_appointed','real appointment required')
    first.check('alpha.village.appointment' in first.snapshot(page)['completed'],
      'the canonical original appointment did not finish')

    first.face_and_interact(page,(19,7),'ren')
    first.check(page.locator('#speaker').inner_text()=='レン','original named resident appears')
    first.check(page.evaluate("""() => GC.Events.findTriggeredEvent('npc','ren',
      {map:'village'})?.id""")=='ryune.farewell.tritonRen',
      'short, one-time goodbye must be offered voluntarily')
    OUT.mkdir(parents=True,exist_ok=True)
    page.screenshot(path=str(OUT/'01_triton_real_farewell.png'),full_page=True)
    first.clean_dialogue(page)
    scene=first.snapshot(page)
    first.check('ryune.farewell.tritonRen' in scene['completed'],'farewell saved once')
    first.check(scene['story']=='01_appointed','no side-story progress requirement')
    first.check(page.evaluate("GC.Events.findTriggeredEvent('npc','ren',{map:'village'})===null"),
      'the old NPC text must remain after goodbye')

    # Save/Continue cannot replay the farewell or erase the original appointment.
    page.locator('#btnSave').click()
    first.clean_dialogue(page)
    page.reload(wait_until='networkidle')
    page.locator('#titleContinue').click()
    first.clean_dialogue(page)
    restored=first.snapshot(page)
    first.check(restored['schema']==23 and restored['story']=='01_appointed',
      'old save-format progression not preserved')
    first.check('ryune.farewell.tritonRen' in restored['completed'],
      'one-time goodbye was lost on reload')
    first.face_and_interact(page,(19,7),'ren')
    first.check(page.locator('#speaker').inner_text()=='レン','original village NPC text returns')
    first.clean_dialogue(page)

    # Skipping Karen/Sophie/Margaret side conversations is a VALID story path.
    for id in ['ryune.farewell.karenBrother','ryune.farewell.sophieTheo',
               'ryune.farewell.margaretMother']:
     first.check(id not in first.snapshot(page)['completed'],
       'other farewells were incorrectly forced')
    first.walk_to(page,[(11,1),(12,1)],'unconditional north exit')
    first.cross_north_boundary(page,'road','depart without completing side errands')
    first.check(first.snapshot(page)['story']=='02_road','original chapter progression')
    first.check(not errors,'browser JS exceptions: '+repr(errors[:4]))
    page.screenshot(path=str(OUT/'02_normal_road_departure.png'),full_page=True)
    (OUT/'results.json').write_text(json.dumps({
     'status':'PASS','source':'real Chromium keyboard input',
     'saved_schema':23,'farewell':'ryune.farewell.tritonRen',
     'skipped_other_three':True,'original_road_progress':'02_road',
     'screenshots':2,'js_errors':errors,
     'not_claimed':'art approval, human emotional response, finished retail game'
    },ensure_ascii=False,indent=2),encoding='utf-8')
   finally:
    browser.close()

if __name__=='__main__':
 main()
