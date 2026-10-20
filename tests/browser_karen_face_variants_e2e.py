#!/usr/bin/env python3
"""Actual Gray Crown 44px Karen face A/B/C capture. Art approval is MANUAL.

This uses a seeded village snapshot only, NOT an uninterrupted story QA.
Requires Playwright and its Chromium browser locally or a working CI runner.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/karen_face_variants_game'
VIEWS=(('desktop',1280,800),('phone',390,844))
CHOICES=('original','eyes','crown','balanced')

def view(browser,url,name,width,height):
    page=browser.new_page(viewport={'width':width,'height':height})
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    try:
        page.goto(url+'?gcKarenFace=2',wait_until='networkidle')
        assert page.evaluate('GC.KarenFaceVariants.active()')
        assert page.evaluate("GC.KarenFaceVariants.state().selected==='original'")
        page.locator('#titleNewGame').click()
        first.clean_dialogue(page)
        page.wait_for_function("""()=>
          ['karen','triton','sophie','margaret'].every(
            id=>GC.Render.World.heroRuntimeStatus()[id].ready
          ) &&
          ['eyes','crown','balanced'].every(
            id=>GC.KarenFaceVariants.state().images[id]?.ready
          )
        """,timeout=30000)
        page.evaluate("""() => {
          const s=GC.State.get();
          s.map='village';s.x=12;s.y=12;s.dir='down';
          GC.Render.World.VISUAL.map=null;GC.Render.World.drawScene();
        }""")
        def state_hash():
            obj=page.evaluate("""() => {
              const s=GC.State.get();
              return JSON.stringify({
                schema:s.schema,map:s.map,x:s.x,y:s.y,dir:s.dir,
                party:s.party,story:s.story,inventory:s.inventory,
                world:s.world,events:s.events,gold:s.gold
              });
            }""")
            return hashlib.sha256(obj.encode()).hexdigest()
        before=state_hash()
        screenshots={}
        for choice in CHOICES:
            page.evaluate('(v)=>GC.KarenFaceVariants.choose(v)',choice)
            page.evaluate('GC.Render.World.drawScene()')
            page.wait_for_timeout(150)
            buf=page.locator('#game').screenshot(path=str(OUT/(name+'_'+choice+'.png')))
            screenshots[choice]=hashlib.sha256(buf).hexdigest()
            assert page.evaluate("""()=>GC.KarenFaceVariants.idleSprite('karen',1)===null"""),'walking animation accidentally replaced'
            assert page.evaluate("""()=>GC.State.get().schema===23""")
        assert len(set(screenshots.values()))==len(CHOICES),'Some original/variant images are identical at actual canvas size'
        assert state_hash()==before,'Visual A/B changed game progression/state'
        assert not errors,errors[:6]
        return {'view':name,'screenshots':screenshots,'unchanged_state':True,
                'ready_images':3,'page_errors':errors,'art_approved':False}
    finally:
        page.close()

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    with first.served() as url,sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        try:
            screens=[view(browser,url,*spec) for spec in VIEWS]
            normal=browser.new_page()
            try:
                normal.goto(url,wait_until='networkidle')
                assert not normal.evaluate('GC.KarenFaceVariants.active()')
                assert normal.locator('#gcKarenVariants').count()==0
            finally:
                normal.close()
        finally:
            browser.close()
    report={'sha':first.source_head(),'comparison':'actual field, seeded village',
            'method':'real Chromium screenshot on same commit, PC and mobile width',
            'screenshots':8,'views':screens,
            'human_appeal_assessment':'PENDING',
            'completion_status':'NO-GO: real-play regression and art review still required',
            'paid_release_approved':False}
    (OUT/'manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'sha':report['sha'],'screenshots':8,
                     'human_appeal_assessment':'PENDING'},ensure_ascii=False))

if __name__=='__main__':
    main()
