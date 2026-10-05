from browser_launch import launch_chromium
from pathlib import Path
import re
import sys

try:
    from playwright.sync_api import sync_playwright
except Exception as exc:
    print(f'BROWSER STARTUP TEST: Playwright unavailable: {exc}', file=sys.stderr)
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
CSS = ROOT / 'css' / 'game.css'

html = INDEX.read_text(encoding='utf-8')
script_order = re.findall(r'<script src="([^"]+)"></script>', html)
if not script_order:
    raise AssertionError('index.html contains no runtime scripts')
# Real Chromium DOM, but script files are injected in the exact order declared by index.html.
# This environment blocks file:// and localhost navigation, so opaque-origin localStorage is
# replaced with a browser-side in-memory implementation. Save/load serialization is covered
# separately by the Node regression suite.
html_without_scripts = re.sub(r'\s*<script src="[^"]+"></script>', '', html)
local_storage_shim = r"""
(()=>{const d=new Map();const ls={
 getItem:k=>d.has(String(k))?d.get(String(k)):null,
 setItem:(k,v)=>d.set(String(k),String(v)),
 removeItem:k=>d.delete(String(k)),clear:()=>d.clear(),
 key:i=>Array.from(d.keys())[i]??null,get length(){return d.size}
};Object.defineProperty(window,'localStorage',{value:ls,configurable:true});})();
"""

with sync_playwright() as p:
    browser = launch_chromium(p)
    page = browser.new_page(viewport={'width': 1365, 'height': 900})
    page_errors = []
    page.on('pageerror', lambda err: page_errors.append(str(err)))

    page.set_content(html_without_scripts, wait_until='domcontentloaded')
    page.add_style_tag(content=CSS.read_text(encoding='utf-8'))
    page.add_script_tag(content=local_storage_shim)
    for rel in script_order:
        path = ROOT / rel
        if not path.exists():
            raise AssertionError(f'missing runtime script declared by index.html: {rel}')
        page.add_script_tag(content=path.read_text(encoding='utf-8'))

    page.wait_for_timeout(120)
    assert page.locator('#titleScreen').is_visible(), 'title screen is not visible after boot'
    assert page.locator('#titleNewGame').is_enabled(), 'New Game button is not enabled'

    page.locator('#titleNewGame').click()
    page.wait_for_timeout(60)
    assert not page.locator('#titleScreen').is_visible(), 'title screen did not hide after New Game'
    assert page.locator('#dialogueBox').is_visible(), 'intro dialogue did not open'

    # First press completes the typewriter, second press advances/closes the intro page.
    page.keyboard.press('Enter')
    page.wait_for_timeout(30)
    page.keyboard.press('Enter')
    page.wait_for_timeout(60)

    state = page.evaluate('GC.State.get()')
    assert state['map'] == 'village', f"expected village, got {state['map']}"
    assert state['locked'] is False, 'player remains locked after intro dialogue'
    before = (state['x'], state['y'])

    page.keyboard.press('ArrowUp')
    page.wait_for_timeout(120)
    moved = page.evaluate('GC.State.get()')
    after = (moved['x'], moved['y'])
    assert after != before, f'player did not move from spawn: {before} -> {after}'
    assert moved['map'] == 'village', 'movement unexpectedly changed maps'
    assert not page_errors, f'page errors during startup: {page_errors}'

    browser.close()

print('BROWSER STARTUP TEST PASS: index -> title -> New Game -> village -> movement')
