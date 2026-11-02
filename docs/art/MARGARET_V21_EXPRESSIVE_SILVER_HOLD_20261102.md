# Margaret V21 expressive silver-hair idle trial — ART HOLD (2026-11-02 JST)

**NOT APPROVED / DO NOT MERGE.** Parent: Draft PR #293 exact HEAD `589c54cdc67e9202127e9edcddc7e3fb2d67be00`. This is an isolated art branch; main, frozen PR #98, production sprites, buildings, story, balance, and Save v23 were not changed.

## Grounded visual standard
- Reference from actual GitHub PNGs: `assets/npc/featured_residents_charm_v5.png` (mayor column 3, royal messenger column 4; Git blob `b169b58a846e1812dc42f566ca1843a6088e901f`); canonical Margaret idle `910458eabfcfaef7442f885f319d0e2a09c88a66`.
- Existing `docs/art/GRAY_CROWN_ART_BIBLE_v2.md` and `docs/pixel/MARGARET_CHIBI_DIRECTION_LOCK_v5.md` remain the style authority. The goal is the NPCs' visual hierarchy, **not** copying their face or palette. Silver hair, calm adult expression, ivory central robe mass, dark costume, restrained gold, and book are preserved.
- V20 trial source `c3dcc57a772c09f098ce14aaac60541f34b7ad99` was the editable base; V19 remains NO-GO.

## Actual work
- Added **real V21 192×192 indexed PNG** at `assets/character_trials/margaret_idle_adult_mage_v21_expressive_trial.png`, 4 directions (rows) × 4 idle frames (columns), 48×48 cells. Exact Git blob `48e9b149c8873aaf3ceddf25328e3c6d0d3c4d46`.
- Added eye/brow/nose/mouth details to the previously blank side profiles; changed front smile to a restrained closed expression; differentiated one blink frame; lightened selected existing long-hair planes to read as silver; refined collar, waist fold, book edge/pages and thumb. No new alpha silhouette, feet, or character setting changes.
- Added `tools/art/margaret_v21_source_native44_review.html`: loads **actual canonical idle, V20, V21, three other heroes, V5 mayor and messenger** at identical 44px, 4 directions, frame selection, grass/stone/neutral, optional foot contact normalization, export. It is a static art board, **not a game screenshot**.
- Added `tests/margaret_v21_expressive_trial.test.js` for exact Git source SHA, 16 cells, footline, alpha preservation and canonical source isolation.

## Verification actually completed
- Local Pillow decoded final PNG and verified **all 16 cells nonempty**, 192×192, source/V21 alpha equality, nominal footline y=44 and 1,211 changed RGBA pixels (a change count, **not a beauty score**).
- Re-fetched the exact committed GitHub PNG: blob `48e9b149c8873aaf3ceddf25328e3c6d0d3c4d46` and valid image rendered through the GitHub connection. A previous malformed intermediate Git blob was replaced on the isolated branch before this review; **the final branch points to the valid blob**.
- Local native44 four-direction V20/V21 preview produced and visually inspected. This is source-backed but **not a same-state Ryune Canvas**.
- **NOT RUN:** native Node test against full repo, `npm run check`, actual Ryune gameplay and animation continuity. The private repo cannot be cloned in the local container (GitHub DNS failure). A local headless Chromium attempt timed out without a screenshot or DOM result; it is not counted as browser PASS. No paid GitHub Actions invoked.

## Candid art judgment / next
V21 is more legible than V20 in side-face features and silver hair separation, but **the robe/body still look flat and toy-like at 44px**. V5 mayor and messenger have more convincing face/shoulder/hand/material construction. The V21 head and hair mass remain visually heavy; one-frame blink does not constitute convincing character acting. **HOLD; do not promote or assign a production selector.**

Next: reconstruct the entire head-neck-shoulder/torso with a real V5-style volume hierarchy rather than continuing micro-edits. Then create matching walk/turn/talk assets, capture actual Ryune Canvas under identical camera and lighting, review against all four heroes and V5 NPC, and reject any degradation. Environment art remains deferred until the full cast is visually coherent.
