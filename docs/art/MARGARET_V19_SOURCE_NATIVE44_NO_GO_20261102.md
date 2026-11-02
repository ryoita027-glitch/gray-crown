# Margaret V19 — exact-source native44 visual NO-GO (2026-11-02 JST)

**V19 NO-GO as a production replacement on source-sprite evidence. Full-game art remains HOLD. DO NOT MERGE.**

Parent PR #289 at `3e537a4a9d6ffe43279cba7c9c4314e1b1c6d2e0`. This branch changes no production art, main, PR #98, buildings, game logic, story, balance or Save v23.

## Actual source-pixel boards

- `docs/art/evidence/margaret_v19_SOURCE_native44_same_pose.png` (176×240): original Margaret idle / V19 idle / V5 mayor / V5 messenger.
- `docs/art/evidence/margaret_v19_SOURCE_native44_walk_diagnostic.png` (220×240): original idle / original walk / V19 idle / V5 mayor / V5 messenger. **Walk is a different pose; this is NOT same-pose A/B.**

Rows: front, left, right, back. Real source atlas frame 0; nearest-neighbor 48→44px; fixed top y=5; same grass checker background and footline y=49. No per-sprite foot correction that hides contact differences; no earlier composite images used. These are source-sprite boards, **not actual Ryune Canvas captures**.

Rebuild with `node tools/art/margaret_v19_source_native44_ab.js`; verify with `node --test tests/margaret_v19_source_native44_ab.test.js`. Four original source PNGs have Git blob SHA locks.

## Visual verdict

Compared directly at 44px, V19 is narrower but looks more like a slim lavender column. Face, neck and hand/book readability are not improved; silhouette and garment structure remain unlike the V5 mayor/messenger. A smaller head contour alone is not adult anatomy. **Reject V19 as a replacement.** The original is not yet commercially satisfactory either: hair volume and dark compressed neck/torso remain. Do not auto-promote earlier trials.

## Verification boundary and next action

Four actual source PNG dimensions and blob SHAs checked. Two real-pixel boards generated and visually inspected; generator/test source parsed. **Not run:** full-checkout Node test, Chromium actual Ryune Canvas, real shadow/contact, dialogue/battle, full `npm run check` (private GitHub clone DNS blocked). No paid Actions/API.

Next art pass must rebuild face, neck, shoulder and robe as one coherent adult mage, preserving silver hair, book and the white vertical robe plane, with four directions and idle/walk continuity. Keep buildings deferred.
