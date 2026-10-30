# Margaret crown/shoulder V5 study — 2026-10-30

**ART HOLD / not accepted.** Stacked on PR #142 exact HEAD `5ad2c194338c3124e06e0120de77692043767d4a`. No production PNG or runtime behavior changed.

## Why this study exists
The previous V4 mostly changed peripheral hair pixels and did not resolve Margaret's oversized noisy crown or weak hair/neck/shoulder relationship compared with the V5 mayor and royal messenger. This trial changes the **shape of the upper crown**, without shrinking the face or the body, and makes the outer lower hair darker where it overlaps the shoulder.

## Actual changes
- New 288×192 RGBA atlas: `assets/characters/margaret/studies/margaret_crown_shoulder_v5_walk.png`, 4 directions × 6 walking frames.
- The crown's top two rows are cleared and the remaining original crown rows are redistributed only within local y=7–18; face y>=19, neck/body, outfit, book and footline are not vertically resampled.
- At local y=24–29, outer side locks receive restrained underside shading (direction-aware: both sides front/back, trailing side in left/right).
- Against V4, **2818 changed RGBA pixels**, **724 alpha changes**; crown loop 2342, shade assignments 476; per-direction operations 735/705/748/630. These are change metrics, **not an aesthetic score**.
- Same-pose native 44px V2/V4/V5 PNG comparison: `docs/art/evidence/margaret_v2_v4_crown_v5_44px_ab_20261030.png`.
- Self-contained 44px V2/V4/V5 vs V5 mayor and royal messenger 4-direction SVG: `docs/art/evidence/margaret_v2_v4_crown_v5_mayor_envoy_44px_20261030.svg`. V5 NPC source columns 3 (mayor), 4 (messenger), from `js/render/opening_pixel_assets.js`.

## Candid visual gate
The trial reduces crown height without compressing facial pixels, but this is **not a hand-redrawn face/head/neck/shoulder rig** and does not yet establish an aesthetically superior character. The unchanged lower hair still contains fine strands, the head-to-body ratio may remain too large, and a shortened crown could look abrupt during movement. Keep the existing original art and all approved V5 NPCs unchanged.

## Verification
- Actual V2/V4 PNGs decoded and candidate/44px evidence encoded; offline RGBA PNG round-trip verified.
- **Not performed:** real Chromium village screenshots, frame-by-frame walking flicker inspection, idle/run/talk/laugh/surprise/approach/turn art, full checkout regression, player art acceptance. Pillow reproduction script is committed but **not executed** in this environment.
- No GitHub Actions or paid API usage.
- `main`, frozen PR #98, PR #142, story, Save v23, balance, maps, buildings and runtime production assets remain untouched.

**Next:** perform real village capture beside the V5 mayor/envoy and compare original/V4/V5 at 44px before deciding GO/NO-GO; if the crown looks compressed or face-to-body unity remains poor, reject this trial and hand-redraw the entire head-to-shoulder silhouette per pose.
