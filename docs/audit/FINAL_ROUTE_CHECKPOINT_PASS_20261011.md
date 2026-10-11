# Gray Crown — Kingdom & Empire tactical checkpoints and route epilogue previews
Date: 2026-10-11 · Base: `feature/ashcrown-playable-schism-20261011`

## Delivered in this branch

### Four meaningful final-route encounters
All four tactical variants reuse the actual existing final chapter approach NPC, map, party and combat systems:
- Kingdom / evacuate → `kingdomEvacuation` (imperial soldiers blocking a civilian escape route)
- Kingdom / orders → `kingdomOrders` (frontline imperial defenders)
- Empire / protect → `empireProtect` (royal prisoner escort guards)
- Empire / advance → `empireAdvance` (royal pursuit messenger command unit)

`runFinalRouteConfrontation(route)` reads the previously saved companion ethical decision, starts only the matching battle, and later allows the Shion/Granz confrontation only after victory/surrender sets `final.route.<route>.checkpoint`. Until cleared, re-talking to the named NPC retries the battle. No additional map entity is invented. No automatic moral kill is recorded for incapacitating human enemies.

### Actual counterplay rather than cosmetic telegraphs
`checkpointEnemyIntent(b)` deterministically names a living target and bonus by battle ID and battle turn. The same function controls both:
- the dedicated, accessible `#battleForecast` user-interface warning shown **before** ally commands; and
- the real enemy-turn target, replaced only by the party's actual existing guard intercept.

A real guard interception was executed in an isolated engine smoke test: forecast Sophie, attack intercepted by Karen, Sophie remains at original HP. The four route / choice / target matches were executed and checked individually. As the battle engine advances b.turn, the next telegraph changes.

### Endings and decisions
Replaces the placeholder heading `Architecture Refactor v19` with three meaningful route-specific epilogue preview sections. Each route has two variants based on its saved companion choice: six distinct texts. All are clearly marked incomplete; no claim of a finished campaign. The 'seen' and clear flags remain idempotent; schema 23 unmodified.

### Tests and honest QA
- Added `tests/final_route_checkpoint_tactics.test.js`: four route mappings, visible forecasts, true enemy targeting, guard interception, surrender, story flags, schema-23 persistence.
- Added `tests/final_route_previews.test.js`: six individual epilogue variants, incomplete label, one-time journal entry.
- Isolated JavaScript execution checks in connector context: four unique encounter selections, four accurate attack targets, Karen guard interception, six unique epilogues. All passed.
- Syntax-parsed changed scripts independently.
- **Not run**: the full repository Node suite, full user journey in Chromium, mouse/keyboard accessibility, native save and reload from localStorage, screenshot comparison, sound listening / mixing. No completed art/BGM, route campaigns or product-release approval claimed.

### Before accepting / merging
1. In a real checkout: `npm test` and `npm run check` (the latter runs expensive browser gates; consider budget).
2. Use the save migration test and real browser to traverse all six route / choice combinations and guard path.
3. Confirm after loss the checkpoint is replayable, after surrender it remains cleared, and after reloading the chosen story path persists.
4. Verify combat warning reads clearly at 320px-520px widths, screen-reader announcements, dialogue flow, and audio.
5. Review performance, full game continuity and credits before moving Draft to Ready. Do **not** merge to main based solely on this report.
