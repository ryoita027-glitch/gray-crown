# 2026-11-01 00:43 JST — Ash Road directional reentry (Draft)

## Verified repository context
- GitHub `main` HEAD checked at run start: `d689aabb5146c9f45466a4f74f397e664c08fb4f`. This change is stacked on map/story Draft PR #194 HEAD `c2d2435aa291a2d7cae34e42874f4a73d7994f03`, not main.
- Open save PR #195 and art PR #196 were checked; neither changes `js/systems/movement.js` in its described scope. Older map/story Drafts #191/#194 remain unmerged. Do not merge stacked PRs out of order.
- **Confirmed code defect:** `frontier` south boundary invoked the same no-argument `enterAshRoad()` as the capital north boundary. Both spawned at (11,13), near the *capital* end of the 24×15 Ash Road. Returning from Serad thus jumped to the wrong end of the road. On *every* return, `travelScene` repeated the first-arrival narration and could show the chapter card again.
- `advanceStory` uses monotonic stage ordering, so a late-game return must preserve the existing Frontier stage. Existing objective hints use saved Ash Road discoveries.

## Player-facing vertical slice
- First departure from the capital is unchanged: spawn at south (11,13), face north, show the authored first-arrival scene.
- Returning from Serad/Frontier's southern exit now spawns at the Ash Road's **north** gate (11,1), facing south. Returning from the capital spawns at the south gate, facing north.
- On reentry, restore immediate movement without replaying the original arrival dialogue/chapter card. Set the objective to the next *actual* Ash Road discovery using existing completion flags. Do not change quest completion, encounters, tiles, NPCs, rewards, or Save v23.
- **Player benefit hypothesis:** voluntary backtracking no longer teleports the player across the entire field or forces an already-seen scene, while exploration and NPC interactions remain available.

## Evidence checked on 2026-11-01
- **Steam player feedback (individual, not representative):** *Sea of Stars: Sunset Edition* reviews describe repeated walks back to camp and weak exploration rewards as frustrations; October 5 review displayed at https://steamcommunity.com/app/1244090/reviews/ . Date year is not explicit in the retrieved review snippet; no 2026 market-wide trend is inferred.
- **Steam player feedback (individual):** *Sea of Stars* 2023 discussion mentions backtracking after failed encounters and frustration with unskippable scenes: https://steamcommunity.com/app/1244090/discussions/0/3814034023688082163/ . Older feedback, not current market proof.
- **Level design resource:** GDC 2019, Aubrey Serr, *Designing Radically Non-Linear Single-Player Levels*, https://gamedesign.gg/watch/radically-nonlinear-levels/ . General design context only; not a test of Graygrow.
- **Verified defect:** wrong-end return and repeated arrival are directly observable in the source. **Inference:** fixing them improves player control and route continuity. **Unverified:** subjective enjoyment, first-play timings, browser appearance, and external human reactions.

## Verification and integration gate
- Pre-write: V8 parsed the exact edited `movement.js`; isolated first-visit, south-return and north-return state/position scenarios passed.
- Added `tests/ashroad_reentry_direction.test.js` covering first arrival, return from capital, actual south-boundary movement from Frontier, no repeated dialogue, monotonic story stage and Save v23 roundtrip. Full Node suite and Chromium end-to-end play **not run** in the connector-only environment; no human test occurred.
- Next: run `node --test tests/ashroad_reentry_direction.test.js tests/ashroad_dynamic_objective.test.js tests/alpha2_ashroad.test.js`, then `npm run check` and browser-walk Frontier south exit → Ash Road north gate → capital south gate → reentry. Check route pacing and chapter/HUD presentation on the exact PR HEAD.
