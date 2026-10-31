# 2026-10-31 23:39 JST — Ash-road objective tracks discoveries (Draft)

## Verified repository context
- main HEAD: `d689aabb5146c9f45466a4f74f397e664c08fb4f`; direct parent: map/story Draft #191 (`5c05dd3baa39323768d4ec72b39cad9bfb500f16`). Other active PRs #192 (portable-import regression) and #193 (field-worker art study) do not touch this slice. No main merge.
- Before this change, `GC.CommercialDiscovery.questHint('ashroad')` responded to the selected Granz priority and actual completed clues, but four event definitions wrote fixed objective strings. In particular, finding the orders before the refugee, defeating the patrol early, or investigating the cart first could leave HUD instructions pointing to a completed or already-bypassed step. `enterAshRoad` also reset the objective to a refugee-first sentence regardless of Granz's choice.

## Player-facing change
- The Ash Road HUD objective now matches the *next* actual map marker. Supply-first: cart → orders → refugee → patrol → north exit. Refugee-first or no answer: refugee → orders → patrol → north exit. Any clue can still be discovered out of order; the cart is optional and never a gate.
- Four existing event completions refresh the objective after dialogue, including the optional cart. Returning to the road uses the same saved completion flags, so the objective does not revert to the original opening instruction.
- No new scene, mandatory dialogue, karma, item, NPC, map dimensions, object coordinates, collisions or Save v23 schema. This is a player-visible confusion fix, not an added quest checklist.

## Evidence reviewed on 2026-10-31
- **Confirmed external source:** Steam *Sea of Stars* discussion, 2023-09-06: individual players criticized unclear pacing and being lost while exploring, while other commenters disagreed about the game's quality. https://steamcommunity.com/app/1244090/discussions/0/3817418793961555363/ . This is an old discussion, not a fresh representative review or proof of 2026 market preference.
- **Confirmed design source:** Harris & Caldwell, *A Transfiguration Paradigm for Quest Design*, Games and Culture 19(4), pp.493–512; emphasizes moving beyond a checklist of tasks. https://doi.org/10.1177/15554120231170152 . The paper is not a playtest of this game.
- **2026 signal:** Fresh searches on 2026-10-31 did not produce sufficiently attributable, comparable recent Steam reviews; no new 2026-wide trend is claimed. The previous Draft #191 research note records specific 2026-10-29/30 reviews, but they were not independently revalidated in this run.
- **Inference:** updating instructions after actual discoveries should prevent avoidable wandering and make the player's earlier Granz answer feel respected. **Unverified:** 44px HUD readability, subjective enjoyment, human first-play time, and browser end-to-end behavior.

## Verification / next
- V8 syntax compilation of all three modified runtime JavaScript files and eight isolated state/priority cases: passed before GitHub write.
- Added Node harness regressions for both priorities, out-of-order discoveries, early patrol, skipped cart, save v23 and reentry. The Node test suite and browser playthrough were **not run** in this connector environment; no human playtest occurred.
- Next: run `node --test tests/ashroad_dynamic_objective.test.js tests/ashroad_supply_loop.test.js tests/alpha2_ashroad.test.js` and browser-walk from south entry to cart/orders/refugee/patrol/north boundary; inspect HUD text width and whether the cart marker competes with the northern fork at 44px.
