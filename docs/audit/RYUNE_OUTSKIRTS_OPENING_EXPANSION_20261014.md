# Gray Crown — Ryune optional outskirts expansion (2026-10-14)

## Authority, branch, and scope

- Base commit: `1285502ec8ba0cefa281019daff3c6f7367890cd` (PR #69, latest player-distribution stack that incorporates the visual battle/follower fixes from PR #68).
- Candidate branch: `feature/ryune-outskirts-opening-v1-20261014`, Draft PR against `chore/clean-player-distribution-20261011`.
- Production `main` still `d689aabb5146c9f45466a4f74f397e664c08fb4f` (v23); not altered.
- Save schema 23, Story 00–19, approved protagonist PNGs, camera and collision rules, existing early appointment/north-gate progression unchanged.
- No final canon changes. Two ordinary local residents are minor optional NPCs, not new named lore authorities or mandatory companions.

## Actual additions

### West: `ryunefields` — リュネ西の畑

Village exit: from `village`, stand at `(1,8)` and press LEFT. Entry in west fields: `(20,8)`. Return: stand at `(22,8)`, press RIGHT, landing in village `(3,8)`.

- New 24×15 editable logical map; field rows, harvested and planted strips, connected dirt routes, handmade hay/stave tiles, cart, and one farmhand with distinctive pixel silhouette/motion.
- Inspect `fieldFurrows` (3-line optional observation with Karen-party discussion and persistent event `ryune.fields.inspect`).
- Inspect `fieldCart` (flavor only); collect `fieldCache` once (one 薬草, canonical `TREASURE_DEFS` and `state.world.treasures`).

### East: `ryunebrook` — リュネ東の小川

Village exit: from `village`, stand at `(22,8)` and press RIGHT. Entry in brook: `(3,8)`. Return: stand at `(1,8)`, press LEFT, landing in village `(20,8)`.

- New 24×15 editable logical map; stream cells use the EXISTING blocked tile `Z`. The two-column wooden bridge restores `P` crossing cells at rows 7 and 8; the creek is not fake open-floor decoration.
- Field/water palette is integer pixel-fill based, no smoothing/AI-art collage; distinct north/south paths; bridge and banks are reachable.
- Inspect `brookWater` (3-line optional observation, persistent event `ryune.brook.inspect`); inspect `brookStones` (flavor); collect `brookCache` once (one 魔力草); a new minor brook watcher resident explains the bridge.
- Two signs at the village hedgerow breaks `westFieldPath` / `eastBrookPath` tell players where side paths lead. Either excursion is available before or after the royal envoy appointment.

### Optional side objective / payoff

After **both** `ryune.fields.inspect` and `ryune.brook.inspect`, speak to the preexisting farmer `farmer` in village. Dialogue references both observations. This one-time `ryune.outskirts.reward` event awards **one 携帯食**, using existing `openTreasure('outskirtsThanks')` and `state.world.treasures` to prevent duplication.

- No Story stage changes or extra main quest gates.
- No persistent schema changes: existing `events.completed`, `world.treasures`, and `world.visited` already serialize with v23.
- Re-enter side areas at any time without forced battles.
- The canonical `alpha.village.appointment` and `villageToRoad` transitions are not modified.

## Implementation footprint

- `js/data/maps.js`: submap generators, map definitions, features, four reversible transitions, 3 supply definitions, new village sign objects.
- `js/data/events.js`: two path hints, two optional 3-line investigation events and repeat dialogue, farmhand/riverbank minor NPC lines, one-time village follow-up, local props.
- `js/systems/movement.js`: only four map-edge transitions; canonical north gate unaffected.
- `js/render/ryune_outskirts.js` (new): 32px tile art, farm rows, real water/bridge, signs, distinct interactable props.
- `js/render/world.js`, `index.html`, `tests/harness.js`: integrate new renderer in correct order.
- `js/data/npcs.js` + `js/render/opening_pixel_assets.js`: two existing-style local resident silhouettes; no protagonist sprite rewriting.
- `js/systems/audio.js`, `js/systems/commercial_discovery.js`: compatible village music and optional exploration counters.
- `tests/ryune_outskirts.test.js` (new): map geometry and BFS reachability, branch movement, one-time reward logic, and v23 save/load.
- `tests/browser_ryune_outskirts_e2e_test.py` (new): real keyboard navigation through both side areas, object interactions, farmer payout, real UI save, new-page Continue and screenshots.
- `package.json`: add a dedicated outskirts acceptance target and include the new Chromium test in `npm run check`.

## What was actually verified in this GitHub-only session

**Static/runtime-independent checks on exact fetched source text:**

1. V8 JavaScript compilation of the modified JS files: PASS after fixing a missing delimiter in the new event array.
2. Browser `index.html` import order and `tests/harness.js` script order: **41 / 41 exact match**.
3. Evaluated actual `js/data/maps.js` functions: both new map dimensions **15 rows × 24 columns**.
4. Deterministic BFS on the actual map tile arrays, with all NPC/object collision tiles blocked:
   - West fields: 284 reachable cells, all 4 NPC/object targets reachable, west-entry-to-exit connected.
   - East brook: 261 reachable cells, all 4 NPC/object targets reachable; real two-column bridge passable; actual water remains blocked.
   - Original village: spawn (12,12) has traversable routes to both new entrance cells (1,8) and (22,8), considering `OpeningWorldLife.blocks`.
5. Evaluated actual Story stage definitions and event array: event IDs unique; `alpha.village.appointment` still advances to the original `01_appointed`; optional farmer reward requires both investigations and an incomplete reward flag.
6. `package.json` JSON parses; new browser test added to standard regression command.

**Not yet verified / do not claim PASS:**

- A local, runnable full checkout and Python/Node/Playwright executing the new tests are unavailable in this GitHub-only work environment.
- The existing GitHub-hosted Actions budget/runner issue (Issue #46) prevents assuming a new cloud CI pass.
- No genuine gameplay screenshots or timed human-play quality judgments were captured here; the browser test is prepared to capture them later.
- Route exploration, event dialog, v23 migration and full Story 00–19 regression still need same-HEAD `npm run check` and actual keyboard Chromium acceptance.
- No claim of commercial final-quality environment art. These are newly authored runtime pixel candidate maps, subject to the user's actual visual review.

## Exact acceptance commands

From a complete checkout of this Draft PR head (Node + Python + Playwright Chromium installed):

```powershell
npm test
npm run ryune-outskirts-browser-test
npm run check
npm run verify:release
npm run build:play
npm run build:single
```

Retain browser captures under `prototype_artifacts/ryune_outskirts_v1/`; verify valid original vs updated `village` and all three new-route screenshots, mobile-width layout, old v23 save import, and unchanged town/cave battle visuals before main adoption.

## Rollback / decision

This is a **Draft opening candidate**, not a main merge and not a mandate to change later approved lore. All previous PR branches and PNGs preserved. To roll back safely, close/unmerge this Draft PR or switch to its immutable base PR #69 head. No force push, branch deletion or Save schema migration is needed.

Suggested next incremental polish if accepted: add more varied villager interactions and small environmental details *within these two maps* based on actual observed players; avoid adding empty new maps just to increase map count.

## User refinement: side content is strictly optional (2026-10-14)

**Do not turn village life, character conversations, childhood recollections, or outskirts investigations into progression requirements.** The normal route is exactly as before: speak to the royal messenger, then depart through the original north village gate. Players may ignore both side maps and every added conversation with no Story-stage or objective penalty. There is no forced tutorial, no quest-list requirement, no gate condition, no obligatory reward collection, and no mandate to clear the two new areas before starting the journey.

Five one-time **optional, short interactions** using existing already-visible points were added:

- Village well `ryune.memory.well`: all four childhood friends remember fetching water together.
- Karen family table `ryune.memory.familyTable`: ordinary homecoming promise.
- Orphanage toy chest `ryune.memory.toyChest`: Sophie and Karen reflect on children's play.
- Mayor's bookcase `ryune.memory.mayorBooks`: Margaret and Triton reflect on her reading habits.
- East cottage soldier letter `ryune.memory.soldierLetter`: Triton and Karen consider people waiting for someone to return.

Each triggers only once and writes **only its own `events.completed` flag**. No gold, items, achievements, Story stages, world switches, party stats, or main quest objectives are changed. After each memory, the existing normal inspect dialogue is restored. All five are accessible independent of whether the messenger has been met.

The two Ryune side exit hint posts were moved from inaccessible transfer tiles at `(0,8)` and `(23,8)` to readable, non-entrance tiles `(2,7)` and `(21,7)`. Their distinct pixel signposts now render through the normal game canvas and are not on the footpaths at `(1,8)` and `(22,8)`.

The added `tests/ryune_outskirts.test.js` now asserts: five memory scene effects are only `completeEvent`, no extra quest prerequisites exist, original appointment remains accessible, the north gate still works **with zero field/brook investigations completed**, and both signposts and side exits remain reachable.

These are source-level changes and test definitions. Same-HEAD Node execution, Chromium acceptance and visual approval are still pending, not claimed PASS.
