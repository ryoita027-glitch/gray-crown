# Margaret V15 — hair/robe contact study (2026-11-02 JST)
**ART HOLD / NOT ACCEPTED.** Dedicated reversible experiment based on Draft PR #274 HEAD `061bdb8254b747e71f753cb5facdcd478d6532f6`, V14A blob `8199e32c264e86a1a07b0b3a5ab90877126c41d1`. No edits to approved sprites, renderer, main, PR #98, buildings, story, or save schema v23.

## Actual assets
- `assets/character_trials/margaret_idle_hair_robe_contact_v15.png`: real RGBA 192×192 atlas, four orientations × four idle frames.
- `docs/art/evidence/margaret_v14_v15_native44_fourway_AB.png`: native 44px same background, nearest-neighbor, same pose and per-direction footline. **Left = V14A; right = V15. Rows = down, left, right, up. This is a static sprite comparison, not a Chromium game screenshot.**
- Source generator `tools/art/build_margaret_hair_robe_contact_v15.js` and offline test `tests/margaret_hair_robe_contact_v15.test.js`.
- Compare V5 mayor and royal messenger using [existing 44px NPC evidence](../art/evidence/margaret_footlocked_vs_v5_npc_native44.png).

## Visual reasoning / no-go risk
Previous V14 torso was readable but rectangular and visually disconnected from broad silver hair. An aggressive full lower-body replacement was previewed and rejected because it created a thin stick-like body and removed Margaret's long-hair identity. The retained V15 trial **does not delete the entire lower hair**: it reduces lower outer fringes, simplifies value groups, builds a directional center robe plane, neck trim and hair-over-shoulder contacts. The four directions are individually varied, not mirrored.

Changes per direction at 48px source, comparing V14A: **117 / 109 / 114 / 113 pixels** (down/left/right/up). Rows 0–25 and 39–47 remain byte-identical to V14A, including face, top hair and foot anchoring. All four idle frames remain identical; no new animation was invented.

**Art verdict: HOLD.** The candidate makes the robe's central color plane more continuous but may be too dark and still has an oversized head relative to V5 NPCs. It is not demonstrably more attractive at 44px. Do not integrate it or call it an improvement until full Ryune village 44px A/B, walk and dialog continuity, and human visual review pass.

## Verification
In-tool generation validated 192×192 RGBA, four directions, pixel change boundaries, four-frame identity and PNG roundtrip. Native Node test and full npm check **not run**. Chromium live-game screenshot **not run** because authenticated private checkout/browser is unavailable in this run. No paid GitHub Actions invoked.

## Next
Use the existing live canvas screenshot gate on the exact branch. Compare V14A and V15 with mayor and royal messenger in Ryune village. Reject the dark/flat robe if it harms the character; design a fresh coherent head/neck/hair/torso drawing rather than further mechanical compression. Do not proceed to architecture before the whole cast is visually unified.
