# Gray Crown — Player fatigue reduction & combat integrity pass
Date: 2026-10-11
Base: `feature/player-first-combat-story-payoff-20261011` (PR #64)
Status: Draft, not release ready.

## Design grounds (adapt principles, not proprietary content)
- *Sea of Stars* and its developers emphasize deliberate small skill sets, removing avoidable repetition and giving players room for unhurried tactical decisions. Gray Crown retains turn-based combat and its own command set; we did **not** import its lock icons or combat content.
- *Clair Obscur: Expedition 33* demonstrates that a satisfying combat response requires feedback and balancing, but repetitive input requirements can become fatiguing. Do not add QTEs or additional defensive buttons without testing.
- *Metaphor: ReFantazio* illustrates how brisk encounters and less punishment can help pacing; this pass polishes encounter cadence and gives accurate resource feedback rather than imitating its overworld combat.

## Concrete changes
1. **Random fights, quicker:** ordinary random enemies skip the long encounter-intro flash, unlock controls after 180ms instead of 680ms, and show a 340ms reward card instead of 860ms. The card still shows correct gold and EXP. Do not replay a victory jingle every random fight. Authored/story and boss battles retain their original presentation, rewards, XP, cinematic and timing.
2. **Revisits, immediately controllable:** repeat visits to an interior no longer interrupt input with `「...に入った」`. Leaving any interior no longer opens `「外へ出た」` dialogue. Re-entering the cave does not replay its original introductory speech; leaving the cave no longer has redundant commentary. First visits retain the introduction. First-entry ceremony state progression in `capitalinn` is preserved.
3. **Do not spend items/turns for zero value:** shared action availability is applied in both battle UI and action processing. Full-health parties cannot spend herbs or healing spells; full-mana parties cannot consume mana grass; food at full HP and MP cannot be consumed. Insufficient MP remains disabled as before. Disabled commands don't spend a turn or resources even if programmatically invoked.
4. **Honest combat feedback:** recovery log numbers for `治癒`, `祈り`, `薬草`, `魔力草` show the amount of HP/MP actually restored, not the nominal skill maximum.
5. **Solo consistency:** Ash Crown Karen-alone defense text no longer says she's covering an ally, and losing alone no longer says four protagonists fell. Original party records are not deleted.

The goal is **less obligatory friction with identical depth**, not five additional combat systems. We do not change encounters-per-map, level-up economy, story choices, loot rarity, UI navigation, any assets, or persistent save schema in this pass.

## What was actually verified
- JavaScript syntax parsing of changed files.
- Isolated execution of all no-op action-availability predicates with a full-HP/MP party (heal, prayer, herb, mana grass and food all correctly blocked).
- Real battleAction source execution: heal when missing exactly five HP restores exactly five and costs 6 MP; mana grass when missing two MP restores exactly two.
- Random result timing and sound behavior: random 340ms, no victory jingle; story 860ms with normal victory jingle; both close and call the completion callback.
- Isolated map transition calls: first interior entry narrates once, exit and re-entry do not interrupt movement.
- The added `tests/anti_fatigue_quality.test.js` covers source parsing, wild/story encounter flash, disabled states, no-effect command safety, actual HP recovery, saved roster protection, repeated interiors and solo defeat wording.

**Not executed / release blockers**
- The full Node test suite, actual Chromium playthrough, real save/load in browser, screenshots/mobile UI, and music/sound mixing remain unverified because this private repository's integration CI has experienced pre-run failures. This PR must remain Draft and must NOT be merged into `main` without end-to-end acceptance.
- Check player feedback: shortening repeated combat is beneficial only if rewards remain readable. Compare 340ms and 860ms on slow hardware; adjust after user testing. Retain accessibility considerations, including motion sensitivity.

## Quality metrics for next evaluation
Use two comparable first-20-minute runs (critical route only, then all optional visits). Track number of forced text interruptions, average repeated wild-battle downtime, resource-command mistakes, tactical decisions per enemy and voluntary exploration. Cut mechanics or dialogue that create more explanation than enjoyment.
