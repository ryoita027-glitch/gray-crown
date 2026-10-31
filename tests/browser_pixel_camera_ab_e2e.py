#!/usr/bin/env python3
"""Real-game 44px/fractional-camera versus pixel-snap/native source visual review.
NOT a substitute for human commercial-art acceptance. Requires Chromium/Playwright.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/pixel_camera_review'
VIEWS=(('desktop',1280,800),('phone',390,844))

def capture(browser,url,name,width,height):
    page=browser.new_page(viewport={'width':width,'height':height})
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    try:
        page.goto(url+'?gcPixelReview=1',wait_until='networkidle')
        assert page.evaluate('GC.PixelCameraAB.active()')
        assert page.evaluate("GC.PixelCameraAB.current()==='baseline'")
        page.locator('#titleNewGame').click()
        first.clean_dialogue(page)
        page.wait_for_function("""() => ['karen','triton','sophie','margaret'].every(
            id=>GC.Render.World.heroRuntimeStatus()[id].ready)""",timeout=20000)
        page.evaluate("""() => {
          const s=GC.State.get();s.map='village';s.x=12;s.y=12;s.dir='down';
          GC.Render.World.VISUAL.map=null;GC.Render.World.drawScene();
        }""")
        page.wait_for_function("() => OpeningPixelAssets.featuredStatus().ready",timeout=20000)
        def snapshot():
            return page.evaluate("""() => {
              const s=GC.State.get();
              return JSON.stringify({schema:s.schema,map:s.map,x:s.x,y:s.y,dir:s.dir,
                party:s.party,story:s.story,inventory:s.inventory,world:s.world,
                events:s.events,gold:s.gold});
            }""")
        before=snapshot()
        hashes={}
        for mode in ('baseline','snap','native'):
            assert page.evaluate("(mode)=>GC.PixelCameraAB.setMode(mode)",mode)==mode
            page.evaluate('GC.Render.World.drawScene()')
            page.wait_for_timeout(200)
            data=page.locator('#game').screenshot(path=str(OUT/f'{name}_{mode}.png'))
            hashes[mode]=hashlib.sha256(data).hexdigest()
        assert hashes['native']!=hashes['baseline'], 'native comparison must visibly differ'
        assert snapshot()==before, 'pixel camera study modified gameplay state'
        assert not errors,errors[:5]
        return {'viewport':name,'hashes':hashes,'game_state_unchanged':True,'page_errors':[]}
    finally:
        page.close()

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    with first.served() as url,sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        try:
            captures=[capture(browser,url,*view) for view in VIEWS]
            normal=browser.new_page()
            try:
                normal.goto(url,wait_until='networkidle')
                assert normal.evaluate("GC.PixelCameraAB.current()==='baseline'")
                assert normal.locator('#gcPixelReviewPanel').count()==0
            finally:
                normal.close()
        finally:
            browser.close()
    manifest={'head':first.source_head(),'images':6,'captures':captures,
              'art_approved':False,'gameplay_accepted':False,
              'scope':'real game, seeded village, 3 pixel-camera modes, two viewports'}
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'head':manifest['head'],'images':6,'technical_capture':'PASS','art_approved':False}))

if __name__=='__main__':
    main()
