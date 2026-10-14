#!/usr/bin/env python3
"""Test the actual player ZIP AND one-file HTML, using Chromium, real keyboard
input, title menu, asset images and persisted Save/Continue. Never mutate game
state, mock a victory or substitute a generated screenshot for genuine evidence.
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

def smoke(browser,entry,edition):
    page=browser.new_page(viewport={'width':1280,'height':800})
    errors=[]
    failed_resources=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('requestfailed',lambda r:failed_resources.append(r.url))
    page.goto(entry.as_uri(),wait_until='load')
    first.check(page.locator('#titleNewGame').is_visible(),
                edition+': title must render from delivered game')
    page.locator('#titleNewGame').click()
    first.clean_dialogue(page)
    now=first.snapshot(page)
    first.check(now['map']=='village' and now['schema']==23,
                edition+': actual game not running in the distribution')
    # The four original hero art sheets must load; fallback sprites alone
    # cannot be counted as commercial-ready.
    page.wait_for_function("""() => {
      const r=GC.Render.World.heroRuntimeStatus();
      return ['karen','triton','sophie','margaret'].every(id=>r[id]?.ready);
    }""",timeout=20000)
    page.locator('#game').screenshot(path=str(OUT/(edition+'_01_heroes.png')))
    # The player-facing Save button must write to local storage on this exact
    # file:// origin, then Continue must restore a real game after reload.
    page.locator('#btnSave').click()
    first.clean_dialogue(page)
    stored=page.evaluate("localStorage.getItem('gray-crown-vslice-save-v1')")
    first.check(stored is not None,edition+': Save did not persist')
    saved=json.loads(stored)
    first.check(saved['schema']==23 and saved['map']=='village',
                edition+': unexpected save contents')
    page.reload(wait_until='load')
    first.check(page.locator('#titleContinue').is_enabled(),
                edition+': title cannot Continue the freshly written save')
    page.locator('#titleContinue').click()
    first.clean_dialogue(page)
    resumed=first.snapshot(page)
    first.check(resumed['map']=='village' and resumed['story']==now['story'],
                edition+': save/Continue regression')
    # A real non-DevMode movement input must still work in a delivered build.
    before=(resumed['x'],resumed['y'])
    target=(resumed['x'],max(1,resumed['y']-1))
    first.walk_to(page,[target],edition+' real keyboard step',limit=20)
    after=first.snapshot(page)
    first.check((after['x'],after['y'])!=before,
                edition+': packaged keyboard play failed')
    page.locator('#game').screenshot(path=str(OUT/(edition+'_02_after_continue.png')))
    first.check(not errors,edition+': JS errors '+repr(errors[:5]))
    first.check(not failed_resources,edition+': missing distribution dependencies '+repr(failed_resources[:5]))
    page.close()
    return {'edition':edition,'saved_schema':saved['schema'],'save_continue':True,
            'hero_sheets_loaded':4,'keyboard_step':True,'js_errors':errors,
            'failed_resources':failed_resources}

def main():
    with tempfile.TemporaryDirectory(prefix='gray-crown-release-e2e-') as tmp:
        root=Path(tmp)
        archive=root/'GrayCrown_Play.zip'
        player_build.create(archive)
        with ZipFile(archive) as z:
            first.check(z.testzip() is None,'player ZIP CRC invalid')
            z.extractall(root/'unpacked')
        zip_entry=root/'unpacked'/'GrayCrown'/'GrayCrown_起動.html'
        onefile=single_build.build()
        first.check(zip_entry.is_file() and onefile.is_file(),'missing delivered launch HTML')
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            rows=[
                smoke(browser,zip_entry,'zip'),
                smoke(browser,onefile,'onefile'),
            ]
            browser.close()
    result={'status':'PASS','editions':rows,'screenshots':4,
            'claim':'Chromium file-origin QA only, not full 8-12h final production acceptance'}
    (OUT/'results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
