# Hero 40/42/44px native-source scale and V5 anchor review — 2026-10-30

**Status: ART HOLD / NO-GO for production.** This branch is an isolated experiment from PR #129 HEAD `86d655f0bd4850f3aaed1d655af29b0e57ffed8e`. Frozen PR #98 (`075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`) and `main` are unchanged.

## Prior art work checked (avoid duplicate studies)

PR #99 establishes the part-based pipeline; #100 is an unrelated 3D Karen blockout. PR #101 already has an offline four-hero 44/48/60/64/72px comparison. PR #102 has an opt-in 44-vs-48px in-game pilot. PR #103–#105 test Karen face parts and reject A/B/C. This run **does not recreate those candidates**: it examines the previously untested smaller 40/42px in-game render alongside 44px, corrects the current Margaret V4F gallery's footline error, and uses V5 NPCs as visual anchors.

## What changed visibly

- `js/render/world.js`: opt-in `?gcHeroDisplay=40` or `?gcHeroDisplay=42` displays **all four existing detailed protagonist PNGs** at 40/42px rather than 44px. Default and invalid values remain **44px**. The same source frames, animation and 48px source data remain unchanged. Ground shadow width scales with the actor; horizontal center and y=44 source foot anchor remain at the existing world tile foot position. This is an experiment addressing oversized hero/map contrast, not a new character design.
- `tools/margaret_v4e_source_ab.html`: selectable 40/42/44px source scale. **Fixed a 4px visual-evidence error:** the previous gallery placed a 44px sprite at y=25 with its source foot around y=65, but the ground shadow was at y=69. The revised draw aligns the y=44 source foot with the shadow at y=69; old gallery screenshots should not be used as proof of proper grounding.
- [Actual source-embedded 4-direction × 3-scale comparison](evidence/hero_scale_native_source_40_42_44_20261030.svg): original Margaret, V4F, mayor V5, messenger V5. Uses exact PNG blobs, same 48px crop, matte field backgrounds, same shadow, same foot anchor, nearest-neighbor rendering. **This is a static SVG study, not a screenshot from gameplay.** Original Margaret blob `1923f1315c377418cea0f2f94ab6431c987f2dd7`, V4F `98ee1e45b706756b8fc4783a67ceea7d80d864a3`, featured V5 `b169b58a846e1812dc42f566ca1843a6088e901f`.

## Art judgment, separate from code correctness

The actual source images confirm a major **quality gap**: the original Margaret has substantially more nuanced hair, face and clothing than the flat V4F redraw; mayor/messenger V5 also have stronger face and garment articulation. **Do not adopt V4F or extrapolate its simplified rendering to other heroes.** This scale experiment is only an option for evaluating original high-detail assets, not an endorsement of V4F. A smaller size may improve map proportion while also losing facial pixels, so neither 40 nor 42px is approved before side-by-side in-game visual review.

## Checks and limitations

- Local Node isolated renderer-header mirror: **96/96** mocked draw cases across 4 heroes, 4 directions and 6 URL modes; x-centering and foot anchor error at most 0.5px. `node --check` passed on the extracted renderer header. The committed test `tests/test_hero_native_scale_study.js` is intended to run on the exact checkout via `node tests/test_hero_native_scale_study.js`. **A complete repository checkout and full test suite were not executed here.**
- Local Chromium successfully rendered a small SVG test with embedded PNG, `<use>`, clip and nearest-neighbor scaling. The complete GitHub evidence SVG was not rasterized locally; it remains unreviewed as a final visual.
- No actual in-game browser capture, multi-map walk-through, combat/dialogue consistency check, 8-action completion, or human art approval was performed. Do not merge.
- No paid API, GitHub Actions minutes, story, Save v23, game balance, building/environment asset, approved PNG or production default change.

## Next art-first step

Inspect the exact source SVG at native 1×, then compare `?gcHeroDisplay=40`, `?gcHeroDisplay=42` and default 44 in the same actual game village scene with mayor/messenger V5 and all four protagonists. Reject sizes that crush faces or weaken gestures. Return to **original-source** Margaret face/head/shoulder edits, not another flat V4-series redraw. Complete characters before any building/environment redesign.
