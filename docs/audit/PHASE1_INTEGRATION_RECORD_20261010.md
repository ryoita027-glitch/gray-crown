# Phase 1 integration provenance and rollback — 2026-10-10

## Approval and scope
User authorized **Pixel-native next-development baseline with visual quality debt deferred and Portrait UNDECIDED**, conditional on actual PR #37/#38 integrated testing. This is **not** permission to merge to `main`.

- main production snapshot: `d689aabb5146c9f45466a4f74f397e664c08fb4f`.
- #35 candidate: `c8ac59a1a16ce3ac8b6450687b7e86d51d65e6f1`.
- #36 acceptance: `9bbea4da0878f17109e4ceaf45f033ed73f17883` — rollback anchor.
- #37 residual defects + v23 save + UI: `dceaf3cd4159909e179b9da1bf97a690a1a19830`.
- #38 Ryune environment: `b25cd412c73db59ba661a73e879b34871a3e75d3`.
- **Merge commit:** `2938145f0bc4302a392827236a3005b5925a1408`, parents #38 and #37 in that order; new review branch `integration/phase1-pixel-native-baseline-20261010`.

## Dependency ancestry
#30 → #31 → #32 → #33 and #34 alternatives → #35 (33 base + 34 ground ring) → #36 acceptance → fork #37 and #38 → **two-parent merge**. #33 selected 44px and battle/NPC representation; #34 alternate 42px and unused SVG enemies remain historical. #38 Ryune environment renderer retained; #37 `partyTrailPoints` walkable 2-tile fallback integrated manually in `world.js`, with original #38 changes kept. CSS/mobile + saved-state browser regression + acceptance workflow from #37 imported unchanged.

## Frozen invariants
Save/state/stories/maps/events/battle system and all 32 protagonist PNG files are unchanged by this merge. Runtime manifests use Git blob SHA, not imaginary checksums. PR #38's environmental `index.html` and `tests/harness.js` imports remain intact.

## Gate before promotion
Run `.github/workflows/phase1-integrated-gate.yml` at current exact phase1 HEAD. Existing source-lock check, full Node/browser regression, real main-v23 Continue, 2-cell input reversal, defeat recovery, Ryune rooms, commercial/battle scenes and multi-viewports must pass. Parent-branch green results **do not** count as merged-branch acceptance. Art quality and Portrait choice remain separate.

## Restoration
To roll back before adoption: leave Draft unmerged and use #36 `9bbea4da0878f17109e4ceaf45f033ed73f17883`; avoid deleting refs. For an accepted candidate requiring undo, apply a new revert commit on the non-main integration branch and rerun all gates; **never force-push**. No production merge authorized.

## CI cost and permissions
Existing historical workflows are left in their original branch scopes and **not added as new triggers**; new gate stages lightweight before Chromium, uses read-only token, one browser installation, pip caching, and short 7-day evidence retention. Remaining Actions minutes, spending limit, and account billing settings are not exposed by repository connector — **UNVERIFIED**.
