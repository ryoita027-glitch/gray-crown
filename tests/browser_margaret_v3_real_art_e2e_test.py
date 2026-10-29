#!/usr/bin/env python3
"""Real-asset, real-Chromium V3 visual gate. No paid service or GitHub Actions needed.

Run from the repository root:
    python tests/browser_margaret_v3_real_art_e2e_test.py

This gate proves the candidate actually changes source pixels and produces
same-scale screenshots; it does NOT approve Margaret's visual design.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "prototype_artifacts" / "margaret_v3_real_art_e2e"
POSES = ("idle", "walk", "turn", "talk", "surprise", "approach", "laugh", "run")


class QuietFiles(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        pass


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", 0), QuietFiles)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    url = f"http://127.0.0.1:{server.server_port}"

    try:
        with sync_playwright() as playwright:
            opts = {"headless": True}
            if os.environ.get("CHROMIUM_EXECUTABLE"):
                opts["executable_path"] = os.environ["CHROMIUM_EXECUTABLE"]
            browser = playwright.chromium.launch(**opts)
            page = browser.new_page(viewport={"width": 1440, "height": 950}, device_scale_factor=1)
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(url + "/tools/margaret_silver_study_review.html", wait_until="load")
            page.wait_for_function(
                "() => document.querySelector('#status')?.textContent.includes('：V1 ')",
                timeout=30000,
            )
            assert not errors, "Review page JavaScript errors: " + repr(errors)
            assert page.evaluate("MargaretSilverStudy.mode('')") == 0
            assert page.evaluate("MargaretSilverStudy.mode('?gcMargaretSilver=3')") == 3

            # Capture the real gallery for all four directions at actual 44px.
            for direction in range(4):
                page.select_option("#direction", str(direction))
                page.select_option("#zoom", "1")
                page.locator("#gallery").screenshot(path=str(OUT / f"direction_{direction}_44px.png"))
            page.select_option("#direction", "0")
            page.select_option("#zoom", "4")
            page.locator("#gallery").screenshot(path=str(OUT / "front_pixel_zoom.png"))

            # Run the actual committed JS transform on all eight real PNG pose
            # sheets in Chromium. This is NOT a mock sprite or a reimplementation.
            metrics = page.evaluate(
                """async poses => {
                    const load = src => new Promise((resolve, reject) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = () => reject(new Error('Image load failed: ' + src));
                        image.src = src;
                    });
                    const pixels = source => {
                        const c = document.createElement('canvas');
                        c.width = source.naturalWidth || source.width;
                        c.height = source.naturalHeight || source.height;
                        const ctx = c.getContext('2d', {willReadFrequently:true});
                        ctx.drawImage(source, 0, 0);
                        return ctx.getImageData(0, 0, c.width, c.height);
                    };
                    const result = {};
                    for (const pose of poses) {
                        const src = await load('../assets/characters/margaret/margaret_' + pose + '.png');
                        const candidate = MargaretSilverStudy.makeCandidate(src, 3);
                        if (candidate === src) throw new Error(pose + ': V3 was not generated');
                        const before = pixels(src), after = pixels(candidate);
                        if (before.width !== after.width || before.height !== after.height)
                            throw new Error(pose + ': dimensions changed');
                        if (before.width % 48 || before.height !== 192)
                            throw new Error(pose + ': source cells are not 48px x 4 directions');
                        const additions = [0,0,0,0], changes = [0,0,0,0];
                        for (let y=0; y<before.height; y++) for(let x=0; x<before.width; x++) {
                            const i=(y*before.width+x)*4, dir=Math.floor(y/48);
                            if (before.data[i+3] > after.data[i+3])
                                throw new Error(pose + ': lost original alpha at ' + x + ',' + y);
                            if (y%48>=38 && before.data[i+3]!==after.data[i+3])
                                throw new Error(pose + ': changed footline alpha at ' + x + ',' + y);
                            if (before.data[i+3]<128 && after.data[i+3]>=128) additions[dir]++;
                            if ([0,1,2,3].some(k=>before.data[i+k]!==after.data[i+k]))
                                changes[dir]++;
                        }
                        if (additions.some(n=>n<=0))
                            throw new Error(pose + ': V3 silhouette had no real change in a direction');
                        result[pose] = {size:[before.width,before.height], additions, changes};
                    }
                    return result;
                }""",
                list(POSES),
            )
            assert metrics["walk"]["additions"] == [157, 88, 92, 182], (
                "Pinned PR #122 walk source changed; review the art before updating baseline: "
                + repr(metrics["walk"]["additions"])
            )
            (OUT / "actual_source_metrics.json").write_text(
                json.dumps(metrics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
            )
            assert not errors, "Chromium console errors: " + repr(errors)
            browser.close()
            print("PASS: actual source images, eight poses, four directions, 44px gallery.")
            print(json.dumps(metrics, ensure_ascii=False, indent=2))
            print("ART DECISION: NO-GO pending a substantially better hand-redrawn design.")
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
