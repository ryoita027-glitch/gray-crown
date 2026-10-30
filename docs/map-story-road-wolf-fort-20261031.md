# 2026-10-31 — Road sign → wolf traces → old-fort entrance

## Repository facts (read from exact PR #153 HEAD `d4448c6db3065c7ac237ce14b902a86576ee4d78`)
- Existing road objects: sign (10,2), wolf (11,5), old-fort cave (13,1). The sign is walk-through; the cave is an interactable blocker; (13,2) is a walkable approach.
- The sign already describes wolf footprints and allows optional scouting, but the road accents did not draw matching footprints. After defeating the wolf, a previously scouted sign still warned about the first attack instead of acknowledging the cleared danger.
- Existing stones already lead toward the cave; the cave opening was small and unframed. The road's western herb detour in PR #153 remains unchanged.
- No save-schema or story-stage additions. This PR is **stacked on #153**, which itself is stacked on #146; it cannot be merged independently into main.

## Public signals checked 2026-10-31
- [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/): a negative review posted Oct 29 describes repeatedly searching for a difficult-to-notice door; Oct 28 praise mentions world details and exploration. These are **individual opinions**, not representative preference data.
- An Oct 25 review mentions frequently getting lost in nested areas. **Individual observation**, not a measured effect in Gray Crown.
- **Hypothesis, not validated:** a visible footprint trail matching a sign's tactical warning, a recognizable old-stone entrance, and a post-battle line that acknowledges the wolf's defeat will reduce aimless backtracking and make this short section more coherent.
- Distinctiveness: the four-hero scouting decision and Gray Crown's old-fort approach; no copied level layout, quest, dialogue, assets or music.

## Implemented player-facing slice
- Three small muted paw-print clusters now connect the existing wolf and road-sign area. These remain as physical traces after battle; no flashing marker, extra collision or loot.
- A shallow stone surround is drawn behind the existing cave opening, entirely within its blocked interaction tile, making the destination readable at native pixel scale without a fake obstruction.
- The road sign now points to the actual east-side old-stone entrance. After the wolf is defeated it acknowledges the cleared threat, whether or not the player previously investigated the tracks; it no longer presents an irrelevant pending-attack tactic.
- No changes to enemy stats, item rewards, travel, existing map dimensions, world choices, Save schema 23 or story spoilers.

## Acceptance and limits
- Added `tests/road_wolf_fort_wayfinding.test.js`: checks exact draw rectangles, sign/approach passability, sign before and after wolf defeat for both scout states, unchanged inventory/story stage.
- **Executed against re-fetched committed source:** V8 syntax parsing 3/3 (renderer, events, new Node test); 6/6 actual renderer rectangle checks (three paw-print clusters and three cave-frame parts); 4/4 actual sign-branch dialogue cases (wolf alive/dead × scout unread/read); road map function evaluated from committed map source and a collision-aware breadth-first route from the southern road to the cave approach was found (174 reachable cells examined). These are isolated checks, **not** full gameplay acceptance.
- **NOT RUN** until verified: full repository Node harness, `npm run check`, Chromium real walking and 44px screenshots, Save/Continue, and human first-time playtest. The isolated GitHub read/write environment cannot clone the private repo from the local container due DNS resolution failure; no paid Actions rerun.
- Browser gate: village → merchant → optional western cache → sign → wolf → sign again → cave. Check that footprints are recognizable but not fake pickups, cave is visible at normal scale, NPCs/followers do not hide the sign, and the post-battle text does not imply an unseen action.
- Keep Draft / HOLD; do not merge before integration tests and actual-play review.
