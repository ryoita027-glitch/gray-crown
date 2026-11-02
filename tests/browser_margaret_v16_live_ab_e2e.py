#!/usr/bin/env python3
"""Actual game-canvas V15 vs V16A/B, same scene, direction and 44px size.

Run in a complete checkout. Never marks experimental art approved.
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
import browser_margaret_live_idle_ab_e2e as baseline

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'prototype_artifacts/margaret_v16_live_ab'
SOURCES = {
    'live_walk': None,
    'v15': 'assets/character_trials/margaret_idle_hair_robe_contact_v15.png',
    'v16a': 'assets/character_trials/margaret_idle_proportion_v16A.png',
    'v16b': 'assets/character_trials/margaret_idle_proportion_v16B.png',
}
LOCKS = {
    'assets/characters/margaret/margaret_walk.png': '1923f1315c377418cea0f2f94ab6431c987f2dd7',
    'assets/character_trials/margaret_idle_hair_robe_contact_v15.png': 'c77fce6ac6630d750112af07f51ed381b612ebd8',
    'assets/character_trials/margaret_idle_proportion_v16A.png': '02f5fdd1c11e0678914f6521baed10aff8044b14',
    'assets/character_trials/margaret_idle_proportion_v16B.png': 'a551d650da20c78f90f786c84ac19010a5106bb7',
    'assets/npc/featured_residents_charm_v5.png': 'b169b58a846e1812dc42f566ca1843a6088e901f',
}
VIEWS = (('desktop', 1365, 900), ('phone', 390, 844))
DIRECTIONS = ('down', 'left', 'right', 'up')


def changed_pixels(a, b):
    delta = ImageChops.difference(a, b)
    r, g, blue = delta.split()
    mask = ImageChops.lighter(ImageChops.lighter(r, g), blue)
    return sum(bool(x) for x in mask.getdata()), mask.getbbox()


def review(view, direction, shots):
    assert [s['key'] for s in shots] == list(SOURCES)
    assert all(s['canvas'] == [768, 480] for s in shots)
    assert all(s['state'] == shots[0]['state'] for s in shots), 'state drift'
    assert all(s['visual'] == shots[0]['visual'] for s in shots), 'camera drift'
    assert all(s['calls'] > 0 and s['nonIdleCalls'] == 0 for s in shots), 'wrong draw source'
    pictures, filenames = [], []
    for s in shots:
        raw = base64.b64decode(s['png'])
        im = Image.open(io.BytesIO(raw)).convert('RGB')
        assert im.size == (768, 480)
        name = f'{view}_{direction}_{s["key"]}.png'
        (OUT / name).write_bytes(raw)
        pictures.append(im)
        filenames.append({'name': name, 'sha256': hashlib.sha256(raw).hexdigest()})
    metrics = {}
    for index in (2, 3):
        count, bbox = changed_pixels(pictures[1], pictures[index])
        assert 0 < count < 2000, f'invisible/unrelated scene change {view}/{direction}/{index}: {count}'
        assert bbox is not None
        assert bbox[2] - bbox[0] <= 48 and bbox[3] - bbox[1] <= 48, (
            f'change escapes Margaret 44px sprite: {bbox}')
        metrics[shots[index]['key']] = {'changed_rgb_pixels': count, 'bbox': bbox,
                                        'same_pose_ab': True}
    board = Image.new('RGB', (768 * 4, 510), '#242424')
    pen = ImageDraw.Draw(board)
    for index, im in enumerate(pictures):
        board.paste(im, (768 * index, 30))
        pen.text((768 * index + 12, 8), f'{view} {direction} / {shots[index]["key"]}',
                 fill='white')
    board_name = f'{view}_{direction}_full_scene.png'
    board.save(OUT / board_name)
    bbox = metrics['v16b']['bbox']
    cx, cy = (bbox[0] + bbox[2]) // 2, (bbox[1] + bbox[3]) // 2
    x0 = max(0, min(768 - 128, cx - 64))
    y0 = max(0, min(480 - 128, cy - 64))
    detail = Image.new('RGB', (256 * 4, 284), '#242424')
    labels = ImageDraw.Draw(detail)
    for index, im in enumerate(pictures):
        crop = im.crop((x0, y0, x0 + 128, y0 + 128))
        detail.paste(crop.resize((256, 256), Image.Resampling.NEAREST),
                     (256 * index, 28))
        labels.text((256 * index + 8, 8), shots[index]['key'], fill='white')
    detail_name = f'{view}_{direction}_detail_2x.png'
    detail.save(OUT / detail_name)
    return {'view': view, 'direction': direction, 'shots': filenames,
            'board': board_name, 'detail': detail_name, 'metrics': metrics,
            'live_walk_vs_v15_DIAGNOSTIC_pixels':
                changed_pixels(pictures[0], pictures[1])[0],
            'art_verdict': 'HOLD'}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, expected in LOCKS.items():
        data = (ROOT / name).read_bytes()
        actual = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
        assert actual == expected, f'asset changed: {name}: {actual}'
    baseline.SOURCES = SOURCES
    records = []
    with helper.served() as url, sync_playwright() as pw:
        browser = launch_chromium(pw)
        try:
            for view, width, height in VIEWS:
                page = browser.new_page(viewport={'width': width, 'height': height},
                                        device_scale_factor=1)
                errors = []
                page.on('pageerror', lambda e: errors.append(str(e)))
                try:
                    page.goto(url, wait_until='networkidle')
                    page.locator('#titleNewGame').click()
                    helper.clean_dialogue(page)
                    page.wait_for_function("""() =>
                      ['karen','triton','sophie','margaret'].every(
                        id => GC.Render.World.heroRuntimeStatus()[id]?.ready)
                    """, timeout=20000)
                    page.wait_for_function("""() =>
                      typeof OpeningPixelAssets !== 'undefined' &&
                      OpeningPixelAssets.featuredStatus().ready &&
                      !OpeningPixelAssets.featuredStatus().failed
                    """, timeout=20000)
                    for direction in DIRECTIONS:
                        records.append(review(view, direction,
                                              baseline.capture_four(page, direction)))
                    assert not errors, errors
                finally:
                    page.close()
        finally:
            browser.close()
    manifest = {
        'kind': 'real Ryune game canvas, seeded village; not normal playthrough',
        'head': helper.source_head(), 'sources': SOURCES, 'blob_locks': LOCKS,
        'views': VIEWS, 'shots': 32, 'full_boards': 8, 'detail_boards': 8,
        'art_verdict': 'HOLD, full-scene human review required', 'records': records,
    }
    (OUT / 'manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Saved 32 actual-canvas PNGs, 8 boards and 8 details at ' + manifest['head'])


if __name__ == '__main__':
    main()
