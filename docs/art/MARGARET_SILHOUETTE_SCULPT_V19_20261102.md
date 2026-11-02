# Margaret V19 — selective silhouette sculpt, native44 V5 NPC review (2026-11-02 JST)

**ART HOLD / DO NOT MERGE.** Stacked on PR #285 exact parent `488d7208abcf784944c3cf93443563f2f0406a5f`. This does not change main, frozen PR #98, approved character assets, buildings, story, balance, or Save v23.

## Design change
V18's robe plane did not resolve the large head/hair silhouette against V5 adult NPCs. V19 changes **outer geometry**, not just the robe color. It sculpts the y10–28 head/hair edge with a 1px crown taper, 2px cheek taper and 3px hair-over-shoulder taper; side directions have separate asymmetry, not a mirrored sprite. The silver material palette, central face, neck, entire lower torso and shoe pixels are preserved. This is a real 192×192 RGBA 4-direction × 4-frame atlas.

## Artifacts
- `assets/character_trials/margaret_idle_silhouette_sculpt_v19.png`: actual trial atlas.
- `docs/art/evidence/margaret_v18_v19_native44_v5_npc_AB.png`: 176×240, 4 direction rows, V18A / V19 / V5 mayor / V5 messenger on same native44 background/footline. NPC pixels copied from V18 source board.
- `tools/art/build_margaret_silhouette_v19.js`: deterministic source-SHA-locked generator.
- `tests/margaret_silhouette_v19.test.js`: 16-frame protection and reproducibility checks.
- `?heroIdleArt=17`: reversible stationary-only Margaret trial. Other heroes and default/walk sprites unchanged.

## Verification and visual verdict
Isolated JavaScript generated both PNGs from source blobs `b69006bcef6671a91c1e621ca1c2f2b326a8a71e` and `9e0b134bc4a62cd6fbdd1349e0aa09ef85a0fc05`. `1696` changed pixels across 16 frames, including `1300` alpha changes. The face center (x19–27, y16–22) and all pixels y29–47 match the V18A source. PNG roundtrip was exact. These are **technical checks, not a visual PASS**.

At 44px the silver-hair/head silhouette is visibly narrower than V18A, especially in side views, but the torso/neck construction and differences from the V5 mayor and messenger remain. A narrower shape could also reduce character identity in motion. **ART HOLD / NO-GO** until actual Ryune village desktop/mobile comparisons, idle→walk→talk continuity and human art review. Local full checkout/Chromium real-game capture and full `npm run check` were **not run** (private GitHub clone DNS blocked). Do not promote to production or begin buildings.

Next: test this exact branch in the real village with the four heroes and NPCs at matching scale and contact; reject if facial/hair readability suffers. Only then extend an accepted design to walk, talk, turn and other actions. No paid Actions/API used.
