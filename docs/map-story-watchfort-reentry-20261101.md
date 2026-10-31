# 2026-11-01 06:43 JST — Bellad Watchfort return and Halum gate feedback

## Repository authority and scope
- main HEAD checked: `d689aabb5146c9f45466a4f74f397e664c08fb4f`.
- Previous map-story Draft #207 (`1fb7a77485231eb7f1574603a8e917ddaea82f8a`) is the exact parent for this independent Draft. #207 itself stacks on #205. Other art, save, and game-wide Drafts were reviewed by PR title and not edited. Do not merge the stack blindly into main.
- Inspected `js/data/maps.js`, `js/systems/movement.js`, `js/systems/events.js`, `js/systems/story.js`, existing Halum/fort tests, and `tests/harness.js`.
- **Observed defect in source:** `enterWatchfort()` unconditionally replayed its “next morning” arrival narrative and overwrote the fort objective on every reentry, even after the commander had briefed the party or the map had been inspected. A player returning from the fort to Halum and then walking north again was treated as a first arrival.
- **Observed usability issue:** the blocked Halum north gate recited the same three-task checklist regardless of which tasks were already completed, forcing players to infer their remaining objective.

## Player-visible vertical slice
- On first entry, preserve the authored morning arrival and commander goal.
- On revisits, enter the fort's south gate immediately without repeating the morning narration; restore the next real task: commander → west operations map → commander unlock → bridge → empire road. Existing progress flags remain authoritative; no new Save v23 fields.
- When Halum's north gate is still locked, give the specific missing step in Margaret's short response and update the on-screen objective. Do not teleport, auto-complete, or remove the mandatory preparation.
- All other map assets, rewards, route endings and existing NPC scripts remain unchanged.

## Player evidence checked 2026-11-01
- Chained Echoes Steam review page: https://steamcommunity.com/app/1229240/reviews/ . A negative review shown as posted October 29 describes revisiting the same map five or six times before noticing an obscure doorway; another October 25 review mentions often feeling lost. The displayed publication year was not independently verified.
- Sea of Stars Steam review page: https://steamcommunity.com/app/1244090/reviews/ . A negative review shown as posted October 5 describes unclear progression and needing a walkthrough; another October 3 positive review praises exploration. The displayed publication year was not independently verified.
- **Confirmed:** these are individual player reports and this repository contained a repeat-arrival/goal-reset code path.
- **Inference:** preserving actual fort progress and naming the remaining task at a blocked gate should reduce confusion and repeated dialogue, without copying other games' maps, story or scenes.
- **Not verified:** population-level market preference, human enjoyment, 44px in-game readability, live Save/Load and browser navigation.

## Verification and next gate
- JavaScript syntax parsed for the modified movement script and added Node test via an isolated JavaScript parser.
- Six isolated invocations of the actual `enterWatchfort` and `watchfortNextObjective` function bodies passed, covering first entry and five reentry states with mocked map/HUD operations. This is **not** a Node harness or browser playthrough.
- Added `tests/watchfort_reentry_context.test.js`: first entry, five fort progress states, three blocked-gate states, Save v23, and physical south/north round trip.
- Node tests, full build, browser play, native 44px screenshot and human test **NOT RUN**: local git clone is blocked by unavailable DNS resolution for github.com. No claims of completed play testing.
- Run `node --test tests/watchfort_reentry_context.test.js tests/borderland_north_trail.test.js tests/borderland_spur_access.test.js tests/frontier_to_borderland_production.test.js`, then `npm run check`, and perform a manual north-gate → fort → Halum → fort route with Save/Load before considering merge.
- Next player-facing risk: the north trail's appearance at native 44px and whether the fort's south-gate spawn and commander path are visually legible after return.
