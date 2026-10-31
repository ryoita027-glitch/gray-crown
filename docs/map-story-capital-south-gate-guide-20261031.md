# 2026-10-31 — South-gate city wayfinding, without a mandatory detour

## Source and safety
- Parent is Draft PR #170 HEAD `e7cf1f0611cd738c5ceb5af307c4fbb17e5097a0`; production main observed `d689aabb5146c9f45466a4f74f397e664c08fb4f`. This is a stacked Draft, not a production release.
- Read live map, event, render, stage and test source; open PRs #171 (Sophie visual, overlapping `world.js` but different early lines), #169, #166 (save) and #168/#170. This adds a separate drawing clause near road signs; reconcile both branches before merging.
- No new region, map size, combat, item, NPC, karma, ending, save schema, mandatory quest or late-war revelation.

## Player-facing vertical slice
- On entering Aldina from the south, a small two-plank sign stands at (10,13), immediately west of the existing northbound 11/12 avenue. It is an actual map object with readable '城↑' / '宿←' marks, not a floating quest arrow.
- One optional interaction shows the existing castle, White Stag inn and ration-queue directions; Karen has one short first-read reaction. Later reads are one line.
- After ceremony, the same sign prioritizes the west inn. After the inn night, it directs the player northwest to Granz. After briefing, it points north to Ash Road. Late-war returns use neutral weathered text. No automatic teleport or forced dialogue.
- Sign is on a verge; both main-road lanes and existing city objects stay in place. One optional `state.events.choices` key prevents repeated first-read banter in Save v23.
- **Differentiation hypothesis:** Aldina's ordinary public infrastructure quietly guides the party while its lived-in civilian stories remain voluntary. Unlike an exposition checklist, wayfinding responds to story progress.

## Market evidence checked 2026-10-31
- **Individual negative review, not a consensus:** [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/) displays an Oct 29 review describing repeated map backtracking after missing an unobvious door. Another Oct 25 review reports often feeling lost in nested areas.
- **Individual positive reviews:** the same listing includes Oct 28 praise for small world details and character/world discovery, illustrating that navigation clarity should not erase exploration.
- **Individual negative review, not a consensus:** [Sea of Stars reviews](https://steamcommunity.com/app/1244090/reviews/) includes an Oct 5 complaint about unclear pathing despite attractive visuals. Year is not visible in the excerpt and is not inferred.
- **Inference, unproven:** an optional landmark with short stage-accurate directions may reduce lost time between south gate, ceremony and inn without an intrusive UI waypoint. No human player trial supports an effectiveness claim.
- No source dialogue, layouts, quest designs, characters or assets were copied.

## Validation status
- Source strings were fetched from the GitHub parent; changed functions compiled in V8 and were subjected to isolated mock checks during the run. This is **not** a full browser test.
- Added Node harness regression for visible sign, adjacent path, Save/Continue, repeat dialogue and stage-based directions. **Node harness test not run** without a local private checkout.
- **NOT RUN:** `node --test tests/capital_south_gate_guide.test.js`, `npm run check`, Chromium 44px map traversal, full Save/Continue integration, human 5–10 minute play. Do not merge before these pass.
- Next acceptance: capture south-gate 44px scene, walk to the official then inn, and verify that the sign is readable and does not obstruct the left market detour or compete with visual-unification PR #171.
