# 2026-10-31 — Western road detour: clue, reward and visible aftermath

## Repository facts verified on PR #146 HEAD `a1ea5fd5c0ef017208a41d35991a1ec3a945c9ae`
- The existing `roadCache` at (7,6) gives exactly **one herb**. The western road spur (7,8) → (7,7) → (7,6) is already P terrain; the unopened box itself is the interaction blocker, not the two approach cells.
- `openTreasure` already writes `state.world.treasures.roadCache`, redraws and prevents repeated rewards. The original generic box artwork previously vanished on pickup, leaving no distinct visual indication of the opened container.
- The merchant's `early.merchantCart` repair/return choice is independent of the cache. The canonical route remains village → road → old fort → capital. Save schema remains 23.

## Public player signals checked 2026-10-31
- [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/): one October 29 negative review describes repeated wandering to find an inconspicuous door; an October 28 positive review praises the journey and small environmental details; another October 28 negative review praises exploration but criticizes weak protagonist impact. **Verified individual opinions, not representative market demand.**
- [Octopath Traveler II Steam reviews](https://steamcommunity.com/app/1971650/reviews/): October 26–29 negative comments criticize dialogue length/tedium. **Verified individual opinions, not proof that all players want short dialogue.**
- **Hypothesis (unverified):** two understated scuffs, a contextual NPC clue, a one-herb detour and an emptied box improve the early 5–10-minute exploration loop without quest markers, forced detours or exposition. Human acceptance remains unknown.

## Actual changes
- Existing passable cells (7,8) and (7,7) gain small scuffs leading to the existing western cache; a cloth tag near (7,6) is visible only before pickup.
- On collecting the one existing herb, the box becomes a shallow, visibly empty container instead of disappearing without an environmental trace. Its tile remains passable after collection, as it already did.
- After either wagon outcome, the merchant gives a single-sentence optional hint while the cache is unopened; after pickup the hint disappears. No new NPC, reward, object, collision, story stage, journal entry or save key.
- Differentiation: an original Gray Crown merchant's practical local knowledge points to a reachable early-road supply find; the player's small discovery persists visually without copying another game's map, characters or writing.

## Verification and release gate
- Added `tests/road_west_cache_payoff.test.js`: passable approach, initial visuals, one-time herb, post-pickup appearance, both merchant outcomes, no journal inflation, Save/Continue and stage invariance.
- **Not yet executed in the full Node harness:** the test source, `npm run check`, browser navigation, native 44px legibility, integrated save/continue or human playtest. Do not interpret source existence as a test pass.
- Required actual-play path: village → merchant → west spur → box → merchant → old fort. Reject or revise if the marks look like fake quest markers, the empty box looks like loot, the approach is obstructed by followers, or the detour feels like filler.
- Isolated branch based on exact PR #146 HEAD `a1ea5fd5c0ef017208a41d35991a1ec3a945c9ae`. This is stacked work for review; PR #146, frozen PR #98 and main were not modified. No paid APIs or Actions used.

**Status: DRAFT / HOLD / NO-GO** pending real gameplay QA.
