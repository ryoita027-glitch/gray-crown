# Gray Crown — Four-Pillar Commercial Quality Pass v1

**2026-10-10 · Work branch:** `pixel-commercial-quality-four-pillars-v1`
**Base:** Stage8 Draft PR #48, SHA `9938b2e899555b9476248ac821380f6ca44ac532`.
**Status:** **IMPLEMENTED CANDIDATE / S1 VALIDATION HOLD / NOT A COMMERCIAL RELEASE APPROVAL.**

This is not a claim that Gray Crown is already commercially competitive or that every part of an 8–12-hour RPG is finished. It is a source-backed, reversible first commercial-quality pass across all four requested pillars, delivered as code on a separate GitHub branch. Neither Phase7 #45 nor Phase8 #48 has had formal artwork/Playwright acceptance. `main` retains schema23 and Story00–19.

## Source of Truth and hard invariants

The existing world data, event text, battle definitions, save/migration code, Story order and four original protagonist sprite sets control canon. No altered `js/data/*`, `js/core/save.js`, `js/systems/story.js`, approved 32 PNG files in `assets/characters/{karen,triton,sophie,margaret}`, map geometry, NPC spawn or reward table. No new royal/imperial heraldry, religion, final costume, exact weapons or Portrait OFF/ON final decision.

No `main` merge, no GitHub Actions dispatch, no asset regeneration. All new systems use transient view-only state except the one explicitly fixed original guard battle mechanic. Production and archived saves still follow v23 with no new serialized key.

## Pillar 1 — four protagonists become readable characters at playing scale

- `js/systems/commercial_acting.js`: ordinary non-ceremony dialogue calls `GC.CommercialActing.onLine` / `onClose`; the speaking hero uses **the authentic approved 48px-per-frame** `talk`, brief `surprise` or `idle` sheets, scaled to 44 logical px. A zero/tiny/measured acting delay separates Karen/Triton/Sophie/Margaret without inventing new lines or replacing faces. Margaret's delay is intentional, not a missing animation. Dialogue locks, save and game-space movement are unchanged.
- Existing SceneRunner at Ryune and Aldina retains its own exact choreography; new acting explicitly disables itself while `GC.Cinematic.isActive()`, in combat or outside the original map. `prefers-reduced-motion` disables the enhancement.
- Redraw is capped to approximately 12fps when reading a dialogue instead of repeatedly painting the entire world at 60fps. This is a throttled implementation target, not an instrumented performance benchmark.
- Combat had a **confirmed CSS asset presentation bug**: `.battle-hero.sprite` was sized `64×64` with `192×1024` background despite approved **`192×192` sprite sheets**. New last-in-CSS override uses `44×44`, `176×176` scaled atlas and four-frame pixel-idle loop; no pseudo-character silhouette overlays.

**Remaining S1 art:** no latest-head real screenshot comparison at 390px/desktop or approval of final portrait mode, emotion legibility and 4-character distinction. A runtime pixel pose is not a new fully hand-authored character illustration.

## Pillar 2 — beginning to Serad has visible choices and meaningful discovery

- `commercial_ux.js` displays the correct existing `front()`-facing NPC name / object in a small contextual command strip. No counterfeit quest text.
- `commercial_discovery.js` marks original village messenger, road wolf, old fort levers/boss and three mandatory Ash Road steps with an existing quest-arrow visual. The markers **do not unlock any event or bypass the actual requirements**.
- Optional find panel reports genuine original flag/treasure state: road 2 optional features, old fort 4, Ash Road 5, Serad 1. Clearly labelled **寄り道の発見（任意）**. All actual optional content, map coordinates, mandatory progression, rewards and drop rates are preserved. This is discovery *visibility*, not a claim new 3D art or newly authored gameplay reward.
- `tests/browser_ashroad_serad_e2e_test.py` now asserts Ash Road guidance and discovery in the real normal-player route, subject to later execution.

**Remaining S1 design:** no instrumented player behavior, time-on-area, side-loop completion, narrative pacing, soft-lock sample or repeat-session retention measurements. Do not claim 8–12h total play time or commercial engagement from a counter.

## Pillar 3 — grounded visuals, actionable UI and royalty-free provisional sound

- Pixel-art corrections on the prior Phase8 branch (false-obstacle decoration moved to blocked map tiles, continuous 32px terrain rather than stamped 30px insets) were retained; new UI adds command hints, enemy selection and an optional-find counter without UI framework replacement.
- `commercial_soundscape.js`: 8-beat deterministic code-authored motifs with intentional rests and subtler bass per existing place, military front, archive aftermath, boss, battle and village. The original mute control, sound settings and WebAudio synth chain remain. All code-generated tones are original; sound design is **provisional**, not mixed/mastered/composed recorded soundtrack. No external licenses or asset dependencies.
- Battle target controls use at least `44px` tap height, keyboard Tab focus, active indication via `aria-pressed`; reduced motion preference honored for hero frame cycles.

**Remaining S1 visuals/audio:** true current HEAD screenshot comparison, keyboard/mobile accessibility pass, sound listening/dynamics balance, performance/FPS/cold-load and responsive mobile regression. No in-game screenshot generated from this SHA so far.

## Pillar 4 — combat input now matters

