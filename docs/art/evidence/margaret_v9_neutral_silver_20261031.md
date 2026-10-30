# Margaret V9 — silver hair material study (2026-10-31)

**ART HOLD. No production adoption or merge.** Parent is Draft PR #148 HEAD `ffca2864358b08f9ee76b84e3177ed3388694b8a` (fixed NPC reference columns). Frozen PR #98, `main`, runtime sprites, save schema v23, story, combat and environment remain untouched.

## Source and actual visual trial

- V8 study source: `assets/characters/margaret/studies/margaret_hair_underlock_v8_walk.png`, Git blob `6019cb49d70964604dfdac3946ea2035d9f59b6f`; RGBA PNG 288×192, 48×48 cells, 4 direction rows × 6 walk frames.
- V9 output: `assets/characters/margaret/studies/margaret_silver_planes_v9_walk.png`; 4165 RGB pixels changed across 24 frames, **no alpha change**. The modification is restricted to light, blue-violet-tinted hair colors in head and outer hanging-lock regions; skin, dark clothing, footline and animation frames are preserved. No head geometry is claimed to be fixed.
- Exact rule: for alpha >=100, R>=115, G>=110, B>=135, B-R>=4, B-G>=3, inside local x 8–39, y 7–39, and either y<=25 or x<19 or x>28, shift R toward B by 95% of (B-R), G toward B by 61.75% of (B-G), and lower B by 17.1% of (B-R), rounding per channel.
- Created a source-derived 44px nearest-neighbor A/B contact sheet (4× enlarged for inspection): `docs/art/evidence/margaret_v8_v9_native44_ab_20261031.png` — top V8, bottom V9, columns Front/Left/Right/Back, same green background. This is a raster resampling study, **not a real Chromium game screenshot**.
- Previewed the real source atlas and candidate at 5× nearest-neighbor, all four directions, same gray background. The V9 silver tone is marginally less violet, but **the difference is too small at native game scale to justify approval**. Head-to-shoulder proportions, tiny hair strokes and NPC style mismatch remain.
- Also tried source-preserving head-width taper alternatives (92% and 84%) on all four directions, and inspected 5× previews. They introduce hard steps in the hair contour and visible compression, so **NO-GO**; those geometry variants are not included in this branch.

## Comparison and verification

- `tools/art/review_margaret_v9.html` compares V2/V7/V8/V9 and Mayor/Envoy V5 at 44×44 Canvas pixels, identical background and directions, with animated Margaret frames but **fixed NPC character columns** (Mayor 3, Envoy 4).
- `tests/margaret_v9_silver_integrity.test.js` checks 288×192 dimensions, 24-frame pixel-level alpha identity, expected RGB transform and changed-pixel count. It also checks V5 anchor metadata and comparison references.
- Verified source IHDR and decoded the V8 8-bit RGBA/filter-0 PNG; generated and previewed actual V9 PNG pixels. The GitHub blob was uploaded from those pixels. **Full checkout Node test, real-game Chromium screenshot, eight-action audit and full project regression were not executed** because the private GitHub repository cannot be cloned in this container (DNS failure). The test is provided for a full checkout, not reported as passed.
- No GitHub Actions job was triggered; no paid API or CI usage.

## Art verdict and next work

**HOLD.** The small silver-material improvement is plausible but not yet meaningful enough to call a player-visible quality upgrade. No formal art approval. The next useful step is a true manual redrawing of the face–neck–shoulder silhouette at 48px, with native 44px in-game screenshot and the V5 NPCs side by side. Do not reintroduce rejected automated head scaling, flatten costume detail, or move on to buildings.
