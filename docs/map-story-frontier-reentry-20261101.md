# 2026-11-01 01:43 JST — Serad reentry continuity (Draft)

## Repository baseline and collision check
- Checked main HEAD `d689aabb5146c9f45466a4f74f397e664c08fb4f`, open map/story Draft #197 HEAD `fe958e95fa7cd16fdc8f9c4dfecd4c64156b38f5`, and concurrent save/art Drafts #195/#198. This isolated branch is stacked on #197, not main. No main merge.
- Inspected `js/systems/movement.js`, `js/systems/story.js`, `tests/alpha2_frontier.test.js`, `tests/ashroad_reentry_direction.test.js`, and prior reentry note.
- **Verified in source:** `enterFrontier()` always called `advanceStory(FRONTIER_ARRIVAL)`, `travelScene` with the original Serad narration and an arrival trigger. The same function handles Ash Road's north exit and Borderland's south exit, including *return visits*. The forced scene and introductory objective repeated even after the party had already completed Frontier events.

## Playable change
- On **first visit**: retain original Serad arrival, chapter card, front-line atmosphere, and arrival event.
- On **revisit from Ash Road or Borderland**: land at Serad south gate (11,13) facing north; skip chapter card, introduction, and arrival trigger; restore movement immediately. Restore the objective from the actual canonical story stage, including hospital or old-checkpoint progress. Do not reset quest flags or rewards.
- Existing geometry, NPCs, chapter lore, visual assets, encounters, and Save v23 are unchanged.
- **Player hypothesis:** a voluntary return now feels like entering a familiar place rather than starting the same chapter again. This is distinct from #197, which fixes entry *to Ash Road* from Serad.

## Player feedback checked 2026-11-01
- *Chained Echoes*, Steam reviews (https://steamcommunity.com/app/1229240/reviews/), displayed Oct 29: individual negative review describes circling the same map repeatedly to find a hidden entrance; Oct 28 positive review values the world's small details. **Observed review text**, not representative market data. The retrieved page did not explicitly establish the year of each displayed review.
- *Sea of Stars: Sunset Edition*, Steam reviews (https://steamcommunity.com/app/1244090/reviews/), displayed Oct 5: individual negative review reports excessive return walks; another describes unclear route signals. **Observed review text**, not representative market data; displayed review year unverified.
- Older 2023 *Sea of Stars* discussion (https://steamcommunity.com/app/1244090/discussions/0/3814034023688082163/) mentions unskippable scenes/backtracking; **historical corroboration only**.
- **Verified fact:** repeated Serad introduction is a code path on revisits. **Inference:** avoiding it improves pacing and player agency. **Unverified:** subjective enjoyment, 5–10-minute human playtest, visual legibility and browser timing.

## Validation and integration gate
- Edited `movement.js` parsed successfully with V8; three isolated first-visit/revisit stage scenarios passed before the write.
- Added `tests/frontier_reentry_continuity.test.js`: Ash Road→Serad hospital objective + Save v23, Borderland→Serad completed-stage objective, and first-visit introduction. Test source parsed with V8; **Node harness tests NOT EXECUTED**.
- Browser walkthrough and full `npm run check` **NOT EXECUTED** in this connector-only run. Do not claim production readiness or human feedback.
- Next gate: `node --test tests/frontier_reentry_continuity.test.js tests/ashroad_reentry_direction.test.js tests/alpha2_frontier.test.js`, then `npm run check`; browser-walk Serad→Ash Road→Serad and Serad→Borderland→Serad at different stages. Check HUD, dialogue, save/reload, collisions, and duplicate arrival triggers.
