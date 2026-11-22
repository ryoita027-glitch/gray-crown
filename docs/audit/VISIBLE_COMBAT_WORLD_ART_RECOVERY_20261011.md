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

## Additional actual visual audit and corrections in the same PR
- All eight original protagonist PNG files were retrieved in base64 from the private repository and visually viewed. Every original header was decoded and dimensions directly verified: Karen/Triton/Sophie/Margaret idle atlases all **192×192 px**, walk atlases all **288×192 px**. This proves the expected source grid exists; it is NOT equivalent to a Chromium on-screen rendering certification.
- Generated representative NPC front-facing images were rendered directly from the **actual** `OpeningPixelAssets` source into a test raster. Initial review rejected the common square heads and silhouettes as insufficiently distinctive. Rebuilt the underlying 32px `person()` drawing to use age/job-specific proportions, more diverse hair masses, shading, facial placement and props; repeated human NPC work poses keep both feet planted. Re-checked generated art at 4× for baker, farmer, elder, orphan, merchant, rationing mother, smith and recruit. **Still prototype art**, not approved hand-drawn retail character sprites. Identical-color-swap silhouettes were found among lulu/noa and baker/inn host; tiny person-specific accessories were added and 35 independently generated geometric signatures now have automated source-level regression checks.
- Four houses were similarly rendered directly from their cached canvas tiles. The first house review rejected their nearly identical roofs as palette swaps. Added genuinely different compositions: low communal orphanage canopy, two-part official mayor roof and tower, asymmetric cottage roof/chimney, family-house gable and purpose-specific windows. Regenerate before approving visual composition.
- Reduced old overlay conflicts by guarding historical flat-costume decals when a named person's new atlas owns the complete body. Non-working NPCs no longer cycle walking legs while standing. Animated workers include indoor armory/apprentice/inn roles at a limited update frequency.
- Revised movement to use **ordered orthogonal waypoint queues** for hero and followers. This prevents fast keyboard turns from diagonally cutting through a road corner when the prior step has not visually finished. Repeated draw frames do not add duplicate waypoints; tested the actual movement helper source for rapid 90-degree turns and unchanged targets.
- New `tests/protagonist_sprite_dimensions.test.js` prevents accidental future 44px/80px CSS mismatch or wrong sprite export dimensions.
- Improved the unexecuted Playwright UI script to capture capital screens, all 35 NPC source atlases and each of the four rendered hero elements separately at both narrow and desktop widths, asserting they do not overlap.

### Final evidence distinction
**Completed:** direct visual inspection of the actual 8 original PNG atlases and raster preview of representative generated NPC/house sprites, source-level sprite/route/unit checks, corrected source syntax, actual sprite header dimension verification.

**Not completed:** launching **the whole Gray Crown game** in Chrome/Edge, obtaining real full-game screenshots, walking a full story chapter, confirming live in-browser layering and frame animation, any price-worthiness/commercial approval. The repository is private and the current local working container cannot resolve `github.com`; the GitHub connected source can read text and PNG bytes but does not supply a runnable repository checkout. Keep Draft and do not claim a fix is visually proven until a genuine full-browser test runs.

## Archived game screen inspection (separate older build)
- Located the user's archived **2026-10-08 Gray Crown playable ZIP** in the file library and restored all 27 JS files, CSS and 37 PNG sources into a local throwaway test directory.
- Standard Chromium `http://127.0.0.1` and `file://` navigations were blocked by administrative browser policy. A true Chromium `page.set_content` session with inlined original HTML/CSS/scripts and original image data was nonetheless executed successfully. No JavaScript page errors; the old title screen, village, road, and wolf battle rendered. The old battle contained **four actually visible hero sprites**.
- Separately reviewed archived real Chromium reference screenshots for the road, cave, boss and capital. They show the visual baseline: repetitive houses, flat city scenery and significant style/scale mismatch between carefully painted protagonist sprites and crude geometric villagers. This validates the *player's aesthetic criticism of that older build*.
- **Scope warning:** The restored ZIP predates PRs #49–#68. These images and a successful archived Playwright launch do **NOT** establish that today's PR #68 loads or looks correct. The current complete private branch is not available as a container checkout; latest PNG bytes are available through GitHub, but not all executable repository files together. The new Playwright regression therefore uses an optional offline single-page fallback on a complete checkout, so the lack of localhost/file navigation access will not prevent future real screenshot runs.
