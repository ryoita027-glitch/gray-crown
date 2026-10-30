# 2026-10-31 — Roadside merchant: visible choice, not just dialogue

## Actual source findings (verified in PR #98 frozen base)
- The road map has an existing merchant at (8,8), with an existing decision `early.merchantCart` = `repair` or `return`.
- The merchant explicitly talks about a broken wagon axle and then about repairing it or turning south. Previously the road's visual renderer had **no cart**, so the scene's key object and the player's outcome were invisible.
- The existing tree tile (6,8) is blocked (`T`), adjacent to the side path (7,8). It can hold a wagon drawing without a new fake walk-through obstruction, a new map object, or any changed collision.
- Existing rewards, chapter, capital ration-queue dialogue, save-schema-23 choice and NPC coordinates are preserved.

## External player signals checked 2026-10-31
- Steam *Chained Echoes* October 28 positive review praises the journey, cast, world and small environmental details. Another October 28 negative review praises pixel art and exploration but criticizes characters not affecting events; October 29 feedback describes repeated loops around a hard-to-see door. These are **individual reviews, not representative survey results**: https://steamcommunity.com/app/1229240/reviews/
- Steam *Octopath Traveler II* October 26–29 comments disagree about dialogue pacing, with some complaining about tedious exposition. This is **not** evidence that every player wants shorter scenes: https://steamcommunity.com/app/1971650/
- **Hypothesis, not proven preference:** A real visible wagon with a bent axle and an outcome-specific appearance gives this existing merchant choice a concrete visual cause and effect, without extra dialogue, map area, loot, or backtracking.

## Implemented on isolated branch
- Draw an original 32px-scale cart on the already-blocked roadside tile. The initial axle is visibly crooked.
- `repair`: straighten the wheel and tie down cargo; `return`: cover the goods and lower the hitch toward the south, leaving the broken wheel unfixed. All variants retain the merchant and the original walkable path.
- Repaint the world immediately after the existing merchant choice is committed.
- Added a Node regression test for original cart, both outcomes, collision, no duplicate rewards, story invariance, and Save/Continue.

## Evidence and acceptance status
- V8 parsed both updated JS files and the new test file.
- Isolated V8 execution of the **actual committed renderer source** verified nine checks across initial, repaired and returning pixel commands. The actual `commitEarlyMerchantChoice` function was also executed in a mock context: repair/return committed once, repaint called twice, repeat did not pay twice. **This is not the repository's Node test harness.**
- **NOT EXECUTED:** `node --test tests/road_merchant_cart_consequence.test.js`, `npm run check`, Chromium walking/collision, native 100%-scale screenshot, actual Save/Continue integration, human first-time playtest.
- Before approval: walk village → merchant → road sign → fort, inspect the cart at native scale, choose both outcomes on separate saves, confirm NPC/collision/readability and capital ration-mother echo. Reject if the cart reads as a tree or appears to block the side path.

**Adoption: DRAFT / HOLD / NO-GO.** No paid services, copied art, altered canonical plot, or main/PR #98 changes.
