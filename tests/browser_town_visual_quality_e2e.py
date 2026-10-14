#!/usr/bin/env python3
"""Capture real Chromium pixel art for town visual review (SEEDED scene only).

Screenshots do not assert commercial-quality GO. Maps are selected through a
visual-only state fixture so all rooms/capital can be compared in one test;
these screenshots must NEVER be called uninterrupted story play evidence.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/town_visual_review'
PLACES=[
 ('village',(12,12)),('capital',(11,8)),
 ('karenhome',(11,10)),('orphanage',(11,10)),
 ('mayorhouse',(11,10)),('cottage',(11,10))
]
VIEWS=[('desktop',1280,800),('compact',390,844)]

def inspect(browser,url,kind,w,h):
    page=browser.new_page(viewport={'width':w,'height':h})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    outputs=[]
    try:
        page.goto(url,wait_until='networkidle')
        page.locator('#titleNewGame').click()
        first.clean_dialogue(page)
        page.wait_for_function("""()=>
          ['karen','triton','sophie','margaret'].every(
            id=>GC.Render.World.heroRuntimeStatus()[id]?.ready)
        """,timeout=20000)
        # If the external PNG is absent, screenshotting a generic fallback
        # would falsely claim the named characters were redesigned.
        page.wait_for_function("""() =>
          typeof OpeningPixelAssets!=='undefined' &&
          OpeningPixelAssets.featuredStatus().ready
        """,timeout=20000)
        assert page.evaluate("OpeningPixelAssets.featuredStatus().count===9")
        assert not page.evaluate("OpeningPixelAssets.featuredStatus().failed")
        for place,(x,y) in PLACES:
            # Explicit visual fixture: NOT a route playthrough, and no game
            # events/quests/loot are completed to fake story progression.
            page.evaluate("""([map,x,y])=>{
              const s=GC.State.get();
              s.map=map;s.x=x;s.y=y;s.dir='down';
              GC.Render.World.VISUAL.map=null;
              GC.Render.World.drawScene();
            }""",[place,x,y])
            page.wait_for_timeout(150)
            filename=kind+'_'+place+'.png'
            page.locator('#game').screenshot(path=str(OUT/filename))
            outputs.append(filename)
            assert page.evaluate("GC.State.get().schema===23"),place
            assert page.evaluate("GC.State.get().party.length===4"),place
        assert not errors,errors[:6]
        return {'view':kind,'screenshots':outputs,'errors':errors}
    finally:
        page.close()

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    with first.served() as url,sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        try:
            rows=[inspect(browser,url,kind,w,h) for kind,w,h in VIEWS]
        finally:
            browser.close()
    manifest={
      'status':'PASS','tested_commit':first.source_head(),
      'type':'SEEDED VISUAL COMPARISON, not real progression',
      'count':sum(len(x['screenshots']) for x in rows),
      'views':rows,
      'human_art_review':'PENDING. Compare roof silhouettes, residents, door clarity, sprite feet, 390px UI.',
      'featured_resident_atlas':'assets/npc/featured_residents_v1.png',
      'featured_residents_required_ready':True,
      'paid_release_approved':False
    }
    assert manifest['count']==12
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'tested_commit':manifest['tested_commit'],
      'screenshots':manifest['count'],'human_review':'PENDING'},ensure_ascii=False))

if __name__=='__main__':
    main()
