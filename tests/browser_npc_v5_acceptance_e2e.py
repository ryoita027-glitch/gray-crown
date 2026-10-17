#!/usr/bin/env python3
"""Exact-HEAD NPC V5 real Chromium QA.

Captures (1) natural New Game opening, (2) seeded village/capital A/B
screenshots, and (3) real UI Save/reload/Continue on the default desktop.
Seeded images are explicitly visual fixtures and never count as story progress.
This script does not approve art or claim a full vertical-slice playthrough.
"""
import argparse
import json
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as base

ROOT = Path(__file__).resolve().parents[1]
VIEWS = {"desktop": (1280, 900), "mobile": (390, 844)}
SCENES = {"ryune": ("village", 12, 9), "capital": ("capital", 11, 8)}
KEY = "gray-crown-vslice-save-v1"


def head_sha():
    return subprocess.check_output(
        ["git", "rev-parse", "--verify", "HEAD"], cwd=ROOT, text=True
    ).strip()


def validate_page(page, mode, view, out, sha):
    errors, resources = [], []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("response", lambda r: resources.append({
        "path": r.url.split("?")[0].split("/")[-1], "status": r.status
    }) if "/assets/npc/" in r.url else None)
    query = "?npcArt=legacy" if mode == "legacy" else ""
    with base.served() as url:
        page.goto(url + query, wait_until="load", timeout=30000)
        assert page.locator("#titleNewGame").is_visible(), "New Game unavailable"
        page.locator("#titleNewGame").click()
        base.clean_dialogue(page)
        page.wait_for_function(
            """() => typeof OpeningPixelAssets !== 'undefined'
               && OpeningPixelAssets.featuredStatus().ready""",
            timeout=20000
        )
        status = page.evaluate("OpeningPixelAssets.featuredStatus()")
        assert status["count"] == 9 and not status["failed"], status
        expected = ("featured_residents_v1.png" if mode == "legacy"
                    else "featured_residents_charm_v5.png")
        assert any(x["path"] == expected and x["status"] == 200
                   for x in resources), {"expected": expected, "loaded": resources}
        first_state = base.snapshot(page)
        assert first_state["map"] == "village" and first_state["schema"] == 23
        actual_mode = "classic-v1" if mode == "legacy" else "concept-charm-v5"
        assert status["artVersion"] == actual_mode, status
        opening_name = f"{view}_{mode}_new_game.png"
        page.locator("#game").screenshot(path=str(out / opening_name))
        seed_files = []
        for label, (scene_map, x, y) in SCENES.items():
            # State injection is solely for image review; not progression proof.
            page.evaluate("""([m,x,y]) => {
                const s = GC.State.get();
                s.map = m; s.x = x; s.y = y; s.dir = 'down';
                document.querySelector('#dialogueBox')?.classList.add('hidden');
                GC.Render.World.VISUAL.map = null;
                GC.Render.World.drawScene();
            }""", [scene_map, x, y])
            page.wait_for_timeout(180)
            filename = f"{view}_{mode}_seeded_{label}.png"
            page.locator("#game").screenshot(path=str(out / filename))
            seed_files.append(filename)

        # Reload is mandatory before Save QA: seeded scenes cannot masquerade
        # as visited locations in the player's real save file.
        save = {"tested": False}
        if mode == "v5" and view == "desktop":
            page.goto(url, wait_until="load")
            page.locator("#titleNewGame").click()
            base.clean_dialogue(page)
            pristine = base.snapshot(page)
            assert pristine["map"] == "village"
            page.locator("#btnSave").click()
            base.clean_dialogue(page)
            raw = page.evaluate(f"localStorage.getItem('{KEY}')")
            assert raw, "Save did not write browser localStorage"
            stored = json.loads(raw)
            assert stored["schema"] == 23 and stored["map"] == "village", stored
            assert stored["story"]["stage"] == pristine["story"]
            page.reload(wait_until="load")
            assert page.locator("#titleContinue").is_enabled(), "Continue disabled"
            page.locator("#titleContinue").click()
            base.clean_dialogue(page)
            restored = base.snapshot(page)
            for field in ["map", "x", "y", "dir", "story", "schema"]:
                assert restored[field] == pristine[field], {
                    "field": field, "before": pristine, "after": restored
                }
            moved = False
            for key in ["ArrowUp", "ArrowLeft", "ArrowRight", "ArrowDown"]:
                page.keyboard.press(key)
                page.wait_for_timeout(185)
                after = base.snapshot(page)
                if (after["x"], after["y"]) != (restored["x"], restored["y"]):
                    moved = True
                    break
            assert moved, "real keyboard movement did not change position"
            continued = "desktop_v5_real_save_continue.png"
            page.locator("#game").screenshot(path=str(out / continued))
            save = {"tested": True, "passed": True, "schema": 23,
                    "continued_screenshot": continued,
                    "real_keyboard_movement": moved}
        assert not errors, {"errors": errors}
        return {"source_sha": sha, "view": view, "art": mode,
                "opening": opening_name, "visual_only": seed_files,
                "scene_fixture_is_not_real_progression": True,
                "png_resources": resources, "status": status,
                "real_save_continue": save, "page_errors": errors}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--expected-head", required=True)
    p.add_argument("--out", type=Path,
                   default=ROOT / "prototype_artifacts/npc_v5_same_head")
    args = p.parse_args()
    sha = head_sha()
    assert sha == args.expected_head, {
        "error": "SOURCE HEAD MISMATCH", "expected": args.expected_head,
        "actual": sha
    }
    args.out.mkdir(parents=True, exist_ok=True)
    rows = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        try:
            for view, (width, height) in VIEWS.items():
                for mode in ["v5", "legacy"]:
                    page = browser.new_page(
                        viewport={"width": width, "height": height},
                        device_scale_factor=1
                    )
                    try:
                        rows.append(validate_page(page, mode, view, args.out, sha))
                    finally:
                        page.close()
        finally:
            browser.close()
    manifest = {
        "head": sha,
        "result": "TECHNICAL VISUAL/INPUT GATE ONLY",
        "real_full_route_completed": False,
        "seeded_screens_are_not_real_story_progression": True,
        "human_player_acceptance": "PENDING",
        "desktop_mobile_visuals": len(rows),
        "real_save_continue_passed": any(
            r["real_save_continue"].get("passed") for r in rows
        ),
        "results": rows
    }
    (args.out / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "head": sha, "views": len(rows), "save_continue": True,
        "human_approval": "PENDING", "output": str(args.out)
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
