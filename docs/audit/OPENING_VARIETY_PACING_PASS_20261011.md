# Opening Variety and Pacing Pass — Gray Crown (Candidate)
Date: 2026-10-11
Parent: `feature/early-game-human-stakes-v1-20261011` (PR #62)

## Experience principle

Avoid bloating the 10–20 minute opening with long dialogue or extra mandatory tutorials. Alternate **optional short discovery → concrete combat decision → quick loot → distinct enemy counterplay**. The four protagonists' established personalities and social stakes remain primary.

Contemporary design references (mechanics inspiration, **not asset/content copying**):
- Clair Obscur: Expedition 33 — clear reactive defenses and character synergies; we adapt a non-twitch, accessible choice of Guard rather than importing timed parry.
- Sea of Stars — enemy-intent response, effective combos and turn decisions; we adapt a readable one-round warning in existing combat.
- Metaphor: ReFantazio — pacing and contrast between faster traversal and deliberate squad fighting; we avoid introducing a new realtime or overworld-combat engine in this small pass.

## Actually coded

1. **Road sign before first wolf:** inspect footprints (one short selection + one line) or move on without any blocking quest. A saved `events.choices['early.wolfScout']='read'` flags the optional preparation. On revisit, no extra choice or item farming. After the wolf was defeated, a first-time inspection no longer advertises an already useless preparation.
2. **First mandatory wolf fight:** Round 1 **truthfully forecasts an attack on Sophie** using `checkpointEnemyIntent`; Karen's already implemented Guard can intercept. Scouting reduces only the first incoming hit by **2**, never below 1. Rounds 2+ return to the normal enemy target AI, keeping it from feeling scripted indefinitely. Nothing here counts as a moral kill.
3. **Cave supply beat:** checking the existing `rations` object yields **one** `携帯食` with a single compact line. Re-check simply reports the emptied box. Previous `rations` structured switch is preserved, along with a new idempotent `early.caveSupplies` saved decision flag. Does not replace required fights or chapter progression.
4. **Stone-shell crawler:** the optional first-round forecast accurately names Triton; short help names the already existing **Break** defense reduction and **Ice Lance** attack reduction. Afterwards it returns to normal AI.
5. **Optional-discovery HUD:** village/road/cave counters track scouting and the cave cache via existing UI; no new navigation screens.

No new map, sprites, music, input buttons, mandatory cutscenes or story chapter changes. Existing schema 23 remains.

## Verified in this session

- JS syntax parsing of touched runtime scripts and regression tests.
- **Executed** two wolf target/damage variants using real battle handler source and deterministic damage input: not scouted = 8, scouted = 6; forecast=Sophie and actual=Sophie.
- **Executed** Karen Guard interception: Sophie kept her HP; Karen absorbed the hit.
- **Executed** crawler's targeted first hit against Triton and confirmed normal AI after round 1.
- **Executed** real road-sign optional choice callback and cave cache interaction: one-time flags and food reward, no repeated journal entries.
- Added `tests/opening_pacing_tactics.test.js` with full runtime harness coverage to be executed with `npm test`.

## Not yet verified / cannot approve

- The full Node test suite, Chromium gameplay, actual save/reload in a browser, UI legibility and sound mixing have **not** passed in the current session. Parent CI remains blocked at runner startup. Distinguish isolated JS handler checks from real user-journey testing.
- The new wolf and crawler behavior still needs actual playtesting for balance, especially low HP/Mana builds and 320px controls.
- Review whether introductory choice prompts take too much time when combined with previous optional orphan/merchant/banner events; these new prompts should not block the critical path.

Release rule: retain Draft, no main merge without full gameplay/screenshot/CI acceptance.
