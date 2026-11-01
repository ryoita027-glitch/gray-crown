## 2026-11-02 05:43 JST — voluntary ruler revisit and honest evacuation consequence

**Verified repository fact (Draft #265 HEAD `cf0f0cb6`):** After recording `route.final.kingdom` or `route.final.empire`, revisiting Shion or Granz replayed the initial confrontation (including surrender/evidence lines) and automatically reopened the provisional ending. This offered no new decision and imposed repeated exposition. Sophie's evacuation dialogue and the kingdom ending also claimed an evacuation outcome not established by the still-blank permit on the witness board.

**Player signals checked 2026-11-02:** [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/) include an individual October 24 complaint about lengthy exposition and indistinct voices, alongside praise for cast and journey. [Sea of Stars Steam reviews](https://steamcommunity.com/app/1244090/reviews/) include an individual October 10 criticism of repetitive progression and limited rewards. Displayed snippets do not confirm publication years. These are individual opinions, not a November 2026 representative sample. **Inference:** a brief context-aware reply and optional recap reduce return-visit friction; this is not measured player feedback.

**Implemented:** After a final demand, a ruler revisit offers a short route-specific response (also reacting to whether the player copied the witness board), then a choice to reopen the existing companion/provisional ending or leave. First meeting, irreversible demand, Ash Crown, Save v23, route checkpoint, and the preview remain unchanged. Sophie and the kingdom preview no longer assert an unverified family evacuation. No external content copied.

**Validation:** Full edited `events.js` and `movement.js` syntax compiled in V8; four isolated actual-source scenarios checked both routes and witness states, voluntary review and skip. Added Node harness tests but **not run natively** (container GitHub DNS unavailable). Browser playthrough, real save/load, 44px readability, human testing **unverified**. Next: native `node --test tests/finalcamp_ruler_revisit.test.js` and real first-confrontation → demand → revisit → optional ending on both routes.

# Map and story: player-facing research notes

## 2026-11-02 04:43 JST — close the optional witness-board exploration loop without a compulsory return walk

**Repository fact (verified on Draft #263 HEAD `7f2b0606`):** The checkpoint battle already offers a voluntary jump from the northern camp to the changed witness board at (10,9). After reading/copying it, the player had to walk the same central road north again to speak to Shion or Granz at (12,4). Both camps have a clear walkable (12,5) tile facing the ruler. This made the optional discovery feel like extra backtracking even though the board itself now has meaningful consequences.

**External player signals checked 2026-11-02:** [Sea of Stars Steam individual review (2023)](https://steamcommunity.com/id/NeoRizer/recommended/1244090/) describes substantial repeated backtracking while also recommending the game; [Steam player discussion (2023)](https://steamcommunity.com/app/1244090/discussions/0/3817418065215519791/) includes a positive comment about being able to backtrack **at the player's convenience**, alongside criticism of excessive linearity. These are older individual reports, not recent representative review data; a new November 2026 Steam review sample was **not verified**. **Inference:** offering a quick return *after* a voluntary discovery preserves agency while reducing repeated walking. No external story, map layout, character or dialogue is copied.

**Implemented:** Once a kingdom/empire checkpoint is cleared, inspecting the existing optional board now leads to a second explicit choice: return near the ruler at (12,5) facing (12,4), or continue walking manually from (11,9). This works after copying, skipping or rereading the record. It does not run before the checkpoint, grant the copy automatically, change route choices or Save schema v23, or affect Ash Crown. The short transition is narrated and the companion trail remains on passable central-road cells. The original two-option copy/skip board UI is retained.

**Validation:** Entire modified `js/systems/events.js` syntax-compiled in V8; the extracted actual north-return helper passed isolated checks for route guard, checkpoint guard, voluntary north travel and staying put. Added native Node harness regression tests for both camps, copy/skip/reread, pre-checkpoint guard, immediate ruler adjacency, save compatibility; **not executed natively** because this environment cannot clone the private repository to the local container (GitHub DNS unavailable). Browser movement, 44px visual quality, full battle-to-board-to-ruler playthrough, real save/load and human playtest remain unverified. Next: run `node --test tests/finalcamp_return_to_leader.test.js tests/finalcamp_postbattle_return.test.js tests/finalcamp_witness_records.test.js`, then test the full path in a browser before approving the stacked PR.

## 2026-11-02 03:43 JST — non-lethal checkpoint results matter after the fight

**Source verified 2026-11-02:** Draft #261 HEAD `fdd6b19a` fixes the post-battle return prompt. All four final-camp checkpoint enemies have morale and can surrender; battleWin already distinguishes surrender from HP defeat in the journal. However the nearby witness boards and ruler conversations did not distinguish those outcomes.

**Implemented:** The first valid final checkpoint resolution is stored in the existing Save v23 event choices. Both camp boards and the friends' confrontation with Shion/Granz now acknowledge soldiers putting down weapons after surrender, or explicitly leave casualties unknown after defeat. This does not imply evacuation permission, prisoner safety, an accepted treaty or a changed route. Optional board copying remains voluntary; old saves without the outcome key display the original wording. Distinct Sophie/Triton reactions preserve the four friends' established voices.

**Review checked 2026-11-02:** [Sea of Stars Steam individual review, published 2025-03-06](https://steamcommunity.com/id/TirOrah/recommended) praises combat and visuals but criticizes character traits that are told rather than shown and narrative setups without payoff. [Chained Echoes Steam individual review, displayed Aug 9, year unverified](https://steamcommunity.com/profiles/76561198149021695/recommended/) values logically motivated NPCs and meaningful encounters. **Inference:** a locally visible, proportionate consequence for a non-lethal resolution may strengthen perceived agency. These reviews are individual opinions, not a population trend or sales metric.

**Verification:** Modified JS syntax compiled in V8; isolated actual helper checks for both routes and both battle outcomes passed. New native Node harness tests were committed but not run. Full browser battle, result-screen timing, actual Save/Load, 44px legibility and human feedback are unverified. Next: execute the new Node tests and play the exact win → optional board → ruler flow before approval.


## 2026-11-02 02:43 JST — restore the post-battle decision the player could not see

**Confirmed source defect:** In PR #259 (HEAD `4749a3aa`), `battleWin` calls `if(!finalCampAfterBattlePrompt(route)) say(...fallback...)`. The prompt helper returned `say(...)`, but `say` is a void dialogue UI function. Thus the condition was always true and the fallback immediately replaced the two-choice menu. The earlier test expected a truthy return but was not executed. This made the intended optional return to the changed witness board unreachable from the battle aftermath, even though its board content and map existed.

**Implemented:** `finalCampAfterBattlePrompt` now explicitly returns `true` after displaying the menu. The existing route/map/checkpoint guards still return `false`, allowing the original fallback when no menu should appear. Both kingdom and empire routes retain the player's option to check the changed board or proceed directly to the leader. No new content is gated, no choice is automatically recorded, and Save v23 remains unchanged. Two additional regression cases exercise the exact caller expression.

**External review signals checked 2026-11-02:** [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/) display an Oct 29 negative individual review about repeatedly circling a map to find an unobvious doorway, alongside positive reviews valuing exploration and the journey. [Sea of Stars Steam reviews](https://steamcommunity.com/app/1244090/reviews/) display an Oct 5 negative individual review mentioning unclear route cues and backtracking, and an Oct 3 positive review valuing discoveries. The snippets do not establish their posting year or a population-wide trend. **Inference:** a promised, visible optional route choice is more useful than a hidden prompt and forced fallback. The defect itself is proven from source, independently of review sentiment.

**Verification:** Executed the extracted actual helper function with a minimal dialogue mock in V8 before editing: the old caller showed `FALLBACK`; the corrected helper preserved both kingdom/empire prompts. After saving, the actual two event helpers were reloaded from the branch and exercised in an isolated V8 mock for all four tactics (kingdom/evacuate, kingdom/orders, empire/protect, empire/advance): visible prompt, optional move, changed board text, voluntary copy, no duplicate copy, skip and pre-checkpoint guard all passed. The new Node harness tests are committed but **not executed natively**; local checkout remains unavailable due to GitHub DNS. Browser battle-result timing, movement, actual save/load and human playtest remain **unverified**. Next: run the native tests and real win-to-prompt-to-board-to-leader playthrough for both routes before approval.

## 2026-11-02 01:43 JST — checkpoint aftermath can be seen without a compulsory return walk

**Verified external signals (checked 2026-11-02; individual opinions only):**
- [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/): displayed Oct 29 negative review describes repeated map laps before noticing a doorway; Oct 28 positive review values the journey and world. The displayed snippets do not confirm the publication year.
- [Sea of Stars Steam reviews](https://steamcommunity.com/app/1244090/reviews/): displayed Oct 5 negative review complains about unclear route signals and excessive return walks; Oct 3 positive review praises discovery around corners. These are not a market-wide statistical finding.

**Repository fact:** On Draft PR #257 HEAD `9a11bcfb4802c77755d167fc7b4f3c9cdcecea1d`, the witness board at (10,9) changes text after the route checkpoint. The battle-win dialogue only said to approach the ruler, leaving the new board response easy to miss; returning from the ruler's northern position required walking back. Both camps share the same 24x15 geometry.

**Implemented player-facing change:** After either of four tactical checkpoint battles, Sophie or Margaret notices the unresolved record. The player can (a) take a narrated, optional short return directly to the existing board interaction at (11,9), or (b) keep position and head north to the ruler. The board's existing before/after dialogue and explicit copy choice remain authoritative; no evidence is awarded automatically, no extra forced dialogue loop, no changed final allegiance, no new Save v23 field. The original battle and ruler sequence remain reachable. This uses an original interaction principle, not a copied layout or script.

**Inference:** Making a newly changed world object easy to revisit may improve perceived agency and prevent the battle's consequence from being missed. **Not verified:** native Node tests, browser movement/44px legibility, battle result timing, real save/load, or human evaluation (no local GitHub checkout: DNS resolution unavailable). Tests added to exercise both return and continue branches. Next check real battle-win-to-board-to-ruler sequence for all four stances.

## 2026-11-02 00:43 JST — the same witness board changes after the player's checkpoint choice

**External signals checked 2026-11-02 (individual reviews, not a population study):**
- [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/), page displayed an Oct 29 negative review describing repeated map backtracking to find an unobvious door; an Oct 28 positive review valued the journey, cast and world. Steam's displayed excerpts do not state the year; no exact publication year is inferred.
- [Sea of Stars Steam reviews](https://steamcommunity.com/app/1244090/reviews/), page displayed an Oct 5 negative review citing unclear progression signals and an Oct 3 positive review valuing the sense of finding something around every corner. These are contrasting personal reports, not a verified market-wide trend.
- **Inference, not fact:** a readable side spur and a board that changes after the player's tactical decision may make the same short area feel discoverable and responsive without requiring a repeat visit.

**Repository source check:** On Draft #254 HEAD `fa3f3d1da1557fb09be42d9d2a904cee72508b38`, both witness boards were at (10,9), but the adjacent ground was undifferentiated battlefield floor. The board's dialogue was identical before and after the route checkpoint, despite the existing four distinct tactical outcomes. The copied witness note already affected ruler dialogue and provisional ending; those effects were preserved.

**Change:** The two camp maps share a short worn two-cell approach at (10,8)-(10,9), retaining the open main corridor. Each board now acknowledges its route-specific **completed** checkpoint and tactical choice on return: limited evacuation passage versus still-blank permission; prisoner protection request versus interrupted pursuit with still-blank names. Pre-checkpoint dialogue does not reveal these outcomes. Skipping/copying remains optional and reversible; no new battle, NPC, map area, Save v23 field, or art replacement. The four childhood friends' existing choices remain authoritative. This is original Graygrow dialogue, not copied from reviewed games.

**Verification scope:** Full changed JS sources syntax-compiled in V8; isolated real-function scenario checks passed before GitHub save. Five Node harness tests are added but **not run natively** in this environment. Browser walking, 44px visual legibility, real battle-to-board progression, full npm check, real Save/Load and human playtest are **not verified** (local container cannot resolve github.com for checkout). Next: execute `node --test tests/finalcamp_aftermath_board.test.js tests/finalcamp_witness_records.test.js tests/finalcamp_evidence_payoff.test.js`, then walk both camps through each checkpoint and revisit the board with/without a copy.


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
