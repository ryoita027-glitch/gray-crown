#!/usr/bin/env python3
"""Real Ryune village A/B: original Margaret idle vs two existing draft atlases.

This is an isolated browser capture. It does not replace production PNGs,
change save data, or automatically approve any artwork.
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
OUT = ROOT / 'prototype_artifacts/margaret_live_idle_ab'
VIEWS = (('desktop', 1365, 900), ('phone', 390, 844))
DIRECTIONS = ('down', 'left', 'right', 'up')
SOURCE_BLOBS = {
    'assets/characters/margaret/margaret_idle.png':
        '910458eabfcfaef7442f885f319d0e2a09c88a66',
    'docs/art/evidence/margaret_identity_safe_hair_HOLD.png':
        '081aa3e9c8e1bc06693dac081c7182c990942d0f',
    'docs/art/evidence/margaret_front_structural_redraw_HOLD.png':
        '1823d20a7438f6a578da8fffd9cb207f1efff65d',
}
SOURCES = {
    'original': 'assets/characters/margaret/margaret_idle.png',
    'hair_hold': 'docs/art/evidence/margaret_identity_safe_hair_HOLD.png',
    'front_no_go': 'docs/art/evidence/margaret_front_structural_redraw_HOLD.png',
}


def capture_three(page, direction):
    """Three real world.drawScene() calls with a frozen state and audited source."""
    return page.evaluate("""async ({direction, sources}) => {
      const world = GC.Render.World, s = GC.State.get(), v = world.VISUAL;
      const originalSize = GC.Data.Animations.artDisplaySize;
      const originals = {map:s.map, x:s.x, y:s.y, dir:s.dir,
        trail:s.trail, worldStepsOnMap:s.worldStepsOnMap};
      const images = {};
      for (const [key, url] of Object.entries(sources)) {
        if (!url) continue;
        const img = new Image(); img.src = url;
        await img.decode();
        if (img.naturalWidth !== 192 || img.naturalHeight !== 192)
          throw new Error(key + ' is not a 4x4 idle atlas');
        images[key] = img;
      }
      const originalNow = Date.now;
      const raf = window.requestAnimationFrame, cancel = window.cancelAnimationFrame;
      const timeout = window.setTimeout, clear = window.clearTimeout;
      const originalDraw = CanvasRenderingContext2D.prototype.drawImage;
      const acting = GC.CommercialActing;
      const actingDraws = acting?.draws;
      cancel(v.raf); clear(v.ambientTimer);
      Date.now = () => 1793509200000;
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
      window.setTimeout = () => 0;
      window.clearTimeout = () => {};
      GC.Data.Animations.artDisplaySize = 44;
      if (actingDraws) acting.draws = function(id, ...args) {
        if (id === 'margaret') return false;
        return actingDraws.call(this, id, ...args);
      };
      s.map = 'village'; s.x = 9; s.y = 8; s.dir = direction;
      s.trail = []; s.worldStepsOnMap = 0;
      const shots = [];
      try {
        for (const key of Object.keys(sources)) {
          let calls = 0, nonIdleCalls = 0;
          CanvasRenderingContext2D.prototype.drawImage = function(...args) {
            const source = args[0];
            const src = source?.currentSrc || source?.src || '';
            if (typeof src === 'string' &&
                /assets\\/characters\\/margaret\\/margaret_walk\\.png(?:[?#]|$)/.test(src) &&
                args.length === 9 && args[3] === 48 && args[4] === 48) {
              calls++;
              if (args[1] !== 0) nonIdleCalls++;
              args[0] = images[key];
            }
            return originalDraw.apply(this, args);
          };
          v.map = null; v.lastActingFrame = 0; v.travelPhase = 0;
          v.followerPhases = [0,0,0];
          v.followerFaces = [direction,direction,direction];
          world.drawScene();
          const canvas = document.querySelector('#game');
          shots.push({key, png:canvas.toDataURL('image/png').split(',')[1],
            calls, nonIdleCalls, canvas:[canvas.width,canvas.height],
            state:{map:s.map,x:s.x,y:s.y,dir:s.dir},
            visual:{camera:[v.camX,v.camY],leader:[v.playerX,v.playerY],
              followers:v.followers.map(p=>[...p]),
              phases:[...v.followerPhases]}});
        }
      } finally {
        CanvasRenderingContext2D.prototype.drawImage = originalDraw;
        if (actingDraws) acting.draws = actingDraws;
        GC.Data.Animations.artDisplaySize = originalSize;
        Date.now = originalNow;
        window.requestAnimationFrame = raf;
        window.cancelAnimationFrame = cancel;
        window.setTimeout = timeout;
        window.clearTimeout = clear;
        Object.assign(s, originals);
        v.map = null; v.raf = 0; v.ambientTimer = 0;
        world.draw();
      }
      return shots;
    }""", {'direction': direction, 'sources': SOURCES})


def review(view, direction, shots):
    assert [s['key'] for s in shots] == list(SOURCES)
    assert all(s['canvas'] == [768, 480] for s in shots)
    assert all(s['state'] == shots[0]['state'] for s in shots)
    assert all(s['visual'] == shots[0]['visual'] for s in shots), 'camera/follower drift'
    assert all(s['calls'] > 0 for s in shots), 'Margaret was not actually drawn'
    assert all(s['nonIdleCalls'] == 0 for s in shots), 'idle atlas used for a walk frame'
    pictures, records = [], []
    for shot in shots:
        data = base64.b64decode(shot['png'])
        picture = Image.open(io.BytesIO(data)).convert('RGB')
        assert picture.size == (768, 480)
        name = f'{view}_{direction}_{shot["key"]}.png'
        (OUT / name).write_bytes(data)
        pictures.append(picture)
        records.append({'key':shot['key'], 'file':name,
                        'sha256':hashlib.sha256(data).hexdigest(),
                        'margaret_draw_calls':shot['calls']})
    diffs = {}
    for index in (1, 2):
        diff = ImageChops.difference(pictures[0], pictures[index])
        mask = diff.convert('L').point(lambda p: 255 if p else 0)
        count = sum(1 for p in mask.getdata() if p)
        if index == 1:
            assert count > 0, f'hair study not visible: {view}/{direction}'
        elif direction == 'down':
            assert count > 0, f'front redraw not visible: {view}/{direction}'
        assert count < 7000, f'unrelated scene changed: {view}/{direction}/{index} ({count})'
        diffs[shots[index]['key']] = {'rgb_pixels':count, 'bbox':mask.getbbox()}
    board = Image.new('RGB', (768*3, 510), '#242424')
    pen = ImageDraw.Draw(board)
    for index, picture in enumerate(pictures):
        board.paste(picture, (768*index, 30))
        pen.text((768*index+12, 9),
                 f'{view} {direction} / {shots[index]["key"]}', fill='white')
    board_name = f'{view}_{direction}_three_way.png'
    board.save(OUT / board_name)
    return {'view':view, 'direction':direction, 'shots':records,
            'board':board_name, 'diffs':diffs, 'same_state':True}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for path, expected in SOURCE_BLOBS.items():
        data = (ROOT / path).read_bytes()
        actual = hashlib.sha1(
            b'blob ' + str(len(data)).encode() + b'\\0' + data).hexdigest()
        assert actual == expected, f'asset changed: {path} {actual}'
    records = []
    with helper.served() as url, sync_playwright() as playwright:
        browser = launch_chromium(playwright)
        try:
            for view, width, height in VIEWS:
                page = browser.new_page(viewport={'width':width,'height':height},
                                        device_scale_factor=1)
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                try:
                    page.goto(url, wait_until='networkidle')
                    page.locator('#titleNewGame').click()
                    helper.clean_dialogue(page)
                    page.wait_for_function("""() =>
                      ['karen','triton','sophie','margaret'].every(
                        id => GC.Render.World.heroRuntimeStatus()[id]?.ready)
                    """, timeout=20000)
                    for direction in DIRECTIONS:
                        records.append(review(view, direction,
                                              capture_three(page, direction)))
                    assert not errors, errors
                finally:
                    page.close()
        finally:
            browser.close()
    manifest = {'type':'real game canvas, seeded Ryune scene',
                'art_verdict':'HOLD; rejected front remains NO-GO',
                'source_head':helper.source_head(), 'views':VIEWS,
                'sources':SOURCES, 'shots':24, 'boards':8, 'pairs':records}
    (OUT / 'manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'shots':24,'boards':8,
                      'source_head':manifest['source_head'],
                      'art_verdict':manifest['art_verdict']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
