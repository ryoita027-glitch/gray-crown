#!/usr/bin/env python3
"""Prove that actual Karen variants are drawn to the real Gray Crown canvas.

This diagnostic does NOT represent uninterrupted game QA or art approval.
It deliberately works in an isolated seeded village after the intro, and
records the exact candidate IMG element passed through Canvas.drawImage().
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "prototype_artifacts/karen_actual_canvas_gate"
CHOICES = (
    ("original", "karen_walk.png", 48),
    ("eyes", "karen_A_eye_clarity_48x56_4dir.png", 56),
    ("crown", "karen_B_crown_space_48x56_4dir.png", 56),
    ("balanced", "karen_C_balanced_48x56_4dir.png", 56),
)
VIEWS = (("desktop", 1280, 800), ("mobile_390", 390, 844))

JS_INSTALL_TRACE = """() => {
 const canvas=document.getElementById('game');
 if(!canvas || !canvas.getContext) throw Error('No real game canvas');
 const ctx=canvas.getContext('2d');
 window.__karenDraws=[];
 if(!ctx.__karenTraceInstalled){
   const nativeDraw=ctx.drawImage.bind(ctx);
   ctx.drawImage=function(...args){
     const im=args[0];
     const src=String(im?.currentSrc||im?.src||'');
     if(src.includes('/characters/karen/karen_walk.png') ||
       src.includes('/character_parts/karen_face_phase1b/variants/')){
        window.__karenDraws.push({
          src, originalSourceX:args[1], originalSourceY:args[2],
          cropW:args[3], cropH:args[4],
          destW:args[7], destH:args[8]
        });
     }
     return nativeDraw(...args);
   };
   ctx.__karenTraceInstalled=true;
 }
 return true;
}"""

JS_CAPTURE = """choice => {
 const render=GC.Render.World;
 if(GC.CommercialActing?.active?.()) throw Error('Dialogue acting took over player image');
 GC.KarenFaceVariants.choose(choice);
 cancelAnimationFrame(render.VISUAL.raf);
 window.__karenDraws.length=0;
 render.drawScene();
 return {draws:window.__karenDraws.slice(),
         selected:GC.KarenFaceVariants.state().selected,
         images:GC.KarenFaceVariants.state().images};
}"""

def collect(browser, url, label, width, height):
    page = browser.new_page(viewport={"width": width, "height": height},
                            reduced_motion="reduce")
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    try:
        page.goto(url + "?gcKarenFace=2", wait_until="networkidle")
        assert page.evaluate("GC.KarenFaceVariants.active()")
        page.locator("#titleNewGame").click()
        first.clean_dialogue(page)
        page.wait_for_function("""() =>
          ['karen','triton','sophie','margaret'].every(
            id => GC.Render.World.heroRuntimeStatus()[id].ready
          ) && ['eyes','crown','balanced'].every(
            key => GC.KarenFaceVariants.state().images[key]?.ready
          )
        """, timeout=30000)
        page.evaluate("""() => {
          const s=GC.State.get();
          s.map='village';s.x=12;s.y=12;s.dir='down';
          GC.Render.World.VISUAL.map=null;
          // The commercial dialogue sprite would bypass drawHeroSpriteSheet.
          // Disable it ONLY in this diagnostic: normal gameplay is untouched.
          GC.CommercialActing.enabled=false;
          GC.Render.World.drawScene();
        }""")
        page.evaluate(JS_INSTALL_TRACE)
        def gameplay_hash():
            state = page.evaluate("""() => {
               const s=GC.State.get();
               return JSON.stringify({schema:s.schema,map:s.map,x:s.x,y:s.y,
                 dir:s.dir,party:s.party,story:s.story,inventory:s.inventory,
                 world:s.world,events:s.events,gold:s.gold});
            }""")
            return hashlib.sha256(state.encode("utf-8")).hexdigest()
        before = gameplay_hash()
        results = {}
        for choice, expected_file, expected_source_h in CHOICES:
            result = page.evaluate(JS_CAPTURE, choice)
            draws = [d for d in result["draws"] if expected_file in d["src"]]
            assert draws, (
                f"{label} {choice}: candidate never reached the real world "
                f"Canvas.drawImage() (not simply an absent PNG)"
            )
            assert any(d["cropH"] == expected_source_h for d in draws), (
                label, choice, "wrong source crop height", draws
            )
            assert all(abs(d["destW"] / 48 - d["destH"] / expected_source_h)
                       < .00001 for d in draws), (
                label, choice, "nonuniform sprite scale", draws
            )
            screenshot = page.locator("#game").screenshot(
                path=str(OUT / f"{label}_{choice}.png"))
            results[choice] = {
                "drawing_source": expected_file,
                "draw_count": len(draws),
                "canvas_screenshot_sha256": hashlib.sha256(screenshot).hexdigest(),
            }
            assert page.evaluate("GC.KarenFaceVariants.idleSprite('karen',1)===null")
        assert gameplay_hash() == before, f"{label}: game state changed by visual trial"
        assert not errors, errors[:8]
        return {"device": label, "choices": results, "errors": errors,
                "gameplay_state_unchanged": True}
    finally:
        page.close()

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with first.served() as url, sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            screens = [collect(browser, url, *view) for view in VIEWS]
            regular = browser.new_page()
            try:
                regular.goto(url, wait_until="networkidle")
                assert not regular.evaluate("GC.KarenFaceVariants.active()")
                assert regular.locator("#gcKarenVariants").count() == 0
            finally:
                regular.close()
        finally:
            browser.close()
    report = {
        "sha": first.source_head(),
        "purpose": "Real canvas drawImage source-path proof and pixel-aligned crop",
        "screenshots": 8,
        "notes": "Seeded village; commercial acting disabled in diagnostic only.",
        "results": screens,
        "human_art_approval": False,
        "full_game_regression_completed": False,
        "release": "NO_GO"
    }
    (OUT / "manifest.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"sha": report["sha"], "proofs": 8, "release": "NO_GO"},
                     ensure_ascii=False))

if __name__ == "__main__":
    main()
