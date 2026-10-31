# Sophie V4 material-plane study — ART NO-GO (2026-10-31 JST)

**Not approved.** Isolated experiment stacked on Draft #171 at exact parent `a46b0227265a8d15f7075946dd099fd3b58b36ca`. No production sprite replacement or runtime opt-in is introduced. PR #98 and main remain untouched.

## Actual asset
- `assets/characters/sophie/studies/sophie_v4_material_planes_no_go_walk.png`: genuine 288×192 indexed PNG, losslessly identical in RGBA to the locally painted 288×192 source; 4 directions × 6 walking frames at 48×48.
- Compared to V2 source `assets/characters/sophie/studies/sophie_v2_handdrawn_walk.png`, 1,805 RGBA pixel positions change over 24 cells (grouped broad hair-shadow and cream cloth planes, collar/face and boot shading). The alpha silhouette is **identical** and the last painted source row is y44 in all 24 frames. Five distinct animation frames per direction. The source V2 and V4 were locally decoded, reloaded and checked in Pillow.
- V4 SHA256 of indexed PNG: `9c3e6c3c0cfe5c91440509e4981ef5d6ed373b8d2f8445e9196db58b1e53b47a`; Git blob SHA: `056350fb1162e67297c723daaef229876c283d3c`. The artifact is **not** a production-ready 8-action sheet.

## Actual visual judgment (native 44px)
At actual game display size, some cloth shadows and hair grouping become more pronounced than V2. However the facial expression remains stiff, the robe reads as a block, and the V5 Mayor/Envoy and the **original production Sophie** retain better visual hierarchy and material separation. V4 does not establish a player-visible improvement over the original. **NO-GO**. Do not replace the original, do not merge this branch. Pixel-count increase is not art acceptance.

The original source and V5 reference were inspected from the existing source-embedded 44px board in Draft #160. [New original/V2/V4/V5 source-embedded native-44px A/B](evidence/sophie_original_v2_v4_v5_native44_20261031.svg) uses the same green backdrop, frame zero and nearest-neighbor 48→44 display; it is a **static source comparison, not a real village screenshot**.

## Verification limits
PASS (local): PNG parse, 288×192 RGBA-equivalent image, 24 nonempty cells, 5 unique frames per direction, identical alpha, unchanged bottom four rows, palette 19 colors, exact Git blob SHA check. NOT RUN: real Chromium village screenshot, actual in-map NPC scale/grounding, eight actions, full `npm run check`, human art acceptance. No paid services/Actions used.

## Decision and next action
Stop incremental work from V2/V3/V4 as the primary art foundation: the original Sophie is the higher-quality source. Next start an **independent redraw derived from the production Sophie**, compare with V5 Mayor/Envoy and all four protagonists at 44px, and only connect to the field renderer if the whole sprite improves. Do not change approved character identity, story, save v23, gameplay or buildings.
