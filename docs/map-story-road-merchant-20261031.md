# 2026-10-31 — Roadside merchant: visible choice, not just dialogue

## Actual source findings (verified in PR #98 frozen base)
- The road map has an existing merchant at (8,8), with an existing decision `early.merchantCart` = `repair` or `return`.
- The merchant explicitly talks about a broken wagon axle and then about repairing it or turning south. Previously the road's visual renderer had **no cart**, so the scene's key object and the player's outcome were invisible.
- The existing tree tile (6,8) is blocked (`T`), adjacent to the side path (7,8). It can hold a wagon drawing without a new fake walk-through obstruction, a new map object, or any changed collision.
- Existing rewards, chapter, capital ration-queue dialogue, save-schema-23 choice and NPC coordinates are preserved.

## External player signals checked 2026-10-31
- Steam *Chained Echoes* October 28 positive review praises the journey, cast, world and small environmental details. Another October 28 negative review praises pixel art and exploration but criticizes characters not affecting events; October 29 feedback describes repeated loops around a hard-to-see door. These are **individual reviews, not representative survey results**: https://steamcommunity.com/app/1229240/reviews/
- Steam *Octopath Traveler II* October 26–29 comments disagree about dialogue pacing, with some complaining about tedious exposition. This is **not** evidence that every player wants shorter scenes: https://steamcommunity.com/app/1971650/
- **Hypothesis, not proven preference:** A real visible wagon with a bent axle and an outcome-specific appearance gives this existing merchant choice a concrete visual cause and effect, without extra dialogue, map area, loot, or backtracking.

## Implemented on isolated branch
- Draw an original 32px-scale cart on the already-blocked roadside tile. The initial axle is visibly crooked.
- `repair`: straighten the wheel and tie down cargo; `return`: cover the goods and lower the hitch toward the south, leaving the broken wheel unfixed. All variants retain the merchant and the original walkable path.
- Repaint the world immediately after the existing merchant choice is committed.
- Added a Node regression test for original cart, both outcomes, collision, no duplicate rewards, story invariance, and Save/Continue.

## Evidence and acceptance status
- V8 parsed both updated JS files and the new test file.
- Isolated V8 execution of the **actual committed renderer source** verified nine checks across initial, repaired and returning pixel commands. The actual `commitEarlyMerchantChoice` function was also executed in a mock context: repair/return committed once, repaint called twice, repeat did not pay twice. **This is not the repository's Node test harness.**
- **NOT EXECUTED:** `node --test tests/road_merchant_cart_consequence.test.js`, `npm run check`, Chromium walking/collision, native 100%-scale screenshot, actual Save/Continue integration, human first-time playtest.
- Before approval: walk village → merchant → road sign → fort, inspect the cart at native scale, choose both outcomes on separate saves, confirm NPC/collision/readability and capital ration-mother echo. Reject if the cart reads as a tree or appears to block the side path.

**Adoption: DRAFT / HOLD / NO-GO.** No paid services, copied art, altered canonical plot, or main/PR #98 changes.


## 2026-10-31 follow-up — the capital visibly remembers the road shipment (unmerged)

### Grounded player problem and original implementation
- In the existing capital map, the ration mother stands at (16,8) and already comments on the merchant's decision via `earlyCapitalEcho()`. Previously the capital's eastern supply-house facade never reflected whether the cart was repaired or turned back.
- Existing `capital` H tiles (16,10) and (17,10) form a solid supply-house frontage beside the ration queue; the adjacent (15,10) street remains passable. The original `CapitalEnvironment.street` draws this frontage before the existing world-life chalk queue markings.
- Added small, original pixel supplies **inside that existing blocked facade**: one normal crate in all states; two extra visible sacks only when `early.merchantCart=repair`; an otherwise unfilled shelf when the merchant returns. A single merchant cannot plausibly empty a whole capital, and the mother's dialogue says the additional delivery *might* improve rations, not that it has already done so.
- No new NPC, shop, interactable, collision, quest, route, reward, chapter, world switch, item, save schema or irreversible decision. The original ration-mother dialogue remains unchanged. The visual echo appears on entering the capital and after Save/Continue without requiring an extra interaction.

