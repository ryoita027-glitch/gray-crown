#!/usr/bin/env python3
"""Real Ryune village 44px canvas A/B/C/D gate for Margaret V15 (ART HOLD).
Run locally with free Playwright/Pillow:
  python tests/browser_margaret_v15_live_canvas_ab.py
Four sources share the same scene, pose, camera, foot anchor, direction and clock.
This does not approve the trial, merge anything or spend paid Actions minutes.
"""
import base64
import io
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright
from browser_launch import launch_chromium
import browser_vertical_slice_e2e_test as helper
import browser_margaret_headheight_v12_live_ab as base

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/margaret_v15_live_canvas'
base.SOURCES={
    'live_walk':None,
    'approved_idle':'assets/characters/margaret/margaret_idle.png',
    'v14A':'assets/character_trials/margaret_idle_neck_torso_v14A.png',
    'v15':'assets/character_trials/margaret_idle_hair_robe_contact_v15.png',
}
base.OUT=OUT
NAMES=list(base.SOURCES)

def rgb_difference(a,b):
    delta=ImageChops.difference(a,b)
    r,g,blue=delta.split()
    return ImageChops.lighter(ImageChops.lighter(r,g),blue).getbbox()

def compare(view,direction,shots):
    assert [s['key'] for s in shots]==NAMES,'wrong source order'
    assert all(s['calls']>0 and s['nonIdle']==0 for s in shots),'not stationary walk atlas'
    assert all(s['canvas']==[768,480] for s in shots),'canvas resolution drift'
    assert all(s['state']==shots[0]['state'] and s['camera']==shots[0]['camera']
               for s in shots),'scene or camera drift'
    pics=[]
    for shot in shots:
        png=base64.b64decode(shot['png'])
        (OUT/f"{view}_{direction}_{shot['key']}.png").write_bytes(png)
        pics.append(Image.open(io.BytesIO(png)).convert('RGB'))
    bbox=rgb_difference(pics[2],pics[3])
    assert bbox is not None,'V15 not visible in the live game canvas'
    assert bbox[2]-bbox[0]<=60 and bbox[3]-bbox[1]<=60,(
        'unrelated world pixels changed',bbox)
    full=Image.new('RGB',(768*4,510),'#242424')
    draw=ImageDraw.Draw(full)
    for i,pic in enumerate(pics):
        full.paste(pic,(i*768,30))
        draw.text((i*768+12,8),NAMES[i],fill='white')
    full_name=f'{view}_{direction}_full_ABCD.png'
    full.save(OUT/full_name)
    cx=(bbox[0]+bbox[2])//2
    cy=(bbox[1]+bbox[3])//2
    x0=max(0,min(640,cx-64))
    y0=max(0,min(352,cy-64))
    detail=Image.new('RGB',(256*4,282),'#242424')
    draw=ImageDraw.Draw(detail)
    for i,pic in enumerate(pics):
        crop=pic.crop((x0,y0,x0+128,y0+128))
        detail.paste(crop.resize((256,256),Image.Resampling.NEAREST),
                     (i*256,26))
        draw.text((i*256+8,7),NAMES[i],fill='white')
    detail_name=f'{view}_{direction}_detail_ABCD.png'
    detail.save(OUT/detail_name)
    return {'viewport':view,'direction':direction,'bbox_v14_vs_v15':bbox,
            'full':full_name,'detail':detail_name,
            'source_calls':[s['calls'] for s in shots],
            'source_non_idle':[s['nonIdle'] for s in shots]}

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    records=[]
    with helper.served() as url,sync_playwright() as pw:
        browser=launch_chromium(pw)
        try:
            for view,width,height in base.VIEWS:
                page=browser.new_page(viewport={'width':width,'height':height},
                                      device_scale_factor=1)
                errors=[]
                page.on('pageerror',lambda error:errors.append(str(error)))
                try:
                    page.goto(url,wait_until='networkidle')
                    page.locator('#titleNewGame').click()
                    helper.clean_dialogue(page)
                    page.wait_for_function("""() => ['karen','triton','sophie','margaret'].every(
                      id=>GC.Render.World.heroRuntimeStatus()[id]?.ready)""",timeout=20000)
                    for direction in base.DIRECTIONS:
                        records.append(compare(view,direction,base.capture(page,direction)))
                    assert not errors,errors
                finally:
                    page.close()
        finally:
            browser.close()
    manifest={'type':'real Ryune game canvas; four source A/B/C/D, native44',
              'source_head':helper.source_head(),
              'sources':NAMES,'screenshots':32,'full_boards':8,'detail_boards':8,
              'art_verdict':'HOLD: human review and animation/continuity still required',
              'pairs':records}
    (OUT/'manifest.json').write_text(
        json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'screenshots':32,'full_boards':8,'detail_boards':8,
                      'art_verdict':'HOLD'}))

if __name__=='__main__':
    main()