- Previously all combat actions hardcoded `livingEnemies()[0]`, so fighting two enemies did not allow a target choice. `commercial_tactics.js` stores a *transient* selected live foe, resets for each real encounter and retargets when the selected foe dies; `battle.js` uses it in the actual damage formula and `render/battle.js` uses the same target for HP/name and enemy card styling.
- Existing Karen `guard` was mislabelled: the previous code halved damage only when Karen was independently chosen by random AI. Now, an alive guarding hero intercepts hits intended for a companion, takes the hit with guard damage reduction and leaves a readable original combat log. Original enemy target-selection fairness remains. Both functions use original battle action / turn flow.
- Subdued encounter advice shows the four existing roles, real enemy selection and the actual original boss-phase threshold: warns when <65% HP phase 1 and <30% phase 2 causes extra attack next enemy turn. No enemy/skill stat or reward balancing guesswork.
- E2E script now demands **a click on the second living Imperial soldier, then a real Karen attack** and verifies only that target loses HP.

**Isolated actual-source V8 functional evidence (not full game):**
  - The original `js/systems/battle.js` executed in a controlled, DOM-stubbed V8 test with the original real `js/data/battles.js`, `js/data/items.js` and newly committed `commercial_tactics.js`. With Imperial patrol HP `[62,58]`, clicking logical second-target and using the real `battleAction('attack')` produced **`[62,46]`**: zero damage to the first.
  - The original enemy-turn function and real guard interceptor redirected an attack intended for Sophie to Karen; Karen lost **3 HP**, all three companions **0**, battle log showed Karen protecting Sophie.
  - Actual boss definition `vanguardCaptain` yielded the phase-2 and phase-3 warnings at the documented original thresholds.
  - Original actual sprite sheets on the archived official artifact were inspected: each heroine's idle/talk/surprise frame atlas **192×192 RGBA**, 4×4 48px frames; proposed CSS atlas scale is dimensionally consistent. PNGs have not been modified.

## Checks, verifiability and release blockers

| Acceptance check | Current evidence |
|---|---|
| GitHub code patch and branch | **APPLIED**, see Draft PR |
| JavaScript syntax of modified and newly added system functions | **PASS — V8** |
| Target-selection health change and Karen interception | **PASS — isolated actual battle code in V8 stubs** |
| Character pose / narrator reset / sounds / optional progress | **PASS — isolated V8 functional smoke** |
| Same order of HTML scripts vs Node harness | **PASS — exact-string static comparison, 38 imports** |
| Approved art file changes / source schema change | **NONE INTRODUCED**, verify tree against Stage8 base |
| `npm test`, `npm run check` on exact HEAD | **NOT RUN** |
| Phase7/8 original E2E plus improved actual Playwright attack | **NOT RUN at commercial branch HEAD** |
| Actual after-art screenshots / audio review / human playtest | **NOT AVAILABLE / PENDING** |
| Commercial appeal, 8–12h target, balance fairness | **NOT MEASURED, no release approval** |

The private repo is available to the assistant through an authenticated GitHub connector, but a working copy of the **current** HEAD has not been obtained in the Chromium container. A successful historical playable ZIP from 2026-10-08 can be run locally, but its program **predates** new Phase7/8/commercial modules: old screenshots do NOT prove this candidate. Run full local acceptance on **this exact branch** before discussing signoff.

## Required no-Actions acceptance procedure

On a current clone with Node, Python, installed Playwright/Chromium and immutable old main v23 commit:
```powershell
git switch pixel-commercial-quality-four-pillars-v1
py -3 tools/run_local_quality.py --mode quick --install
py -3 tools/run_local_quality.py --mode full --install --with-v23
```
The full existing suite includes the stronger second-Imperial-soldier attack target assertion and original mandatory battles. Retain raw screenshots at village, cave/boss, royal appointment, Ash Road, Serad and 390px; compare with approved hero art, check input, menu, audio disable, no overflowing tactical buttons, stage15 Continue, unchanged v23. Record precise HEAD and full logs. Every error is a new fix candidate, not a reason to weaken the assertion.

## Adoption and next priority

1. Get **exact-HEAD real Chromium** play from new game via boss→capital→Ash Road→Serad (including actual four sprites) and no-action proof, fix S0/S1.
2. Review original 48px runtime idle/talk/battle pose coherence with authentic screenshots; reject cutout halos, generic NPC faces, silhouette confusion and excessive UI.
3. Instrument novice user playtests (5–10 people as a preliminary sample, not statistical validation) for first 10/30 minutes, exploration discovery and encounter choices; **do not invent conversion/retention or sales**.
4. Balance according to real encounter logs (boss outcomes, healing pressure, successful guarding, encounter time) while preserving moral/canon choices.
5. Decide the canonical Portrait mode, final art and `main` merge only with explicit owner approval; until then **Draft / HOLD**.

**Rollback:** leave Draft unmerged and return to Phase8 `9938b2e899555b9476248ac821380f6ca44ac532`. Pure art-layer opt-outs are `GC.CommercialActing.enabled=false`, `AshFrontierEnvironment.enabled=false` and other existing prior design toggles. Combat Guard behavior and target UI require reverting these specific commit diffs, not a visual toggle. No force push; no Story/data edits.
