# 2026-10-31 — North-road milestone care: a visible, optional player action (10:48 JST)

## Repository baseline and separation
- Main HEAD checked: `d689aabb5146c9f45466a4f74f397e664c08fb4f`. This branch is based **exactly** on [Draft PR #159](https://github.com/ryoita027-glitch/gray-crown/pull/159) HEAD `18141bafa594e6c69c6d60fdf402908109e05a47`, stacked on #157 → #155 → #153 → #146. Do **not** merge independently into main. Other task branches and PR #98 were not modified.
- Existing `northroad` already has a walkable spur to stone milestone (9,6), a scout (12,3), a direct northern exit and route-dependent south return. The milestone previously only delivered a static direction line. The scout already rewards clearing the old fort once; preserve that logic.
- Existing `state.events.choices` is serialized in Save schema v23; no new schema, map size, NPC, path blocker, item, reward inflation, plot spoiler or story gate is introduced.

## Public signals (checked 2026-10-31 JST)
- [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/): an **Oct 28 individual negative review** praises exploration and art but criticizes that player characters have little impact on events; an **Oct 24 individual review** criticizes over-explained story and similar-sounding character voices. A **Oct 29 individual negative review** mentions repeated navigation due to a hard-to-see doorway. These are individual, non-representative opinions, not evidence this feature will work.
- [Octopath Traveler II Steam reviews](https://steamcommunity.com/app/1971650/reviews/): **Oct 26 and 29 individual negative reviews** criticize tedious exposition/backstories. Again, not a consensus.
- **Hypothesis / not verified:** allowing a 10–20-second optional action at a useful existing landmark, with an immediately clearer inscription and one NPC acknowledgement, offers a small sense of agency without forcing more dialogue, quests or backtracking. Two distinct party voices keep the interaction about the four friends rather than a lore lecture. No text, art, layout or unique scenario copied from reviewed games.

## Implemented player-facing slice
1. On first inspecting the existing stone milestone, retain true directions for both arrivals and offer **clean the moss** or **continue**. Declining changes nothing and permits reconsideration; neither route is blocked.
2. Cleaning records one choice and one journal line, visibly replaces the moss with a high-contrast carved label, and gives two short lines from Margaret and Karen about the return journey. Later visits show only directions; no repeated choice or journal reward.
3. The existing scout notices the restored marker in his direct-road or fort-return follow-up. The fort's one-time herb remains exactly once and the forest route does not receive it.
4. New `tests/northroad_waystone_care.test.js` covers the visible color change, optionality, route directions, NPC acknowledgement, one-time reward and Save/Continue persistence.

## Verification / limitations
- V8 source syntax compiled for the modified events and renderer before upload. Existing northroad geometry and passability are untouched; the marker remains at (9,6).
- New Node-harness tests are committed **but full Node test execution, `npm run check`, browser walking, native-pixel visual review and human first-play testing have not yet been performed**. Authenticated private clone from this container failed DNS resolution of github.com. Keep **Draft / HOLD**.
- Next: exact-SHA Node harness and a real browser walk from both entry routes, with the milestone initially ignored, then restored, then revisited after Save/Continue. Confirm readability and that the two-line beat does not interrupt the route.
