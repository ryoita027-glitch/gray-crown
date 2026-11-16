# Tactical readability and enemy-round safety — 2026-11-17

Based on published PR #106 source 5a6d738644174eb903e10337344f215a724d0235.

Player changes:
- Forecast now distinguishes announced target, active interception, all enemies interrupted, and unknown/random target. It reuses actual enemy intent and guard selection rules without rolling RNG or changing AI.
- Party and recovery-picker labels identify the threatened companion or protected companion and the defender. Guarding does not claim invulnerability. Partial interruption does not claim every enemy is stopped.
- Text and border/background changes convey state without flashing or colour-only meaning.
- Fixed renderBattle advancing the actor when the leader is knocked out during an already-running enemy turn. Enemy-turn completion now owns that transition; unlocked player turns still skip knocked-out allies.

Validation:
- All 397 Node tests pass, zero failures/skips. Six new tests cover intent purity, guard expiry, partial interruption, unknown targets, locked rendering and an actual enemy attack that knocks out the leader: exactly one attack/round before the surviving companion acts.
- Two earlier forecast assertions intentionally change from a hidden panel to explicit unknown-target text; original AI intent assertions remain.
- DOM integration passes for source and embedded standalone: forecast state, party labels, recovery-picker label, prior target-selection/cancellation/resource tests. Canvas mocked; not a screenshot/layout test.
- Hygiene, project authority and JS syntax pass. Six Python release tests and both distribution builds pass.
- Browser launch remains blocked by the already-observed environment socket restriction. No new actual browser, visual, audio or full playthrough acceptance is claimed.

No character asset, balance, story canon or save-schema changes. Still a draft development candidate.
