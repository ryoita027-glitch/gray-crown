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


## 2026-10-31 follow-up — the capital visibly remembers the road shipment (unmerged)

### Grounded player problem and original implementation
- In the existing capital map, the ration mother stands at (16,8) and already comments on the merchant's decision via `earlyCapitalEcho()`. Previously the capital's eastern supply-house facade never reflected whether the cart was repaired or turned back.
- Existing `capital` H tiles (16,10) and (17,10) form a solid supply-house frontage beside the ration queue; the adjacent (15,10) street remains passable. The original `CapitalEnvironment.street` draws this frontage before the existing world-life chalk queue markings.
- Added small, original pixel supplies **inside that existing blocked facade**: one normal crate in all states; two extra visible sacks only when `early.merchantCart=repair`; an otherwise unfilled shelf when the merchant returns. A single merchant cannot plausibly empty a whole capital, and the mother's dialogue says the additional delivery *might* improve rations, not that it has already done so.
- No new NPC, shop, interactable, collision, quest, route, reward, chapter, world switch, item, save schema or irreversible decision. The original ration-mother dialogue remains unchanged. The visual echo appears on entering the capital and after Save/Continue without requiring an extra interaction.

### Public player signals reviewed on 2026-10-31
- *Chained Echoes* Oct 28 player feedback praises environmental details and exploration while another review criticizes protagonists' actions not affecting events; Oct 29 feedback criticizes having to circle a confusing map repeatedly: https://steamcommunity.com/app/1229240/reviews/
- *Octopath Traveler II* Oct 26 and 29 individual negative reviews criticize long or repetitive dialogue: https://steamcommunity.com/app/1971650/
- **Inference, not established consensus:** A visible, nonintrusive city-side consequence complements the already-written NPC response without adding a detour or another exposition scene. No player acceptance or statistically representative market proof has been obtained.

### Verification actually performed
- GitHub source for `js/render/capital_environment.js` and `tests/road_merchant_cart_consequence.test.js` compiled in V8's JavaScript parser.
- **Actual current renderer source executed in an isolated V8 mock canvas:** 8/8 checks passed for baseline crate, no premature delivery, two delivered sacks on repair, absence of empty-shelf marking on repair, no sacks on return, unfilled spare shelf on return, and retention of other city supplies.
- A new focused Node regression test checks real map H collision, adjacent walkability, both visuals, inventory/story invariance, and Save/Continue visual restoration. **It has been written but not run** in the repository's Node harness.
- **NOT EXECUTED:** `node --test`, `npm run check`, actual Chromium at 100% scale, camera/foreground compositing screenshot, actual integrated Save/Continue, human first-time playtest. Private GitHub source is accessible through the connector, but the execution container cannot resolve GitHub for cloning. Existing CI runner allocation was already blocked. These limits are not a pass.

### Next acceptance gate
- In a real browser at native scale: visit the road merchant and choose each outcome on separate saves; travel to the capital, check the supply facade near the ration mother, listen to her existing dialogue, Save/Continue, verify visibility and no occlusion/false blockage. Reject if the pixel sacks are unreadable or if the ration queue appears more prosperous than the script supports.

**Still Draft / HOLD / NO-GO.**
