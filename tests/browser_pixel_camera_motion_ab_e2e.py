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

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'prototype_artifacts' / 'pixel_camera_motion_review'
VIEWPORTS = (('desktop', 1280, 800), ('phone', 390, 844))
OFFSETS = (0.10, 0.35, 0.60, 0.85)


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
      const result = [], baseX = v.camX, baseY = v.camY;
      for (const offset of offsets) {
        for (const mode of ['baseline','snap']) {
          GC.PixelCameraAB.setMode(mode);
          v.camX = baseX + 0.10 + offset;
          v.camY = baseY + 0.35 + offset;
          w.drawScene();
          result.push({mode,offset,scale:GC.PixelCameraAB.scale(1.16),
            image:c.toDataURL('image/png').split(',')[1]});
        }
      }
      GC.PixelCameraAB.setMode('baseline');
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
    for index, item in enumerate(frames):
        assert item['mode'] in ('baseline', 'snap')
        raw = base64.b64decode(item['image'], validate=True)
        assert raw.startswith(b'\x89PNG\r\n\x1a\n'), 'Canvas PNG is invalid'
        name = f'{viewport_name}_{index // 2:02}_{item["mode"]}.png'
        (OUT / name).write_bytes(raw)
        with Image.open(BytesIO(raw)) as source:
            image = source.convert('RGB')
            cx, cy = image.width // 2, image.height // 2
            crops.append(image.crop((cx - 160, cy - 120, cx + 160, cy + 120)))
        manifest.append({'file':name,'mode':item['mode'],
          'camera_offset':item['offset'],'sha256':hashlib.sha256(raw).hexdigest(),
          'bytes':len(raw)})
    assert len(manifest) == len(OFFSETS) * 2
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
    return {'viewport':viewport_name,'frames':manifest,'state_unchanged':True}


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
      'interpretation':'Motion stills only; assess tile/actor jitter visually before adoption'}
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'head':manifest['head'],'frames':sum(len(x['frames']) for x in captures),
      'technical_capture':'PASS','visual_approval':'HOLD'}))


if __name__ == '__main__':
    main()
