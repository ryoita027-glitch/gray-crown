# Battle recovery recipient selection — 2026-11-17

Base: 009ccb6eadeb89c317a0d38a12f627ae4dbc15ca (PR #106).

## Player changes
治癒・薬草・魔力草 now open a companion selector showing HP/MP and capped recovery. Players can protect an anticipated target or refill a chosen caster instead of accepting the automatic lowest-ratio recipient. Cancel/Escape costs nothing. Full, downed, absent, stale and repeated selections cannot waste resources. Selection expires on encounter/turn/actor changes and is never serialized. Existing direct internal battleAction calls retain automatic-target compatibility. Party prayer and self-use food are unchanged.

The unfinished-route preview now repeats the exact selected intention as well as its explanatory note. This is not new ending content. Save schema remains 23; character assets and combat balance are unchanged.

## Evidence
- `npm run check`: hygiene, authority, Python/JS syntax and all 391 Node tests passed; zero failures or skipped Node tests. The browser gate subsequently failed at Chromium launch: socket() Operation not permitted. The complete check is NOT a pass.
- `NODE_PATH=<jsdom installation> node tests/dom_field_preparation.cjs`: passed on source (42 scripts) and with GRAYGROW_TEST_HTML=dist/GrayCrown_起動.html (43 including asset shim). Real DOM listeners verify recipient choice, Escape, exact MP consumption, stale double click, field preparations and notebook. Canvas is stubbed: no visual acceptance claim.
- `npm run release:checked`: six Python integrity/rights tests and both distribution builders passed. Standalone embeds 43 assets and 42 game scripts.

## Why the prior 28 failures disappeared
These were not 28 repaired gameplay bugs. The harness did not cancel RAF callbacks or advance Date.now consistently, causing story animations to never settle. PNG validation included the stored CRC bytes in its checksum input. Art fixtures still expected old sprite dimensions/names and omitted the logger in deliberate image-failure cases. Other assertions referenced old dialogue, the wrong exported API, an obsolete 150HP boss value (the committed balance is 185), or CSS outside the intended media block. Route tests now exercise actual state transitions instead of obsolete source-call spelling. The exact final-choice label change is a player-facing correction. No PNG files were regenerated or modified.

## Outstanding acceptance
Desktop/mobile layout, actual pixels, audio, and New Game → village → road → fort → boss → capital including Save/Continue still require a working browser. This is a draft development candidate, not commercial release acceptance.
