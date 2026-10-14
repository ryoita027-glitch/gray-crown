#!/usr/bin/env python3
"""Capture real Chromium pixel art for town visual review (SEEDED scene only).

Screenshots do not assert commercial-quality GO. Maps are selected through a
visual-only state fixture so all rooms/capital can be compared in one test;
these screenshots must NEVER be called uninterrupted story play evidence.
"""
import json
import base64
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
NPC_LINEUP=[
 'baker','farmer','mayor','veteran','messenger','ren',
 'lulu','capitalVendor','capitalFlowerGirl','capitalRecruit','capitalOfficial','granz'
]

def capture_named_npcs(page):
    # This captures the ACTUAL sprite renderer, not an artist's description,
    # rectangle counts, SVG mockup or a recolored placeholder.
    result=[]
    for facing in ('down','left'):
        pngs=page.evaluate("""([ids,facing])=>{
          const base=document.createElement('canvas');
          base.width=6*32;base.height=2*32;
          const c=base.getContext('2d');
          c.imageSmoothingEnabled=false;
          ids.forEach((id,i)=>{
            const x=i%6,y=Math.floor(i/6);
            c.fillStyle=(x+y)%2?'#c9bca8':'#dfd1bc';
            c.fillRect(x*32,y*32,32,32);
            if(!OpeningPixelAssets.drawNpc(c,{id,x,y},facing,0))
              throw Error('Missing final NPC sprite: '+id);
          });
          const zoom=document.createElement('canvas');
          zoom.width=base.width*4;zoom.height=base.height*4;
          const z=zoom.getContext('2d');z.imageSmoothingEnabled=false;
          z.drawImage(base,0,0,zoom.width,zoom.height);
          return [base.toDataURL('image/png'),zoom.toDataURL('image/png')];
        }""",[NPC_LINEUP,facing])
        for size,encoded in zip(('native','4x'),pngs):
            filename='actual_npcs_'+facing+'_'+size+'.png'
            (OUT/filename).write_bytes(base64.b64decode(encoded.split(',',1)[1]))
            result.append(filename)
    return result


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
        if kind=='desktop':
            outputs.extend(capture_named_npcs(page))
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
      'status':'CAPTURED_PENDING_HUMAN_ART_REVIEW','tested_commit':first.source_head(),
      'type':'SEEDED VISUAL COMPARISON, not real progression',
      'count':sum(len(x['screenshots']) for x in rows),
      'named_sprite_order':NPC_LINEUP,
      'named_sprite_views':'down and left, native 32px and nearest-neighbor 4x',
      'acceptance_rule':'Visually reject indistinguishable faces, clipped outfits, head-size mistakes or unnatural town layering; source metrics cannot approve art.',
      'views':rows,
      'human_art_review':'PENDING. Compare roof silhouettes, residents, door clarity, sprite feet, 390px UI.',
      'manual_acceptance':{
        'recognizable_jobs_without_labels':'PENDING',
        'distinct_face_and_hair_at_1x':'PENDING',
        'clean_32px_outlines_and_no_atlas_bleeding':'PENDING',
        'town_path_and_building_scale':'PENDING',
        'optional_ryune_activity_enjoyable':'PENDING'
      },
      'paid_release_approved':False
    }
    assert manifest['count']==16
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'tested_commit':manifest['tested_commit'],
      'screenshots':manifest['count'],'human_review':'PENDING'},ensure_ascii=False))

if __name__=='__main__':
    main()
