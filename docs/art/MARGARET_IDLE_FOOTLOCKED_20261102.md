# Margaret idle contact-lock trial — native 44px (2026-11-02)

**ART HOLD. NOT APPROVED. DO NOT MERGE.** Independent reversible branch stacked on Draft PR #258 at `79118528dbac9cf20e55f4d002964b4139d7e0f1`. The original Margaret PNG and approved game path are unchanged. This is a **real binary sprite edit plus an opt-in live field renderer path**, not a claim of commercial visual acceptance.

## Source-image finding (not inferred from tests)

The original 192×192 RGBA idle atlases were decoded and compared pixel by pixel for **all four heroes × four directions**. In all 16 direction rows, frames **1 and 3 are exact copies of frame 0**. Frame 2 is almost entirely just the same full character translated upward by **one source pixel**:

- Margaret: **exact 1px whole-sprite translation** in all four directions (visible pixel equality 100% after alignment).
- Triton: exact 1px whole-sprite translation in all four directions.
- Sophie: 99.27–100% alignment, with a few edge differences.
- Karen: 98.91–99.15% alignment, with a few edge differences.

Therefore PR #258's four-frame playback is primarily **whole-body bouncing**, not authored hair, hands, shoulders or facial acting. It can make the party look toy-like and visibly lift shoes off the contact line. A passing animation frame-index test is **not** an aesthetic pass. Do not enable mode 2 in default gameplay.

## Actual new image, source-perfect preservation

- Source: `assets/characters/margaret/margaret_idle.png`, Git blob `910458eabfcfaef7442f885f319d0e2a09c88a66`.
- New **experimental PNG**: `assets/character_trials/margaret_idle_footlocked_v1.png`, Git blob `193d180e3daf9584725c0c8dc82ad6a504fb9f85`.
- Same 192×192 RGBA, four directions × four frames, same source palette, same frame size, no changed identity or clothing.
- For frame 2 only, keep original upper head/face pixels through source row 23; replace source rows 24–47 with the **unchanged original frame 0 lower body**. This keeps the head's slight upward movement while the shoes and lower silhouette remain planted. All other frames and every original source file remain byte-for-byte untouched.
- Exact comparison: **1,352 changed RGBA pixels** in the experimental atlas, including **250 alpha changes**; no edits outside frame 2 lower halves. Source frame 2 foot bottoms were at y45 while frame 0 was at y46. The candidate has y46 in both frames for all four directions.
- Reproducer: `node tools/build_margaret_idle_footlocked_v1.js` (dependency-free codec in `tools/art_pixel_png_codec.js`).
- [Native-44px same-ground A/B PNG](../art/evidence/margaret_idle_footlocked_native44_AB.png): first row is original lifted frame 2, second row is foot-locked candidate frame 2, directions down/left/right/up. Same background, scale and shadow. **This is a source-based board, not a game screenshot.**
- [Native-44px V5 NPC reference board](evidence/margaret_footlocked_vs_v5_npc_native44.png): left to right **mayor / kingdom messenger / Margaret original / Margaret contact candidate** (front, same grass, 44px, common nominal shoe contact). Real indexed-color V5 NPC atlas decoded; the comparison is source-based, not a Ryune screenshot. **Visual verdict:** both NPCs have firmer warm/dark outer contours and compact head/shoulder masses. Margaret's broad cool-lavender hair, large head and softer outline remain visibly out of family; the contact change alone does not solve the requested art unification.

## Live game opt-in

- Default `index.html`: original approved walk-at-rest rendering; **unchanged**.
- `?heroIdleArt=1`: original static authored idle trial; unchanged.
- `?heroIdleArt=2`: earlier full-party bobbing experiment; unchanged, **aesthetic NO-GO** until replaced.
- `?heroIdleArt=3`: **Margaret alone** uses the actual experimental PNG and frame sequence; Karen, Triton and Sophie hold idle frame 0. All four keep 44px display, original camera, foot anchors, positions, shadows, and walking source. The mode is off by default and fails back to approved walk art if the image fails to load.

## Verification done vs not done

**Executed:** GitHub original/candidate binary re-read; lossless RGBA PNG decoder round-trip; candidate exact pixel provenance; 4-direction source contact measurements; native-44px source A/B image creation; modified `world.js` V8 syntax compile; **15/15 isolated V8 tests** using the actual saved source and binary PNGs (including old idle-mode contracts). These are not native Node or browser tests.

**NOT EXECUTED:** native `node --test`, full `npm run check`, Chromium, full-scene Ryune desktop/mobile A/B, actual motion review, visual adoption. The local container still cannot resolve `github.com`, so a complete checkout is unavailable. No paid Actions were started.

The new `tests/browser_margaret_idle_footlocked_ab_e2e.py` captures 16 real game-canvas PNGs and 8 paired A/B boards when a complete checkout with Chromium exists; it freezes the world and other heroes, checks 44px and draw-source identity, and rejects changes outside Margaret's sprite rectangle. **This script has not been run here.**

## Art verdict and next task

**HOLD** for the new PNG. The original mode-2 animation is **NO-GO** because it only bounces whole characters. The trial removes the most obvious foot lift while preserving Margaret's identity, but a one-pixel head rise over a stationary torso may create a seam at row 24. This has not been accepted visually in a real scene. Compare the true 44px Ryune village scene, walking-to-idle transitions, conversation and phone view before adoption. If the neck seam is noticeable, reject the candidate rather than force it into main.

The mayor and kingdom messenger in `assets/npc/featured_residents_charm_v5.png` remain the style references. This contact experiment **does not** resolve Margaret's oversized hair/head-to-shoulder relationship, NPC/hero scale mismatch, or full cast style unification. Those remain higher-priority structural art tasks. Buildings, story, save schema v23, balance, PR #98 and `main` are untouched.
