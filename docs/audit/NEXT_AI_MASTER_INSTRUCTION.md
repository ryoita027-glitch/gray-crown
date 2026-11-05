# Gray Crown — Next AI Master Instruction (2026-10-10)
This document is the current AI handoff. Never infer status from a saved conversation, old PR description or a stale standalone ZIP.

1. Read `docs/audit/CURRENT_PROJECT_STATE.md`, `docs/audit/NEXT_WORK_ORDER.md`, `docs/visual/SOURCE_OF_TRUTH_STATUS.md`, `docs/visual/VISUAL_ASSET_MANIFEST.md`, `docs/visual/PIXEL_NATIVE_PRODUCTION_STANDARD_v1.md`. Fetch `main`, all relevant PR HEADs and CI anew.
2. Two truths exist intentionally: **production** `main` v23 / Story 00–19 / Save schema 23, and the **approved next-development Pixel-native candidate** `integration/phase1-pixel-native-baseline-20261010`. Development-base approval does not permit pushing or merging into `main`.
3. PR lineage: #30→#31→#32, #33/#34→#35→#36, then #37/#38 as separate descendants of #36; the 2026-10-10 two-parent merge `2938145f0bc4302a392827236a3005b5925a1408` integrates #37+#38 without rewriting either. Preserve rollback at #36 `9bbea4da0878f17109e4ceaf45f033ed73f17883`.
4. Four protagonists' animations are already completed; do not ask for initial Karen Idle, Triton/Sophie/Margaret generation, or substitute historical Sophie v2/Margaret v5 for the currently used appeal v3/v7 sources. Verify byte-level locks and true canvas rendering. Karen/Triton originals are immutable. No AI comparison redraws.
5. Technical contract: 48×48 RGBA/cell, 4 direction rows, 8 category sheets, Medium44 displayed in 32px logical grid, foot anchor [24,44], nearest neighbor, distinct followers even on short reversals; dedicated Ryune pixel environment; other NPC/terrain/combat art still provisional.
6. Portrait ON/OFF is **UNDECIDED**: both modes remain available for testing; do not remove code or silently set a new default. Do not canonize eye colors, weapons, final outfits, flags, heraldry, Shion crown, military/religious insignia.
7. Every code/asset change: compare latest HEAD and blob, isolate to reviewable PR, keep historical notes, run `npm run check` equivalent (no weakened tests), exact PNG/source verifier and relevant real Chromium scenario; explain residual risks separately from CI status.
8. Existing historical GitHub Actions are branch-limited; new phase-1 integrated CI runs on the phase-1 branch only with `contents: read` and no mutation. Billing minutes / action spend **not verified**. Do not consume reruns or generate PNG assets gratuitously.
9. Next actual work is **vertical slice production** and quality convergence, not restarting the four-character sprite program. On any unresolved semantic change, request user approval; reversible bug fixes may proceed in Draft. **Never update `main` without a new explicit approval.**

Historical details live in previous lock/result documents; do not delete history, old PRs or branches.
