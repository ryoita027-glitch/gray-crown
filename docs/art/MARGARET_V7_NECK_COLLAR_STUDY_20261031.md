# Margaret V7 front neck/collar study — 2026-10-31

**ART HOLD — not approved, do not merge to main.** Parent is PR #143 HEAD `03c989a1ea7e5cd707a821fdf3b8783f7898a34f`; PR #144's rejected V6 redraw is **not** used. The frozen PR #98 and all production PNGs remain unchanged.

## Actual asset edit
- New `assets/characters/margaret/studies/margaret_neck_collar_v7_front_study.png`, RGBA 288×192, 4 directions × 6 walk frames.
- Based on the existing high-detail V2 source, not the simplified V6. Front six frames receive 50 manually selected neck/chin/collar/chest color placements each (300 applied, 262 pixels actually changed). The 3 other directions are bit-for-bit unchanged.
- Skin-toned neck bridge, darker collar outline, restrained mauve lapels and two muted gold brooch pixels. No hair geometry resampling, no head shrinking, no global palette filter. Original transparency and silhouette are preserved.
- Reproducible Pillow script: `tools/art/generate_margaret_neck_collar_v7.py`.
- Static 44px native nearest-neighbor A/B: `docs/art/evidence/margaret_v7_neck_collar_native44_ab_20261031.png` (rows front/left/right/back, left V2, right V7).
- Front six-frame native 44px A/B: `docs/art/evidence/margaret_v7_neck_collar_front6_native44_20261031.png`.
- Same-scale V5 mayor/envoy visual anchor review: `tools/art/review_margaret_v7.html`, open through local server or checkout.

## Visual verdict (not a technical PASS)
**HOLD.** At native 44px the neck/collar separation is slightly more legible than V2, but the change is subtle. The large head-to-body ratio, side silhouette, bright fragmented hair and V5 NPC style gap are **not** solved. The gold chest detail may be too assertive and requires review. The unedited side/back views are not coherent with the new front collar; this is intentionally a front-only proof, **not** a complete animation set. Do not promote or silently extend it.

## Technical checks and limitations
- Actual source PNG decoded, actual candidate and two native 44px comparison PNGs encoded and visually inspected.
- Candidate PNG RGBA roundtrip identical to in-memory bytes; alpha unchanged; zero modified pixels outside front-direction row; six front frames retained.
- Python script syntax checked locally, but its full Pillow regeneration on the original repository checkout was **not** executed in this environment.
- **Not performed:** actual Chromium village capture, motion flicker acceptance, 8 actions, full Node regression. No claims of commercial-quality improvement.
- No paid API or GitHub Actions use. Story, Save v23, battle, map, buildings and runtime not changed.

## Next work
Instead of another global palette or crown tweak, test a **single directionally coherent neck-to-shoulder redraw** against the V5 anchors in the real village canvas. If the side/back action frames cannot match, reject V7 rather than layering more patches. Character unification remains the priority; no building work yet.
