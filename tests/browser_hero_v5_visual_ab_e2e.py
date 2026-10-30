#!/usr/bin/env python3
"""Capture unmodified Gray Crown game-canvas A/B for four original heroes vs V5 NPCs.

Visual REVIEW tool, not art acceptance. Run in a complete repository checkout:
    python tests/browser_hero_v5_visual_ab_e2e.py
"""
import contextlib
import functools
import http.server
import json
import threading
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'prototype_artifacts' / 'hero_v5_visual_ab_20261030'
DIRECTIONS = ('down', 'left', 'right', 'up')
SCENES = {
    'village_wide': (12, 12),
    'messenger_contact': (12, 8),
    'mayor_contact': (7, 10),
}
SIZES = (40, 42, 44)
ANCHORS = ('default', 'alpha')


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


@contextlib.contextmanager
def local_server():
    handler = functools.partial(Quiet, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f'http://127.0.0.1:{server.server_port}'
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def setup_scene(page, x, y, direction):
    # Real village renderer and original atlases, no invented background.
    # The test state is never persisted as a save.
    page.evaluate("""([x,y,direction]) => {
      const s=GC.State.get();
      s.map='village'; s.x=x; s.y=y; s.dir=direction;
      s.trail=[[x-1,y],[x-2,y],[x-3,y]];
      s.worldStepsOnMap=3;
      GC.Render.World.VISUAL.map=null;
      GC.Render.World.draw();
    }""", [x, y, direction])
    page.wait_for_timeout(420)
    n = page.evaluate("""() => {
      const s=GC.State.get();
      const points=[[s.x,s.y],...s.trail.slice(0,3)];
      return new Set(points.map(p=>p.join(','))).size;
    }""")
    if n != 4:
        raise AssertionError(f'four hero state positions overlap: {n}')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {'status': 'ART_HOLD', 'meaning': 'real canvas captures, not visual approval',
                'scenes': SCENES, 'captures': [], 'failures': []}
    with local_server() as base, sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for size in SIZES:
                for anchor in ANCHORS:
                    params = f'?gcHeroDisplay={size}'
                    if anchor == 'alpha':
                        params += '&gcHeroFootline=alpha'
                    # Never enable the rejected gcV5Footline=44 option.
                    page = browser.new_page(viewport={'width': 1280, 'height': 900},
                                            device_scale_factor=1, reduced_motion='reduce')
                    errors = []
                    page.on('pageerror', lambda err: errors.append(str(err)))
                    try:
                        page.goto(base + '/index.html' + params, wait_until='networkidle')
                        page.locator('#titleNewGame').click()
                        for _ in range(4):
                            page.keyboard.press('Space')
                            page.wait_for_timeout(65)
                        page.evaluate('() => GC.Dialogue.closeDialogue(false)')
                        page.wait_for_function("""() => {
                          const s=GC.Render?.World?.heroRuntimeStatus?.();
                          return s && ['karen','triton','sophie','margaret'].every(k=>s[k]?.ready);
                        }""", timeout=12000)
                        setup_scene(page, *SCENES['village_wide'], 'down')
                        page.wait_for_function("""() =>
                          typeof OpeningPixelAssets!=='undefined' &&
                          OpeningPixelAssets.featuredStatus().ready
                        """, timeout=12000)
                        hero_status = page.evaluate('() => GC.Render.World.heroRuntimeStatus()')
                        npc_status = page.evaluate('() => OpeningPixelAssets.featuredStatus()')
                        if npc_status.get('footlineStudy') != 'default':
                            raise AssertionError('rejected V5 footline option became active')
                        for hero in ('karen', 'triton', 'sophie', 'margaret'):
                            meta = hero_status[hero]
                            if (meta['naturalWidth'], meta['naturalHeight']) != (288, 192):
                                raise AssertionError(f'{hero}: unexpected source size {meta}')
                        for scene, (x, y) in SCENES.items():
                            for direction in DIRECTIONS:
                                setup_scene(page, x, y, direction)
                                name = f'{scene}_{direction}_{size}px_{anchor}.png'
                                page.locator('#game').screenshot(path=str(OUT / name))
                                manifest['captures'].append({
                                    'file': name, 'scene': scene, 'direction': direction,
                                    'size': size, 'hero_footline': anchor,
                                    'npc_art_version': npc_status['artVersion'],
                                    'npc_footline': npc_status['footlineStudy']})
                        if errors:
                            raise AssertionError('browser page errors: ' + repr(errors))
                    except Exception as exc:
                        manifest['failures'].append({'size': size, 'anchor': anchor, 'error': str(exc)})
                    finally:
                        page.close()
        finally:
            browser.close()
    # Unscaled 768x480 game-canvas panels. No source art resampling.
    if not manifest['failures']:
        for scene in SCENES:
            sheet = Image.new('RGB', (768 * 6, 504 * 4), '#1a1a1a')
            draw = ImageDraw.Draw(sheet)
            for row, direction in enumerate(DIRECTIONS):
                for col, (size, anchor) in enumerate(
                    (size, anchor) for size in SIZES for anchor in ANCHORS
                ):
                    name = f'{scene}_{direction}_{size}px_{anchor}.png'
                    with Image.open(OUT / name) as shot:
                        if shot.size != (768, 480):
                            raise AssertionError(f'wrong canvas size: {name}: {shot.size}')
                        sheet.paste(shot.convert('RGB'), (col * 768, row * 504 + 24))
                    draw.text((col * 768 + 8, row * 504 + 5),
                              f'{scene} | {direction} | {size}px | {anchor}', fill='white')
            sheet.save(OUT / f'{scene}_native_AB_montage.png', optimize=True)
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    if manifest['failures']:
        raise AssertionError('visual capture incomplete: ' + repr(manifest['failures']))
    if len(manifest['captures']) != len(SIZES) * len(ANCHORS) * len(SCENES) * len(DIRECTIONS):
        raise AssertionError('visual capture count mismatch')
    print(f"CAPTURED {len(manifest['captures'])} real game canvas PNGs; ART HOLD, human visual review required")


if __name__ == '__main__':
    main()
