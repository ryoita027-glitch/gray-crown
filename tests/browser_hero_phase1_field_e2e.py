#!/usr/bin/env python3
"""Real-game, same-HEAD Phase 1 field visual A/B; art remains UNAPPROVED.

Requires Playwright browser. Uses a fresh local origin and a seeded starting
village scene. Screenshot evidence is NOT uninterrupted gameplay evidence.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/hero_phase1_field_review'
VIEWS=(('desktop',1280,800),('phone',390,844))

def digest(data:bytes)->str:
    return hashlib.sha256(data).hexdigest()

def capture(browser,base_url:str,name:str,width:int,height:int):
    page=browser.new_page(viewport={'width':width,'height':height})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto(base_url+'?gcHeroStudy=1',wait_until='networkidle')
        assert page.evaluate('GC.HeroPhase1.active()')
        assert page.evaluate('GC.HeroPhase1.size()===44')
        page.locator('#titleNewGame').click()
        first.clean_dialogue(page)
        page.wait_for_function(
            """() => ['karen','triton','sophie','margaret'].every(
              id=>GC.Render.World.heroRuntimeStatus()[id].ready)""",
            timeout=20000)
        page.wait_for_function("() => !!document.getElementById('gcHeroStudyPanel')")
        page.evaluate("""() => {
          const s=GC.State.get();s.map='village';s.x=12;s.y=12;s.dir='down';
          GC.Render.World.VISUAL.map=null;GC.Render.World.drawScene();
        }""")
        def stable_state():
            return page.evaluate("""() => {
              const s=GC.State.get();
              return JSON.stringify({schema:s.schema,map:s.map,x:s.x,y:s.y,dir:s.dir,
                party:s.party,story:s.story,inventory:s.inventory,world:s.world,
                events:s.events,gold:s.gold});
            }""")
        before=stable_state()
        def shot(label):
            page.evaluate('GC.Render.World.drawScene()')
            page.wait_for_timeout(170)
            screenshot=page.locator('#game').screenshot(path=str(OUT/(name+'_'+label+'.png')))
            return digest(screenshot)
        base=shot('original44')
        assert page.evaluate("GC.HeroPhase1.setFieldSize(48)===48")
        natural=shot('native48')
        assert natural!=base, 'Field sprite size A/B generated an identical scene'
        assert page.evaluate('GC.HeroPhase1.setNeutralHair(true)')
        recoloured=shot('native48_margaret_hair_draft')
        sample=page.evaluate("""async() => {
          const image=new Image();image.src='assets/characters/margaret/margaret_walk.png';
          await image.decode();
          const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
          const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
          const p=ctx.getImageData(0,0,canvas.width,canvas.height);
          return GC.HeroPhase1.adjustSilverHair(p.data,canvas.width,canvas.height).pixelsChanged;
        }""")
        assert sample>0, 'Hair draft adjustment did not touch any Margaret pixels'
        assert recoloured!=natural, 'Field Margaret colour mode failed to change actual scene'
        assert before==stable_state(), 'Visual study changed game state'
        assert not errors,errors[:5]
        return {'view':name,'screenshot_hashes':{'original44':base,'native48':natural,
            'native48_margaret_hair_draft':recoloured},'hair_pixels_changed_per_sheet':sample,
            'game_state_unchanged':True,'page_errors':[]}
    finally:
        page.close()

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    with first.served() as url,sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        try:
            results=[capture(browser,url,*view) for view in VIEWS]
            normal=browser.new_page()
            try:
                normal.goto(url,wait_until='networkidle')
                assert normal.evaluate("GC.HeroPhase1.size()===44 && !GC.HeroPhase1.active()")
                assert normal.locator('#gcHeroStudyPanel').count()==0
            finally:
                normal.close()
        finally:
            browser.close()
    manifest={'tested_commit':first.source_head(),
              'method':'same-HEAD real Chrome browser, seeded village field ONLY',
              'screenshots':6,'views':results,
              'visual_quality_accepted':False,'commercial_ready':False,
              'notes':'An opt-in size/colour hypothesis is NOT an approved Margaret design; compare all four heroes and NPCs at normal screen size.'}
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'tested_commit':manifest['tested_commit'],
        'screenshots':6,'technical_check':'PASS',
        'visual_quality_accepted':False},ensure_ascii=False))

if __name__=='__main__':
    main()
