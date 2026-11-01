# Map and story: player-facing research notes

## 2026-11-01 — final battlefield: civilian waymark

**Scope:** The optional side path in `finalfield` (branch `feature/finalfield-civilian-waymark-20261101-1843`). This note is not a claim of human playtesting.

### Evidence checked (facts, not universal preferences)
- Japanese Steam-review excerpt mirrored at https://gamelog-jp.com/game/1229240/ (page checked 2026-11-01): one *Chained Echoes* Japanese review dated **2026-03-04** warns that trading too early can make later requirements hard to identify. This is one player's report; it supports checking *clarity and revisitable choices*, not a population-wide trend.
- https://imho.run/games/1244090/sea-of-stars (page checked 2026-11-01; page's price check marked 2026-10-29): the site aggregates *Sea of Stars* review excerpts, reporting appreciation for secrets and a sampled complaint about repetitive gameplay. Sampling and representativeness are not independently verified; do not interpret as all players' preferences.
- https://niklasnotes.com/dashboard/game/108411/chained_echoes (analysis marked updated **2026-10-05**, checked 2026-11-01): summarizes mixed reactions to story, characters, and save reliability. It is a secondary analysis, not primary Steam review verification.

### Design inference (hypothesis)
A one-step, visually marked detour should be easier to notice than a large empty battlefield; letting players restore a civilian escape sign without choosing an army provides a small, morally grounded action with immediate visual and later dialogue feedback. A restored sign does **not** magically guarantee civilian safety or force the player's ending.

### Implementation / verification status
- Added a one-tile spur off the central battlefield road, broken/repaired waymark artwork, a reversible optional interaction, one-time journal entry, return-visit plan dialogue, and a companion callback at the final route.
- Kept the three-route gate, save schema v23, existing army plans, and main crossroads.
- Source syntax and static map construction were checked in the tool runtime. Added Node harness regression tests, but they **have not been executed**; full browser play, real save/load, 44px legibility, human evaluation, and collision testing remain unverified.
- Distinctive feature vs. references: this is a non-factional civilian choice embedded between two opposing military plans, with consequences shown through the game's own cast; no third-party map, plot, dialogue, or art was copied.

### Next concrete check
Execute `node --test tests/finalfield_civilian_waymark.test.js` on the PR branch; verify west/east plans and marker are reachable in-browser, that restoring does not interrupt the three endings, and that the sign is legible at native display scale.
