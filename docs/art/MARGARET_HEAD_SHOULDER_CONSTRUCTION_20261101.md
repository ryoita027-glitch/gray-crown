# Margaret head–neck–shoulder construction — 2026-11-01 14:19 JST

**ART HOLD. NOT FOR RUNTIME / NOT APPROVED.**

This branch is stacked on PR #230 HEAD `fda8d73514d43cc15341772115034c8d1008a2b3`; it does not change main, PR #98, source hero PNGs, V5 NPC PNGs, any other PR, buildings, story, balance, or Save v23.

## Authored visual work
- `docs/art/evidence/margaret_head_shoulder_construction_front48_HOLD.png`: **new** 48×48 transparent hand-placed pixel construction. Distinct silver-white hair masses, compact visible neck, shoulders beneath collar, limited matte cel-shading, separated face from hair, and a grounded shoe line. It is a construction study, not a new canon costume.
- `docs/art/evidence/margaret_head_shoulder_construction_native44_preview.png`: **new** 44×44 nearest-neighbor preview on muted green.
- `tools/art/margaret_head_shoulder_review.html`: local, no-API browser board loading actual original idle frame, the new construction, V5 mayor and V5 messenger, all on a shared 44px native display and aligned source-foot anchors. It has grass/checker backgrounds and optional CSS-only zoom.

## Critical limitations
This is **only a front idle construction**, not a same-pose A/B: shoulder and costume silhouettes differ from the original. Therefore it **cannot** be adopted as Margaret, even if the standalone image looks cleaner. Her established identity and clothing must be preserved in a subsequent actual source-pixel edit, including left/right/back, walk, run, talk and other authored actions. The mayor/messenger and Margaret original are loaded by the review HTML when run from a full checkout; they were not available as decoded PNGs in this isolated run. **No real-game Chromium capture or full test suite was executed.** Do not report a player-visible quality improvement.

## Actually verified
The new PNG was encoded locally as 48×48 RGBA, and a 44×44 nearest-neighbor preview was generated. GitHub blob identity for the source study is `7ee575a6cb3d57b7d4c0dfb732b68f03854ab836`. No paid API or Actions was invoked.

## Next
In a full checkout open `tools/art/margaret_head_shoulder_review.html`, inspect at 100% beside the actual original and V5 NPCs, and **reject** if the anatomy or identity is worse. Then produce a **same-pose** pixel edit to the real Margaret original, preserving canonical costume and face; run real Ryune village Chromium screenshots before any runtime adoption. Do not move to buildings.
