# Serad optional choice and tactical synergy — implementation candidate

Branch: `feature/serad-choices-tactics-20261011` (base `feature/character-combat-feedback-20261011`).

## Implemented now
- Optional three-way interaction at the existing `frontierfield/fieldGraves` object: tidy the graves, record evidence, or continue; four established characters react differently.
- A repeatable revisiting line and a completed event flag `optional.serad.graves` with a diary note recording the chosen response. Does **not** gate original quests.
- Original synthesized two-note discovery sound tied to the existing mute channel.
- Limited encounter-local focus synergy: successive **different** party members attacking the **same still-living enemy** add up to 3 extra damage, with readable combat log and audio.
- Higher-phase bosses show tactical warning text before the existing enemy target selection; no fabricated fixed enemy intent.
- Node regression tests for event flags, transient combo reset, and source wiring.

## Deliberate scope limits
- No new objects or maps or background graphics, no recorded/mastered soundtrack, no status-effect engine, no altered original encounter probabilities, no new canonical lore, no changes to original save schema 23 or artwork.
- Current implementation is a candidate until Chromium path, screen/audio, npm test and original save migration are verified. This session did not run a local browser.
- Next: author more optional scenes against existing interactive targets; improve actual enemy tells/AI and upgrade environmental layers only after real browser evidence.
