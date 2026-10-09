# Gray Crown — Next Work Order (Phase 1)
**Live development target:** `integration/phase1-pixel-native-baseline-20261010`. **Production:** main / v23 / Save schema 23 / Story 00–19, unchanged.

**Historical completed gate:** Triton Second Character Validation PASS. This is a retained proof-of-completion marker for legacy CI, **not** a pending or restarted work item.

## Completed (do not queue again)
- Four-character source approval/animation generation and clean runtime integration: complete.
- Medium44, true 48px protagonist sheets in world and battle: implemented.
- PR #35 commercial reconciliation, PR #36 adoption gate, PR #37 residual technical checks, PR #38 Ryune environment: implemented in isolated branches.
- Two-parent PR #37/#38 source integration: committed; **combined CI on its own HEAD required**.

## NOW — integrated release-candidate gate
**Decision boundary:** Portrait ON/OFF remains UNDECIDED; art quality stays PROVISIONAL and user-approved development direction does not authorize a main merge.

1. Confirm integration branch/parent SHAs, `main` SHA, 32 runtime sprite blob SHAs and no changed game data.
2. Run full lightweight regression and source-lock checks without re-generating committed PNGs.
3. Run actual Chromium scene, defeat/Continue/save v23, extreme two-cell follower, battle/commercial and Ryune before/after checks on **one merged checkout**.
4. Inspect screenshot artifacts from village, home, road, cave, battle, mobile + Portrait ON/OFF. Correct regressions in a **new reviewable commit** on this Draft branch.
5. Mark engineering gate GO only on total success. User has already approved **development-baseline direction**, not `main` merge or final aesthetics.

## AFTER GATE — production vertical slice
- Deliver polish and gameplay for **Ryune Village → Royal Road → first dungeon (old fort) → first boss**, with full dialogue/movement/loot/battle, save/Continue/backup and recoverability.
- Priorities: S1 player-blocking bugs, map collisions & save progression; S2 NPC protagonist design cohesion, 32px tile/44px actor overlaps, combat spatial balance, mobile control density; S3 optional cosmetics.
- Respect the original ambition of an eventual 8–12 hour RPG, but **this vertical slice is a smaller sellable-quality reference**, not a claim that the full product is finished.
- Retain Portrait ON/OFF A/B; present a direct comparative review before the user picks the default.
- Do not mass-regenerate existing 8-category protagonist PNGs; do not use artificial comparison boards.

## Not authorized
`main` merge, rewrite of old branches, history rewrite, force-push, final emblems/eyes/weapons/costumes/religious designs, Story 20+ changes or Save schema 24.

## CI budget
New phase-1 gate stages cheap regressions before Chromium; same runner executes browser checks once, no asset generation, pip cache and short artifact retention. Billing balance is **UNVERIFIED** through repository connector; owner must review GitHub billing settings. Historical branch-only workflows stay preserved but must not be copied into the integrated trigger list.

## Historical note
The old **Four Protagonist Runtime Harmonization** and **Four Protagonist Environment Integration** work orders are completed. Their details remain in Git and original review reports; they are not today's instruction.
