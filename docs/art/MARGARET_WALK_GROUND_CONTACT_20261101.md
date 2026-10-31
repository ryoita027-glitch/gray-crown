# Margaret walk foot contact — native 44px A/B (2026-11-01)

**ART HOLD.** This is a reversible, default-on **only in this isolated Draft branch** runtime positioning trial. It is **not** a production art approval and must not be merged without actual game-scene review.

## Exact frozen source
- Base: PR #98 HEAD `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c` (unchanged).
- `assets/characters/margaret/margaret_walk.png` Git blob `1923f1315c377418cea0f2f94ab6431c987f2dd7` (288×192, 48×48 × 6 walk frames × 4 directions).
- `js/render/world.js` original Git blob `c2562c3b65d1468915e1677dc5cefca0ab219318`.
- Existing runtime uses 48px original cells, displays 44px nearest-neighbor, shadow center `footY-1`, and shared foot anchor source `[24,44]`.

## Source-image finding and implemented difference
The actual PNG was decoded and each walk frame inspected at alpha > 128. For Margaret, the lowest opaque row is 45 or 46 in every direction and all six frames. Original source anchor y44 therefore puts her lowest visible pixels roughly **1–2 screen pixels below** the shared ground/shadow contact. Karen's walk bottom is y42–43, Triton's y42–44, and Sophie's y43–44. These are alpha extents, not a guarantee that every bottom pixel is a shoe.

This branch retains all original sprite bytes and moves **only Margaret's field sprite draw origin** up 2 screen pixels at Medium44 by using source anchor y46. Her existing shadow, camera, sprite size, direction and animation crop remain unchanged; the other three heroes retain y44. It does not repair her head/neck/shoulder anatomy or solve every apparent scale mismatch.

## Native-44 A/B evidence
`evidence/margaret_walk_ground_contact_native44_AB_20261101.png` is mechanically rendered from the exact original walk PNG, frame 0, all four directions. Each row: **left = original y44**, **right = trial y46**, on the same muted green field, same 44px nearest-neighbor scaling and identical contact shadow. This is a synthetic native-size rendering, **not** a screenshot of the running game. Image was encoded, decoded and compared byte-for-byte to its source RGBA raster (PASS).

## Quality decision and previous work
The adjustment better aligns the lowest visible sprite row with the fixed contact shadow in this isolated board, but the overall silhouette remains too hair-heavy compared with V5 mayor and envoy; there is no verified in-map quality improvement yet. **HOLD** until a real Ryune-village A/B and walking/idle/interaction checks. This is distinct from PR #131's opt-in all-hero alpha alignment study: it tests a single source-verified default candidate, with no changes to the V5 NPC footline. PR #131's rejected V5 downward shift stays rejected.

## Verification and limits
- Added `tests/margaret_native44_ground_contact.test.js` to verify source crop, 44px draw size, four directions, unchanged other three heroes and exact two-screen-pixel shift using a Canvas mock.
- **Full-checkout Node test, actual Chromium village capture, visual approval and full game suite: NOT RUN** in this environment; GitHub Actions not triggered.
- No production PNG replacement, no NPC/building, story, Save v23, balance, main or PR #98 changes. No paid services.

## Next gate
Compare original vs trial in the **actual village** at 100% capture for front/side/back, standing/walking, near the V5 mayor and royal messenger. Reject if her shoe shadow looks detached, her head rises unnaturally, or the cast appears less coherent. Then resume authored Margaret head/neck/shoulder sprite work; do not jump to buildings.
