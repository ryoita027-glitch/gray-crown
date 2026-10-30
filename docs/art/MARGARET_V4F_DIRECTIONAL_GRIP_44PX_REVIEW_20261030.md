# Margaret V4F — four-direction book grip, 44px source A/B (2026-10-30)

**ART NO-GO / reversible study; not an accepted character redesign.**

Base: PR #128 HEAD `ba624345f6f1d2ba55e3c6e6b0c0d87f61db5676`, itself stacked on V4 PR #125. PR #98's frozen SHA `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`, `main`, and other Draft PRs remain unchanged.

## Actual image changes
- `assets/characters/margaret/studies/margaret_walk_v4f_study.png`: newly drawn 288×192 PNG, four 48px directions × six walk frames. 21 exact RGBA colors, indexed PNG with lossless pixel identity.
- In V4E the same green book appeared on the right in all four directions. V4F positions it by direction: right side when facing front/right, left side when facing left/back. A short hand/sleeve touches the binding, and the book swings one pixel on two walk frames.
- Matte green planes and a single gold clasp retained. Silver hair, face, clothing, shoe groundline and original V4E study preserved. This is **not** a full face/head/body redesign.
- `tools/margaret_v4f_directional_grip.py`: repeatable PNG generator. `tools/margaret_v4e_source_ab.html` now shows V4F next to original, V4, V4E, the other three heroes and the V5 mayor/messenger on a common 44px field background.
- `tests/test_margaret_v4f_study.py`: PNG CRC/decode, exact 48px cells, 4 directions × 6 frames, groundline and directional book placement.

## Evidence and verdict
An offline same-background **44px V4E vs V4F** comparison was generated and visually inspected. The book no longer remains on the same screen side when the character turns; side/back poses have a clearer prop silhouette. The change is modest at actual size and does not fix the oversized/simplified face, character head-to-body proportion, or mismatch with V5 NPC design. **Art acceptance: NO-GO.**

Local tests: 3/3 PASS (source PNG decode, 4-direction groundline, directional book). This is structural validation, **not** proof of commercial visual quality. Static gallery is not a live game screenshot; browser gameplay, all eight motions, original/V5 anchor visual acceptance and full regression remain untested.

## Next
1. Inspect V4F, original Margaret and V5 NPCs in a real browser scene at native scale. Check side/back grip, face and grounding, then reject or revise.
2. Redesign the face/head-to-shoulder ratio and cloak volumes from actual-source V5 anchors instead of repeating small color edits. Keep four distinct identities.
3. Only after art approval, complete all eight motions; no environment/building work until the character set is coherent.

No paid APIs, Actions runs, story changes, Save v23 changes or production asset replacement.
