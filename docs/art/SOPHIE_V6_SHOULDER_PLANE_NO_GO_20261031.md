# Sophie V6 original-source shoulder planes — ART NO-GO (2026-10-31 JST)

**This is an actual 24-frame pixel experiment, not a production art improvement. Do not merge.**

## Baseline and assets
- Based on Draft #175 exact HEAD `ba408def08effe53c0a71eba8dc9d69c323db686`; this PR is stacked on #175 for isolation.
- Read the **original production** Sophie walk PNG (Git blob `47065a719b16b3da0c3f0f2457d69ccfcf8a8a04`), **not** rejected V2/V3/V4 or V5 smoothing.
- Added `assets/characters/sophie/studies/sophie_v6_shoulder_plane_no_go_walk.png` (288×192 RGBA, 4 directions × 6 frames).
- Added [original above / V6 below at native 44px sampling](evidence/sophie_v6_shoulder_plane_native44_AB.png). Each cell is a 44px nearest-neighbor sample enlarged 4×; identical matte background, walk frame zero and anchor.
- Added reproducible Pillow generator `tools/art/sophie_v6_shoulder_plane_study.py`.

## Art hypothesis and actual verdict
The hypothesis was that shading cream robe pixels beneath the neck and at direction-specific shoulder edges could make Sophie less like a single hair/torso mass while preserving her original face, eyes, hairstyle and costume. **At 44px the change is marginal and does not create the missing readable neck-to-shoulder anatomy. The darker patches risk looking muddy rather than more tailored. ART NO-GO.** Do not promote this experiment to runtime or treat code/PNG validation as aesthetic acceptance.

## Technical invariants
- Exactly 456 opaque RGB pixel positions changed, by direction [189,106,107,54], across all 24 frames.
- Original alpha masks, all pixels in local y0–23 (face/head) and y37–47 (lower legs/footline) unchanged.
- New PNG is an isolated study; original source sprite, all eight production actions, gameplay, buildings, story, Save v23, frozen PR #98 and main remain unchanged.
- The committed source can regenerate equivalent RGBA pixels; byte-for-byte PNG compression need not match.

## Not done
Real Ryune village Chromium gameplay screenshot, V5 Mayor/Envoy live A/B, eight-action art replacement, complete project test suite and human visual acceptance **NOT RUN**. Static PNG board is not a live screenshot.

## Next art action
Stop automatic recolor/median tweaks. Work from the original 48px Sophie head/neck/shoulder silhouette in a pixel editor, redraw the physical collar/upper arm separation manually in all four directions, then check actual 44px game scene beside the V5 Mayor/Envoy. Reject any loss of original facial and clothing detail. Keep the character phase ahead of buildings.

No paid APIs or GitHub Actions were triggered.
