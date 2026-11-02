# Margaret V17 — face and hair-plane trials (2026-11-02 JST)

**ART HOLD / DO NOT MERGE.** Stacked on #281 exact commit `6a81d4c4e888ddeb0be813af9ce5ae922b665b3e`; frozen #98, main and all production atlases remain untouched.

## What changed
- The previous V16B source remains unchanged. New `v17A` has an edited front-face eye plane (reducing 4–5px dark eye patches to smaller marks), a narrower upper hair silhouette, fewer white hair glints, hand-placed neck/collar pixels, and a restrained robe seam.
- `v17B` adds a more compact crown and stronger head-width reduction while retaining the long silver locks and original foot pixels. Both retain four directions × four idle frames; these are experiments, **not fully redrawn walk/acting atlases**.
- Native44 A/B: `docs/art/evidence/margaret_v16_v17_native44_npc_AB.png`. Columns: V16B / V17A / V17B / original V5 mayor / original V5 messenger. Same background, 44px nearest-neighbor and footline. The last two NPC columns are byte-identical pixels from the V16 reference board, not newly invented.
- Opt-in live renderer: `?heroIdleArt=13` V17A, `?heroIdleArt=14` V17B (stationary Margaret only). Default and walking art unchanged.

## Art review (preliminary)
The goal is to remove the conspicuous black eye blocks and excessively glossy crown while retaining Margaret's silver hair and mage silhouette. **A/B alone is insufficient to certify improvement**: facial treatment can become too plain, B can lose hair volume, the robe may still look like a dark rectangle, and adult V5 NPCs still have a different silhouette. Reject the candidates if real village context looks worse.

## Verification
Source Git blobs are SHA-locked in `tools/art/build_margaret_face_planes_v17.js`. Generated 192×192 PNGs and a 220×240 comparison board; all 32 directional/frame shoe anchors match V16B at y46, and rows y44–47 are pixel-identical. The portable PNG generator and two Node tests are committed for repeatable verification.

**Not run:** native `node --test`, full `npm run check`, actual Chromium village canvas capture, movement/dialogue/battle continuity, human aesthetic acceptance. The local checkout remains DNS-blocked. Do not claim screenshots or release readiness.

Next: exact-HEAD Node checks and real Ryune village 44px captures with 12/13/14 modes; evaluate against mayor/messenger and the four heroes. If B reads pinched or A reads flat, reject; redraw head/neck/shoulder by hand in all actions before any production adoption. Do not proceed to architecture yet.
