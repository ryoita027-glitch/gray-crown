# Gray Crown — CAPITAL_FIRST_ARC_QUALITY_REVIEW_v1
**2026-10-10 JST · Phase 7 · DRAFT / REVISE (technical S1 gate not cleared)**
**Target branch:** `pixel-production-capital-first-arc-v1`; **base:** `pixel-vslice-integration-v1` HEAD `81cf40a007dded765d14d468d66ccc4fcbf4ad19`.
**Production `main`:** `d689aabb5146c9f45466a4f74f397e664c08fb4f`, untouched; Save schema **23**.

## 1. Preflight gate / limitation — do not pretend Phase 6 was GO

GitHub was inspected for live `main`, integration branches, open PRs, actions, current Source of Truth, Phase 5 acceptance. Phase 5 PR #43 is **Draft / unmerged**; no signed Phase 6 art/vertical-slice acceptance exists. Its latest [Phase 5 Actions run](https://github.com/ryoita027-glitch/gray-crown/actions/runs/37972618637) and [Triton CI](https://github.com/ryoita027-glitch/gray-crown/actions/runs/37972624720) are `failure` with job steps **null/zero**. Runner/budget/policy constraints must be diagnosed from GitHub's account-side Actions UI. There is no legitimate `npm run check`, natural full-route or fresh screenshot PASS at Phase 5 merged HEAD.

**Accordingly this PR is a separate non-destructive Phase-7 implementation experiment, not a formally approved continuation or a claim of a shippable capital chapter.** `main` and all historical PRs remain untouched. Phase 7 cannot be declared DONE without Phase 5/6 S0/S1 sign-off and same-HEAD real tests.

## 2. Inventory of authentic current capital content

| Gameplay zone | Preexisting characters / objects | Progress and class |
|---|---|---|
| `capital` public square, north castle terrace | `capitalOfficial`(12,6), `capitalCitizen`(9,8), `capitalFlowerGirl`(5,8), `capitalRecruit`(18,8), `capitalVendor`(4,8), `rationMother`(16,8), `granz`(8,5). Castle, market, fountain, barracks, poster, hero records, inn and armory doors. | EXISTING/PROVISIONAL city render; original NPC and interaction data untouched |
| `capitalinn` 白鹿亭 | `capitalInnHost`(8,6), `offDutySoldier`(15,8), desk, notice, `innRest`, exit | EXISTING functional site; nighttime story only after ceremony |
| `capitalarmory` 兵装店 | `capitalSmith`(8,6), `armoryApprentice`(15,8), repair bench, rack, exit | EXISTING working improvement service; no final weapon designs |
| Ceremony `alpha.capital.ceremony` | 12 original dialogue lines; triggered by initial contact with `capitalOfficial`, guarded by incomplete event and `returnedKingdom=false` | EXISTING original effects: complete event, advance to `06_ceremony`, journal |
| White Stag night `alpha.capital.whiteStagNight` | `innRest` after ceremony; 13 original dialogue lines and recovery | EXISTING; `07_white_stag` upon first inn entry and `08_alpha_complete` at event end |
| `alpha2.capital.granzBriefing` | Existing later dialogue with General Granz, only once the white stag night is complete | EXISTING; no new staged dialogue |
| Revisit from outside city | Existing `northroad`, Ash Road and later return story with `returnedKingdom` | EXISTING; story chronology and flag checks preserved |

Related files reviewed: `js/data/maps.js`, `js/data/npcs.js`, `js/data/events.js`, `js/data/battles.js`, `js/render/world.js`, `js/render/ui.js`, `js/systems/events.js`, `js/systems/exploration.js`, `js/systems/cinematic.js`, `js/systems/audio.js`, `js/core/save.js`, and `js/systems/movement.js`, `js/systems/story.js` and earlier acceptance and art standards.

## 3. Changes actually prepared in isolated branch

1. `js/render/capital_environment.js`: reversible integer-coordinate palette and role-specific details for **only** three capital maps. West markets, east military logistics, shared stone architecture, inn and smithy have different material signatures. Existing tile and NPC positions unaffected; no new interactables, collision changes or official emblems.
2. `js/systems/capital_acting.js`: only existing ceremony lines (12) mapped to cinematic actors. Distinct Karen impulse, Triton restraint, Sophie audience response, Margaret observation. No new dialogue, no cutscene expansion of story, no saving while active. Portrait A/B remains **UNDECIDED**.
3. `js/render/world.js`: delegates optional city pixel accents and NPC role accents without removing approved four-hero rendering; original capital architecture scene still draws so existing district geometry remains.
4. `js/systems/cinematic.js` and `js/systems/events.js`: preserve existing SceneRunner and original triggered event effects. Instead of immediate event effects, finish the original lines before applying `EVENT_DEFS` as done for Ryune.
5. `js/systems/audio.js`: map-scoped `capitalInn` / `capitalArmory` synthetic themes and a single ceremony bell cue; old capital, road, cave, battle music still present.
6. `index.html`, `tests/harness.js`: deterministic script-load order. `js/data/events.js`, `js/core/save.js`, `js/data/maps.js`, `js/data/npcs.js`, every hero PNG and existing `STORY_STAGES` are unchanged.
7. `tests/capital_first_arc.test.js`: contract tests for original 12 lines, effects, stage, NPC/doors, toggled appearance, four distinct actor pace hints and interior audio.
8. `tests/browser_capital_first_arc_e2e_test.py`: normal title → Phase-5 ordinary-input full route → real capital checkpoint → original 12-line ceremony → capital NPCs and 2 interiors → save/Continue, plus source-save-matched Portrait ON/OFF and 390/1024 responsive captures. A/B reuses **actual** game save contents in a test-only second browser context; does not plant new Story flags.

