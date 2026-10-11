# Gray Crown — Opening World Art & Life Pass (Review Candidate)
2026-10-11 · Base `fix/visual-battle-followers-player-reported-20261011` (PR #66)

## The player quality bar
This pass does **not** claim the environment is commercially finished. Its practical goal is to stop the opening from resembling unrelated repeated tile blocks and identically posed NPCs, while keeping the actual game navigable. Price-worthy presentation needs a coherent scene composition, credible human activity, differentiated locations, responsive and honest collision, and ultimately approved hand-designed tile/NPC art rather than a large number of rectangles.

## Code delivered

- **Village identity:** Separate frontages and silhouettes for the family home, orphanage (green communal awning/bench), mayor's residence (upper dormer/stone step), and eastern cottage (chimney and herb rack). A bakery display, western agricultural rows, well buckets and subtle orphanage play objects ground the NPCs' existing dialogue in physical world evidence.
- **Road identity:** Curved trade-route wheel ruts and erosion, roadside milestones placed on already blocked tiles, and a visible merchant cart stationed in **four newly reserved solid forest-edge cells**. The cart appearance responds read-only to `early.merchantCart` ("repair" vs "return" vs unresolved); the merchant's "return" reprise dialogue was corrected so they are visibly preparing rather than already departed.
- **Capital identity:** District-specific market goods/awnings, meaningful queue-wear marks and a lightly equipped ration basket, richer palace approach stone inlays. The market is visually prosperous but shortage is visible at the ration line. Three solid-looking capital stall/basket positions have actual collision guards; central avenue remains open.
- **Named villagers:** Selected existing named baker, farmer, elderly resident, orphan, merchant, vendor, rationing mother, flower seller, and recruit now have visible occupation-specific clothing (aprons, workwear, shawls and straps) and readable profession-related props in their actual positions. Tiny gesture variations refresh only when a named person is within five tiles; idle redraw is capped at **5 FPS** and honors reduced-motion preferences. No fake wandering NPC that can't be talked to.
- **No new dialogue menus or exploration currency:** The implementation uses only existing coordinates, existing `events.choices` and current maps. `OpeningWorldLife` is a narrow, opt-out render module, inserted before `world.js`. Outside its three target maps it paints nothing. No save schema migration or music changes.

## User-experience precautions
- The bakery counter occupies two formerly green tiles with real collision; access to the bakery NPC, village north gate and well survives.
- The roadside cart occupies reserved solid tiles, **not the central trade route**. The merchant and cave remain reachable.
- Two pre-existing capital shop footprints and one ration basket use explicit collision without converting their stone floor to an unrelated house/forest tile.
- Decorative lane ruts and chalk queue marks can be walked across; actual obstacles cannot.
- This is an early-area visual pass, not a redesign of every late-game environment.

## Evidence and outstanding review
Performed in this chat:
- All changed JavaScript files were syntax-parsed in isolated V8.
- **10 authored source-level drawing/path tests were executed**, with all passing in a virtualized JS environment. Checks included three unique scenes, role props, choice-sensitive cart, four different house identities, nearby actor activity, collision/route access, module order and no story/save mutation.
- Additional direct BFS-style path tests passed from the road start to wolf route/merchant/west detour, from village to bakery and north gate, and from capital south to the square and west market.
- Route rendering source executed in isolated V8 and produced distinct scene rectangle sequences.
- `tests/opening_environment_worldlife.test.js` committed as repeatable Node test source.
- `tests/browser_opening_worldlife_visual_e2e.py` committed to capture A/B **real** screenshots at desktop and narrow widths, and to verify actual `isBlocked` guards in Chromium.
- The full Node suite, true Chromium tests, actual screenshots, animated NPC appearance and art-direction quality **have NOT run**. Do not attach invented screenshot artifacts or describe this art as approved.

Run on an actual checkout with Chromium/Playwright:
```bash
npm test
npm run opening-art-browser-test
npm run opening-art-acceptance
```
The last command requires Playwright Chromium installation. GitHub Actions in the parent integration chain had earlier startup failures, so this remains a **Draft PR** and cannot be accepted without browser and actual visual evaluation.

## Remaining work toward a game somebody would buy
1. Replace placeholder block-based human bodies with reviewed, individually designed and animated 4-direction **NPC sprite assets**, with coherent outline/shading and natural working poses.
2. Hand-author a cohesive pixel tile set (house rooftops, roofs/doorways, road edges, town market fronts), ensuring scene-specific color keys rather than repeated geometric patches.
3. Compare the same saved camera at daytime / dusk with both environments and NPC assets in the actual browser, including shadow, material readability and layering; avoid excessive post-processing/gloss.
4. Audit walking collision around every visual prop and the true on-screen interaction radius (especially bakery, merchant cart, market/rations).
5. User-playtest the first 20 minutes: do the houses, shortcuts and civilians read naturally **without** decorative clutter or compulsory dialogue?
