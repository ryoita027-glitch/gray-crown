# Gray Crown — Player-reported disappearing characters, unnatural movement and placeholder NPC art
2026-10-11 · Candidate build based on `feature/opening-environment-worldlife-20261011` (PR #67).

## Severity
**Critical visible regression.** In the user's playable build, all four battle hero figures disappeared after CSS-based sprite-sheet clipping was introduced. World movement looks unnatural; the village/city art is still commercially unconvincing. Fix visibility and motion before claiming any content expansion.

## Changed in this branch

### 1. Battle figures: no empty combat stage
- Replace opaque CSS variable URLs such as `--idle-sheet:url('assets/...')` with actual `<img src="assets/characters/<id>/<id>_idle.png">` elements relative to **HTML document root**, not CSS resource resolution rules.
- Clip real images to a 48×48 square with an inner overflow-hidden wrapper. Idle uses a 192×192 frame sheet, attack swaps to 288×192 six-frame walking art. Frame crops change by 48px; **the whole sheet does not slide visibly across the stage**.
- The root hero has a visible, character-specific fallback colored silhouette until the image is loaded and valid. `onload` confirms nonzero size and minimum sheet dimensions. `onerror` retains the fallback, instead of displaying nothing.
- All eight current protagonist idle/walk image paths exist in the repository tree. Their actual pixels and in-browser successful loads remain **unverified**.
- No changes to battle rules, damage, controls, or three-route flags in this patch.

### 2. Overworld movement: fix actual trailing rather than rearranging sprites
- Followers now use 1, 2 and 3 actual previous steps rather than 2/4/6 skipped cells; incomplete map-transition seed positions do not count as walked route steps.
- Per-map `worldStepsOnMap` initializes on map transition and increments on successful movement. Existing saved schemas don't change; missing field uses zero at runtime.
- Advance actor animation frame phase based on **actual distance interpolated**, not `Date.now()/82`; followers face their recent interpolated movement direction. Reset phase when entering a new map.
- Remove the 200ms early-return check that previously **froze the whole canvas** when a nearby villager performed a minor animation. Idle background micro-acting redraws schedule on a 200ms timer only when nothing is moving; camera/party redraw continuously during movement.
- Still uses the game's original 48px temporary protagonist sheets; this is mechanical repair, **not** hand-animated protagonist artwork.

### 3. Village residents and houses: distinct source atlases
- New `js/render/opening_pixel_assets.js` defines individually authored hair, outfit color, class, silhouette and accessories for **35** early-area named resident IDs, covering the complete NPC lists in Ryune Village, its four buildings, road, capital, inn and armory. Generated **4 directions × 4 physically different arm/leg frames** at 32×32 per named NPC and cached in a single 128×128 Canvas sheet for that individual. This is editable source/at-runtime sprite data, **NOT delivered as pre-rendered PNG files**.
- Four distinct houses generate independent cached 104×108 tile images: family home, orphanage, mayor home, cottage. Each has distinct roof/drainage/window/frontage features and is called by existing `RyuneEnvironment`.
- Fallback to the previous renderer if an Offscreen/DOM canvas is unavailable (e.g. existing headless Node harness). The test harness now loads the two opening art modules in production script order.

## Verification performed
- Existing protagonist idle and walk PNG paths verified in GitHub tree: four per action? **Eight in total** (4 idle + 4 walk).
- Modified JS syntax checked with the real source text.
- New `tests/battle_visible_sprite_motion_acceptance.test.js` eight source/behavior tests executed in the V8 environment: all eight passed. This includes actual runtime-generated per-NPC frame data (not four copies of one frame), independent profile coverage, correctly cached houses, true step history, document-root image links and fallback.
- Existing `tests/opening_environment_worldlife.test.js` rerun against changed source. A stale assertion expecting the removed 200ms freeze was updated to assert scheduled ambient redraw. Re-run after this edit before claiming the suite green.
- `tests/browser_battle_visible_motion_art_e2e.py` committed for true Chrome/Edge visual verification: 1280px and 430px, visible playable sprites with real `naturalWidth`, rendered screenshots, village NPC atlas and house tile, world character stepping and sprite clipping. **Not executed**, because full private repository checkout was not available to the current container and the previous integration CI runner provisioning failed before test steps.

## Must-fix before calling it commercial
- Actually run the full Node test suite and Chromium screenshot test on the repository; verify all four images are visibly present and cleanly cropped, no CSS competing styles, at both desktop and mobile widths.
- Play a complete walking path including turns, backtracking, returning to village, chapter map transfers, and combat-to-world transitions.
- Visual-review the **authored NPC atlases**; although the generated 4-frame limbs are distinct, code-generated tiny sprites are **not a substitute for approved, hand-drawn premium NPC art**. Material, skin shades, expressive eyes, posture and shading should be evaluated visually against real premium pixel-RPG competitors.
- Visual-review named building tiles at real game zoom and ensure scale/roof alignment, correct collision, and no overlapping sprites/props.
- Only once validated, issue a player build. Remain Draft; main untouched.
