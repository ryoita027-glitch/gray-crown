# Margaret: actual live walk-sheet baseline + authored-idle A/B (2026-11-01 23:26 JST)

**ART HOLD — isolated Draft. No production art adoption or merge.**

## Why the preceding gate was insufficient

PR #251 replaced the game’s actual `margaret_walk.png` draw with `margaret_idle.png` for its so-called original column. This is a valid **idle-to-idle same-pose study**, but it cannot show the untouched game baseline. The production world renderer `js/render/world.js` actually draws the 288×192 **walk** atlas even when Margaret stands still (source frame 0). A screenshot of the approved idle atlas alone cannot establish that the player sees an improvement.

## Implemented, not yet executed

Updated `tests/browser_margaret_live_idle_ab_e2e.py` on an isolated branch based exactly on PR #251 HEAD `6c89c891ddd3b0bf35e9ccdb855475753e4a4f62`.

Each real `GC.Render.World.drawScene()` capture now includes **four columns**, without changing the game's assets:

1. **live_walk**: unmodified game `margaret_walk.png` draw (the true player-visible baseline).
2. **original**: approved `margaret_idle.png` frame 0 injected in the same scene.
3. **hair_hold**: source-faithful silver-hair trial from PR #248, still unapproved.
4. **front_no_go**: rejected front redesign from PR #246, shown for diagnostic comparison only.

The live column is deliberately **not substituted**; the other three temporarily replace only Margaret's stationary 48×48 source frame. All are rendered at the existing 44px display size, with frozen time, identical player/map/camera/follower state, and the V5 NPCs still in the village.

The test checks Git blob identities for **all four PNG sources**, actual intercepted Margaret draw calls, same scene state, unchanged crop origin, and visible pixel differences. Only columns 2–4 are classified as an authored-idle same-pose A/B; differences from live walk are explicitly **diagnostic**, not a same-pose artistic verdict.

On successful execution: **32 game-canvas PNGs**, **8 full four-column comparison boards**, **8 nearest-neighbor 2× detail boards** cropped around the actual Margaret difference, and a JSON manifest. Viewports: desktop 1365×900 and phone 390×844, four directions each. Crops show the actual canvas, not reassembled source-atlas frames.

```bash
python tests/browser_margaret_live_idle_ab_e2e.py
```

## Source art observations and artistic status

The actual Margaret idle and walk atlases and V5 featured-NPC sheet were inspected. Margaret's pale silver-lavender hair and large dark-violet silhouette differ noticeably in material/volume language from the V5 mayor and messenger's earthier, tighter silhouettes. This is **a comparison observation, not proof that the NPC style should simply be copied**. Margaret's character identity and long ponytail remain locked.

- PR #246 front redraw: **NO-GO** (face identity and hair shape weakened).
- PR #248 color-only silver-hair study: **HOLD** (small 44px improvement, structural problem persists).
- This branch: **HOLD** (capture tool improvement, no new accepted sprite).

## Verification limits

GitHub file update and exact file re-read: performed. Source code review against `js/render/world.js` and `js/data/animations.js`: performed. **No Chromium capture, 32 PNGs, 8+8 boards, full checkout Node tests, or human 100% art review were executed in this environment.** Direct container network cannot resolve github.com; the connected GitHub API is available for isolated text writes but does not furnish a runnable full checkout. The new script is not a visual PASS simply because it exists.

No change to `main`, PR #98, original assets, NPC assets, buildings, story, combat, save schema v23, or paid services.

## Next actual acceptance gate

Run the script in a full local checkout, inspect the 44px real canvas next to the V5 mayor and messenger and compare live walk versus authored idle without conflating poses. Then prepare a source-faithful structural redraw of Margaret's neck/shoulder and ponytail junction **only after** establishing what players currently see. Any candidate that reduces face identity, long-hair character, action consistency or game readability is NO-GO. Buildings remain deferred until character cast consistency is established.
