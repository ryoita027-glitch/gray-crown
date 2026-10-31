# 2026-10-31 20:47 JST — Granz briefing: shorter orders, optional route priority

## Source of truth and isolation
- Checked main HEAD `d689aabb5146c9f45466a4f74f397e664c08fb4f` and active Draft PRs. Parent map/story Draft #182 HEAD `2e7391a6c35a40be4304ffead5800267d9ef577a` (stacked on #179 and earlier map/story PRs). Art and save tasks have separate PRs; this branch does not modify sprites, rendering, map tiles, save schema or their branches.
- Read `js/data/events.js` canonical ceremony/Granz/ash-road scenes, `js/systems/events.js` dispatch and dialogue adaptations, `js/data/maps.js` actual capital/ash-road coordinates, `js/systems/dialogue.js` choice continuation, and `tests/harness.js`. The Granz NPC is at capital (8,5); the burned home is west (4,5), cart east (17,9).
- Preserve the early knowledge boundary: no revelation of the older hero records, invasion history, or true motives before their later discoveries.

## Player-facing slice
- The compulsory Granz briefing is now 9 lines instead of 10; it still explains the public hero vs. actual military mission contradiction, the emperor, Serad, scorched supply route, refugees, scouts, and the warning against easy conclusions. All four companions speak.
- If the player actually gave up the White Stag room, Sophie refers to that concrete choice within her existing briefing line. No extra exposition screen.
- Immediately after the orders, the player can ask **one optional practical question**: where to find displaced civilians (west, burned home), or where to examine supply destruction (east, burned cart), or depart without asking. This is a navigational hint, not a route lock or a quest requirement.
- The chosen focus is journaled once and recalled at the existing burned home/cart through a *replacement* line, not an added mandatory cutscene. Revisiting Granz gives the chosen direction again. Declining preserves the ability to ask later. No item, combat reward, new save field, compulsory backtrack, or changed map footprint.
- Differentiation hypothesis: the player's first tactical question turns military exposition into a self-chosen point of interest that is later acknowledged at a real landmark.

## External evidence — checked 2026-10-31
- Steam *Chained Echoes* reviews, posted Oct 24 and Oct 28–29: individual complaints about exposition, indistinct character voices, missing player agency and getting lost; positive responses to world detail and the cast. https://steamcommunity.com/app/1229240/reviews/
- Steam *Sea of Stars* negative reviews, posted Oct 15–21: individual criticism of shallow dialogue and linearity. https://steamcommunity.com/app/1244090/negativereviews/
- **Confirmed:** those specific public opinions are visible. **Inference:** concise briefings with opt-in navigation choices might reduce passive reading and route confusion. **Unverified:** Graygrow player preference, effectiveness, and any market-wide trend. No story, character, level layout or dialogue was copied.

## Verification / remaining gates
- JavaScript syntax of both edited production files was checked using the JS parser before committing.
- New Node harness regression cases cover mandatory scene length, prior inn choice, optional question / skip, journal idempotence, save v23 round-trip, replay, and the correct ash-road callbacks. Tests added but **not executed** in this connector-only runtime.
- **Not run:** full Node suite, `npm run check`, actual browser movement/dialogue timing, 44px readability, Save/Continue in browser, or external human evaluation.
- Draft only; verify on actual game branch before merge. Especially inspect whether the extra choice after the nine-line briefing feels natural, and whether optional prompts are discoverable without a mandatory extra trip.
