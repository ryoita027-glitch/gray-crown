#!/usr/bin/env python3
"""Real-game Karen idle art A/B; does not certify commercial quality.
Uses same HEAD and SEEDED village for repeatable framing, NOT true progression.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/karen_face_phase1b_game'
VIEWS=(('desktop',1280,800),('phone',390,844))

def inspect(browser,url,name,width,height):
    page=browser.new_page(viewport={'width':width,'height':height})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto(url+'?gcKarenFace=1',wait_until='networkidle')
        assert page.evaluate('GC.KarenFacePilot.active()')
        page.locator('#titleNewGame').click()
        first.clean_dialogue(page)
        page.wait_for_function("""()=>GC.KarenFacePilot.status().ready &&
            ['karen','triton','sophie','margaret'].every(
              id=>GC.Render.World.heroRuntimeStatus()[id].ready)""",timeout=20000)
        page.evaluate("""()=>{
            const s=GC.State.get();s.map='village';s.x=12;s.y=12;s.dir='down';
            GC.Render.World.VISUAL.map=null;GC.Render.World.drawScene();
        }""")
        def game_state():
            return page.evaluate("""()=>{
                const s=GC.State.get();return JSON.stringify({
                  schema:s.schema,map:s.map,x:s.x,y:s.y,story:s.story,party:s.party,
                  inventory:s.inventory,events:s.events,world:s.world});
            }""")
        before=game_state()
        def capture(label,candidate):
            page.evaluate('(v)=>GC.KarenFacePilot.setShowCandidate(v)',candidate)
            page.evaluate('GC.Render.World.drawScene()')
            page.wait_for_timeout(125)
            png=page.locator('#game').screenshot(path=str(OUT/(name+'_'+label+'.png')))
            return hashlib.sha256(png).hexdigest()
        old=capture('original',False)
        new=capture('fringe_draft',True)
        assert before==game_state(),'Art pilot changed serialized gameplay state'
        assert not errors,errors
        return {'view':name,'old_sha256':old,'new_sha256':new,
                'different_image_bytes':old!=new,'game_state_unchanged':True,'page_errors':[]}
    finally:
        page.close()

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    with first.served() as url,sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        try:
            results=[inspect(browser,url,*row) for row in VIEWS]
            ordinary=browser.new_page()
            try:
                ordinary.goto(url,wait_until='networkidle')
                assert not ordinary.evaluate('GC.KarenFacePilot.active()')
                assert ordinary.locator('#gcKarenFaceCompare').count()==0
            finally:
                ordinary.close()
        finally:
            browser.close()
    manifest={'tested_commit':first.source_head(),'method':'real Chromium, opt-in seeded field 44px',
              'views':results,'screenshot_count':4,
              'original_sprite_preserved':True,'gameplay_validation':False,
              'art_accepted':False,'commercial_approved':False}
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'phase':'1B','tested_commit':manifest['tested_commit'],
                      'screenshots':manifest['screenshot_count'],
                      'art_accepted':False},ensure_ascii=False))

if __name__=='__main__':
    main()
