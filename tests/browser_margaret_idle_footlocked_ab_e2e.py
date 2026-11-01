#!/usr/bin/env python3
"""Real game-canvas A/B for Margaret's foot-locked idle PNG (review-only).

Runs two identical Ryune scenes with ?heroIdleArt=2 (original bouncing source)
and ?heroIdleArt=3 (Margaret-only contact-locked trial). Both use the same
frame clock and hold the other three heroes on idle frame zero. No saves,
approved PNGs or story content are modified.
"""
from __future__ import annotations
import base64
import hashlib
import io
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright
from browser_launch import launch_chromium
import browser_vertical_slice_e2e_test as helper
from browser_hero_idle_fourframe_motion_e2e import capture_cycle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'prototype_artifacts/margaret_idle_footlocked_live_ab'
DIRECTIONS = ('down', 'left', 'right', 'up')
VIEWS = (('desktop', 1365, 900), ('phone', 390, 844))


def ready(page):
    page.locator('#titleNewGame').click()
    helper.clean_dialogue(page)
    page.wait_for_function("""() =>
      ['karen','triton','sophie','margaret'].every(id=>{
        const r=GC.Render.World.heroRuntimeStatus()[id];
        return r?.ready&&r?.idleReady;
      })""", timeout=20000)


def compare(view, direction, old, new):
    assert len(old) == len(new) == 4
    old_frames = {s['step']:s for s in old}
    new_frames = {s['step']:s for s in new}
    for i in range(4):
        a,b = old_frames[i],new_frames[i]
        assert a['size'] == b['size'] == [768,480]
        assert a['state'] == b['state']
        assert a['camera'] == b['camera']
        assert a['followers'] == b['followers']
        ad = {d['hero']:d for d in a['draws']}
        bd = {d['hero']:d for d in b['draws']}
        assert set(ad) == set(bd) == {'karen','triton','sophie','margaret'}
        for hero in ad:
            assert ad[hero]['dest'] == bd[hero]['dest']
            assert ad[hero]['bbox'] == bd[hero]['bbox']
            assert ad[hero]['frame'] == bd[hero]['frame']
            assert ad[hero]['dest'][2:] == [44,44]
            if hero != 'margaret':
                assert ad[hero]['frame'] == 0
        assert ad['margaret']['frame'] == [0,1,2,3][i]
    # Frames 0,1,3 are source-identical. Only frame2 is a deliberate change.
    old_img = Image.open(io.BytesIO(base64.b64decode(old_frames[2]['png']))).convert('RGB')
    new_img = Image.open(io.BytesIO(base64.b64decode(new_frames[2]['png']))).convert('RGB')
    delta = ImageChops.difference(old_img,new_img)
    bbox = {d['hero']:d for d in old_frames[2]['draws']}['margaret']['bbox']
    channels = delta.split()
    mask = ImageChops.lighter(ImageChops.lighter(channels[0],channels[1]),channels[2])
    changed = 0
    for y in range(480):
        for x in range(768):
            if mask.getpixel((x,y)):
                changed += 1
                assert bbox[0]-2 <= x < bbox[2]+2 and bbox[1]-2 <= y < bbox[3]+2, (
                    'unrelated world or party pixels changed',view,direction,x,y)
    assert changed > 0, 'candidate not visible on the real game canvas'
    old_name = f'{view}_{direction}_original_frame2.png'
    new_name = f'{view}_{direction}_footlocked_frame2.png'
    old_img.save(OUT/old_name)
    new_img.save(OUT/new_name)
    board = Image.new('RGB',(1536,514),'#242424')
    pen = ImageDraw.Draw(board)
    board.paste(old_img,(0,34))
    board.paste(new_img,(768,34))
    pen.text((12,10),f'{view} {direction} | original whole-body bob | ART HOLD',fill='white')
    pen.text((780,10),f'{view} {direction} | foot-locked lower half | ART HOLD',fill='white')
    name=f'{view}_{direction}_live_AB.png'
    board.save(OUT/name)
    return {'view':view,'direction':direction,'old':old_name,'candidate':new_name,
            'board':name,'changed_pixels':changed,'margaret_bbox':bbox,
            'old_sha256':hashlib.sha256((OUT/old_name).read_bytes()).hexdigest(),
            'candidate_sha256':hashlib.sha256((OUT/new_name).read_bytes()).hexdigest()}


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    records=[]
    with helper.served() as url, sync_playwright() as playwright:
        browser=launch_chromium(playwright)
        try:
            for view,width,height in VIEWS:
                old=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
                new=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
                errors=[]
                old.on('pageerror',lambda err:errors.append(str(err)))
                new.on('pageerror',lambda err:errors.append(str(err)))
                try:
                    old.goto(url+'?heroIdleArt=2',wait_until='networkidle')
                    new.goto(url+'?heroIdleArt=3',wait_until='networkidle')
                    ready(old)
                    ready(new)
                    # In both versions only Margaret moves. All other hero
                    # poses and world clocks remain fixed for an honest A/B.
                    old.evaluate('HERO_RUNTIME.idleContactTrialEnabled=true')
                    for direction in DIRECTIONS:
                        records.append(compare(view,direction,
                            capture_cycle(old,direction),capture_cycle(new,direction)))
                    assert not errors,errors
                finally:
                    old.close()
                    new.close()
        finally:
            browser.close()
    manifest={'source_head':helper.source_head(),'status':'ART HOLD — NOT APPROVED',
              'scope':'real Ryune 44px full-scene A/B, fixed world/other hero frames',
              'boards':8,'screenshots':16,'records':records}
    (OUT/'manifest.json').write_text(
        json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'boards':8,'screenshots':16,'status':manifest['status']}))


if __name__=='__main__':
    main()
