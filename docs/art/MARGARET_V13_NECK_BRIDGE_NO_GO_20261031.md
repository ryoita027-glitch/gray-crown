# Margaret V13 neck/collar bridge — ART NO-GO (2026-10-31)

**Base:** V11 Draft PR #154, fixed SHA `07123c50d3915035ebe357c29e46ae4b59f62c38`. **Not based on the rejected V12 row-remap.** This is an isolated, reversible diagnostic. Do not adopt as a live sprite.

## Real artifacts and method
- Actual 288×192 RGBA atlas, 4 directions × 6 walking frames: [V13 diagnostic PNG](../../assets/characters/margaret/studies/margaret_neck_bridge_v13_diagnostic_walk.png).
- [V11 (top) / V13 (bottom) native 44px A/B](evidence/margaret_v11_v13_neck_bridge_native44_20261031.png): same frame 0, direction order front/left/right/back, identical neutral background, nearest-neighbor 48→44 sampling, enlarged 3× **only after** sampling. This is **static asset comparison, not a game screenshot**.
- [Reproducible generator](../../tools/art/build_margaret_v13.py): `python tools/art/build_margaret_v13.py --write`, then `python tools/art/build_margaret_v13.py` to check.
- 105 changed RGBA pixels across 24 frames (front 24, left 33, right 28, back 20). Alpha unchanged; rows 0–22 and 42–47 unchanged in every direction. Round-trip PNG pixel verification passed during creation.
- Source references: `assets/npc/featured_residents_charm_v5.png` (Mayor/Envoy style anchor) and `assets/characters/margaret/margaret_walk.png` (live original). Neither was modified.

## Visual judgment: NO-GO
The small neck bridge creates at most a minor collar separation in the 44px comparison. The V11/V13 silhouettes are practically indistinguishable; large head mass, neck/shoulder connection, excessive fine white hair and mismatch against the V5 featured NPCs remain. The side-view neck pixels can read as disconnected spots. **No claim of improved player-facing commercial quality.**

**Decision:** do not promote this diagnostic, do not keep stacking RGB/one-row changes as if they were meaningful art progress. Next art attempt must redraw the head–neck–shoulder contour as one coherent, direction-specific shape, preserve face/hair identity, and show a visibly different and better 44px A/B against V5 anchors before runtime testing.

## Safety / unverified
No edits to `main`, frozen PR #98, production sprites, NPCs, buildings, story, battle, save schema v23, or other schedules. No paid APIs or Actions. Real Chromium game-canvas captures, all 8 actions and full gameplay tests **not performed**; cannot infer a GO from file-integrity checks.
