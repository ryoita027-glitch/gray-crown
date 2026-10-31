# Triton walk color-mass pilot — 2026-11-01

**ART HOLD / DO NOT MERGE.** Frozen QA baseline PR #98, original `assets/characters/triton/triton_walk.png` blob `a151bff9e4a54668b99923450658d85c7ec2b9bb`. The original is 288×192, with 4 directions × 6 frames at 48px. This experiment changes no production assets or game runtime.

## Actual PNG trial

A source-derived weighted median-cut RGB reduction from 2211 distinct nontransparent RGB colors to 40 candidate colors, without dithering. 16742 nontransparent source pixels have RGB changes. Every source alpha and pixel position is preserved; no new contours, face geometry or frame omissions. This is a *color-mass readability* study, not a claim of anatomical improvement.

- `docs/art/studies/triton_walk_40color_HOLD.png`: complete 4-direction × 6-frame candidate PNG.
- `docs/art/evidence/triton_walk_40color_native44_AB_HOLD.png`: same-pose original/candidate pairs at 44px, four directions on a fixed green-gray field-like background. Within each pair: left=original, right=candidate.
- `docs/art/evidence/triton_walk_40color_2x_AB_HOLD.png`: same board at 2× for inspection; not a substitute for native scale.

## Verification and limits

A direct PNG RGBA decode/encode roundtrip check passed, dimensions and per-pixel alpha are unchanged. This is **not** an art-quality pass. Color clustering can flatten face expression, leather material, and selected hair highlights; compare against V5 mayor/messenger and in a genuine Ryune game capture before any adoption. No real Chromium capture, full tests, or remaining seven action sheets were executed. The candidate is deliberately not loaded by the game. Buildings and all gameplay/save v23 files untouched.

Next: visually judge the native board; reject if the face or material becomes muddy, or continue with a manually authored silhouette/lighting pass only after the V5 NPC anchor and full-action consistency checks.

## Native-scale visual review verdict (2026-11-01)

**NO-GO / reject this 40-color palette candidate.** At the 44px paired board, the original and candidate are barely distinguishable in character silhouette, head/body proportion and foot contact. The candidate subtly flattens several warm hair/face/garment accents, while the oversized hair mass and shoulder readability remain unchanged. Reducing 2,211 RGB values to 40 therefore does **not** demonstrate a player-visible aesthetic gain. The pixel/alpha verification above is technical only. Keep this study as rejected evidence; do not promote it or repeat palette-count reduction as a substitute for deliberate head/neck/shoulder redesign.
