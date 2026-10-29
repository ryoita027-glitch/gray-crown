# Margaret V2 hair mass / torso contrast — 2026-10-30

**DRAFT / ART NO-GO / NOT APPROVED.** Based on PR #120 HEAD `1cdd77218cb28632d87c1edd5c4670b5babdd422`. Frozen PR #98, main, original PNGs, story, save v23, battles, and buildings remain untouched.

## Actual player-visible experiment

Open `index.html?gcMargaretSilver=2`. The optional topbar button switches the current Margaret sprite between original and **V2** in the same field scene, without reloading or moving the party. Both the 44px walking sprite and the eight animation-engine poses use the same reversible transform. `?gcMargaretSilver=1` still selects the previous V1 silver experiment; the normal URL still uses original art.

V2 applies a **six-plane restrained silver/lavender hair palette** and a gradual lower-hair shadow, plus a slightly stronger dark-plum torso mass. It protects the center of the face/eyes in front and side views, retains the original contours, transparent pixels, 48px source cells, 44px draw geometry, animation frames and footline. It adds no glitter, glow, jewelry or costume changes. All four directions are treated consistently by the cell-relative pixel function.

`tools/margaret_silver_study_review.html` now places original, V1, V2, Karen, Triton, Sophie, V5 mayor and V5 messenger on the same 44px ground and four-direction review grid, with grass/stone, 1x/2x/4x and PNG export.

## Visual inspection and decision

An **in-memory image inspection** decoded the actual committed Margaret walk PNG (RGBA, 288x192) and V5 featured-resident atlas (indexed PNG, 432x192), composed original/V2/mayor/messenger on the same 44px pixel grid for four directions, and displayed the resulting 224x224 image. The candidate is indeed visibly different in pixel colors, but **the difference is too small at normal 44px scale to establish a meaningful improvement**. Margaret's overall pale hair mass and narrow body remain unlike the stronger facial/garment separation of the V5 mayor and messenger. V2 is therefore **NOT APPROVED** and should not replace the default art. A color-pass alone does not resolve her head silhouette, face readability, proportions or the party's cohesion.

The comparison was a **static sprite composition, not a Chromium screenshot of the live game**. It does not prove correct in-game lighting, animation, camera, scene occlusion or mobile layout. No score is awarded for changed-pixel count.

## Changed source

- `js/render/margaret_silver_study.js`: V2 pixel color planes and optional mode 2; original V1 and default preserved.
- `tools/margaret_silver_study_review.html`: original/V1/V2/V5 same-scale comparison.
- `tests/margaret_hair_mass_v2.test.js`: Node regression coverage for mode isolation, face/alpha/footline invariants, four-direction cells and review links.
- This document: evidence, limitations and NO-GO decision.

## Checks and remaining work

Source-level review and the real-PNG static comparison were performed. **Not run**: full same-HEAD Node/npm tests, Chromium real-play screenshot, 8–12h routes, art approval. Existing GitHub Actions runner/free-minute limitations remain; do not spend paid minutes.

**Next visual priority:** do not iterate indefinitely on tiny palette tweaks. Produce a genuinely redrawn Margaret **head/face/hair silhouette and body color-mass** candidate with independently readable front/left/right/back at native 48px, then compare at 44px beside all three heroines and V5 mayor/messenger. Keep distinct eyes, high ponytail and composed identity; avoid distorting body or footline. Reject any candidate whose 44px face appeal and scale are not clearly better. Then apply a coherent shared art language to the four heroines and other NPCs. Only after character acceptance, proceed to houses/environment.
