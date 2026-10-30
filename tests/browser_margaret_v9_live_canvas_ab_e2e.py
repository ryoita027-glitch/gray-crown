#!/usr/bin/env python3
"""Actual Gray Crown game-canvas Margaret original vs V9 review (ART HOLD).

Run from a complete checkout:
    python tests/browser_margaret_v9_live_canvas_ab_e2e.py

This is a *visual evidence generator*, not a design approval or a release gate.
It substitutes only the HTTP response for Margaret's field walk PNG inside a
throwaway browser context. No production file, save or game JS is modified.
"""
from __future__ import annotations

import functools
import hashlib
import math
import http.server
import json
import threading
from contextlib import contextmanager
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / 'assets/characters/margaret/margaret_walk.png'
CANDIDATE = ROOT / 'assets/characters/margaret/studies/margaret_silver_planes_v9_walk.png'
NPC_V5 = ROOT / 'assets/npc/featured_residents_charm_v5.png'
OUT = ROOT / 'prototype_artifacts/margaret_v9_live_canvas_ab_20261031'
SCENES = {'village_wide': (12, 12), 'envoy_contact': (12, 8), 'mayor_contact': (7, 10)}
DIRECTIONS = ('down', 'left', 'right', 'up')
VARIANTS = ('original', 'v9_study')


