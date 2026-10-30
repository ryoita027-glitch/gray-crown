# Margaret V3 pose-aware head/neck study — 2026-10-30

**Art verdict: NO-GO / do not replace the production sprite.** This experiment is not a quality improvement claim.

## Exact isolation
- Parent: PR #139 head `ae1711f261ff62c3ffd1c66260cfd4a70345f2e1`; PR #98 frozen at `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`.
- Original: `assets/characters/margaret/margaret_walk.png`, GitHub blob `1923f1315c377418cea0f2f94ab6431c987f2dd7`.
- Input V2: `assets/characters/margaret/studies/margaret_original_contour_v2_walk.png`, blob `5351fe25d61045ea19141534479a1621bddf0f54`.
- Experimental V3: `assets/characters/margaret/studies/margaret_pose_face_v3_walk.png` (288×192 RGBA, 4 directions × 6 walk frames).
- Actual 44px pixel comparison: `docs/art/evidence/margaret_original_v2_pose_v3_44px_ab_20261030.png` (columns original/V2/V3, rows front/left/right/back; same background, pose and sampling).
- Reproduction: `python tools/art/generate_margaret_pose_face_v3.py` (Pillow). Generator has **not** been executed in a full checkout in this run.

## Actual pixel work
The existing V2 was used as a reversible input. Face and neck pixels were redesigned at 48px with directional eye placement, narrower chin transition, hair/cheek separation, and a less abrupt collar bridge. A small head-centroid correction is computed separately for each of six walk frames from the original alpha; this avoids imposing exactly the same x-coordinate on every pose. Back pixels remain unchanged. The 288×192 sheet and source alpha are preserved. 416 opaque pixels differ from V2 across the walk sheet; this count is not a visual score.

## Visual verdict
The front face becomes more conspicuous at 44px, but the pale central patch reads **too much like an attached mask**. Side profiles remain underdefined and the head-to-shoulder relationship does not approach the V5 village mayor/kingdom messenger's coherent adult silhouette. The clothing is still dense and lilac-heavy. **NO-GO for V3.** Original production sprite remains authoritative. For the V5 anchor comparison, see `docs/art/evidence/margaret_source_face_planes_v1_44px_ab_20261030.png` from PR #138 (V5 atlas columns 3 and 4).

## Validation boundaries
- Created and visually reviewed two real PNGs from actual GitHub source/V2 pixels using an offline JavaScript PNG decoder/encoder; PNG image rendered successfully.
- Measured 416 RGB pixel changes, zero alpha differences, retained four directions/six walk frames.
- **Not done:** Chromium village screenshot, frame-by-frame walk flicker, all eight actions, full regression, human aesthetic approval.
- No production assets, `main`, PR #98, maps, buildings, gameplay, Save v23, or balance changed. No paid APIs/Actions.

## Next art gate
Do not iterate color patches again. Reconstruct Margaret's head/neck/shoulder silhouette **per pose**, review at native 44px beside Karen/Triton/Sophie and V5 anchors, then validate in the actual village Canvas before approving any sprite. Environment art remains deferred.
