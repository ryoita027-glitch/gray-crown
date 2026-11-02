# Margaret V24 lower-body silhouette experiment — 2026-11-03 JST

**ART HOLD / DO NOT MERGE.** Exact parent PR #303 HEAD `4bebf5ede98dc40a11979b96e8e73a21fbc61f34`. Production sprites, main, frozen PR #98, story, balance, buildings, Save v23 and other automated tasks untouched.

## Actual change
- New 288×192 indexed PNG: `assets/character_trials/margaret_walk_v24_leg_silhouette_trial.png` (4 directions × 6 frames, 48px cells, 44px game display study). Blob `a1cc824ae23dd45c0360341b474155c88d518a91`.
- From pinned V22 idle (blob `d7d0aa4eaa7286b85c3cf0181b36c550962b688d`), re-drew lower 9 rows of all 24 frames: alternating visible planted/lifted boots, split robe hem and counter-phase hem swing. All pixels above y39 match the V22 original, preserving silver hair, face, neck, shoulders, book and upper costume.
- Deterministic Pillow generator, Node source/geometry test and browser A/B against V23 and V5 mayor/messenger at same 44px scale. This does **not** replace the formal walk or include a runtime art selector.

## Verification actually performed
- Local Pillow PNG generation and image inspection of all 24 native44 cells; 4 directions × 6 distinct frame silhouettes; bottom occupied row y44 in each frame; upper y0–38 byte-identical to V22. Git blob of output verified before GitHub upload.
- Static 44px comparison: V24 makes the two lower boot shapes easier to distinguish, especially in side view, than V23. **However**, the reconstructed hem is too rigid/blocky, and face, shoulder, torso and arm motion are still static. At game scale, the art does not yet match V5 adult NPC construction.
- **Verdict: HOLD, not an accepted commercial-quality improvement.** Static board is not a live Ryune screenshot. Full Node test suite and real Chromium game Canvas **not run** because private checkout DNS access is blocked; the new Node test is added but not claimed as executed. No paid Actions.

## Next
Obtain real Ryune same-state game capture with Margaret next to mayor/messenger; redesign adult shoulder/arm/robe/leg anatomy together rather than iterating only boots; compare idle→walk→talk/turn at 44px before any promotion. Only after character cast visual approval, work on buildings/environment.

## Additional local browser evidence
- Chromium headless with Playwright successfully rendered a **standalone** V23/V24 44px Canvas board from inline data-URI PNGs (`page.set_content`, viewport 1020×510); a screenshot was captured and inspected. This is actual Chromium rendering of source pixels, **not** execution of the repository HTML reviewer, and **not** a real Ryune game scene. The direct `file://` attempt failed with `ERR_BLOCKED_BY_ADMINISTRATOR`, so data-URI rendering was used for this isolated visual check.
- The Chromium board still shows V24's boot separation more distinctly, but hem blocks and upper-body rigidity remain. No art adoption.
