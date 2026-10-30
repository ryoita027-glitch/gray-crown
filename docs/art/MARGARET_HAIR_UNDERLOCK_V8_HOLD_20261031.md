# Margaret V8 under-lock / shoulder hair-plane study — 2026-10-31

**ART HOLD — unapproved; do not merge.** Based on PR #145 HEAD `84e99c4eba7de326870b1edd3d03a8f898ae7781` (V7), not the rejected V6. No changes to production sprites, runtime, main, frozen PR #98, Save v23, story, balance, maps or buildings.

## Actual pixel changes
- `assets/characters/margaret/studies/margaret_hair_underlock_v8_walk.png`: real RGBA 288×192 atlas, four directions × six walk frames, derived from the high-detail V7 sprite.
- Instead of shrinking the head or adding fine hair strands, deepen the **underside planes of the long silver hair near the shoulder** with existing palette steps only. Preserve the front V7 neck/collar work, face, original hair silhouette, dress, book, feet and alpha channel.
- 1,062 changed opaque RGB pixels: front 226, left 263, right 316, back 257. All 24 walk frames contain changes. No transparency changes.
- Source colors are remapped only inside direction-specific under-lock polygons. No global palette filter. Reproduction: `python tools/art/generate_margaret_hair_underlock_v8.py` with Pillow.
- Native 44px static A/B: `docs/art/evidence/margaret_v2_v7_v8_44px_20261031.png` (four directions; left V2, center V7, right V8).
- Native 44px front six-frame A/B: `docs/art/evidence/margaret_v7_v8_walk6_44px_20261031.png`.
- `tools/art/review_margaret_v8.html` compares V2/V7/V8 and existing Mayor V5 / Envoy V5 at the same 44px on one background, with optional walk animation. This is a **static local Canvas sprite review**, not an actual village Chromium screenshot.

## Aesthetic assessment (separate from technical checks)
**HOLD.** The lower hair mass is somewhat more separated from the dark costume, and side/back under-lock shading now follows the direction. The improvement is modest at native 44px. The oversized head, long fragmented silver hair, side-face contour, face-to-neck connection, body occupancy, and mismatch with the V5 mayor/envoy are still visible. This does not demonstrate commercial-quality improvement and is not an adoption approval. Do not promote this trial into runtime.

## Verification and remaining gates
- Original source RGBA decoded; candidate encoded, decoded again and compared byte-for-byte in memory. Alpha unchanged. 1,062 exact RGB changes; 24/24 walk frames modified.
- Three PNGs stored as Git blobs, including two native-size A/B contact sheets. GitHub branch readback must confirm exact paths and blob SHAs.
- **Not run:** full Pillow regeneration on a local repository checkout, real Chromium village capture, 8 action categories, full Node regression, frame-to-frame visual flicker review, human player art approval. Technical PNG integrity is not an aesthetic PASS.
- No GitHub Actions or paid API usage.

## Next action
Stop treating isolated hair shadow edits as the main solution. Obtain a real same-scene village screenshot against V5 mayor/envoy; then hand-redraw a coherent face–neck–shoulder silhouette across all four directions. Keep all experiments isolated until visual A/B and all-eight-action completeness are verified. Character unification precedes architecture.
