# Margaret same-scene 44px A/B — 2026-10-30

**DRAFT / NO-GO / not an art approval.** Stacked on PR #118 HEAD 0bc29294b8d3713bc00b545f79a9ce0cf6d7141b. Frozen PR #98, main, source PNGs, story, battle, save v23, NPC V5 and buildings are untouched.

## Player-visible result

Previously, comparing gcMargaretSilver=1 with the original required reopening the game, potentially changing camera, direction, animation frame or save origin. In the **opt-in study only**, the top action bar now has a **マーガレット：銀白候補 / マーガレット：原画** button. Clicking it immediately switches the exact existing Margaret PNG versus the palette candidate **in the same game frame and location**. Both the 44px field party and her animation-engine acting sprites use the same toggle. No reload, movement, save, quest or character changes. The default game has no added control or changed art.

The acting engine now caches the untouched alpha-normalized original and a separate candidate, rather than overwriting its only image reference on load. The original source and candidate retain identical frame size, position, silhouette and footline.

## Review protocol

1. Open index.html?gcMargaretSilver=1 on the candidate branch, start the game and stand beside the mayor or messenger; compare at native game zoom, same pose and ground. Click the new topbar control repeatedly while observing the hair silhouette, lavender tint and face readability.
2. Check four directions and a walking sequence, then an acting/talking sequence. Inspect on grass and stone, desktop and mobile.
3. Reject if the candidate becomes flat grey, harms the face, loses individual identity or fails to look better beside the V5 residents. This is a color experiment only; it does not fix head compression or character proportions.

## Technical evidence and limits

- Verified the modified module, field draw function and animation source in an isolated JS runtime: candidate→original→candidate changes the actual Canvas draw source while preserving original cache and 44px draw geometry; opt-in state cannot affect normal URLs.
- tests/margaret_live_ab.test.js reproduces those checks against the repository sources when a full checkout is available.
- **Not performed:** same-HEAD npm test, real Chromium playthrough/screenshots, visual approval, full release gate. The isolated JS checks are not equivalent to those gates.
- No claim that the candidate looks better than the original; the control is an in-game review instrument. No adoption or merge until the player-visible art is judged.

## Next

Use the in-game A/B to decide whether to retain, refine or reject the silver palette. Then tackle actual head/face silhouette and four-hero proportion consistency using new hand-authored art, before touching buildings.
