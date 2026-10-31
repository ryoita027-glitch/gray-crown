# 2026-10-31 22:44 JST — Ash-road supply loop and remembered priority (Draft)

## Repository state / collision boundaries
- Main HEAD checked: `d689aabb5146c9f45466a4f74f397e664c08fb4f`. Base: map/story Draft #188 HEAD `66802a959a58ca16bacd6285819c5a70a7dc1c90`. PR #189 edits save recovery; PR #190 edits field-worker art. Neither touches this slice. All are unmerged at the time checked.
- Canonical `makeAshRoadTiles` has a north-south D road, a western D side path to the refugee (8,5), and an eastern D side path to the burned cart (17,9). The orders (18,5) were reachable over B ground but lacked a visible connecting spur. `GC.CommercialDiscovery.questHint('ashroad')` always pointed to the refugee first, regardless of Granz's earlier `early.granzPriority='supplies'` answer.
- All original event IDs, dialogue, flags, enemy, NPC/object coordinates, 24×15 boundaries, and Save v23 schema remain unchanged. No added mandatory scene, loot, or karma.

## Player-facing change
- Players who asked Granz about the supply line now get the existing quest diamond on the **burned cart** first; after examining it, the diamond moves to the **scorched orders**, then to the **refugee mother** if not yet visited, and finally to the **imperial patrol**. The cart remains entirely optional: if the orders were discovered first, the marker skips the cart. Choosing refugees or asking nothing retains the original refugee-first route. Events can still be completed in any order.
- A short D-material east loop and faint wheel ruts now visibly join the cart-side spur to the orders and the center fork. The cart and orders remain physical blockers that are interacted with from adjacent cells; the side connector bypasses the cart. No new map area or forced backtracking.
- Distinctive design principle: the player’s **spoken investigation preference** changes their *actual first route* through an existing war-damaged environment, without turning the optional answer into a quest lock.

## Player evidence checked 2026-10-31
- Steam *Castlevania Advance Collection* player reviews posted **2026-10-29 and 2026-10-30**: praise for the games, but specific criticism of tedious backtracking and difficulty knowing where to go after an ability change. Source: https://steamcommunity.com/app/1552550/ (individual, not a representative sample; different subgenre).
- Steam *Forever Skies* review posted **2026-10-25** criticizes quest-order softlocks and difficult-to-track objects, while noting exploration can still be enjoyable. Source: https://steamcommunity.com/app/1641960/ (individual, different genre).
- Confirmed from repository: the original supply choice did not affect the existing ash-road quest marker. Inference: a small readable loop plus responsive guidance should reduce unnecessary wandering and make the earlier choice feel respected. **Unverified:** whether players notice the wheel ruts at native game scale or prefer the order; no human playtest and no claim of a market-wide consensus. No borrowed characters, dialogue, puzzles, or world layout.

## Verification and follow-up
- V8 parse of three modified JavaScript files and isolated logic checks: pass before commit. Isolated checks covered connected D cells and supply-first marker sequence.
- Added Node harness regressions for supply/refugee/default priority, out-of-order discovery, walkable loop, wheel-rut strokes, object blocking and Save v23 round-trip. **Node test suite and browser playthrough not run in this connector environment.**
- Next: run `node --test tests/ashroad_supply_loop.test.js tests/alpha2_ashroad.test.js`, then browser walkthrough from south gate to cart, orders, refugee and patrol. Inspect wheel-rut readability and quest-diamond visibility at 44px; adjust if the eastern loop feels too prescriptive.
