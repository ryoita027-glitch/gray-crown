# Gray Crown — continuous-adventure combat audit (2026-10-17)

**Decision: HOLD**. Do not equate the following source-level evidence with real gameplay or completed player acceptance.

## Playability blocker fixed

At parent PR #89 HEAD `c2c8b1a09cc86639f708679e4e00b1edc0ed83e8`, battle turn selection did not skip a hero with HP 0. A battle initialized with Sophie knocked out progressed from Karen to Triton and then remained on Sophie indefinitely. Reproduced by repeating eight genuine `battleAction` inputs in the real battle engine: the actor index remained at 2 after all further attempts.

The fix:
- Starts new combat with the first **living** eligible hero, not always the saved party's slot 0.
- Skips knocked-out hero slots when the active turn advances. Preserves KO heroes in the persistent four-character party.
- Resumes at the first living hero on the next turn after enemies attack.
- Retains the existing Ash Crown route's one- or two-person party selection.
- Makes internal battle audit outcome unambiguous via **`playerResult: 'win' | 'loss'`**, while leaving legacy `outcome: 'defeat' | 'surrender'` unchanged for story and existing consumers. Without this, both defeating an enemy and a player-party wipe emitted `outcome:'defeat'`, which could cause false-positive balance reports.

These are state transition and observability fixes, **not** new damage boosts or punishments.

## Exact-source results

Source HEAD for final code paths: `e8a9f59714ee3f8bcada44f4f6958cd66820d86b` (production battle code at `0034f4607c48396f6a77b2f073008d58c40c5cf1` unchanged in the later test commits). All JavaScript is evaluated from that GitHub source in a V8 sandbox with **synchronous presentation/timer stubs**. Gameplay visuals, actual keyboard interaction and timing are **not** exercised.

### KO and save regressions

- 5 direct checks at code HEAD `0034f460...`: no KO, Karen down, Triton down, Sophie down and Margaret down — each completed a real wolf encounter without soft lock.
- 4 actual committed `tests/combat_ko_queue_and_result.test.js` callbacks PASS with actual game state/battle/one-person-party selection source in a simplified V8 test harness.
- 2 actual committed `tests/combat_resource_persistence.test.js` callbacks PASS with actual battle + progression source: combat victories do not automatically restore KO allies, HP or MP; only losses have a `playerResult:'loss'` record; a loss does not grant XP or gold.
- Existing `tests/combat_progression_guardrails.test.js` corrected: leveling for healthy-party trials now sets HP/MP to the upgraded maximum; verification of wins now uses `playerResult:'win'` instead of mistakenly accepting party losses as victories.
- **Full native `node --test` and `npm run check`: not performed** because private full repo/assets could not be checked out and Actions runners remain blocked.

### Extended encounter endurance (artificial fight sequence, no resting)

Each trial uses a new initial state then carries **actual HP, MP, EXP, level-ups, rewards, drop outcomes and KO state** from one battle to the next. No free heal or a state reset between battles. The route below is a testing **sequence of combat IDs**, not a claim to have traversed the real map.

15 encounters: wolf → road bandit → bats → cave rats → crawler → cave beetles → ancient fort boss → northern wolves → boar → northern wolves → imperial raid → Vanguard → battlefield wolves → northern wolves → Zenith.

| Strategy | Seeded trials | Complete wins | Party wipes | Technical stalls |
| --- | ---: | ---: | ---: | ---: |
| Primarily attack (magic until out of MP) | 48 | 48 | 0 | 0 |
| Conserve MP, guard on key first turns | 48 | 48 | 0 | 0 |
| Guard / ice / break / heal when required | 48 | 48 | 0 | 0 |

**No-attrition starting assumption:** four healthy initial level-1 heroes with 3 healing herbs, 1 mana herb, 120G. Did not invoke any rest, inn or vendor; skipped between-battle conversations and explored zero map tiles. First-party HP across the complete 15 encounters was reduced substantially in attack-focused strategies; this is an acceptable tradeoff, but requires genuine pacing and shop/rest testing.

### Resource-stressed seven-fight expedition

Seven forced fights: wolf, bandit, bats, cave rats, crawler, cave beetles, ancient fort boss, **without resting between them**. 60 fixed seeds per starting-resource and tactic pair. Each party starts at the indicated proportion of **base** HP and MP, with the same initial inventory (no starting-level cheat).

| Starting HP + MP per hero | Policy | 7-fight complete victories | Party wipes | Input stalls |
| --- | --- | ---: | ---: | ---: |
| 100% | Attack-focused | 60/60 | 0 | 0 |
| 100% | Guard / selective heal | 60/60 | 0 | 0 |
| 50% | Attack-focused | 60/60 | 0 | 0 |
| 50% | Guard / selective heal | 60/60 | 0 | 0 |
| 25% | Attack-focused | **38/60** | **22** (all at fort boss) | 0 |
| 25% | Guard / selective heal | **60/60** | 0 | 0 |

**Interpretation**: at unusually low supplies, using the defensive and healing commands changes survival rather than merely altering a damage counter. The 25%-resource synthetic scenario is not the observed state of a real player arriving at the fort; do **not** tune the boss higher solely on these numbers. 100% and 50% are not evidence that a beginner could never struggle with timing or readability.

## Required real player review before GO

1. Do a fresh **New Game** and actually walk through Ryune village, the training choice, exit, first wolf, merchant and cave with keyboard/controller/touch controls.
2. Record the real battle count and HP/MP on reaching the fort boss, not assumed encounters. Confirm whether resting is easy to understand, reachable, and not mandatory to grind.
3. Intentionally allow Karen, Sophie and Margaret to fall in separate fights; verify the next command remains usable and UI highlights a **living** active party member.
4. Run the initial 25% scenario from a browser save with actual actions and observe whether missing MP leads to an informative disabled ability rather than blocking the action queue.
5. Compare 1280 px desktop and 390 px mobile readability of warnings, defense effects and normal combat.
6. Capture **video or timestamped screenshots**, record time-to-complete, lost inputs, dialogue quality, actual play enjoyment and frustration. Independently accept or reject with reasons.

No server-runner or human gameplay validation is represented by this document. Full QA and GO remain blocked pending the actual playable build / Actions fix.
