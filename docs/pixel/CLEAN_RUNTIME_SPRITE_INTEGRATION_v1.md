# Clean Runtime Sprite Integration v1

Status: **IMPLEMENTATION BRANCH / USER PLAYTEST REQUIRED**

This phase fixes the visible cutout/halo artifacts in the actual game renderer without rewriting approved character-source PNGs.

## Root cause confirmed

- Exploration and battle use `assets/hero_party_walk.png`, a separate 32x32 derived sheet.
- Karen and Triton approved 48x48 runtime PNGs contain many partially transparent edge pixels from their original export.
- Those semitransparent edge pixels can read as pale left/right cutout residue against the world.
- Rewriting Karen's approved PNG bytes would violate the existing visual-regression lock.

## Final cleanup architecture

1. **Approved 48x48 files remain byte-for-byte immutable.**
2. `assets/hero_party_walk.png` is rebuilt mechanically from the committed 48x48 Walk sheets:
   - whole 48x48 cells only;
   - no auto-crop;
   - alpha threshold 128;
   - transparent RGB cleared;
   - nearest-neighbour 48→32 transform.
3. `js/systems/animation.js` applies the same alpha normalization after image load for 48x48 cinematic/runtime actors:
   - source PNG is not modified;
   - loaded image is copied to an offscreen canvas;
   - alpha becomes 0 or 255;
   - RGB under transparent pixels is cleared.
4. Battle and exploration therefore share the same character identities as the 48x48 source assets instead of a separately designed/cut-out illustration.

## What is not changed

- Karen/Triton/Sophie/Margaret design authority.
- animation timing;
- story/maps/save schema;
- source lock images;
- `main`.

## Acceptance gate

CI must prove:

1. Karen's visual-regression lock still passes;
2. project hygiene and full regression still pass;
3. derived `hero_party_walk.png` is 96x512 and contains no semitransparent fringe;
4. runtime alpha-normalizer code is present;
5. actual `index.html` boots in Chromium and moves the party on the real canvas;
6. screenshot evidence is uploaded from the actual game, not an AI-generated comparison board.

Visual adoption still requires the user's playtest. This branch can be discarded without affecting the current four-protagonist prototype branch.
