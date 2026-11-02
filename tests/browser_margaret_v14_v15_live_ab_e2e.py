#!/usr/bin/env python3
"""Actual Gray Crown canvas: default walk, authored idle, V14A and V15.

Only a seeded visual fixture. Does not change saved data or approve artwork.
Run from a full checkout: python tests/browser_margaret_v14_v15_live_ab_e2e.py
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
import browser_margaret_live_idle_ab_e2e as baseline

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'prototype_artifacts/margaret_v14_v15_live_ab'
SOURCES = {
    'live_walk': None,
    'authored_idle': 'assets/characters/margaret/margaret_idle.png',
    'v14a': 'assets/character_trials/margaret_idle_neck_torso_v14A.png',
    'v15': 'assets/character_trials/margaret_idle_hair_robe_contact_v15.png',
}
BLOBS = {
    'assets/characters/margaret/margaret_walk.png': '1923f1315c377418cea0f2f94ab6431c987f2dd7',
    'assets/characters/margaret/margaret_idle.png': '910458eabfcfaef7442f885f319d0e2a09c88a66',
    'assets/character_trials/margaret_idle_neck_torso_v14A.png': '8199e32c264e86a1a07b0b3a5ab90877126c41d1',
    'assets/character_trials/margaret_idle_hair_robe_contact_v15.png': 'c77fce6ac6630d750112af07f51ed381b612ebd8',
    'assets/npc/featured_residents_charm_v5.png': 'b169b58a846e1812dc42f566ca1843a6088e901f',
}
VIEWS = (('desktop', 1365, 900), ('phone', 390, 844))
DIRECTIONS = ('down', 'left', 'right', 'up')


def diff(a, b):
    delta = ImageChops.difference(a, b)
    red, green, blue = delta.split()
    mask = ImageChops.lighter(ImageChops.lighter(red, green), blue)
    return sum(bool(p) for p in mask.getdata()), mask.getbbox()


def review(view, direction, shots):
    assert [s['key'] for s in shots] == list(SOURCES)
    assert all(s['canvas'] == [768, 480] for s in shots)
    assert all(s['state'] == shots[0]['state'] for s in shots), 'state drift'
    assert all(s['visual'] == shots[0]['visual'] for s in shots), 'camera/follower drift'
    assert all(s['calls'] > 0 and s['nonIdleCalls'] == 0 for s in shots), 'not stationary Margaret'
    pictures, files = [], []
    for s in shots:
        data = base64.b64decode(s['png'])
        pic = Image.open(io.BytesIO(data)).convert('RGB')
        assert pic.size == (768, 480)
        name = f'{view}_{direction}_{s["key"]}.png'
        (OUT / name).write_bytes(data)
        pictures.append(pic)
        files.append({'name': name, 'sha256': hashlib.sha256(data).hexdigest(),
                      'margaret_draw_calls': s['calls']})
    # Same-pose A/B is V14A -> V15. Live walk -> idle is only a diagnostic.
    changed, bbox = diff(pictures[2], pictures[3])
    assert changed > 0 and bbox is not None, f'V15 invisible: {view}/{direction}'
    assert changed < 2000, f'unexpected full-scene change: {changed}'
    assert bbox[2]-bbox[0] <= 48 and bbox[3]-bbox[1] <= 48, (
        f'change escapes one 44px sprite: {bbox}')
    board = Image.new('RGB', (768*4, 510), '#242424')
    pen = ImageDraw.Draw(board)
    for i, pic in enumerate(pictures):
        board.paste(pic, (768*i, 30))
        pen.text((768*i+10, 9), f'{view} {direction} / {shots[i]["key"]}', fill='white')
    board_file = f'{view}_{direction}_full_scene.png'
    board.save(OUT / board_file)
    cx, cy = (bbox[0]+bbox[2])//2, (bbox[1]+bbox[3])//2
    x0 = max(0, min(768-128, cx-64))
    y0 = max(0, min(480-128, cy-64))
    detail = Image.new('RGB', (256*4, 284), '#242424')
    labels = ImageDraw.Draw(detail)
    for i, pic in enumerate(pictures):
        crop = pic.crop((x0, y0, x0+128, y0+128))
        detail.paste(crop.resize((256, 256), Image.Resampling.NEAREST), (256*i, 28))
        labels.text((256*i+8, 8), shots[i]['key'], fill='white')
    detail_file = f'{view}_{direction}_detail_2x.png'
    detail.save(OUT / detail_file)
    diagnostic, _ = diff(pictures[0], pictures[1])
    return {'view': view, 'direction': direction, 'files': files,
            'board': board_file, 'detail': detail_file,
            'detail_crop': [x0, y0, 128, 128],
            'v14a_vs_v15_rgb_pixels': changed, 'v14a_vs_v15_bbox': bbox,
            'live_walk_vs_authored_idle_DIAGNOSTIC_pixels': diagnostic,
            'same_pose_ab': True, 'art_verdict': 'HOLD'}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for path, expected in BLOBS.items():
        data = (ROOT / path).read_bytes()
        actual = hashlib.sha1(
            b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
        assert actual == expected, f'asset changed: {path}: {actual}'
    baseline.SOURCES = SOURCES
    records = []
    with helper.served() as url, sync_playwright() as pw:
        browser = launch_chromium(pw)
        try:
            for view, width, height in VIEWS:
                page = browser.new_page(viewport={'width': width, 'height': height},
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
    manifest = {'kind': 'real game canvas, seeded Ryune village, not a playthrough',
                'head': helper.source_head(), 'sources': SOURCES,
                'asset_blob_locks': BLOBS, 'views': VIEWS,
                'images': 32, 'full_boards': 8, 'detail_boards': 8,
                'art_verdict': 'HOLD; human 44px review required',
                'records': records}
    (OUT / 'manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"Saved 32 live-canvas PNGs, 8 full boards, 8 details at {manifest['head']}")


if __name__ == '__main__':
    main()
