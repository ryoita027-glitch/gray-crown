# 2026-10-31 — Old-fort / forest-road arrival payoff at the north-road scout

## Source-of-truth facts (checked 2026-10-31 JST)
- Read current main HEAD `d689aabb5146c9f45466a4f74f397e664c08fb4f`, open PRs, and exact [PR #155](https://github.com/ryoita027-glitch/gray-crown/pull/155) HEAD `49ce86092af99b21bb71395c77b85a56e57954df`.
- The road already has **two actual routes** to the north road: the direct forest road (`enterNorthRoad('road')`) and the old-fort north exit (`enterNorthRoad()` after `bossDead`). `northRoadFromRoad` records the latest arrival route and controls the return transition.
- The north-road scout (12,3) previously asked **every** party whether it came through the fort, including parties that took the direct road. The milestone (9,6) only reported distance, not which route the south return leads to.
- The fort boss is already a required encounter for exiting the fort northward. `isDefeated('boss')` is the established persisted defeated-symbol state. The existing `state.events.choices` dictionary is saved with schema v23.
- The merchant wagon, western cache, wolf tracks and stone entrance remain owned by stacked PRs #146 → #153 → #155; this change is **based on exact #155**, not main. Do not merge this stacked PR independently into main.

## Public player signals (reviewed 2026-10-31)
- [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/): Oct 29 individual negative review describes missing an unobvious door and revisiting a map repeatedly; Oct 28 individual review appreciates small world details, while another criticizes weak player influence on the story. These are **individual accounts**, not representative user testing.
- [Octopath Traveler II Steam community](https://steamcommunity.com/app/1971650/): Oct 26 and 29 individual negative reviews criticize tedious dialogue / repeated backstory. Not evidence of this change's effectiveness.
- **Hypothesis, unverified:** route-specific acknowledgement, clear north/south directions, and one tangible herb for clearing the dangerous fort will make the branch feel intentional and less like identical corridors. Avoid adding a long explanation or extra NPC.
- Differentiation: a local scout reacts to the Gray Crown party's actual old-fort passage and shares one field supply. No copied dialogue, geography, reward-board mechanics, graphics or scenario from other games.

## Player-facing implementation
- Scout on the direct forest route now identifies that route correctly and gives immediate north/south directions; no reward, no false fort victory claim.
- On the actual cleared-fort route, the scout acknowledges the newly passable north gate, Karen responds briefly, and the scout hands over **one herb**. Inventory and journal change immediately, visibly, once per save. Revisit has a single short acknowledgement, never repeats the gift.
- The existing milestone now explains whether walking south returns to the forest road or the old-fort north gate. No fake shortcuts, new map area, enemy stats, encounter changes, route flags, progression gates, art edits, or new save-schema version.
- This gives the optional fort route a modest **world-response + consumable payoff** without making the direct route inferior for players who want a faster story.

## Verification and limits
- Parsed the actual updated `js/systems/events.js` using V8 syntax compilation; executed the extracted new helper with isolated state stubs for direct road, fort first contact, repeat visit, direct road after boss, and one-time herb/journal checks. All these **isolated** conditions passed.
- Added `tests/northroad_scout_route_payoff.test.js` for actual game harness, route dialogue, one-time supply, route switching, milestone, Save/Continue, and unchanged story stage. **Test source parsed; full Node harness not run.**
- Local container `git ls-remote` failed DNS resolution for the private GitHub repository on 2026-10-31. GitHub connector fetched and saved source; no paid CI / Actions reruns.
- **NOT RUN:** `npm test`, `npm run check`, full browser walkthrough, real Save/Continue with repository runtime, human 5–10-minute playtest, or 44px visual acceptance. The improvement is **Draft / HOLD**, not commercial acceptance.
- Next actual-play gate: village → road (direct) → north-road scout → milestone → south return; separately village → wolf → old fort → boss → north-road scout → Save/Continue → scout revisit. Verify that the herb is shown once and that return directions match the visible path.
