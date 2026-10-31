# 2026-11-01 02:43 JST — Serad / Halum return gates (Draft)

## Source and conflict check
- Checked main `d689aabb5146c9f45466a4f74f397e664c08fb4f`, map/story Draft #199 `4da42e255a450232c2c0f8a2fa4bc0a3b984acc1`, and open art/save PRs #200/#195. Branch stacked on #199; main and unrelated art/save untouched.
- Source: `js/systems/movement.js`, `js/data/maps.js`, `js/systems/story.js`, `tests/frontier_reentry_continuity.test.js`.
- **Verified defect:** `borderland` south exit called `enterFrontier()` which always spawned at Serad **south** gate (11,13), although the player was entering from the **north**. Returning from Watchfort to Halum similarly always spawned at Halum's south entrance. `enterBorderland()` replayed its half-day introduction on every visit.
- Both maps have open central columns 11/12 at rows 1 and 13 in their tile constructors.

## Player-visible slice
- Borderland → Serad: return at **north** wall (11,1), face south. Ash Road → Serad: remain at **south** gate (11,13), face north.
- Watchfort / relay village → Halum: return at **north** gate (11,1); Serad → Halum: arrive at **south** gate (11,13).
- On Halum revisits, skip the introductory half-day narration/chapter card; restore control immediately and show the next unfinished task: scout → stranded merchant → rest → north fort.
- First visits retain their original authored introduction. No NPCs, loot, save fields, story stage, art, or paid APIs changed.

## Player signal checked 2026-11-01
- *Chained Echoes* Steam reviews: https://steamcommunity.com/app/1229240/reviews/ — one displayed Oct 29 negative review describes repeatedly circling a map before spotting a hard-to-see door. Another Oct 28 positive review values world detail. **Individual reports**, review year not independently verified.
- *Sea of Stars* Steam reviews: https://steamcommunity.com/app/1244090/reviews/ — one displayed Oct 5 review complains about unclear path signals and unnecessary walks. **Individual report**, review year not independently verified.
- **Inference:** consistent directional entry and skipping duplicate exposition should reduce frustration. **Unverified:** actual enjoyment, commercial quality, human playtest, browser timing.

## Validation / gate
- Parsed exact edited movement and test text with V8 before upload. Executed four isolated extracted function scenarios with mocked dependencies: Serad north/south and Halum north/south **4/4 pass**.
- Updated old regression expecting the incorrect Serad south arrival; added three new Node harness regressions (Halum revisits from Serad and Watchfort, first Halum arrival).
- **NOT RUN:** committed Node harness tests, full `npm run check`, Chromium walk, real Save v23 reload, human playtest. Keep Draft/HOLD.
- Next: `node --test tests/frontier_reentry_continuity.test.js tests/ashroad_reentry_direction.test.js`, then `npm run check`; walk Serad ↔ Halum ↔ Watchfort with save/reload and verify north/south entrances and no repeated scenes.
