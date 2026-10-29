# Margaret V4B native 44px silhouette experiment — 2026-10-30

**Status: ART NO-GO / Draft, not production.** Parent: PR #125 fixed commit `766ffd7847450cea5bf849a98bb0e532e7d641d1`. No main/PR #98/approved sprite overwrite.

## Actual changes
- Added independent 288×192 indexed PNG `assets/characters/margaret/studies/margaret_walk_v4b_study.png` (4 directions × 6 walk cells, 3 distinct poses/direction). Maintains silver-white hair, adult scholarly expression, robe, book and footline y=43. This is a silhouette and face study, **not** eight complete animations.
- Re-authored V4 at a taller native pixel grid, added hair planes, shoulder seam and garment contrast. V4 top opaque pixel y=8 (back 9); V4B y=4 (back 5). V4B horizontal bounds x=13–36 front/side; bottom remains y=43 in all 24 cells.
- Added `tools/margaret_v4b_real_source_ab.html` which loads **real repository PNGs** for the four heroes, V4, V4B, mayor V5 and messenger V5. Each direction is rendered at 44px, same background and foot shadow. V5 atlas columns are 3 and 4 (zero-indexed), confirmed in `js/render/opening_pixel_assets.js`.
- Added 3 Pillow structural checks in `tests/test_margaret_v4b_walk_study.py`.

## Visual judgment and limitations
Locally inspected the actual V4/V4B candidate PNGs side by side at native 44px. V4B improves vertical silhouette presence over V4, but the face and clothing remain simpler than the existing Margaret and V5 reference characters inspected from GitHub. **Do not adopt V4B.** Original/V5 PNG bytes were not available in the local browser container, so a full original/V5/V4B matched PNG composite and real-game Chromium screenshot were **not** produced. The gallery is code for reproducible real-source review in a complete checkout, not proof that such review has been executed.

Local standalone structural tests: 3/3 passed on the byte-identical candidate and V4 PNG, **not** a full same-HEAD repository QA. Full `npm run check`, real gameplay, dialogue, combat and eight motion sheets remain unverified. No paid APIs/Actions minutes used.

Next: execute the real-source gallery on a complete checkout, redesign the candidate face/hair/torso more substantially if needed, and only after a visible improvement complete all eight animations and an opt-in game A/B. Characters before buildings; no changes to story, save v23, balance, maps or default sprites.
