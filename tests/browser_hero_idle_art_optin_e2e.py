#!/usr/bin/env python3
"""Real canvas A/B: default walk-frame-at-rest vs opt-in authored idle art.

Review-only branch; never changes production PNGs or declares art acceptance.
Run with: python tests/browser_hero_idle_art_optin_e2e.py
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

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'prototype_artifacts/hero_idle_art_optin'
HEROES = ('karen', 'triton', 'sophie', 'margaret')
VIEWS = (('desktop', 1365, 900), ('phone', 390, 844))
DIRECTIONS = ('down', 'left', 'right', 'up')


def capture_pair(page, direction):
    return page.evaluate("""({direction}) => {
      const s = GC.State.get(), w = GC.Render.World, v = w.VISUAL;
      const original = {map:s.map,x:s.x,y:s.y,dir:s.dir,
        trail:s.trail,worldStepsOnMap:s.worldStepsOnMap};
      const originalTrial = HERO_RUNTIME.idleTrialEnabled;
      const originalDate = Date.now, originalRaf = window.requestAnimationFrame;
      const originalCancel = window.cancelAnimationFrame;
      const originalTimeout = window.setTimeout, originalClear = window.clearTimeout;
      const originalDraw = CanvasRenderingContext2D.prototype.drawImage;
      const originalSize = GC.Data.Animations.artDisplaySize;
      const canvas = document.querySelector('#game');
      const result = [];
      cancelAnimationFrame(v.raf); clearTimeout(v.ambientTimer);
      s.map = 'village'; s.x = 9; s.y = 8; s.dir = direction;
      s.trail = []; s.worldStepsOnMap = 0;
      Date.now = () => 1793509200000;
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
      window.setTimeout = () => 0;
      window.clearTimeout = () => {};
      GC.Data.Animations.artDisplaySize = 44;
      try {
        for (const trial of [false,true]) {
          HERO_RUNTIME.idleTrialEnabled = trial;
          const draws = [];
          CanvasRenderingContext2D.prototype.drawImage = function(...args) {
            const src = args[0]?.currentSrc || args[0]?.src || '';
            const m = String(src).match(/assets\\/characters\\/(karen|triton|sophie|margaret)\\/\\1_(walk|idle)\\.png(?:[?#]|$)/);
            if (m && args.length === 9 && args[3] === 48 && args[4] === 48)
              draws.push({hero:m[1],pose:m[2],frame:args[1]/48,
                direction:args[2]/48,dest:args.slice(5,9)});
            return originalDraw.apply(this,args);
          };
          v.map = null; v.travelPhase = 0; v.followerPhases = [0,0,0];
          v.followerFaces = [direction,direction,direction];
          w.drawScene();
          result.push({trial, png:canvas.toDataURL('image/png').split(',')[1],
            canvas:[canvas.width,canvas.height], draws,
            state:{map:s.map,x:s.x,y:s.y,dir:s.dir},
            camera:[v.camX,v.camY],
            followers:v.followers.map(p=>[...p])});
        }
      } finally {
        CanvasRenderingContext2D.prototype.drawImage = originalDraw;
        HERO_RUNTIME.idleTrialEnabled = originalTrial;
        GC.Data.Animations.artDisplaySize = originalSize;
        Date.now = originalDate;
        window.requestAnimationFrame = originalRaf;
        window.cancelAnimationFrame = originalCancel;
        window.setTimeout = originalTimeout;
        window.clearTimeout = originalClear;
        Object.assign(s, original);
        v.map = null; v.raf = 0; v.ambientTimer = 0;
        w.draw();
      }
      return result;
    }""", {'direction':direction})


def save_pair(view, direction, shots):
    assert len(shots) == 2 and [s['trial'] for s in shots] == [False, True]
    assert all(s['canvas'] == [768, 480] for s in shots)
    assert shots[0]['state'] == shots[1]['state']
    assert shots[0]['camera'] == shots[1]['camera']
    assert shots[0]['followers'] == shots[1]['followers']
    records, pictures = [], []
    for shot in shots:
        poses = {d['hero']:d['pose'] for d in shot['draws']}
        assert set(poses) == set(HEROES), f'missing live hero draw: {view}/{direction} {poses}'
        expected = 'idle' if shot['trial'] else 'walk'
        assert all(p == expected for p in poses.values()), f'wrong draw source: {poses}'
        assert all(d['frame'] == 0 for d in shot['draws']), 'standing pose used moving frame'
        assert all(d['direction'] == DIRECTIONS.index(direction) for d in shot['draws'])
        data = base64.b64decode(shot['png'])
        im = Image.open(io.BytesIO(data)).convert('RGB')
        assert im.size == (768, 480)
        name = f'{view}_{direction}_{"authored_idle" if shot["trial"] else "live_walk"}.png'
        (OUT / name).write_bytes(data)
        pictures.append(im)
        records.append({'name':name,'sha256':hashlib.sha256(data).hexdigest(),
                        'draws':shot['draws']})
    delta = ImageChops.difference(*pictures)
    mask = ImageChops.lighter(ImageChops.lighter(*delta.split()[:2]),delta.split()[2])
    bbox = mask.getbbox()
    changed = sum(1 for pixel in mask.getdata() if pixel)
    board = Image.new('RGB', (1536, 510), '#242424')
    pen = ImageDraw.Draw(board)
    for i, image in enumerate(pictures):
        board.paste(image, (i*768, 30))
        pen.text((i*768+12, 9),
                 f'{view} {direction} / {"authored idle TRIAL" if i else "live walk DEFAULT"}',
                 fill='white')
    board_name = f'{view}_{direction}_ab.png'
    board.save(OUT / board_name)
    return {'view':view,'direction':direction,'files':records,'board':board_name,
            'changed_rgb_pixels':changed,'bbox':bbox,'same_scene':True,
            'art_verdict':'HOLD'}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    pairs = []
    with helper.served() as url, sync_playwright() as playwright:
        browser = launch_chromium(playwright)
        try:
            for view, width, height in VIEWS:
                page = browser.new_page(viewport={'width':width,'height':height},
                                        device_scale_factor=1)
                errors = []
                page.on('pageerror', lambda err: errors.append(str(err)))
                try:
                    page.goto(url + '?heroIdleArt=1', wait_until='networkidle')
                    page.locator('#titleNewGame').click()
                    helper.clean_dialogue(page)
                    page.wait_for_function("""() =>
                      ['karen','triton','sophie','margaret'].every(id => {
                        const r=GC.Render.World.heroRuntimeStatus()[id];
                        return r?.ready && r?.idleReady && r?.idleTrialEnabled;
                      })""", timeout=20000)
                    assert page.evaluate("GC.Data.Animations.artDisplaySize") == 44
                    for direction in DIRECTIONS:
                        pairs.append(save_pair(view,direction,capture_pair(page,direction)))
                    assert not errors, errors
                finally:
                    page.close()
        finally:
            browser.close()
    manifest = {'source_head':helper.source_head(),'status':'ART HOLD, NOT ADOPTED',
                'scope':'real canvas 44px, four heroes, same-state live walk vs authored idle',
                'views':VIEWS,'screenshots':16,'boards':8,'pairs':pairs}
    (OUT / 'manifest.json').write_text(
        json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'screenshots':16,'boards':8,'status':manifest['status'],
                      'source_head':manifest['source_head']}))


if __name__ == '__main__':
    main()
