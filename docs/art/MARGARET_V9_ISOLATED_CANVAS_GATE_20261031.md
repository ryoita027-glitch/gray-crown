# Margaret V9 — isolated real-canvas visual gate (2026-10-31)

**ART HOLD.** This is a stacked, reversible review-only improvement on PR #150 HEAD `462d3dbc5283046ef020e19d507fd4f453195c28`. Do not merge as approved art. Frozen PR #98, `main`, production PNGs, NPC V5 atlases, save v23, story, buildings, and gameplay remain unchanged.

## Problem found in the prior 24-capture gate

The old script required the *entire* 768×480 game canvas to differ between original and V9, but did not prove that the changed pixels belonged to Margaret. Ambient water, NPC activity, camera motion or time differences could make a comparison appear successful even if Margaret was not the cause.

## Concrete implementation

`tests/browser_margaret_v9_live_canvas_ab_e2e.py` now:
- Freezes `Date.now()` **only after loading** the two disposable browser contexts; no shipped runtime change.
- Uses the actual `world.js` village transform (tile 32, 1.16 camera scale, 44px hero, anchor 24/44) and the captured third follower's world coordinates to compute Margaret's screen rectangle. A 5px guard covers rounding and foot shadow.
- Rejects any A/B whose camera/party/pose differ, whose Margaret rectangle falls outside the 768×480 canvas, or whose changed pixels fall **outside** the Margaret rectangle.
- Still requires a visible difference inside the expected rectangle. This is a *source-attribution check*, **not** an aesthetic improvement score.
- Saves three additional `*_margaret_detail_4x_DIAGNOSTIC.png` sheets, each containing four directions × original/V9 at nearest-neighbor 4×. These are magnified diagnostics, not native 44px evidence. The original three native full-scene montages are retained.
- Records `outside_margaret_pixel_differences` and `margaret_screen_boxes` in `manifest.json`. A nonzero outside count invalidates the A/B and must be investigated rather than hidden.

## Execution and evidence boundary

Run from a complete checkout of this branch:

```sh
python tests/browser_margaret_v9_live_canvas_ab_e2e.py
```

Expected output directory: `prototype_artifacts/margaret_v9_live_canvas_ab_20261031/`.

During this run the private repository could be read through the GitHub connector but **not cloned into the local container** (GitHub DNS resolution failure). The new code was saved and reread from GitHub; a local synthetic geometry/crop calculation for representative village positions succeeded. **The exact complete script, actual Chromium capture, visual comparison and full Node regression were not executed.** A green pixel-isolation result, if obtained later, is not proof that V9 is aesthetically superior.

## Next artistic decision

Review the native 44px scene montages with the Mayor and Royal Envoy V5 anchors. Reject V9 if the broad head, crowded neck/shoulder or body-to-head proportion remain inferior. Do not propagate V9 to idle/run/acting or production until an original-detail-preserving, 4-direction shape redraw is visually better. No building art work yet.
