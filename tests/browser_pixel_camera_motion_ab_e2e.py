#!/usr/bin/env python3
"""Capture deterministic in-game fractional camera movement A/B frames.

This is visual evidence generation, not commercial-art acceptance. Requires a
real Git checkout, Playwright and Chromium. Never writes game save data.
"""
from __future__ import annotations

import base64
import hashlib
import json
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'prototype_artifacts' / 'pixel_camera_motion_review'
VIEWPORTS = (('desktop', 1280, 800), ('phone', 390, 844))
OFFSETS = (0.10, 0.35, 0.60, 0.85)


def pair_metrics(a: Image.Image, b: Image.Image) -> dict:
    """Count actual RGB differences; this is not an aesthetic score."""
    assert a.size == b.size, 'A/B dimensions differ'
    delta = ImageChops.difference(a.convert('RGB'), b.convert('RGB'))
    bbox = delta.getbbox()
    changed = sum(1 for pixel in delta.getdata() if any(pixel))
    return {'different_pixels': changed, 'total_pixels': a.width * a.height,
            'changed_fraction': round(changed / (a.width * a.height), 6),
            'difference_bbox': list(bbox) if bbox else None}


def capture(page, url, viewport_name):
    page.goto(url + '?gcPixelReview=1', wait_until='networkidle')
    assert page.evaluate("GC.PixelCameraAB.active()")
    page.locator('#titleNewGame').click()
    first.clean_dialogue(page)
    page.wait_for_function("""() => ['karen','triton','sophie','margaret'].every(
      id => GC.Render.World.heroRuntimeStatus()[id].ready)""", timeout=20000)
    page.wait_for_function('() => OpeningPixelAssets.featuredStatus().ready', timeout=20000)
    page.evaluate("""() => {
      const s = GC.State.get(); s.map = 'village'; s.x = 12; s.y = 12; s.dir = 'down';
      GC.Render.World.VISUAL.map = null;
      GC.Render.World.drawScene();
    }""")
    before = page.evaluate("""() => {
      const s = GC.State.get();
      return JSON.stringify({schema:s.schema,map:s.map,x:s.x,y:s.y,
        party:s.party,story:s.story,inventory:s.inventory,world:s.world,
        events:s.events,gold:s.gold});
    }""")
    # Synchronous A/B capture prevents animation advancing between modes.
    frames = page.evaluate("""(offsets) => {
      const w = GC.Render.World, v = w.VISUAL;
      const c = document.getElementById('game');
      if (!(c instanceof HTMLCanvasElement)) throw Error('Game canvas missing');
      const stop = () => {
        cancelAnimationFrame(v.raf); clearTimeout(v.ambientTimer);
        v.raf = 0; v.ambientTimer = null;
      };
      stop();
      // drawScene advances camera easing, party movement and follower phases.
      // Restore all of them before EACH render, not merely before each offset.
      const frozen = JSON.stringify(v), initial = JSON.parse(frozen);
      const result = [], realNow = Date.now, frozenNow = realNow();
      Date.now = () => frozenNow;
      try {
        for (const offset of offsets) {
          for (const mode of ['baseline', 'snap']) {
            stop();
            GC.PixelCameraAB.setMode(mode); // schedules a draw; cancel it
            stop();
            Object.assign(v, JSON.parse(frozen));
            v.camX = initial.camX + 0.10 + offset;
            v.camY = initial.camY + 0.35 + offset;
            v.lastActingFrame = 0;
            w.drawScene();
            result.push({mode, offset,
              camera_x:v.camX, camera_y:v.camY,
              player_x:v.playerX, player_y:v.playerY,
              travel_phase:v.travelPhase,
              follower_phases:[...v.followerPhases],
              image:c.toDataURL('image/png').split(',')[1]});
            stop();
          }
          const a = result[result.length - 2], b = result[result.length - 1];
          for (const key of ['camera_x','camera_y','player_x','player_y','travel_phase']) {
            if (a[key] !== b[key]) throw Error('A/B VISUAL drift: ' + key);
          }
          if (JSON.stringify(a.follower_phases) !== JSON.stringify(b.follower_phases))
            throw Error('A/B follower phase drift');
        }
      } finally {
        Date.now = realNow;
        stop();
        GC.PixelCameraAB.setMode('baseline');
        stop();
        Object.assign(v, JSON.parse(frozen));
      }
      return result;
    }""", list(OFFSETS))
    after = page.evaluate("""() => {
      const s = GC.State.get();
      return JSON.stringify({schema:s.schema,map:s.map,x:s.x,y:s.y,
        party:s.party,story:s.story,inventory:s.inventory,world:s.world,
        events:s.events,gold:s.gold});
    }""")
    assert before == after, 'Rendering study modified gameplay state'
    manifest = []
    crops = []
    images = []
    pairs = []
    for index, item in enumerate(frames):
        assert item['mode'] in ('baseline', 'snap')
        raw = base64.b64decode(item['image'], validate=True)
        assert raw.startswith(b'\x89PNG\r\n\x1a\n'), 'Canvas PNG is invalid'
        name = f'{viewport_name}_{index // 2:02}_{item["mode"]}.png'
        (OUT / name).write_bytes(raw)
        with Image.open(BytesIO(raw)) as source:
            image = source.convert('RGB')
            image.load()
            images.append(image)
            cx, cy = image.width // 2, image.height // 2
            crops.append(image.crop((cx - 160, cy - 120, cx + 160, cy + 120)))
        manifest.append({'file':name,'mode':item['mode'],
          'camera_offset':item['offset'],
          'rendered_camera':[item['camera_x'],item['camera_y']], 'sha256':hashlib.sha256(raw).hexdigest(),
          'bytes':len(raw)})
    assert len(manifest) == len(OFFSETS) * 2
    for i in range(len(OFFSETS)):
        pairs.append({'offset':OFFSETS[i], **pair_metrics(images[2*i],images[2*i+1])})
    # No resize: 1:1 pixel-scale crops, A left / B right.
    sheet = Image.new('RGB', (640, len(OFFSETS) * 264), (36, 36, 36))
    painter = ImageDraw.Draw(sheet)
    for i, offset in enumerate(OFFSETS):
        y = i * 264
        painter.text((6, y + 4), f'Camera +{offset:.2f} | A original', fill='white')
        painter.text((326, y + 4), f'Camera +{offset:.2f} | B snap', fill='white')
        sheet.paste(crops[2 * i], (0, y + 24))
        sheet.paste(crops[2 * i + 1], (320, y + 24))
    sheet.save(OUT / f'{viewport_name}_native100_contact.png')
    return {'viewport':viewport_name,'frames':manifest,'pairs':pairs,
            'state_unchanged':True,'visual_state_paired':True}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    captures = []
    with first.served() as url, sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        try:
            for name, width, height in VIEWPORTS:
                page = browser.new_page(viewport={'width':width,'height':height})
                errors = []
                page.on('pageerror', lambda exc: errors.append(str(exc)))
                try:
                    result = capture(page, url, name)
                    assert not errors, errors[:5]
                    captures.append(result)
                finally:
                    page.close()
        finally:
            browser.close()
    manifest = {'head':first.source_head(), 'visual_approval':'HOLD',
      'full_game_test':'NOT_RUN', 'camera_modes':['baseline','snap'],
      'camera_offsets':OFFSETS, 'captures':captures,
      'interpretation':'Visual state reset for each A/B pair; pixel differences are not art acceptance'}
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'head':manifest['head'],'frames':sum(len(x['frames']) for x in captures),
      'technical_capture':'PASS','visual_approval':'HOLD'}))


if __name__ == '__main__':
    main()
