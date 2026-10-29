# Margaret V3 48px hair silhouette pilot — 2026-10-30

**DRAFT / UNAPPROVED / NO-GO until real visual review.** Parent: PR #121 HEAD `317222bf7b93f450f8a4b2208cffa2624d1d9e93`. This does not overwrite PR #98, main, original PNGs, story, Save v23, or buildings.

## Actual implementation
- New opt-in `?gcMargaretSilver=3` in the same live field A/B toggle as V1/V2. The normal URL remains unchanged.
- V3 reuses V2's restrained silver/dark-cloth color planes, then changes **actual alpha geometry** of the crown and selected direction-specific long-hair outlines by one 48px source pixel. This is not another palette-only pass.
- Pixel bands are different for front, left, right, back. They derive edge color from existing hair pixels, never generate a glowing border, and do not touch the original face/eye/skin, hands, body, feet, game footprint, or anchor. The original sprite sheets and animation frame count remain intact. Changes are reversible.
- `tools/margaret_silver_study_review.html` now compares original/V1/V2/V3, Karen/Triton/Sophie, and V5 mayor/messenger at 44px, with 4 directions and grass/stone backgrounds. Alpha-difference count exposes whether a silhouette really changed.

## Verification and decision
- Synthetic 48px four-direction geometry test was executed locally and changed 250 alpha pixels across eight synthetic frames while leaving all original opaque pixels and the footline untouched. **This proves only mask behavior on synthetic data, not real visual quality.**
- New repository Node test checks V3 mode isolation, actual silhouette alpha change, V2 alpha preservation, footline, and gallery/renderer references. The exact committed HEAD's full Node suite and live Chromium screenshots are **NOT YET RUN**.
- The source PNG's actual silhouette may not satisfy every guard band; if a direction has zero geometry changes, V3 must be revised rather than called successful.
- **Art decision: NO-GO pending real 44px screenshot and human review.** V3 remains an experiment, not a completed hand-redrawn 48px canonical sprite. The previous V2 NO-GO remains in effect.

## Next
Inspect the actual original/V3 44px four-direction game screenshot against V5 anchors. If the added crown/hair volume worsens proportions, reject V3 and hand-redraw a full head/face/torso source sprite for all animation sheets rather than endlessly tweaking palettes. Then align all four heroines before NPCs and houses. No paid services.
