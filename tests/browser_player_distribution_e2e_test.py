#!/usr/bin/env python3
"""QA delivered ZIP and single HTML on real Chromium file:// origins.
Real player controls, hero PNG loads, Save/Continue, ZIP-to-single-file
portable-save migration and narrow-viewport screenshots. No Dev Mode writes.
"""
import importlib
import json
import sys
import tempfile
from pathlib import Path
from zipfile import ZipFile

from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/player_distribution_e2e'
OUT.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(ROOT/'tools'))
player_build=importlib.import_module('build_player_release')
single_build=importlib.import_module('build_standalone_html')

def smoke(browser,entry,edition,import_from=None):
    page=browser.new_page(viewport={'width':1280,'height':800},accept_downloads=True)
    errors=[]
    failed_resources=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('requestfailed',lambda r:failed_resources.append(r.url))
    page.goto(entry.as_uri(),wait_until='load')
    first.check(page.locator('#titleNewGame').is_visible(),
                edition+': player title must render')
    page.locator('#titleNewGame').click()
    first.clean_dialogue(page)
    fresh=first.snapshot(page)
    first.check(fresh['map']=='village' and fresh['schema']==23,
                edition+': shipped game failed to boot')
    page.wait_for_function("""() => {
      const r=GC.Render.World.heroRuntimeStatus();
      return ['karen','triton','sophie','margaret'].every(id=>r[id]?.ready);
    }""",timeout=20000)
    page.locator('#game').screenshot(path=str(OUT/(edition+'_01_heroes.png')))

    if import_from is not None:
        exported=json.loads(import_from.read_text(encoding='utf-8'))
        first.check((fresh['x'],fresh['y'])!=(exported['x'],exported['y']),
                    'the transfer fixture must contain a distinct player location')
        page.keyboard.press('m')
        first.check(page.locator('#modal').is_visible(),edition+': import menu missing')
        page.once('dialog',lambda d:d.accept())
        page.locator('#portableSaveUpload').set_input_files(str(import_from))
        page.wait_for_function("""point=>{
          const s=GC.State.get();
          return s.x===point[0]&&s.y===point[1]&&s.schema===23;
        }""",arg=[exported['x'],exported['y']],timeout=8000)
        first.clean_dialogue(page)
        restored=first.snapshot(page)
        first.check(restored['story']==exported['story']['stage'],
                    edition+': imported Story stage diverged')

    # Actual player Save, reload and Continue; browser storage is real here.
    page.locator('#btnSave').click()
    first.clean_dialogue(page)
    stored=page.evaluate("localStorage.getItem('gray-crown-vslice-save-v1')")
    first.check(bool(stored),edition+': Save failed on the delivered file origin')
    saved=json.loads(stored)
    first.check(saved['schema']==23 and saved['map']=='village',
                edition+': save schema or location unexpectedly changed')
    page.reload(wait_until='load')
    first.check(page.locator('#titleContinue').is_enabled(),
                edition+': Continue unavailable after saved file reload')
    page.locator('#titleContinue').click()
    first.clean_dialogue(page)
    resumed=first.snapshot(page)
    first.check(resumed['map']=='village' and resumed['story']==saved['story']['stage'],
                edition+': title Continue did not restore the game')
    before=(resumed['x'],resumed['y'])
    target=(before[0],before[1]-1)
    first.walk_to(page,[target],edition+' real keyboard movement',limit=20)
    after=first.snapshot(page)
    first.check((after['x'],after['y'])!=before,edition+': packaged keyboard movement failed')
    page.locator('#game').screenshot(path=str(OUT/(edition+'_02_after_continue.png')))

    exported_path=None
    if edition=='zip':
        page.keyboard.press('m')
        first.check(page.locator('#modal').is_visible(),'ZIP export menu missing')
        with page.expect_download() as download_event:
            page.locator('#modalContent button').filter(has_text='セーブを書き出す').click()
        download=download_event.value
        exported_path=OUT/'portable_zip_to_onefile.json'
        download.save_as(str(exported_path))
        first.clean_dialogue(page)
        payload=json.loads(exported_path.read_text(encoding='utf-8'))
        first.check(payload['schema']==23 and (payload['x'],payload['y'])==(after['x'],after['y']),
                    'downloaded JSON must preserve actual player location')
    # The narrow layout gets a real captured screenshot, not a CSS-only claim.
    page.set_viewport_size({'width':390,'height':844})
    page.wait_for_timeout(150)
    page.screenshot(path=str(OUT/(edition+'_03_mobile.png')),full_page=True)
    first.check(not errors,edition+': JavaScript exceptions '+repr(errors[:5]))
    first.check(not failed_resources,edition+': asset requests failed '+repr(failed_resources[:5]))
    page.close()
    return ({'edition':edition,'save_continue':True,'hero_sheets_ready':4,
             'portable_import':import_from is not None,
             'portable_export':exported_path is not None,'js_errors':errors},
            exported_path)

def main():
    with tempfile.TemporaryDirectory(prefix='gray-crown-player-') as tmp:
        root=Path(tmp)
        archive=root/'GrayCrown_Play.zip'
        player_build.create(archive)
        with ZipFile(archive) as z:
            first.check(z.testzip() is None,'player ZIP CRC invalid')
            z.extractall(root/'extracted')
        zip_entry=root/'extracted'/'GrayCrown'/'GrayCrown_起動.html'
        onefile=single_build.build()
        first.check(zip_entry.is_file() and onefile.is_file(),'missing player launch HTML')
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            zip_result,transfer=smoke(browser,zip_entry,'zip')
            onefile_result,_=smoke(browser,onefile,'onefile',import_from=transfer)
            browser.close()
    result={'status':'PASS','editions':[zip_result,onefile_result],
            'screenshots':6,'portable_transfer':'ZIP -> one-file via user UI',
            'scope':'technical smoke only, not completed product/visual acceptance'}
    (OUT/'results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
