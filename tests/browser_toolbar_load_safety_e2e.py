"""Real Chromium regression for both player-visible Load entry points.

Run on the exact PR checkout:
    python tests/browser_toolbar_load_safety_e2e.py

This is intentionally separate from the mandatory full gate until its first
complete, asset-backed run is recorded. It never edits committed saves/assets.
"""
from pathlib import Path
import re
import sys

try:
    from playwright.sync_api import sync_playwright
except ImportError as exc:
    print(f"TOOLBAR LOAD E2E: Playwright unavailable: {exc}", file=sys.stderr)
    sys.exit(2)

from browser_launch import launch_chromium

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "css" / "game.css").read_text(encoding="utf-8")
scripts = re.findall(r'<script src="([^"]+)"></script>', html)
assert scripts and scripts[-1] == "js/game.js", "runtime script order changed"
base_html = re.sub(r'\s*<script src="[^"]+"></script>', "", html)
# Same-origin, deterministic localStorage for the in-memory browser document.
# The test checks actual Save serialization and Load state replacement.
storage_shim = """(()=>{const data=new Map();const storage={
 getItem:k=>data.has(String(k))?data.get(String(k)):null,
 setItem:(k,v)=>data.set(String(k),String(v)),
 removeItem:k=>data.delete(String(k)),clear:()=>data.clear(),
 key:i=>Array.from(data.keys())[i]??null,
 get length(){return data.size}
};Object.defineProperty(window,'localStorage',{value:storage,configurable:true});})();"""


def dismiss_dialogue(page):
    for _ in range(80):
        if not page.locator("#dialogueBox").is_visible():
            return
        if page.evaluate("GC.Dialogue.dialogueTyping()"):
            page.keyboard.press("Enter")
        page.keyboard.press("Enter")
        page.wait_for_timeout(8)
    raise AssertionError("dialogue did not close")


with sync_playwright() as playwright:
    browser = launch_chromium(playwright)
    page = browser.new_page(viewport={"width": 1365, "height": 900})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    # Browser confirm is exercised through the actual button click, not a
    # replaced confirm() function or a VM mock.
    decisions = {"accept": False}
    confirmations = []

    def on_dialog(dialog):
        confirmations.append((dialog.type, dialog.message))
        if decisions["accept"]:
            dialog.accept()
        else:
            dialog.dismiss()

    page.on("dialog", on_dialog)
    page.set_content(base_html, wait_until="domcontentloaded")
    page.add_style_tag(content=css)
    page.add_script_tag(content=storage_shim)
    for script in scripts:
        source = ROOT / script
        assert source.is_file(), f"missing runtime file: {script}"
        page.add_script_tag(content=source.read_text(encoding="utf-8"))
    page.locator("#titleNewGame").click()
    dismiss_dialogue(page)
    assert page.evaluate("GC.Save.canPersistNow('save')"), "intro did not release input"
    page.evaluate("state.gold = 71")
    assert page.evaluate("GC.Save.save(true)"), "checkpoint was not persisted"
    assert page.evaluate("GC.Save.hasUsableStoredAdventure()")

    # Top-bar Load: cancellation must preserve live, unsaved progress.
    page.evaluate("state.gold = 193")
    page.locator("#btnLoad").click()
    assert len(confirmations) == 1 and "未保存" in confirmations[-1][1]
    assert page.evaluate("state.gold") == 193, "cancelled toolbar Load discarded progress"

    # Accepting the same action restores the saved checkpoint exactly once.
    decisions["accept"] = True
    page.locator("#btnLoad").click()
    assert len(confirmations) == 2 and "未保存" in confirmations[-1][1]
    assert page.evaluate("state.gold") == 71, "confirmed toolbar Load did not restore"
    dismiss_dialogue(page)

    # Adventure menu must use the same warning and preserve retry access.
    decisions["accept"] = False
    page.evaluate("state.gold = 224")
    page.keyboard.press("m")
    assert page.locator("#modal").is_visible()
    page.locator('#modalContent button:has-text("ロード")').click()
    assert len(confirmations) == 3 and "未保存" in confirmations[-1][1]
    assert page.locator("#modal").is_visible(), "cancelled menu Load closed the menu"
    assert page.evaluate("state.gold") == 224

    decisions["accept"] = True
    page.locator('#modalContent button:has-text("ロード")').click()
    assert len(confirmations) == 4
    assert page.evaluate("state.gold") == 71
    assert not page.locator("#modal").is_visible()
    dismiss_dialogue(page)

    # A story dialogue blocks loading. No misleading discard prompt is shown.
    page.evaluate("state.gold = 295; say('システム', '読み込み不可の検証')")
    assert page.locator("#dialogueBox").is_visible()
    page.locator("#btnLoad").click()
    assert len(confirmations) == 4, "blocked Load asked a discard question"
    assert page.evaluate("state.gold") == 295
    dismiss_dialogue(page)

    # Without a usable checkpoint, the Save layer must report the problem
    # without suggesting that the current unsaved adventure will be erased.
    page.evaluate("localStorage.clear()")
    page.locator("#btnLoad").click()
    assert len(confirmations) == 4, "missing checkpoint triggered a false warning"
    assert page.evaluate("state.gold") == 295
    assert page.locator("#dialogueBox").is_visible(), "missing-save error was not visible"
    assert not errors, f"uncaught browser errors: {errors}"
    browser.close()

print("TOOLBAR LOAD E2E PASS: cancel, confirm, menu retry, blocked and missing save")
