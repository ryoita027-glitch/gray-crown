# Gray Crown — Player-first combat and storytelling pass (candidate)
Date: 2026-10-11 · Base: `feature/opening-variety-pacing-v1-20261011` (PR #63).

## Scope
The gameplay criterion is: **Does the player make a legible decision, and does the game respond immediately, reliably, and without extra chores?**

We took *design principles*, not images, story beats, character concepts, UI layouts or proprietary combat formulas, from modern turn-based RPGs. Reactive risk/reward and readable combat feedback appear in *Clair Obscur: Expedition 33*, but adding a timing parry/QTE to Gray Crown would be an untested accessibility and combat-balance gamble. Player-driven turn-based interception uses our **existing Guard button**. Short choice-dependent character reactions are preferred to repeated exposition.

## New combat mechanic — earned opening
- In encounters with an announced target (opening wolf, crawler and the later faction checkpoints), **Karen's Guard must actually intercept the announced hit** to open a temporary counter opportunity. Simply using Guard is not enough.
- It records `battle.counterWindow={enemy,turn:currentTurn+1}`. The target, window and state exist **only during combat**; the save system already excludes active battle.
- During the following player turn the **first actual damaging action on that same living enemy** consumes the window, adding **up to 5 damage** and, for morale-enabled human enemies, reducing morale by **up to 3**. Healing, items, rally, persuasion or attacking a different target do not consume it.
- Opportunity is cleared when the enemy's next turn begins, so it cannot be held for later turns or farmed indefinitely.
- Existing `battleHelp` now tells the player the exact consequence and single-use nature. The counter also has short battle-log and existing rally sound feedback, not another menu or tutorial cutscene.
- Normal untelegraphed fights cannot obtain the window, and Guard's previous damage mitigation remains unchanged. It does **not** increment moral kills.

## Narrative reinforcement
- After meeting the optional roadside bandit, the same already-present capital recruit has one contextual follow-up spoken by **Karen** (when the player deliberately killed an incapacitated person) or **Sophie** (when the player deliberately spared them); for untouched encounters, retain the exact original one-line recruit exchange.
- No unknown NPC possesses supernatural information about the event: the follow-up is an internal party response to the recruit's enthusiasm. The recruit is not rewritten as a major new quest NPC.
- Remove three repetitive lines from the orphan, merchant and ancient-banner **pre-choice** scenes. The choices, immediate results and later callbacks still work. This is a small first pass on **dialogue density**, not a claim of completely rewritten story pacing.

## Validation performed here
Actually executed engine source in a V8 sandbox:
1. Wolf attack without Guard → Sophie takes 8, no opening.
2. Wolf attack intercepted by Karen → Karen takes 4, Sophie unhurt, counter window appears on turn 2.
3. Karen follows up with an attack → **13 damage** (base 8 + one-off 5), and the window disappears.
4. Same attack without the earned opening → **8 damage**.
5. Capital recruit handler returns 1 line if the player made no moral choice, but 2 correct lines for `kill` (Karen) and `spare` (Sophie).
6. All modified script sources passed JavaScript syntax parsing.

Added `tests/player_first_guard_counter.test.js` with full game-harness checks for source syntax, Guard targeting, actual attack damage, expiration, wrong-target/zero-damage behavior and character callback. **These full Node tests have not run** in a real checkout, and no browser/screenshots/soundtrack audition were executed. GitHub Actions in the parent branch remains blocked before runner steps, so this branch must stay Draft and must not be merged into `main`.

## Player acceptance gates before release
- Measure first successful interception comprehension without explaining it; can a new player identify the rewarded action from the warning alone?
- Does the reward scale sensibly with level, boss stats and multi-enemy encounters? Reduce or restrict if it trivializes combat.
- Play the first 20 minutes with all optional talk skipped, and again with all decisions made; verify neither route feels excessively verbose or empty.
- Test keyboard, screen-reader warning, narrow viewport, real Save/Load and full four-hero battle order in Chromium.
- Do not add other mechanics until the existing choices, audio, exploration and the full integrated PR chain pass quality acceptance.