class QuietFiles(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


@contextmanager
def local_server():
    handler = functools.partial(QuietFiles, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        yield f'http://127.0.0.1:{server.server_port}'
    finally:
        server.shutdown()
        server.server_close()
        worker.join(timeout=5)


def sha256(file: Path) -> str:
    return hashlib.sha256(file.read_bytes()).hexdigest()


def validate_atlases():
    for path, size in ((ORIGINAL, (288, 192)), (CANDIDATE, (288, 192)),
                       (NPC_V5, (432, 192))):
        with Image.open(path) as image:
            allowed_modes = ('P', 'RGBA') if path == NPC_V5 else ('RGBA',)
            if image.size != size or image.mode not in allowed_modes:
                raise AssertionError(f'{path.name}: expected {allowed_modes} {size}, got {image.mode} {image.size}')
    with Image.open(ORIGINAL) as a, Image.open(CANDIDATE) as b:
        if a.getchannel('A').tobytes() != b.getchannel('A').tobytes():
            raise AssertionError('V9 changed original walk transparency/footline')
        original = a.tobytes()
        study = b.tobytes()
    changed = [0] * 24
    for direction in range(4):
        for frame in range(6):
            for y in range(48):
                for x in range(48):
                    pos = ((direction * 48 + y) * 288 + frame * 48 + x) * 4
                    if original[pos:pos+3] != study[pos:pos+3]:
                        changed[direction * 6 + frame] += 1
    if not all(changed):
        raise AssertionError(f'V9 has unchanged walk frames: {changed}')
    return changed


def set_scene(page, x, y, direction):
    # Same real village map, NPCs, four-hero party, camera and idle frame.
    # Only the temporary in-memory state is changed, not the save file.
    result = page.evaluate('''([x,y,direction]) => {
      const s=GC.State.get();
      s.map='village';s.x=x;s.y=y;s.dir=direction;
      s.trail=[[x-1,y],[x-2,y],[x-3,y]];
      s.worldStepsOnMap=3;
      GC.Render.World.VISUAL.map=null;
      GC.Render.World.drawScene();
      const v=GC.Render.World.VISUAL;
      return {map:s.map,x:s.x,y:s.y,dir:s.dir,
              trail:s.trail.map(p=>p.join(',')),
              display:GC.Render.World.heroVisualStudyStatus().display,
              camera:[v.camX,v.camY],player:[v.playerX,v.playerY],
              followers:v.followers.map(p=>[...p])};
    }''', [x, y, direction])
    if result['display'] != 44 or result['map'] != 'village' or result['dir'] != direction:
        raise AssertionError(f'Incorrect review state: {result}')
    if len(set(result['trail'] + [f'{x},{y}'])) != 4:
        raise AssertionError('Party positions overlap')
    return result


def capture_variant(browser, base, variant, manifest):
    context = browser.new_context(viewport={'width': 1280, 'height': 900},
                                  device_scale_factor=1, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    substituted = []
    if variant == 'v9_study':
        def replace_walk(route):
            substituted.append(route.request.url)
            route.fulfill(status=200, content_type='image/png', body=CANDIDATE.read_bytes())
        page.route('**/assets/characters/margaret/margaret_walk.png', replace_walk)
    try:
        page.goto(base + '/index.html?gcHeroDisplay=44', wait_until='networkidle')
        page.locator('#titleNewGame').click()
        for _ in range(4):
            page.keyboard.press('Space')
            page.wait_for_timeout(65)
        page.evaluate('() => GC.Dialogue.closeDialogue(false)')
        page.wait_for_function('''() => {
          const s=GC.Render?.World?.heroRuntimeStatus?.();
          return s && ['karen','triton','sophie','margaret'].every(id=>s[id]?.ready);
        }''', timeout=15000)
        page.wait_for_function('''() => typeof OpeningPixelAssets!=='undefined' &&
          OpeningPixelAssets.featuredStatus().ready''', timeout=15000)
        status = page.evaluate('''() => ({
          heroes:GC.Render.World.heroRuntimeStatus(),
          visual:GC.Render.World.heroVisualStudyStatus(),
          npc:OpeningPixelAssets.featuredStatus()
        })''')
        if status['visual'] != {'display': 44, 'footline': 'default'}:
            raise AssertionError(f'Unexpected scale/anchor: {status["visual"]}')
        if status['npc'].get('footlineStudy') != 'default':
            raise AssertionError('Rejected V5 NPC footline experiment active')
        for hero, record in status['heroes'].items():
            if (record['naturalWidth'], record['naturalHeight']) != (288, 192):
                raise AssertionError(f'{hero} runtime source is not 288x192: {record}')
        # Ambient NPC/water frames use Date.now; freeze only in this throwaway
        # browser context so two separate contexts represent the same instant.
        page.evaluate('() => { Date.now = () => 1793400000000; }')
        for scene, (x, y) in SCENES.items():
            for direction in DIRECTIONS:
                state = set_scene(page, x, y, direction)
                filename = f'{scene}_{direction}_{variant}.png'
                page.locator('#game').screenshot(path=str(OUT / filename), animations='disabled')
                manifest['captures'].append({'variant': variant, 'scene': scene,
                                             'direction': direction, 'file': filename,
                                             'state': state})
        if variant == 'v9_study' and len(substituted) != 1:
            raise AssertionError(f'V9 image response substitution count={len(substituted)}')
        if errors:
            raise AssertionError(f'Browser page errors: {errors}')
        manifest['runtime'][variant] = {
            'npc_art_version': status['npc'].get('artVersion'),
            'npc_footline': status['npc'].get('footlineStudy'),
            'display': status['visual']['display'],
            'margaret_source_substitutions': len(substituted),
        }
    finally:
        context.close()


def compare_and_montage(manifest):
    states = {(c['variant'], c['scene'], c['direction']): c['state']
              for c in manifest['captures']}
    manifest['outside_margaret_pixel_differences'] = {}
    manifest['margaret_screen_boxes'] = {}
    for scene in SCENES:
        sheet = Image.new('RGB', (768 * 2, 504 * 4), '#1b201c')
        pen = ImageDraw.Draw(sheet)
        details = Image.new('RGB', (2 * 256, 4 * 276), '#1b201c')
        detail_pen = ImageDraw.Draw(details)
        for row, direction in enumerate(DIRECTIONS):
            a_state = states[('original', scene, direction)]
            b_state = states[('v9_study', scene, direction)]
            if a_state != b_state:
                raise AssertionError(f'Camera/party/pose mismatch: {scene}/{direction}: {a_state} vs {b_state}')
            # Derive the expected on-screen Margaret rectangle from the exact
            # world.js hero anchor (24,44), 44px sprite and village scale 1.16.
            # A difference elsewhere is a moving-camera/ambient/NPC confound,
            # not evidence that Margaret's sprite is better or even visible.
            if len(a_state['followers']) != 3:
                raise AssertionError('Four-hero party not established in capture')
            mx, my = a_state['followers'][2]
            cam_x, cam_y = a_state['camera']
            world_x = round(round(mx * 32) + 16 - 24 * 44 / 48)
            world_y = round(round(my * 32) + 30 - 44 * 44 / 48)
            left = math.floor((world_x - cam_x) * 1.16) - 5
            top = math.floor((world_y - cam_y) * 1.16) - 5
            right = math.ceil((world_x + 44 - cam_x) * 1.16) + 5
            bottom = math.ceil((world_y + 44 - cam_y) * 1.16) + 5
            if not (0 <= left < right <= 768 and 0 <= top < bottom <= 480):
                raise AssertionError(f'Margaret crop outside canvas: {scene}/{direction} {(left,top,right,bottom)}')
            box = (left, top, right, bottom)
            manifest['margaret_screen_boxes'][f'{scene}/{direction}'] = list(box)
            originals = []
            for col, variant in enumerate(VARIANTS):
                filename = f'{scene}_{direction}_{variant}.png'
                with Image.open(OUT / filename) as source:
                    if source.size != (768, 480):
                        raise AssertionError(f'Unexpected game canvas size: {filename} {source.size}')
                    original = source.convert('RGB')
                originals.append(original)
                cx, cy = (left + right) // 2, (top + bottom) // 2
                detail_box = (cx - 32, cy - 32, cx + 32, cy + 32)
                if detail_box[0] < 0 or detail_box[1] < 0 or detail_box[2] > 768 or detail_box[3] > 480:
                    raise AssertionError(f'64px detail crop outside canvas: {scene}/{direction}')
                detail = original.crop(detail_box).resize((256, 256), Image.Resampling.NEAREST)
                details.paste(detail, (col * 256, row * 276 + 20))
                detail_pen.text((col * 256 + 5, row * 276 + 3),
                                f'{direction} {variant} | 4x diagnostic', fill='white')
                pen.text((col * 768 + 8, row * 504 + 5),
                         f'{scene} | {direction} | {variant} | 44px', fill='white')
                sheet.paste(original, (col * 768, row * 504 + 24))
            a, b = originals
            changed = outside = 0
            for index, (first, second) in enumerate(zip(a.getdata(), b.getdata())):
                if first == second:
                    continue
                changed += 1
                y, x = divmod(index, 768)
                if not (left <= x < right and top <= y < bottom):
                    outside += 1
            key = f'{scene}/{direction}'
            manifest['canvas_pixel_differences'][key] = changed
            manifest['outside_margaret_pixel_differences'][key] = outside
            if not changed:
                raise AssertionError(f'Candidate did not affect visible canvas: {key}')
            if outside:
                raise AssertionError(f'Uncontrolled pixels outside Margaret: {key}, {outside} pixels. A/B is invalid.')
        sheet.save(OUT / f'{scene}_native_game_canvas_ab.png', optimize=True)
        details.save(OUT / f'{scene}_margaret_detail_4x_DIAGNOSTIC.png', optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {
        'status': 'ART_HOLD', 'aesthetic_approval': False,
        'evidence_type': 'real Chromium game canvas, not static atlas mockup',
        'original_sha256': sha256(ORIGINAL), 'candidate_sha256': sha256(CANDIDATE),
        'npc_v5_sha256': sha256(NPC_V5), 'walk_rgb_changed_per_frame': validate_atlases(),
        'runtime': {}, 'captures': [], 'canvas_pixel_differences': {}, 'errors': [],
    }
    try:
        with local_server() as base, sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            try:
                for variant in VARIANTS:
                    capture_variant(browser, base, variant, manifest)
            finally:
                browser.close()
        if len(manifest['captures']) != len(VARIANTS) * len(SCENES) * len(DIRECTIONS):
            raise AssertionError('Missing game canvas captures')
        compare_and_montage(manifest)
    except Exception as exc:
        manifest['errors'].append(str(exc))
        raise
    finally:
        (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n',
                                           encoding='utf-8')
    print(f"Captured {len(manifest['captures'])} actual game canvases, {len(SCENES)} native A/B sheets and 4x detail diagnostics.")
    print('ART HOLD: screenshot difference is not proof of improved character design.')


if __name__ == '__main__':
    main()