### Public player signals reviewed on 2026-10-31
- *Chained Echoes* Oct 28 player feedback praises environmental details and exploration while another review criticizes protagonists' actions not affecting events; Oct 29 feedback criticizes having to circle a confusing map repeatedly: https://steamcommunity.com/app/1229240/reviews/
- *Octopath Traveler II* Oct 26 and 29 individual negative reviews criticize long or repetitive dialogue: https://steamcommunity.com/app/1971650/
- **Inference, not established consensus:** A visible, nonintrusive city-side consequence complements the already-written NPC response without adding a detour or another exposition scene. No player acceptance or statistically representative market proof has been obtained.

### Verification actually performed
- GitHub source for `js/render/capital_environment.js` and `tests/road_merchant_cart_consequence.test.js` compiled in V8's JavaScript parser.
- **Actual current renderer source executed in an isolated V8 mock canvas:** 8/8 checks passed for baseline crate, no premature delivery, two delivered sacks on repair, absence of empty-shelf marking on repair, no sacks on return, unfilled spare shelf on return, and retention of other city supplies.
- A new focused Node regression test checks real map H collision, adjacent walkability, both visuals, inventory/story invariance, and Save/Continue visual restoration. **It has been written but not run** in the repository's Node harness.
- **NOT EXECUTED:** `node --test`, `npm run check`, actual Chromium at 100% scale, camera/foreground compositing screenshot, actual integrated Save/Continue, human first-time playtest. Private GitHub source is accessible through the connector, but the execution container cannot resolve GitHub for cloning. Existing CI runner allocation was already blocked. These limits are not a pass.

### Next acceptance gate
- In a real browser at native scale: visit the road merchant and choose each outcome on separate saves; travel to the capital, check the supply facade near the ration mother, listen to her existing dialogue, Save/Continue, verify visibility and no occlusion/false blockage. Reject if the pixel sacks are unreadable or if the ration queue appears more prosperous than the script supports.

**Still Draft / HOLD / NO-GO.**

## 2026-10-31 follow-up — an optional, personally costly ration gift at the capital (Draft)

### Player-facing change
- The existing ration mother at (16,8) now offers a **voluntary** choice if the party actually carries at least one `携帯食`: give exactly one ration to her, or keep it for the journey. The merchant's repair outcome gives one portable ration, creating a tangible tradeoff between immediate aid and travel resources; the return outcome grants a herb instead and does **not** fabricate a ration.
- The gift deducts one real inventory item, writes `early.capitalRationGift='donate'` in existing Save schema 23 choices, updates the HUD, records a short journal entry and yields a specific grateful reply. Revisit dialogue remembers the gift and does not request another ration. Keeping the ration costs nothing and the player may reconsider later.
- The initial 3-line queue conversation and existing merchant/orphan echoes remain; after the first fully read conversation, ordinary revisits no longer replay the whole exposition. The existing later `returnedKingdom` war-aftermath dialogue takes precedence unchanged.
- No city-wide food supply miracle, additional reward, quest, route lock, new NPC, new collision, new art, forced detour or automatic merge. This is a *personal* act; the mother never claims one ration fixes the city's distribution.

