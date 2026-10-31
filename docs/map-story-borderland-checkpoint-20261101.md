# 2026-11-01 03:43 JST — Halum checkpoint route and lived-in feedback (Draft)

## Verified repository baseline
- Main HEAD `d689aabb5146c9f45466a4f74f397e664c08fb4f`; parent map/story Draft #201 HEAD `4a3bdc1f4c9d4dc8a1999aae8b492c5de1b7832c`. Art Draft #202 and unrelated save PRs remain untouched. This change stacks on #201; do not merge into main out of order.
- Read `js/data/maps.js`, `js/systems/events.js`, `js/systems/movement.js`, `js/systems/story.js`, `tests/harness.js`, `tests/frontier_reentry_continuity.test.js` and the previous Halum gate note.
- **Confirmed bug:** `lostMerchant` stands at (18,10), `oldCheckpoint` at (20,10). The merchant and Triton both directed players **west** to a checkpoint physically **east** of the wagon. Picking up the pin after speaking to the merchant could also overwrite the immediate delivery objective with a distant scout visit, causing unnecessary backtracking.
- Other out-of-order defects: briefing after helping the merchant reset the objective to a completed cart; repeat scout dialogue assumed the wagon was already fixed; on reentry the objective ignored whether the pin was already found.

## Player-visible implementation
- Merchant and Triton now point east, matching the actual checkpoint. The broken wagon points toward the checkpoint **only after** the player hears the merchant's request, preserving discovery.
- Shared `borderlandNextObjective` chooses the next practical step from existing v23 flags: merchant request → pin → deliver; scout briefing (if still missing) → inn rest → fort. Discoveries remain valid in any order; no added quest gate.
- The scout's first and repeat lines respect prior repair and rest. The child and the inn notice acknowledge the repaired wagon. This is a small, voluntary payoff for repairing civilian infrastructure rather than a currency reward or added forced cutscene.
- Existing tiles, NPC positions, collision, four-hero relationships, future revelations, combat and Save schema v23 are unchanged. The route is a short east-side loop, not a new large map.

## Player evidence checked 2026-11-01
- Steam `Chained Echoes` reviews, https://steamcommunity.com/app/1229240/reviews/ : a displayed October 29 negative review describes repeatedly circling a map before finding a hard-to-see doorway; October 28 positive reviews praise exploration detail. Publication year was not independently verified from the excerpt. **Individual opinions only**.
- Steam `Sea of Stars` reviews, https://steamcommunity.com/app/1244090/reviews/ : displayed October 5 review criticizes unclear route cues and repeated walking; other reviews value finding interesting things while exploring. Publication year not independently verified. **Individual opinions only**.
- **Inference:** truthful spatial directions and immediately responsive NPCs should reduce frustration and make a short optional loop feel consequential. **Unverified:** actual enjoyment, commercial readiness, 44px visibility, completion time, market-wide trend and human reception. No layouts, dialogue or art copied.

## Verification and next gate
- Before upload, full edited JavaScript files parsed in V8. Pure objective function passed 8 independent state permutations, including merchant-before-scout, found-pin-first and completed-rest. After upload, 17 assertions on the exact extracted inline NPC/object code passed with isolated dependency mocks (request → pin → repair → briefing → child/notice → rest → scout repeat).
- Generated the exact 24×15 Halum tile layout from the repository map functions. Static tile flood-fill reaches the merchant (18,10), checkpoint approach (19,10), scout (6,10), host (7,6), and campfire (12,5). This is **not** an in-game collision or browser movement test.
- Added `tests/borderland_checkpoint_wayfinding.test.js` (3 Node harness regressions) covering real inline interactions, east/west map positions, journal objective, visible notice/child response, Save v23 and north reentry.
- **NOT RUN:** committed Node harness suite, full `npm run check`, Chromium game walkthrough, save/reload in a browser, human playtest. Local checkout cannot resolve github.com DNS; no claim of tested commercial quality.
- Next: `node --test tests/borderland_checkpoint_wayfinding.test.js tests/frontier_reentry_continuity.test.js`, then `npm run check`; browser-walk scout (6,10) → merchant (18,10) → checkpoint (20,10) → merchant → host (7,6), then reverse from Watchfort. Inspect object approach collision, notice readability and whether the east checkpoint is visually distinguishable from rocks. **DRAFT / HOLD / NO MAIN MERGE.**
