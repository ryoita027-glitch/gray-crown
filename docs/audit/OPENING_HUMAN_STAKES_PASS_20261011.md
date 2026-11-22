# Gray Crown — Opening Human Stakes vertical pass
Candidate branch: `feature/early-game-human-stakes-v1-20261011` · 2026-10-11

## Design intention

The opening must teach what Gray Crown is about **by letting the player decide** before any national allegiance or late-game karma is introduced. The four heroines are people from Ryune, not faceless duty-bound RPG archetypes. Each optional vignette has a choice, an immediate effect and a later grounded callback.

## Implemented in existing maps and entities

| Where | Decision | Immediate cost/benefit | Later memory |
| --- | --- | --- | --- |
| Ryune village / orphan child | Give one `薬草` to an ill orphan, or keep it for the journey | Giving deducts exactly 1 herb; keeping preserves it | Orphan revisit, caretaker in orphanage, Sophie during departure and return, Queen's-capital ration queue |
| Royal road / merchant | Help Triton repair the supply cart for the capital, or advise retreat toward the safer village | Repair adds 1 `携帯食`; retreat adds 1 `薬草`. Neither repeats | Merchant revisit, ration mother's dialogue about a cart/blocked supplies |
| Abandoned fort / old military banner | Margaret records sewn-in soldiers' names, or Karen ties up their weathered banner | No loot, no stat change | Banner revisit and one additional protagonist line at capital's victory propaganda poster |

All choices record a unique key in **existing** `state.events.choices`, require no save schema migration, do not change faction karma or force an eventual story route, and cannot be repeated for extra items. A "decide later" option doesn't set flags. A donation option is not offered when out of herbs; direct dishonest calls safely return false.

### Four-person acting and pacing
- The orphan dilemma gives Sophie ownership of the medical decision; Margaret articulates scarcity and Karen does not override her.
- Triton can repair the cart with practical skill, not only with a sword.
- Margaret and Karen have legitimate but different understandings of what an abandoned flag means.
- Village departure reflects the actual orphanage choice, and return visits preserve the earlier decision.
- Old poster interactions no longer append the same journal entry repeatedly.
- Existing cave boss, battle progression and main story stages are not touched.
- Progress appears on the existing optional-discovery HUD in Village, Road and Cave. Optional scenes do not block the main route.

## Current verification facts

**Actually executed in this conversation (isolation checks):**
- JS source parsed for `events.js`, `movement.js`, `commercial_discovery.js` and the new Node test.
- Both three-choice story-state combinations (donate/repair/names; reserve/return/raise) were directly executed in the JS source environment: inventory costs/rewards, one-time flags, three discovery counts, journal entries, no main-story advance and two capital reaction lines all matched expectation.
- The actual victory-poster handler was invoked in isolation for both banner outcomes: correct callback; no repeated journal entry.

**Test sources committed, NOT executed:**
- `tests/early_game_human_stakes.test.js`: optional NPC/object locations, all decisions, source runtime, 23 schema serializing/migration, repeated visits and missing-inventory handling.
- `tests/browser_early_game_human_stakes_e2e.py`: real HTML/controls, two scenarios, actual dialogue choices, inventory/UI, postscript in the capital, browser Save/Load and screenshots.
- Run `npm run early-game-acceptance` on a complete repository checkout after Playwright/Chromium installation.

**Still not certified:** full `npm test`, actual Chromium E2E, real 1st-chapter fresh-game walking route, input responsiveness, mobile layout, soundtrack or original art quality. The parent integration branch's Actions setup failed before any test step, with inaccessible logs; this is not a passing CI state. Keep this PR Draft and do not merge to main until checkout/runner access is restored and baseline acceptance is green.

## Quality next steps

1. Actually play Ryune → Road → Cave → Capital and compare chosen/nonchosen conversation rhythm, world ambience and four-hero portrayal.
2. Validate that giving up a healing item makes early battles thoughtful but not unfair; tune after measured HP/MP and completion data.
3. Produce/approve location-specific pixel backgrounds and properly mixed audio **in a separate reviewed art/audio task**; this pass does not call existing procedural sound "professional" or claim new sprites.
4. Review canonical lore and how early mercy/responsibility motifs influence later routes (without inventing outcomes from one early choice).
