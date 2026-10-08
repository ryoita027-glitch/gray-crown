# Clean Runtime Sprite Integration v1

Status: **IMPLEMENTATION BRANCH / USER PLAYTEST REQUIRED**

This phase fixes the visible cutout/halo artifacts in the actual game renderer.

## Root cause confirmed
The exploration and battle UI were reading `assets/hero_party_walk.png`, a separate 32x32 sheet. Karen and Triton runtime sheets also contained thousands of partially transparent edge pixels. On the canvas those pixels read as pale left/right cutout residue.

## Fix
- Runtime character sheets are normalized to strict binary alpha: 0 or 255 only.
- RGB is cleared under transparent pixels.
- No illustration auto-crop is used.
- `assets/hero_party_walk.png` is rebuilt mechanically from the committed 48x48 Walk sheets using nearest-neighbour whole-cell scaling.
- The world/battle sheet therefore cannot drift into a different character design.
- Karen / Triton / Sophie / Margaret retain their current character designs and animation timing.
- Main is untouched.

## Acceptance
CI must verify:
1. correct frame dimensions for all 32 runtime sheets;
2. zero semi-transparent fringe pixels;
3. rebuilt 96x512 world/battle sheet;
4. actual `index.html` browser boot and movement with pixelated canvas;
5. screenshot evidence from the real game screen.

Visual adoption still requires user playtest. This branch can be discarded without affecting the current prototype branch.