This scope adds **no** new kingdom, empire, religion, insignia, rank, formal costume, weapon or post-19 Story.

## 4. Acceptance matrix (strict)

| Criterion | Verified as of drafting |
|---|---|
| Same-HEAD `npm run check`, including Story 00–19 | **NOT YET RUN SUCCESSFULLY** |
| 4 protagonist source assets locked, hash validation | **NOT YET RUN ON THIS HEAD**; existing PNG files unchanged in PR diff |
| Legitimate start-game → capital (with real battles) | **UNVERIFIED**, Phase 5 upstream S1 still open |
| City NAV, NPCs, both indoor doors, return paths | **E2E CODE PREPARED, NOT PASSED** |
| 12-line ceremony, camera and lock cleanup | **E2E CODE PREPARED, NOT PASSED**; original event data untouched |
| Both Portrait modes from same save | **E2E CODE PREPARED, NOT PASSED** |
| Actual fresh capital screen before/after, inn and armory images | **NOT YET CAPTURED** |
| Schema23, Save/Load/Continue, historical v23 main save | **NOT YET VERIFIED ON HEAD** |
| Headless browser JS exceptions and 390px viewport | **NOT YET VERIFIED** |
| Aesthetic cohesion, pacing, urban sense of social stratification | **USER-OWNED; UNDECIDED** |

Never present a generated illustration as actual gameplay evidence, never call a test passing merely because its test file exists.

## 5. Risks and exact follow-up acceptance

- **S1 BLOCKER (inherited):** Actions jobs 0 steps; Phase 5 boss-route regression, S0/S1 and v23 migration not signed off. Fix actions runner allocation/minutes/billing/policy first. Do not relax failing tests or push to `main`.
- **S1 (candidate / unknown):** City Scripted Ceremony SceneRunner might leak a lock, skip lines or mis-restore the camera if test fails. Reproduce in actual Chromium and repair before approval.
- **S1 (candidate / unknown):** New city drawing may obscure a door or official, or create a false obstacle. Grounded per-tile collision reachability and screenshot validation needed.
- **S2:** Original `capitalOfficial` uses hideWhen after ceremony, making repeat NPC dialogue unavailable in the ordinary world; original post-event gate logic preserved. Review whether to expose an optional post-ceremony source-neutral city NPC, **not** an invented new quest.
- **S2:** Capital NPCs are procedural 32px with small accessories while playable actors are pixel-native 48px sources. User review still needed; accessories are not a finished artist's atlas.
- **S2:** Original city block facades and new accent layer may be visually busy; check post-ceremony crowd and door markings at 390px; prune ornament where readability suffers.
- **S2:** City music and ceremony bell are placeholders (oscillator Web Audio, not recorded soundtrack). No human rating or audio mastering yet.
- **S2:** Existing merchant/forge gold sinks and capital war economy should be reviewed for cost and usefulness, but prices/stats remain unchanged.
- **S3:** Crowds with pathfinding, high-frame-cost dynamic NPC behaviors, licensed BGM and new NPC sprites postponed; avoid new story chapters.

## 6. Proof/rollback/decision protocol

All technical verdicts above remain **REVISE / NOT GO**, not production quality. When Actions restarts, run exact branch HEAD: `npm run check`; locked PNG/hash validators; old Phase 5 end-to-end; `tests/capital_first_arc.test.js`; `tests/browser_capital_first_arc_e2e_test.py`; real main v23/backup compatibility and existing responsive/acting gates. Capture direct screenshots at 1365, 1024 and 390px with identical camera/state and compare before/after toggling `CapitalEnvironment.enabled`. Record total runtime, number of dialogues, stage restoration and unexpected render locks in artifacts. Confirm city after exit and second encounter doesn't replay completed ceremony.

Rollback points: Phase 7 `CapitalEnvironment.enabled=false` for *art-only A/B*; for entire phase, leave Phase 7 Draft PR unmerged and return to Phase 5 `81cf40a007dded765d14d468d66ccc4fcbf4ad19`. **Never force-push, overwrite or merge into production `main` without user permission.**

**Adoption requested from the user only after clean same-HEAD CI, comparison footage/screenshots and playable user visual sign-off. Do not start a large subsequent story region before formal acceptance.**
