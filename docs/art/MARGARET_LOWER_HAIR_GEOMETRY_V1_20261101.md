# Margaret lower-hair geometry v1 — 2026-11-01 18:25 JST

**ART HOLD — experiment only, no production adoption.**

Stacked on Draft PR #242 exact HEAD `4cb623399b08bf06713e012293903eaf2f8f0479`. Original Margaret idle (192×192, 4 directions × 4 frames), V5 mayor and messenger were decoded from source-locked GitHub blobs. Existing Art Bible v2 and earlier Margaret V1/V2/V3/#239 attempts were reviewed; no new style bible was created.

## Concrete art change
This is a geometry edit rather than the previous palette-only pass: taper the lower outer hair mass by 1–3 native pixels at y24–38, with a restrained existing dark contour and a small collar bridge in front and side views. Skip rows containing protected skin; preserve face, skin, costume body and feet. All 16 idle frames have a candidate, but the other seven actions have **not** been updated.

- `docs/art/evidence/margaret_lower_hair_geometry_v1_HOLD.png` — 192×192 actual experimental RGBA sprite sheet.
- `docs/art/evidence/margaret_lower_hair_geometry_v1_native44_AB.png` — original / candidate / V5 mayor / V5 messenger, four directions, equal 44px nearest-neighbor sampling, grass/checker, contact-normalized footline.
- `tools/art/margaret_lower_hair_geometry_v1.js` — deterministic generator, exact original blob guard.
- `tests/margaret_lower_hair_geometry_v1.test.js` — preservation and roundtrip assertions.

## Verification and visual verdict
Generated and decoded both PNGs in memory. Original→candidate: 583 changed RGBA pixels, 396 alpha changes, 183 contour visits, 24 collar visits; per-frame changed pixel counts: 38, 38, 39, 38, 35, 35, 30, 35, 42, 42, 37, 42, 33, 33, 33, 33. These are technical counts, not aesthetic grades. A/B at 44px was inspected: lower right hair silhouette is slightly narrower but the difference is small, and the taper could weaken Margaret's distinctive flowing hair. Neck/shoulder/head relationship and side-view mismatch against V5 NPCs remain. **HOLD — not approved as a visual improvement; do not replace production PNG.**

Local direct GitHub checkout is DNS-blocked. In this run, local Node command, real Ryune Chromium screenshot, full npm tests, 8-action continuity and full-screen human aesthetic acceptance were not executed. Next prioritize existing live screenshot gate (#230) and artist-reviewed original-pose head/neck/shoulder reconstruction; do not jump to buildings. Main, frozen PR #98, story, battle, save v23, maps and approved sprites unchanged. No paid API or GitHub Actions run.
