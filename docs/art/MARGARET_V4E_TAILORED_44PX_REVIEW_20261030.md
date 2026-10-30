# Margaret V4E — tailored silhouette walk study (2026-10-30)

**ART NO-GO / unapproved reversible experiment.** Base is PR #125 commit `766ffd7847450cea5bf849a98bb0e532e7d641d1`. PR #127 (V4C) and broken PR #126 (V4B) are separate branches and were not overwritten. PR #98 and `main` remain untouched.

## Real changes
- `assets/characters/margaret/studies/margaret_walk_v4e_study.png`: new 288×192, 4 directions × 6 cells of 48×48, three distinct walk poses in each direction, bottom at local y=43.
- Compared with V4: the crown begins at y=6 instead of y=8, three matte hair planes are separated, long hair and coat/skirt silhouette extend around the waist, the ivory center panel has restrained collar/fastener stitching, and the green scholar's book is enlarged with a visible binding. The character's silver hair, dark clothing and book identity remain. No glow, bloom, purple ambient gradient or borrowed art.
- `tools/margaret_v4e_source_ab.html`: actual PNG comparison against the four heroes, original Margaret, V4 and V5 mayor/messenger at 44×44 native display. This is a **static source comparison**, not a real-game screenshot.
- `tests/test_margaret_v4e_study.py`: strict PNG decode, dimensions, directions, frame differences, ground line and V4 source non-modification checks.

## Visual assessment (not a technical test)
An offline same-background 44px V4/V4E comparison was generated and inspected. The hair/coat silhouette and green book read more distinctly than the V4 study, but the book protrudes to the right and may appear detached, and the face/garment are still substantially less nuanced than the original Margaret and V5 NPC references. **NO-GO for adoption** until actual game screenshots and direct V5 comparison establish an improvement. The isolated asset is not wired to runtime; all eight actions, dialogue/battle appearances, and full-game QA remain unfinished.

## Next
1. Inspect actual-source gallery in browser, then capture *real in-game* same-scene screenshots at native 44px. Reject if scale/identity/grounding suffers.
2. Rework face expression, mantle taper and book-hand connection, with original Margaret and V5 NPCs as detail-density anchors; do not merely add more pixels.
3. Complete all 8 motions only after the design passes visual review. Do not touch buildings until character coherence is demonstrated.

No paid API or GitHub Actions run was used. Story, save v23, balance, default sprites and other characters are unchanged.
