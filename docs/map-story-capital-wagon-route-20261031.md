# 2026-10-31 — Aldina wagon route feedback (13:45 JST)

## Scope and prior state
- Base: Draft PR #165 HEAD `d53099ada90729a5f955a0ef236ce198dda1fdfc`, itself stacked on #163 and earlier map-story Drafts. Current production `main` remains `d689aabb5146c9f45466a4f74f397e664c08fb4f`; PR #98 is frozen. Art PR #164/#167 changes the world renderer in a separate stack, so **manual conflict review is mandatory** before any integration.
- Read the current capital map, wagon event, renderer, ration-mother dialogue, previous PR #165 QA note, and its existing tests. The wagon already moved and left produce after the choice, but there was no spatial cue connecting the main avenue, cart and ration lane; the next destination could be hard to infer.

## Actual player-visible slice
- Before helping: low-contrast twin wheel grooves on existing south-gate paving from the main avenue toward the optional produce cart.
- After helping: the wheel marks continue north along the **existing walkable x=15 lane** to the ration mother's produce sacks (15,8). No new route, blocking, NPC, map area, currency or karma.
- Wagon keeper's first line identifies the ration destination as **east of the fountain**. The short revisit points back to the visible tracks instead of repeating the introduction.
- The post-war `returnedKingdom` scene hides these early supply-route marks and sacks. Save v23 still uses the pre-existing `early.capitalWagonGuide` choice, with no schema changes.
- Differentiation: a player can literally trace a minor act of wartime help across a living city, rather than receiving an abstract morality score or mandatory side-quest reward.

## Evidence, checked 2026-10-31
- **Confirmed individual player opinions, not population-level consensus:** [Chained Echoes Steam reviews, Oct 28–29 2026](https://steamcommunity.com/app/1229240/reviews/) include praise for environmental detail, but also a complaint about circling a map repeatedly before spotting an unobvious door. A separate Oct 28 review criticizes insufficient player impact. These reviews motivate hypotheses, not proven Graygrow outcomes.
- **Confirmed research with a different 2D-game setting:** [Lankes et al., CHI 2025, Pathways of Desire](https://doi.org/10.1145/3706598.3713191), a 50-participant study, reports persistent footsteps helped orientation for some players while too many footprints increased clutter. This motivates **few, subtle marks** rather than a dense trail. It does not validate this particular city.
- **Confirmed theory-oriented research, not a playtest:** [Tranter et al., CGVC 2025, Persistence of Agency](https://doi.org/10.2312/cgvc.20251213) argues for visible environmental persistence as a design mechanism.
- **Inference / unverified:** short route marks and grounded NPC directions may reduce first-arrival confusion and make the delivery feel consequential. No external human has played this exact revision.

## Verification and limits
- V8 syntax compilation of edited `world.js` and `events.js`: **2/2 pass**.
- Isolated V8 execution of the **actual edited** wagon renderer branch, with stubbed canvas and three event states: **10/10 checks pass** (cart before, entry marks, no premature route, route after, sacks after, cart gone, late marks absent, late sacks absent, first direction, revisit direction).
- Evaluated the **actual** `makeCapitalTiles()` source in isolated V8: **9/9 route-tile checks pass** (avenue x12–14 at y12, delivery lane x15 at y8–12, and blocked cart layby x14,y13).
- Updated existing Node test assertion for the changed revisit text; added a regression for trail before/after, actual walkable tiles, and late-war hiding.
- **Not run:** full Node harness, full `npm run check`, Chromium 44px camera view, actual Save/Continue after this change, human 5–10-minute playtest. The local container cannot resolve github.com for a private clone; connector-side isolated V8 checks are **not** integrated tests. Do not mark as production ready.
- **Draft/HOLD:** inspect whether wheel grooves are legible but not visually noisy at 44px, and whether the cart is visible from the south-gate approach. Check the shared `js/render/world.js` conflict against the separate visual-art stack before integration.

## Next player-facing bottleneck
Test the exact first-arrival path from the old-road vista through the south gate to the ration mother and ceremony. If the route reads as railroad tracks or the cart is occluded, reduce marks or adjust placement; do not add another NPC or exposition to compensate.
