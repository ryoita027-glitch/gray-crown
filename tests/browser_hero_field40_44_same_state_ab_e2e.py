#!/usr/bin/env python3
"""Real Ryune game canvas: paired 44px/40px hero A/B, identical scene state.

Requires a complete local checkout, Pillow, Playwright and installed Chromium.
This creates visual evidence; it does NOT approve the 40px art experiment.
"""
import base64
import hashlib
import io
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright
from browser_launch import launch_chromium
import browser_vertical_slice_e2e_test as helper

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'prototype_artifacts/hero_field40_44_same_state_ab'
VIEWS = [('desktop', 1365, 900), ('phone', 390, 844)]
DIRECTIONS = ('down', 'left', 'right', 'up')


def capture_pair(page, direction):
    """Two synchronous real drawScene calls, resetting visual state before each."""
    return page.evaluate("""direction => {
      const s=GC.State.get(), world=GC.Render.World, v=world.VISUAL;
      s.map='village';s.x=9;s.y=8;s.dir=direction;
      s.trail=[];s.worldStepsOnMap=0;
      const originalSize=GC.Data.Animations.artDisplaySize;
      const originalNow=Date.now;
      const raf=window.requestAnimationFrame, cancel=window.cancelAnimationFrame;
      const timeout=window.setTimeout, clear=window.clearTimeout;
      cancel(v.raf);clear(v.ambientTimer);
      const frozenTime=1793509200000;
      Date.now=()=>frozenTime;
      window.requestAnimationFrame=()=>0;window.cancelAnimationFrame=()=>{};
      window.setTimeout=()=>0;window.clearTimeout=()=>{};
      const shots=[];
      try {
        for(const size of [44,40]) {
          GC.Data.Animations.artDisplaySize=size;
          // The game draw mutates camera interpolation and follower queues.
          // Force the same initial visual state for both draws, not merely
          // the same player coordinates or a close-enough animation frame.
          v.map=null;v.lastActingFrame=0;v.travelPhase=0;
          v.followerPhases=[0,0,0];v.followerFaces=[direction,direction,direction];
          world.drawScene();
          const canvas=document.querySelector('#game');
          const bounds=canvas.getBoundingClientRect();
          shots.push({size, png:canvas.toDataURL('image/png').split(',')[1],
            canvas:[canvas.width,canvas.height],css:[bounds.width,bounds.height],
            state:{map:s.map,x:s.x,y:s.y,dir:s.dir},
            visual:{camera:[v.camX,v.camY],leader:[v.playerX,v.playerY],
              followers:v.followers.map(p=>[...p]),phases:[...v.followerPhases],
              travelPhase:v.travelPhase}});
        }
      } finally {
        GC.Data.Animations.artDisplaySize=originalSize;
        Date.now=originalNow;
        window.requestAnimationFrame=raf;window.cancelAnimationFrame=cancel;
        window.setTimeout=timeout;window.clearTimeout=clear;
        v.map=null;v.raf=0;v.ambientTimer=0;
        world.draw();
      }
      return shots;
    }""", direction)


def review_pair(view, direction, shots):
    assert [s['size'] for s in shots] == [44, 40]
    assert shots[0]['state'] == shots[1]['state']
    assert shots[0]['visual'] == shots[1]['visual'], 'camera/follower drift invalidates A/B'
    assert shots[0]['canvas'] == shots[1]['canvas'] == [768, 480]
    pictures=[]
    records=[]
    for shot in shots:
        data=base64.b64decode(shot['png'])
        picture=Image.open(io.BytesIO(data)).convert('RGB')
        assert picture.size == (768, 480)
        filename=f'{view}_{direction}_{shot["size"]}.png'
        (OUT/filename).write_bytes(data)
        pictures.append(picture)
        records.append({'size':shot['size'],'file':filename,
                        'sha256':hashlib.sha256(data).hexdigest(),
                        'canvas':shot['canvas'],'css':shot['css']})
    difference=ImageChops.difference(*pictures)
    mask=difference.convert('L').point(lambda value: 255 if value else 0)
    changed=sum(1 for value in mask.getdata() if value)
    assert 100 < changed < 25000, f'Unexpected A/B difference {view}/{direction}: {changed}'
    board=Image.new('RGB',(1536,510),'#222222')
    draw=ImageDraw.Draw(board)
    for index,picture in enumerate(pictures):
        board.paste(picture,(768*index,30))
        draw.text((768*index+12,9),f'{view} {direction} / {shots[index]["size"]}px',fill='white')
    board_name=f'{view}_{direction}_same_state_pair.png'
    board.save(OUT/board_name)
    return {'view':view,'direction':direction,'images':records,
            'pair':board_name,'changed_rgb_pixels':changed,
            'diff_bbox':mask.getbbox(),'same_render_state':True}


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    results=[]
    with helper.served() as url, sync_playwright() as playwright:
        browser=launch_chromium(playwright)
        try:
            for view,width,height in VIEWS:
                page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
                errors=[]
                page.on('pageerror',lambda error:errors.append(str(error)))
                try:
                    page.goto(url,wait_until='networkidle')
                    page.locator('#titleNewGame').click()
                    helper.clean_dialogue(page)
                    page.wait_for_function("""() =>
                      ['karen','triton','sophie','margaret'].every(
                        id=>GC.Render.World.heroRuntimeStatus()[id]?.ready)
                    """,timeout=20000)
                    page.wait_for_function("""() =>
                      typeof OpeningPixelAssets!=='undefined' &&
                      OpeningPixelAssets.featuredStatus().ready &&
                      !OpeningPixelAssets.featuredStatus().failed
                    """,timeout=20000)
                    for direction in DIRECTIONS:
                        results.append(review_pair(view,direction,capture_pair(page,direction)))
                    assert not errors, errors
                finally:
                    page.close()
        finally:
            browser.close()
    manifest={'type':'REAL GAME CANVAS, SEEDED RYUNE STATE, not story playthrough',
              'baseline':'44px current approved default','candidate':'40px opt-in only',
              'art_review':'HOLD / not automatically adopted',
              'views':VIEWS,'pairs':results,'png_count':16,'pair_boards':8,
              'source_head':helper.source_head()}
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'png_count':16,'pair_boards':8,'source_head':manifest['source_head'],
                      'art_review':'HOLD'},ensure_ascii=False))


if __name__ == '__main__':
    main()
