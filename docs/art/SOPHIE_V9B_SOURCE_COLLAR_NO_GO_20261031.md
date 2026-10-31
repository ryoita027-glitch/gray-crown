# Sophie V9b source-preserving collar study — 2026-10-31 21:22 JST

**ART NO-GO / DO NOT MERGE.** A real original-based 288×192 PNG pilot was made and visually compared, but the collar/shoulder pixels are less coherent at native 44px than the original. This is a recorded rejection, not a production improvement.

## Source / work isolation
- Parent: Draft #184 HEAD `de055e16ccf464f0ea3f4c823c32d3dae39f16c1`.
- Source: `assets/characters/sophie/sophie_walk.png` Git blob `47065a719b16b3da0c3f0f2457d69ccfcf8a8a04`.
- V5 reference: `assets/npc/featured_residents_charm_v5.png` blob `b169b58a846e1812dc42f566ca1843a6088e901f`.
- New unapproved PNG: [Sophie V9b front-frame-0 pilot](../../assets/characters/sophie/studies/sophie_v9b_front0_collar_NO_GO_walk.png).
- [Native 44px original / V9b / mayor / envoy comparison](evidence/sophie_v9b_front0_original_v5_native44_NO_GO.png). Columns original Sophie, V9b Sophie, V5 Mayor, V5 Royal Envoy. Rows front, left, right, back. Only front frame 0 is edited; other 23 source frames are byte-equivalent at pixel level. The 44px board is a static nearest-neighbor source render, **not** a Chromium village screenshot.
- Reproducible generator: `node tools/art/sophie_v9b_original_collar_pilot.js`, plus isolated zero-dependency PNG codec.

## Actual edit / evaluation
- 23 manually selected pixel locations in front frame 0, y29–34, x18–31, using original palette cream/shadow/green/dark colors. `19` actually differ from source, and `14` native-44px front pixels change.
- **Verified in JS isolate:** decoded real GitHub source and V5 PNGs; candidate and board PNG encode/decode pixel-exact round trips; unchanged alpha; no edits outside designated collar/shoulder region. GitHub binary readback pending.
- **Art judgment:** The source's original warm face/hair and garment detailing are preserved, but the new collar points form an unconvincing dark/bright interruption; the neck-to-shoulder connection remains unclear. No improvement to V5 reference cohesion. **Reject V9b.** An additional much broader front redraw was inspected but looked simplified and toy-like; it was discarded before upload.
- **Not verified:** full local Node suite, actual game Canvas/Chromium screenshot, walking 24-frame animation, eight actions, real village contact/grounding, commercial art approval. This is not a game release gate.

## Next action
Do not stack another automatic recolor on V9b. Use the original detailed 48px source and real V5 reference to draw a coherent shoulder and upper-arm silhouette (not disconnected pixel points), first as one front-frame art gate, then 4 directions and six walk frames only if it looks better. Production sprite, main, frozen PR #98, story, Save v23, combat, and buildings stay untouched. No paid API or GitHub Actions run.
