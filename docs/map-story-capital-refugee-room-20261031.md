# 2026-10-31 — White Stag inn: optional refugee room request

## Current baseline / conflict review
- Read current `main` HEAD `d689aabb5146c9f45466a4f74f397e664c08fb4f` and the latest map-story Draft #174 HEAD `c78173594b3917843d958b8a0138804dd3f8ef1f`.
- Stacked branch starts from exact #174 HEAD. Prior #172, #170, #168, #165, #163, #161, #159, #157, #155 remain separate unmerged layers. Visual #175 and save recovery #166 were inspected for overlapping concerns; this slice changes no render, art, map geometry, movement, save core, or scripts for other tasks.
- Inspected `js/data/events.js` canonical first-night scene, `js/systems/events.js` inn object/NPC dispatch and story conditions, `js/data/maps.js` existing White Stag objects, `tests/capital_inn_civic_memory.test.js`, and the previous map-story report.
- **Not released:** this is a stacked Draft candidate and must not be merged into main without full regression and browser acceptance.

## Player-visible improvement
- The White Stag already has a bulletin board requesting a room for displaced northern families, but it was previously a static line.
- After the ceremony, before the free first night, the board now offers a *voluntary* choice to ask the innkeeper to redirect the military-reserved room to the displaced family. The party then takes a smaller shared room; there is no gold cost, combat effect or quest lock.
- The innkeeper, Sophie and Triton acknowledge the choice. The board is marked arranged on revisit; the innkeeper remembers it; the canonical first-night opening takes place in the smaller room. The existing night scene, party recovery, objectives and ending routes remain unchanged.
- A player who does not engage with the board gets the original pacing and night scene. Declining has no penalty and can be reconsidered until resting. Once chosen, it cannot be repeated for more journal entries.
- This uses existing `state.events.choices` in Save v23, so no schema change. It never asserts the displaced family arrived or the war is solved.
- **Distinctive hypothesis:** an optional environmental detail is promoted into a small sacrifice the four childhood friends can make together, with immediate room/board/NPC/night feedback, rather than a generic collect-and-reward quest.

## External player signals checked 2026-10-31
- **Observed, individual negative review:** `Chained Echoes` Steam reviews, posted October 28 (year not explicit in excerpt), praises exploration/art but criticizes protagonists' lack of impact and being carried through cutscenes: https://steamcommunity.com/app/1229240/reviews/
- **Observed, individual positive review:** same Steam page October 28 review appreciates small world details and the journey/cast; other positive October 28 review praises character/world connections: https://steamcommunity.com/app/1229240/positivereviews/
- **Observed, individual negative review:** October 29 review on same Steam listing describes missing an unobvious doorway and repeatedly traversing the map. We did not enlarge the inn map or add a new room entrance.
- **Inference:** a choice-sensitive object with a short consequence may be more rewarding than another one-line background prop. Neither a market-wide preference nor an uplift in Graygrow engagement is established. No review text, scenario, NPC, geography, or other game's assets were copied.
- **Not verified:** current Japanese-language Steam review sample size or comparable controlled usability results. This change is not claimed as market-validated.

## Checks and remaining work
- PASS: V8 parsed full updated `js/systems/events.js` and new `tests/capital_inn_refugee_room_choice.test.js`.
- PASS: 12 independent function-level checks with the saved implementation: ceremony gate, two choices, no permanent decline, persistent offer, exactly one journal, immediate character reactions, board reactivity, shorter night adaptation, unseen ration-queue continuity, no repeat after rest, late-war priority, existing board/bed map positions.
- New Node harness regression file covers gating, re-entry, board/innkeeper/night changes, Save/Continue and canonical first-night progression. **NOT RUN:** Node harness itself, `npm run check`, browser playthrough, actual Save/Continue integration, and human playtest. Local container cannot resolve GitHub's hostname for cloning this private repository.
- Browser acceptance: at native 44px, compare (a) direct ceremony→rest, (b) ceremony→bulletin board→decline→reconsider→offer→innkeeper→rest; confirm no dialogue choice softlock, no visual mismatch with the shared room, and no first-night duplicate. If the unchanged room sprite conflicts with the shared-room text, revise narration or the physical room presentation before promotion.
- Next bottleneck: test the entire south-gate→ceremony→inn segment for redundant errands and awkwardly long mandatory conversations; reduce them only after a measured playthrough.
