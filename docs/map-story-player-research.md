# Map and story: player-facing research notes

## 2026-11-01 23:43 JST — optional camp evidence: discoverable, then remembered at the ending preview

**Source check (2026-11-01):**
- [Japan Society for the Science of Design, *マップ構造における探索誘導の設計分析*, 2025, DOI 10.11247/jssd.72.0_672](https://www.jstage.jst.go.jp/article/jssd/72/0/72_672/_article/-char/ja): research abstract identifies categories of spatial exploration cues and suggests cue density, variety and context matter for exploratory motivation. This is design research, **not** a Steam-review sample or a measured Graygrow outcome.
- [4Gamer, GDC 2025 Cameron Williams exploration-design talk, 2025-03-19](https://www.4gamer.net/games/512/G051218/20250319025/): describes reuse of places under changing context and player-driven storytelling as presented at the talk. These are a speaker's design proposals, **not** independently validated commercial-success causality.
- New 2026-11-01 individual Steam RPG reviews with verified timestamps were **not** established in this run. Previous Steam examples remain recorded below; no popularity or player consensus is inferred from them.

**Verified in the previous Draft #252 source (HEAD `cf8ed24f95803df189f3925c1674415ea96c8417`):** both camps now had an optional board at (10,9) and a conditional ruler line after copying. However, the objective on first arrival only said to face the ruler, and the ending preview never mentioned the copied witness record. The empire-protect preview implied a filled list of returning places despite the actual camp ledger having blank names. This was a source-level narrative continuity gap; no human player had yet verified its effect.

**Implemented on a new isolated branch:** camp objectives now mention the nearby board as **optional** until it is copied, then immediately return to the ruler objective; skipping never gates the route. Kingdom/empire provisional ending previews conditionally recall the specific copied evidence and explicitly preserve uncertainty about evacuees/prisoners. The empire-protect scene no longer silently turns an incomplete name list into a complete one. Ash Crown does not inherit evidence from another route. Existing map positions, battle gates, choices, Save v23 and final ending's unfinished label remain unchanged.

**Player-experience hypothesis, not verified:** a short objective cue increases the chance of discovering the board without forcing an extra trip; a conditional end-scene callback makes the optional interaction feel consequential without fabricating a rescue. This is Graygrow-specific application of contextual cues and persistent narrative feedback, not copied scenes or layout.

**Validation:** full modified `movement.js` and `events.js` compiled in isolated V8. Isolated real-source objective checks and provisional-ending calls passed for kingdom, empire and Ash Crown. Added five Node harness regression cases, **not executed natively**. Browser walking, 44px readability, real Save/Load, full npm check and external human feedback remain **not verified** because container GitHub DNS prevents full checkout. Next: run the exact-head Node tests and browser camp board -> ruler -> ending, including skip/copy/reload on both routes.

## 2026-11-01 22:43 JST — final camps: evidence before confronting a ruler

**Evidence checked on 2026-11-01:**
- [Sea of Stars player discussion, 2026-10-22](https://www.reddit.com/r/seaofstars/comments/1xcixou/7_hours_into_the_game_and_loving_every_moment_of/): some players praised the characters and journey, while another criticized planted story concepts that did not pay off later. Individual opinions, **not** a representative Steam survey.
- [Chained Echoes review-theme aggregation, analysis updated 2026-10-05](https://niklasnotes.com/dashboard/game/108411/chained_echoes): sampled criticism includes continuity/save-data concerns. The aggregate method and representativeness were not independently verified.
- [Sea of Stars review sample, checked 2026-11-01](https://imho.run/games/1244090/sea-of-stars): sampled praise for rewarding secrets and complaints about repetition. The site reports its price check as 2026-10-29; this is not a verified date for individual reviews.
- **No newly dated Steam individual review was independently verified this run.** Do not infer player consensus or sales from these sources.

**Code observation verified on PR #250 HEAD `df40cf087a9697d136455f3164b2dceb00d24f5e`:** both final camp maps contained only their ruler NPC, no optional objects. Players entered at y=13 and approached the ruler at y=4. The previous route decision already affected arrival and checkpoint combat, but no inspectable local evidence was available during the walk.

**Implemented, player-value hypothesis unverified:** a small contrasting paper board at (10,9), immediately beside the central route, in each camp. The imperial camp lists families waiting for evacuation permission; the royal camp records surrendered soldiers but leaves their names blank. The player can copy the visible information or continue; a copy is saved as an existing Save v23 event choice and one journal entry. On revisiting, the board remembers the copy. After the existing checkpoint, Margaret confronts Shion/Granz with the specific evidence; neither ruler promises a rescue or order change. No new map area, forced detour, battle gate, or claimed political victory. This makes civilian stakes discoverable before the ruler encounter without borrowing any external game scene.

**Verification:** syntax compilation of modified runtime and test JS passed in V8. Isolated real-function V8 execution passed 10/10 branch scenarios (both routes: skip, copy, repeat, journal, ruler echo). These are not native Node, Chromium, full game Save/Load or human-playtest results. The new Node harness regression source is committed **but not executed**. Local git clone still cannot resolve github.com. Next: run `node --test tests/finalcamp_witness_records.test.js tests/finalfield_camp_continuity.test.js` and full checks; walk both maps and confirm the board's native 44px readability, dialogue sequence, boss checkpoint, return and real Save/Load.

## 2026-11-01 21:43 JST — final army camps: no skipped friend decision, no repeated arrival

**Evidence checked (2026-11-01; individual Steam opinions, not population statistics):**
- [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/): one review displayed as **Oct 29** reports walking the same map repeatedly before noticing a doorway; a positive **Oct 28** review praises the journey, party and world. The page did not independently verify those reviews' year.
- [Sea of Stars Steam reviews](https://steamcommunity.com/app/1244090/reviews/): an **Oct 5** negative review criticizes unclear progression and repeated walks back to camp; an **Oct 3** positive review values the expectation of discovery around corners. The page did not independently verify those reviews' year.
- These are contrasting individual experiences, **not** proof that every player prefers shorter transitions.

**Direct code finding (verified on PR #249 HEAD `7d8345fc`):** `enterFinalBranch()` let kingdom/empire players cross the north gate after allegiance was saved even if `route.companions.<route>` was absent. The ruler NPC later offered the conversation, but the entry into camp had already skipped the intended friend discussion. Every camp re-entry also replayed the first approach narration. Both are code-level observations, not claims from a human playtest.

**Player-experience hypothesis (unverified):** Restore the friends' meaningful tactical choice *at the north exit*, before the player crosses; reflect the chosen stance and an optionally repaired civilian waymark in the **first** camp approach; skip the introduction on later visits. This makes the same short corridor express different priorities without increasing map size or copying another game's story.

**Implemented:** `js/systems/movement.js` now gates all three allegiances against missing companion decisions, makes the two army-camp first approaches stance-aware, and uses a silent return to already visited camps. Existing route battles, gates, positions, journal, artwork and Save v23 are unchanged. Added `tests/finalfield_camp_continuity.test.js` (five regression cases).

**Verification:** V8 parsed the full modified movement source. Isolated execution of the real replacement function checked both routes, all four tactical variants, missing-choice gate and silent revisits. The five committed Node harness tests are **not executed**. Browser play, full `npm test`, Save/Load integration, 44px readability and external human feedback remain unverified.

**Next:** Run `node --test tests/finalfield_camp_continuity.test.js tests/finalfield_commitment_return.test.js` on this branch, then actually walk the two north exits after saving mid-conversation and return from each camp; check dialogue order, no replay, and no unintended objective reset.


## 2026-11-01 20:43 JST — final battlefield: commitment that persists across return trips

**Verified observations (checked 2026-11-01; individual opinions, not market-wide results):**
- [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/): a review displayed as **Oct 24** criticizes lengthy exposition and indistinct voices despite enjoying the game; another displayed as **Oct 28** values a journey with distinct party members and a consequential story. The review page did not independently establish the publication year, so only the displayed month/day is claimed.
- [Sea of Stars Steam reviews](https://steamcommunity.com/app/1244090/reviews/): a review displayed as **Oct 10** criticizes weak protagonist characterization and optional areas that appear open but offer little agency. The publication year is not independently verified. This is a single negative review, not a genre consensus.
- Prior note (19:43 JST) already records discoverability feedback; it was not treated as new research this run.

**Direct code finding (verified in the repository):** In the existing `finalfield` decision NPC, both orders being read always reopened the allegiance choices, even when `state.finalChoice` was already committed. Re-selecting could silently overwrite a saved allegiance and leave the earlier `route.companions.<route>` result in place. Returning south from either army camp replayed a generic battlefield-arrival narration and objective instead of acknowledging the actual chosen route. These are source-code observations; the player impact is a hypothesis until browser-tested.

**Design inference (unverified):** A concise, explicit irreversible choice with a safe defer option, persistent return acknowledgement and route-specific north-gate direction should preserve narrative causality without adding a long exposition scene. A Save v23 committed before the companion conversation finishes should resume that conversation rather than offering a different faction. This specifically differentiates Graygrow's four childhood friends and three conflicting allegiances; no third-party dialogue, layout, or mechanics were copied.

**Implementation:** Guarded the finalfield decision NPC against re-selection after commitment; added a defer option before commitment; resume a missing route-specific companion decision after reload; route-aware short NPC response on return; removed repeated army-camp-to-battlefield arrival narration; restored the north-edge entry position and correct destination objective. Existing flags and Save schema v23 are reused; no main merge, art, balance or route-gate changes.

**Verification:** Fetched exact parent #247 GitHub source and PRs, compiled modified `events.js` and `movement.js` with V8, and executed isolated real-source scenarios for initial menu/defer/commit/missing-companion recovery/locked revisit plus four objective variants. Five Node harness regression cases were committed **but not executed**. Full `npm test`, browser travel, 44px visuals, Save/Load integration and human playtest are **not verified** because the private GitHub repository cannot be cloned in the local container (DNS lookup failed). No paid API or Actions rerun.

**Next:** Run `node --test tests/finalfield_commitment_return.test.js`, then walk both final-field plans → choose/defer → companion decision → army camp → return → decision NPC, including reload immediately after choosing a faction. Confirm no dialogue lock or route swap, and that each north gate destination is legible.

## 2026-11-01 19:43 JST — final battlefield: clear army-plan paths and comparison

**Verified individual reviews, checked 2026-11-01:** On https://steamcommunity.com/app/1229240/reviews/ an Oct 29 negative *Chained Echoes* review describes circling a map repeatedly before noticing a hard-to-see door; an Oct 28 positive review values the world and party journey, while another Oct 28 negative review praises exploration but criticizes limited protagonist agency. On https://steamcommunity.com/app/1244090/reviews/ an Oct 5 negative *Sea of Stars* review reports unclear paths, while an Oct 3 positive review values exploration and discoveries. These are individual experiences, not representative population data. No fresh Japanese primary review was verified this run.

**Design hypothesis:** Visible one-tile approaches and stage-specific directions can reduce needless backtracking. Comparing two opposed orders in either sequence, then receiving a concise Sophie response and journal summary, should improve player comprehension without a long lore recap. No outside story, map or dialogue was copied.

**Changes:** Two worn approach tiles, progression-aware decision guide and objectives, one-time comparison journal and short response after the second order, no replay of the first battlefield arrival on return. Prior civilian waymark, route choices, Save v23 and main storyline remain unchanged.

**Checks:** JavaScript source and added test syntax parsed; original waymark and third-route gate source preserved. The saved map generator was executed in isolation (24×15 dimensions; paths to both order boards, waymark, decision NPC and north exit reachable). Saved event code passed 8 isolated mocked-state checks (either reading order, objective, single journal, repeat, decision unlock, sign callback); saved movement code passed 4 isolated mocked-state checks (return entrance, objective and no replay). These are NOT full gameplay tests. Five Node harness tests were authored but NOT run (local container cannot reach the private repository). Real browser navigation, 44px visibility, save/load integration and human feedback are unverified. The UX benefit remains a hypothesis.

**Next:** Run `node --test tests/finalfield_plan_wayfinding.test.js`; walk capital gate → west/east orders (both sequences) → central decision → north exit; verify revisits and visual clarity.


## 2026-11-01 — final battlefield: civilian waymark

**Scope:** The optional side path in `finalfield` (branch `feature/finalfield-civilian-waymark-20261101-1843`). This note is not a claim of human playtesting.

### Evidence checked (facts, not universal preferences)
- Japanese Steam-review excerpt mirrored at https://gamelog-jp.com/game/1229240/ (page checked 2026-11-01): one *Chained Echoes* Japanese review dated **2026-03-04** warns that trading too early can make later requirements hard to identify. This is one player's report; it supports checking *clarity and revisitable choices*, not a population-wide trend.
- https://imho.run/games/1244090/sea-of-stars (page checked 2026-11-01; page's price check marked 2026-10-29): the site aggregates *Sea of Stars* review excerpts, reporting appreciation for secrets and a sampled complaint about repetitive gameplay. Sampling and representativeness are not independently verified; do not interpret as all players' preferences.
- https://niklasnotes.com/dashboard/game/108411/chained_echoes (analysis marked updated **2026-10-05**, checked 2026-11-01): summarizes mixed reactions to story, characters, and save reliability. It is a secondary analysis, not primary Steam review verification.

### Design inference (hypothesis)
A one-step, visually marked detour should be easier to notice than a large empty battlefield; letting players restore a civilian escape sign without choosing an army provides a small, morally grounded action with immediate visual and later dialogue feedback. A restored sign does **not** magically guarantee civilian safety or force the player's ending.

### Implementation / verification status
- Added a one-tile spur off the central battlefield road, broken/repaired waymark artwork, a deferrable optional interaction, one-time journal entry, return-visit plan dialogue, and a companion callback at the final route.
- Kept the three-route gate, save schema v23, existing army plans, and main crossroads.
- Source syntax and static map construction were checked in the tool runtime. The actual `inlineObjectEvent` function was executed in an isolated mocked state: introduction, both choices, restored flag, one-time journal, redraw, both initial plan reads, and concise revisit all passed. Added Node harness regression tests, but they **have not been executed**; full browser play, real save/load, 44px legibility, human evaluation, and collision testing remain unverified.
- Distinctive feature vs. references: this is a non-factional civilian choice embedded between two opposing military plans, with consequences shown through the game's own cast; no third-party map, plot, dialogue, or art was copied.

### Next concrete check
Execute `node --test tests/finalfield_civilian_waymark.test.js` on the PR branch; verify west/east plans and marker are reachable in-browser, that restoring does not interrupt the three endings, and that the sign is legible at native display scale.
