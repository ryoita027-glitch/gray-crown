# Field worker V4 — reposed tool-grip, native 44px study (2026-10-31)
**ART HOLD / DO NOT MERGE.** This is a four-direction idle-pose pixel experiment, not a commercial art acceptance and not a production sprite switch.

## Exact provenance and isolation
- Stacked on Draft PR #190 HEAD `1f462a5f97bbad73ce936878d448b16c579a06e6`; base study V2 Git blob `a39fd00215fb227c4031d3fbf53f2ebe182ca2c9`. V3b's scattered recolor was **not** used as a source.
- V5 reference `assets/npc/featured_residents_charm_v5.png`, blob `b169b58a846e1812dc42f566ca1843a6088e901f`; farmer atlas column 1, mayor column 3. No V5 pixels copied.
- Candidate: [V4 48×192 RGBA](../../assets/npc/studies/field_worker_v4_toolgrip_HOLD_48x192.png).
- [Native 44px four-direction comparison](evidence/field_worker_v2_v4_farmer_mayor_native44_HOLD.png): columns V2 / V4 / V5 farmer / V5 mayor; rows front / left / right / back. Same matte, frame, scale and footline.
- Rebuild: `node tools/art/field_worker_v4_toolgrip_pilot.js` (Node built-ins only; no external services).

## What actually changed
- The previous hanging tool-side hand is lifted into a bent forearm that visually grips the vertical tool shaft; both front and rear arm silhouettes are reconstructed, with side directions receiving matching reach/grip accents.
- Four direction source-pixel changes: 66 / 20 / 21 / 57. Alpha-mask changes: 43 / 5 / 5 / 38. The original face, straw hat, tool head, footline and all pixels y<22 and y>=42 are unchanged.
- Existing character identity and green work vest/linen apron are retained. The original V2 PNG and normal game assets are not overwritten.

## A/B judgment
- **Potential gain:** the front pose communicates tool handling rather than a rigid hanging arm, and the right-side silhouette is less rectangular. This is a structural pose experiment, not another tiny palette-only patch.
- **Remaining concern:** at actual 44px the improvement is modest; the new elbow/hand can read as thin or detached, and the back/side grips require animation continuity. The V5 farmer and mayor remain more expressive, with superior body volume and garment shape.
- **Decision: ART HOLD**. No commercial superiority established. Do not enable V4 by default or claim improved player-facing visuals.

## Verification and remaining gates
- Generated from exact GitHub V2/V5 source blobs in a zero-dependency JS isolate; 48×192 candidate and 176×176 board PNGs decoded back pixel-identically; four-direction pixel changes counted; face/hat and footline guarded.
- **Not run:** actual Chromium village screenshots, game runtime sprite substitution, Node project-wide tests, walk/work animation frames, character-wide visual approval. Static 44px board is **not** a real gameplay screenshot.
- **Next:** visually resolve elbow/wrist anatomy against V5 and check on a real Ryune field screen before drawing complete animation. Reject if no clear improvement. Hero cohesion and NPC roster remain unfinished; do not touch buildings.
- No changes to main, frozen PR #98, PR #99–#105, approved art, Save v23, story, battle, maps or buildings. No paid APIs or Actions requested.
