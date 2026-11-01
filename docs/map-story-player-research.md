# Map and story: player-facing research notes

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
