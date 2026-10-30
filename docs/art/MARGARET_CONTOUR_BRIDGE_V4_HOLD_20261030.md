# Margaret V4 contour-to-shoulder study — 2026-10-30

**ART HOLD — experimental only. No runtime adoption or art acceptance.**

## Exact sources and isolation
- Parent: PR #141 exact HEAD `6b1d73f7b8ccb2c2ca14ed0ffce6c444fd6cfc2f` (V3 judged NO-GO).
- Source for V4: actual V2 PNG `assets/characters/margaret/studies/margaret_original_contour_v2_walk.png` (blob `5351fe25d61045ea19141534479a1621bddf0f54`). V3 is a comparison only, **not** the base of V4: the V3 face was too mask-like.
- New 288×192 RGBA / four directions × six walk frames: `assets/characters/margaret/studies/margaret_contour_bridge_v4_walk.png`.
- Same-background, same-pose, nearest-neighbor **44px** V2 / V3 / V4 comparison (left-to-right): `docs/art/evidence/margaret_v2_v3_contour_v4_44px_ab_20261030.png`; rows front / left / right / back. This is a static sprite comparison, **not** a screenshot of the game.
- Reproducible Pillow generator: `tools/art/generate_margaret_contour_bridge_v4.py`.

## Actual art change and visual judgment
V4 edits the **alpha silhouette** rather than painting another face mask: narrows the upper outer hair contours with restrained dark edge shading, then selectively bridges lower hair contours toward the shoulder at supported adjacent pixels. The edits are direction-aware (front/back both sides, left/right rear side) and applied separately to all six walking frames. The face, book and lower costume are left as V2; no original/production PNG is replaced.

Pixel comparison against V2: **452 changed RGBA pixels, 300 alpha changes** across 24 frames (234 outer pixels removed, 66 supported contour pixels added, 152 edge-shading edits). Per-direction operations: 144 / 88 / 76 / 144. These counts establish that pixels were edited; **they are not a beauty score**. All frame cells and PNG dimensions remain intact.

At native 44px the upper hair mass is slightly narrower and the shoulder transition is less blocky in some front/back poses. However the visual difference is modest; side-profile anatomy and the original's dense internal hair texture remain unresolved. V4 has **not** demonstrated superiority to the original production Margaret or the V5 mayor/royal messenger. Do not merge it or promote it to default sprites.

## Verification boundary and next gate
- Real V2 and V3 PNGs were decoded; the V4 PNG and 44px A/B PNG were encoded and decoded again for exact RGBA round-trip before GitHub upload. Both are committed as actual binary PNGs.
- The committed Python reproduction script has **not** been executed on a full repository checkout in this run. The offline JavaScript transform was used to generate the binary PNGs; its byte-level round-trip passed.
- **Not performed:** actual village Chromium screenshot, full walk-cycle flicker review, idle/run/talk/laugh/surprise/approach/turn completion, whole-project regression, human aesthetic acceptance.
- Next: inspect original Margaret and V5 NPC together in real game canvas; hand-redraw coherent head/neck/shoulder **per direction and pose** rather than incremental outline/color patches. Only expand to other characters when art A/B shows genuine improvement; buildings remain deferred.
- Unchanged: `main`, frozen PR #98, original sprites, architecture, story, Save schema v23, gameplay/balance. No paid APIs or GitHub Actions.
