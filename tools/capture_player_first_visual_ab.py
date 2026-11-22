#!/usr/bin/env python3
"""Same-camera REAL Chromium screenshots from two checked-out builds.

Visual-only seeded frames, NOT a normal-input route completion or a human
aesthetic approval. Every frame includes the exact git SHA of its source.
"""
import argparse
import contextlib
import functools
import http.server
import json
import subprocess
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

SCENES = {
    "ryune-center": ("village", 12, 9),
    "ryune-south": ("village", 12, 12),
    "capital-square": ("capital", 11, 8),
}
VIEWPORTS = {"desktop": (1280, 900), "mobile": (390, 844)}

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

@contextlib.contextmanager
def serve(root):
    srv = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(Quiet, directory=str(root)))
    thread = threading.Thread(target=srv.serve_forever, daemon=True)
    thread.start()
    try:
        yield "http://127.0.0.1:{}/index.html".format(srv.server_port)
    finally:
        srv.shutdown()
        srv.server_close()

def sha(root):
    return subprocess.check_output(["git", "rev-parse", "--verify", "HEAD"],
                                   cwd=root, text=True).strip()

def shots(browser, root, label, out):
    build_sha = sha(root)
    all_frames = []
    with serve(root) as url:
        for viewport, (w, h) in VIEWPORTS.items():
            page = browser.new_page(viewport={"width": w, "height": h},
                                    device_scale_factor=1)
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            try:
                page.goto(url, wait_until="load", timeout=30000)
                page.locator("#titleNewGame").click(timeout=12000)
                page.wait_for_function(
                    "() => typeof GC!=='undefined' && !!GC.Render?.World?.drawScene",
                    timeout=25000)
                if label == "candidate":
                    page.wait_for_function(
                        "() => typeof OpeningPixelAssets!=='undefined'"
                        " && OpeningPixelAssets.featuredStatus().ready",
                        timeout=30000)
                for scene, (m, x, y) in SCENES.items():
                    page.evaluate("""([map,x,y]) => {
                        const s=GC.State.get();
                        s.map=map; s.x=x; s.y=y; s.dir='down';
                        document.querySelector('#titleScreen')?.classList.add('hidden');
                        document.querySelector('#dialogueBox')?.classList.add('hidden');
                        GC.Render.World.VISUAL.map=null;
                        GC.Render.World.drawScene();
                    }""", [m, x, y])
                    page.wait_for_timeout(300)
                    name="{}_{}_{}.png".format(label, viewport, scene)
                    page.locator("#game").screenshot(path=str(out / name))
                    all_frames.append({"file": name, "source_sha": build_sha,
                        "map": m, "x": x, "y": y, "viewport": viewport,
                        "size": [w, h], "fixture": "seeded visual only"})
                if errors:
                    raise AssertionError(
                        "{} browser errors: {}".format(label, errors[:5]))
            finally:
                page.close()
    return all_frames

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--old", type=Path, required=True)
    parser.add_argument("--candidate", type=Path, required=True)
    parser.add_argument("--out", type=Path, default=Path("prototype_artifacts/player_first_ab"))
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        try:
            frames = shots(browser, args.old.resolve(), "old-main", args.out)
            frames += shots(browser, args.candidate.resolve(), "candidate", args.out)
        finally:
            browser.close()
    (args.out / "evidence.json").write_text(
        json.dumps({"kind": "normal-game-renderer seeded visual A/B",
                    "not_story_play": True, "frames": frames},
                   ensure_ascii=False, indent=2), encoding="utf-8")
    print("Captured {} exact-SHA real Chromium image files".format(len(frames)))

if __name__ == "__main__":
    main()
