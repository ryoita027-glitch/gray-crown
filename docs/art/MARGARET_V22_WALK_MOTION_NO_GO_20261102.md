# Margaret V22 walk motion trial — ART NO-GO (2026-11-02 JST)

**Not approved / do not merge.** Branch from PR #298 exact HEAD `dd2ebe32fdea2e24133033550c70ca8fb7266539`. Do not alter main, PR #98, formal sprites, world tiles, story, balance, save v23.

## Actual asset and comparison
- Added real indexed PNG `assets/character_trials/margaret_walk_adult_mage_v22_motion_trial.png`, 288×192, four directions × six 48px walk cells; Git blob `937c29174c80bf67da0312e299ffade96af547b2`.
- Generator `tools/art/margaret_v22_walk_motion_trial.py` (Pillow) reproduces the PNG and a 44px contact sheet. Source is V22 idle; first walk cell per direction is the source pose, remaining five frames alternate boot offsets, hem and upper-body sway without rescaling the face.
- Existing `tools/art/margaret_v21_source_native44_review.html` extended with source-backed original walk vs trial walk 4-direction × six-frame comparison. It is a **static review**, not actual game Canvas.

## Visual judgment
Actual V5 mayor and royal messenger PNG (`assets/npc/featured_residents_charm_v5.png`, blob `b169b58a846e1812dc42f566ca1843a6088e901f`) are the style reference. Compared with official Margaret walk (`1923f1315c377418cea0f2f94ab6431c987f2dd7`), this V22-derived motion is too restrained and looks like a sliding paper doll at native 44px; legs, robe and upper body are insufficiently articulated. The head/shoulder/face/cloth hierarchy also remains below V5 NPC standard. **NO-GO for production; no selector added.**

## Verification
- Local Pillow decoded 288×192 indexed PNG; checked all 24 cells, fixed y=44 footline, distinct frame alpha masks, and exact source first pose; 44px contact sheet visually inspected.
- GitHub PNG blob SHA is pinned above. Test file added, but full repo Node tests and actual Ryune Chromium gameplay capture are **not executed** because the private repository is not locally cloneable (DNS). No paid Actions.
- Next: rebuild head-neck-shoulder and articulated walk manually to the V5 standard, then capture same-state real Ryune village at 44px before considering art adoption. Buildings remain deferred.
