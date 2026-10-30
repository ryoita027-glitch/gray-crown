# Margaret V10 — 48px temple-contour source study / 44px A/B (2026-10-31)

**ART HOLD / no approval.** Stacked on PR #151 HEAD `c684bf6986a47a58582787dd37d38be9e314ad47`. Frozen PR #98, `main`, approved NPC V5, production sprites, save v23, story, battle and buildings are untouched.

## Source-based actual art experiment

- Source: V9's real 288×192 RGBA walk atlas, 4 directions × 6 frames, not a generated placeholder.
- V10: reduce only the head's outer contour at source rows 15–25 by 1px at rows 15–17 and 23–25, 2px at rows 18–22, on both sides. New outermost contour is a restrained darker hair edge. Existing facial skin pixels are protected; rows 26–47, costume and feet are byte-identical.
- Source-image pixel audit performed in a standalone JavaScript PNG decoder: 1,218 RGBA pixel differences, including 768 alpha differences, **32 alpha differences per walk frame**. Lower-body differences 0, protected skin differences 0. The candidate is a separate PNG and does not load in the default game.
- Reproducible generator: `python tools/art/build_margaret_v10.py` verifies; `--write` regenerates only the isolated V10 PNG.
- Added a Node test of PNG dimensions, frame coverage, and skin/body preservation. Python generator syntax and Node test syntax were checked in a local runtime; **the full repo tests and the exact source-image generator were not executed from a complete checkout**.

## Actual visual comparison (not a game screenshot)

- `docs/art/evidence/margaret_v9_v10_native44_20261031.png`: V9 top, V10 bottom; front, left, right, back; 44px native output on identical grass background.
- `docs/art/evidence/margaret_v9_v10_zoom4_DIAGNOSTIC_20261031.png`: same cells magnified nearest-neighbor 4× for inspection.
- `tools/art/review_margaret_v10.html`: frame-locked V9/V10, original V2, Mayor V5 and Envoy V5 on one 44px scale; 6-frame walk playback and 4× view.

## Visual verdict: HOLD

The narrower temple outline may improve the head/body ratio at 44px, but the edge can appear abrupt and the broad lower hair, neck/shoulder merge, side-view anatomy and V5 NPC style gap remain. **Do not declare improvement or deploy V10** without inspecting the real village canvas, including movement and four directions. A passing PNG audit proves reproducibility, not commercial art quality.

## Next gate

Execute the existing 24-shot real village A/B from PR #151 on a complete checkout; adapt the temporary HTTP atlas substitution to V10 only in an isolated test branch, then inspect full scene, 44px contact, Mayor/Envoy anchors, and walk-frame continuity. If the head looks pinched or worse than V9, reject V10 and restore V9 as study reference. Do not touch houses until cast-wide visual approval. No paid Actions invoked.