### Public signals reviewed 2026-10-31
- [Chained Echoes community/reviews](https://steamcommunity.com/app/1229240): Oct 28 individual negative review praises exploration details but criticizes protagonists' lack of effect on events; Oct 29 individual negative review describes getting lost retracing a map.
- [Octopath Traveler II community/reviews](https://steamcommunity.com/app/1971650): Oct 26 individual negative review criticizes tedious dialogue; Oct 29 review criticizes lengthy repeated backstories.
- **Inference (not market consensus):** a brief, optional *resource-consuming* choice and a remembered NPC reply may provide more agency than another free dialogue choice; skipping repeated queue exposition may improve pacing. No A/B test, representative sample or human playtest confirms this hypothesis. No copied plot, dialogue, map or assets.

### Implementation and actual verification
- `js/systems/events.js`: `commitCapitalRationGift` and `capitalRationMotherVisit`; existing ration-mother fallback delegates to the new handler.
- `tests/capital_ration_gift.test.js`: real-harness regression source for no-food, donation/one-time spending, defer/return, Save/Continue, and late-war precedence.
- **Executed before first code commit:** V8 syntax compilation of the complete modified events source and 6/6 isolated executions of the actual new helper with controlled state/dialogue mocks (no-food, donate, repeat prevention, grateful revisit, keep, late-war precedence).
- **Executed after test-file creation:** V8 syntax compilation of the Node test source (parse only).
- **Not executed:** the committed Node test in the full repository harness, `npm run check`, actual Chromium/44px UI, real input/camera/collision, Save/Continue end-to-end, or human player evaluation. The prior local private checkout was blocked by GitHub DNS; no Actions minutes spent.
- The new option's actual screen readability and choice timing remain unapproved. Keep this PR **Draft / HOLD / NO-GO** and do not merge to main or frozen PR #98.

### Next acceptance
Run `node --test tests/capital_ration_gift.test.js tests/road_merchant_cart_consequence.test.js` and `npm run check` on the exact PR HEAD; then real browser: reach the capital with zero and one ration, choose donate/keep, revisit and Continue, check no double spend, and verify the late-war dialogue remains unchanged. Evaluate whether the added prompt helps agency without slowing the ration queue.

## 2026-10-31 follow-up — the capital sees one personal ration (Draft)

### Actual player-visible change
- The previous gift cost one `携帯食` and the mother remembered it, but no scenery or other nearby character acknowledged the donation. At (16,8), a small wrapped food packet now appears beside the mother immediately after the gift and after Continue, using the existing `early.capitalRationGift` choice. It is scenery only, not a new pickup, collision or city-wide food supply.
- The recruit at (18,8), two tiles away, now notices the gift and adds **one line** about helping in future. His original opening, road-bandit moral branch and late-war priority are retained. No extra reward, NPC, quest, map area, forced stop or lore spoiler.
- Distinction: the repaired merchant's supplies belong to the supply house; this packet is a single personal gift.

### External player signals checked 2026-10-31
- Steam *Chained Echoes*, Oct 28 reviews: individual players praised environmental details and criticized lack of protagonist impact. Oct 29 criticism described a hard-to-find doorway and repetitive backtracking: https://steamcommunity.com/app/1229240/reviews/
- Steam *Octopath Traveler II*, Oct 26 and Oct 29 individual reviews criticize dialogue fatigue: https://steamcommunity.com/app/1971650/
- **Hypothesis only:** one visual consequence plus one short witnessed reaction is more legible than another long exposition scene. These are not representative market findings or tested improvements.

### Verification and limits
- Runtime sources and Node regression source parsed in V8; isolated execution of actual updated renderer and gift commit verified before writing. New tests cover initial/after-gift pixels, one-time spending, passability, Save/Continue and recruit's existing moral and war branches.
- **Not run:** actual Node harness, `npm run check`, native-scale Chromium screenshot, full Save/Continue integration, human player test. Private repo clone from the execution container still fails GitHub DNS. No paid CI.
- **Draft/HOLD** pending real-screen inspection: reject if the packet is hidden under the mother's authored sprite, resembles loot, or masks walking. Confirm recruit dialogue in all states.

## 2026-10-31 follow-up — recruit acts on the witnessed gift (Draft)

### Player-facing slice
The recruit's previous line promised to help someday, but revisits repeated the same promise and the city never changed. After the player gives one real portable ration to the existing mother and *then talks to the recruit*, he now brings a small water pail to the queue. The pail appears immediately on existing walkable pavement at (17,8), is purely decorative (no pickup or collision), and persists using a schema-23 event choice. The mother recognizes the water on revisit. Before the gift, the recruit does not help or claim to have seen it; late-war dialogue still overrides this scene. Repeated conversations do not award anything or repeat the action.

### Evidence and hypothesis (checked 2026-10-31)
- Steam *Chained Echoes* Oct 28 individual review praises exploration but criticizes the protagonists having little effect on events; Oct 29 individual review complains about repeated map loops around a subtle door. https://steamcommunity.com/app/1229240/reviews/
- Steam *Octopath Traveler II* Oct 26 and 29 individual reviews complain about repetitive story exposition. https://steamcommunity.com/app/1971650/
- **Inference, not verified acceptance:** a visible, modest NPC follow-through with short revisits gives a clearer consequence than a permanently repeated promise. These reviews are not representative research. No copied scene, script, artwork or map design.

### QA gate
- Changed JS sources and Node test source: V8 parse check at authoring time; targeted static checks on one-time choice and visible state.
- **Not run:** repository Node harness, full npm check, Chromium actual 1x scene, collision walk, Save/Continue integration, human first-time playtest. New regression covers pre-gift, post-gift, single commit, mother dialogue, persistence and no collision; its presence is not proof of execution.
- Hold adoption if the pail looks like loot, obscures the mother/recruit, or cannot be seen at native scale. No changes to main or frozen PR #98.


## 2026-10-31 — merchant decision deferral no longer replays three lines (Draft)

### Verified source / actual player problem
- Existing road merchant at (8,8) offers repair, safe return, or postponement. Before this change, postponement left no intro-completion flag, so talking again replayed all three opening lines before reaching the same choice. The real road map's tree at (6,8) and walkable side path at (7,8) remain untouched.
- The updated first meeting still introduces the bent axle, Triton's practical repair offer, and the dangerous fort route. Only after the *third line is actually completed* is `early.merchantIntro` recorded via existing schema-23 `events.completed`. On deferred reentry, the player immediately sees the three original options and a short reminder. If the dialogue is closed before the last line, the introduction is not silently marked as read.
- Repair and return retain their original mutually exclusive rewards and later visual/world reactions; neither choice is auto-committed. No new NPC, forced event, story stage, map dimensions, collision, inventory reward, or schema migration.

### External evidence checked on 2026-10-31
- An individual Steam *Chained Echoes* review criticizes long dialogue and limited choice, but is old and **not** representative of current players: https://steamcommunity.com/id/vel8b8/recommended/1229240
- Kao et al., *How does Juicy Game Feedback Motivate?*, CHI 2024, preregistered experiment (n=1,699): immediate feedback alone is not automatically beneficial; player agency and legible action–outcome relationships matter: https://nickballou.com/publication/2024-kao-et-al-juicy/
- Lagrange, *Individualized Communal Experience*, DiGRA 2023, reports agency-related immersion in branching narrative play; it does not validate this particular JRPG change: https://dl.digra.org/index.php/dl/article/view/1954
- **Hypothesis:** skipping repeated setup after a voluntary postponement reduces friction without hiding the original stakes. The latest Japanese Steam review distribution, broader trend and human response remain **unverified**. No source's dialogue or design is copied.

### Validation and limits
- Parsed the complete updated `js/systems/events.js` in V8; executed the actual new functions with isolated dialogue/state mocks: **8 checks passed** (first intro, interrupted intro, completion, defer, direct reentry, repair option, resolved reentry, inventory/story invariance).
- Added `tests/road_merchant_deferred_revisit.test.js` using the project's real Node harness for first read, interruption, deferral, Save/Continue, both mutually exclusive outcomes, one-time rewards, and existing collision. **Test file parsed but Node test not executed.**
- **Not executed:** full `node --test`, `npm run check`, browser walk-through, actual integrated Save/Continue, native-scale screenshot or human first-time playtest. This remains a Draft / HOLD change on PR #146, not an approved release or a main merge.

### Next high-value gate
Run `node --test tests/road_merchant_deferred_revisit.test.js tests/road_merchant_cart_consequence.test.js` on this exact HEAD, then actually defer and return in a browser. Confirm the short prompt, original three options, no replayed introduction, a readable wagon, and a clear path toward the fort. Reject if an uncompleted introduction is incorrectly skipped or if the first interaction feels rushed.
