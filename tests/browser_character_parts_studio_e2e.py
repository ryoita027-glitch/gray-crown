"""Playwright/Pillow evidence for offline part editor, not gameplay certification."""
from __future__ import annotations
import base64
import io
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
DIRECTIONS=('down','left','right','up')
PARTS=('body','head','hairFront','legFar','legNear')

def image_of(url: str) -> Image.Image:
    assert url.startswith('data:image/png;base64,')
    return Image.open(io.BytesIO(base64.b64decode(url.partition(',')[2]))).convert('RGBA')

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        try:
            page=browser.new_page(viewport={'width':1280,'height':900},accept_downloads=True)
            errors=[]
            page.on('pageerror',lambda error: errors.append(str(error)))
            page.goto((ROOT/'tools'/'character_parts_studio.html').as_uri(),wait_until='load')
            assert page.locator('[data-part]').count()==16
            assert '試作を開始' in page.locator('#status').inner_text()
            initial=page.evaluate('window.__characterStudioTest.dataForSheet("idle")')
            assert initial['width']==192 and initial['height']==192
            assert len(initial['missing'])==20
            for row,d in enumerate(DIRECTIONS):
                for i,part in enumerate(PARTS):
                    color=f'#{30+row*36:02x}{45+i*32:02x}{90+row*20:02x}'
                    page.evaluate('([p,d,x,y,c])=>window.__characterStudioTest.paint(p,d,x,y,c)',
                                  [part,d,18+i,12+row,color])
            done=page.evaluate('window.__characterStudioTest.dataForSheet("walk")')
            assert not done['missing']
            assert (done['width'],done['height'])==(288,192)
            sheet=image_of(done['png'])
            for row in range(4):
                assert any(sheet.getpixel((col*48+18,row*48+12+row))[3]>0 for col in range(6))
            with page.expect_download() as dl:
                page.locator('#exportManifest').click()
            with TemporaryDirectory() as tmp:
                path=Path(tmp)/dl.value.suggested_filename
                dl.value.save_as(str(path))
                data=json.loads(path.read_text(encoding='utf-8'))
                assert data['cell']==48
                for part in PARTS:
                    assert set(data['parts'][part]['directions'])==set(DIRECTIONS)
                page.reload(wait_until='load')
                page.locator('#importManifest').set_input_files(str(path))
                page.wait_for_function('window.__characterStudioTest.hasInk("head","up")')
                assert not page.evaluate('window.__characterStudioTest.dataForSheet("idle").missing.length')
            page.set_viewport_size({'width':375,'height':812})
            bounds=page.evaluate('({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})')
            assert bounds['scroll']<=bounds['client']+2,bounds
            assert errors==[],errors
            print('PART STUDIO E2E PASS: 4 directions, PNG sheets, JSON roundtrip, mobile and JS errors')
        finally:
            browser.close()

if __name__=='__main__':
    main()
