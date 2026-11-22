# Gray Crown — VERTICAL_SLICE_ACCEPTANCE_REPORT_v1
**Phase 5 status: TECHNICAL ACCEPTANCE BLOCKED / CREATIVE ACCEPTANCE UNDECIDED**
**Date:** 2026-10-10 JST. **Target:** development-only `pixel-vslice-integration-v1`; **production `main`: unchanged**. The current report deliberately does **not** call the opening vertical slice complete.

## 1. Authority, baseline and integration sequence

- Production `main`: `d689aabb5146c9f45466a4f74f397e664c08fb4f` (v23); Save schema 23.
- Approved next-development Pixel-native baseline: PR #39 HEAD `994178432e44cdb06dd592fdd2d39bc418d90acc`. **Draft**; not merged to `main`.
- Phase 3 acting and village NPC identity: PR #41 HEAD `253d5d85feed3613cd8e2c3c34b8f2bf0982c410`. Proven to have succeeded in its original browser and Triton CI runs `37970478373` and `37970484136`; the original unretouched 26-file acting / Portrait A/B evidence is artifact `11634764203`.
- Phase 4 work exists as a separate exploratory branch `pixel-vslice-road-cave-combat-v1`, audited at `7ec47f232618215f5b4d768e68088810df4eb093`. Its latest Actions runs `37970769609`, `37971139120`, `37971182098` reported **failure**; its artistic branch also depends on unapproved Ryune v2 PR #40.
- Phase 5 branch was created **from PR #41**, not from `main`; a separate commit overlays **only** identifiable road/cave/battle/audio changes from Phase 4. **Do not imply the entire Phase 4 branch or PR #40 is accepted.** No force pushes, branch deletes, history rewriting or production merges.

### Candidate changes

| Area | Exact sources / implementation | State |
|---|---|---|
| 4 protagonists | Existing Karen/Triton/Sophie/Margaret native 48×48-source PNG animations with 44px world display; actor ID and anchors unchanged | LOCKED files; combined use requires E2E |
| Village and interiors | PR #39 environment v1 + PR #41 NPC role accents; unapproved Ryune art v2 **not included** | development baseline + visual review |
| Dialogue / Pixel Acting | PR #41 SceneRunner, exact 22-line original appointment; portrait ON default, OFF A/B comparison | technical candidate; Portrait **UNDECIDED** |
| Road/cave terrain | `js/render/road_cave_quality.js` copied from inspected Phase 4 code; renderer opt-out `RoadCaveQuality.enabled=false`, no tile/coordinate change | PROVISIONAL visual improvement |
| NPC/map/object placement | `js/data/maps.js` and `js/data/npcs.js` unchanged | LOCKED for this candidate |
| Battle rendering | Terrain-aware backdrop and persistent party sprites, status cues, contrast / command focus, using existing PNG bytes | PROVISIONAL visual improvement |
| Boss | Existing gray-horned beast HP 185 / ATK 18 / DEF 9 and reward 125G / EXP65; Phase 4 metadata enables boss cinematic and phase II/III thresholds without changing original base stats | PROVISIONAL balance decision, test required |
| Audio | Map/boss music selection, existing player sound toggle, small lever/pickup cues; no external asset downloads | PROVISIONAL auditory improvement |
| Data/Story | `js/data/events.js`, `js/systems/story.js`, `js/core/state.js`, `js/core/save.js` untouched; Story 00–19 and schema 23 remain authoritative | LOCKED |
| v23 compatibility | Pinned real `main` checkout used by Phase 0 original compatibility test in CI | **not rerun successfully on merged HEAD** |

### Excluded from automatic integration
The `ryune_art_direction_v2.js` artwork, its higher-level source changes, and competing legacy PR-specific workflows. They remain unapproved comparisons. This branch keeps the existing village environment and four actors.

## 2. Canonical playable route / chronology

1. Main title → new game → village NPCs, stores/homes/orphanage → envoy dialogue `alpha.village.appointment` → `01_appointed`.
2. North village gate requires appointment complete; `02_road` on entering Kingdom Road.
3. Story wolf near (11,5) on road: ordinary collision/proximity battle; scripted `alpha.road.wolfVictory` advances to `03_first_battle`. Road also contains optional human bandit and traveler cache.
4. Road side branch near (13,1) → old fort `cave` by normal movement. Chests `chest1/chest2`, guardian bats/crawler, two guarded levers. Both are required before the boss/central gate.
5. Actual gray-horned beast boss choice and encounter; `world.defeatedSymbols.boss` unlocks northern exit. Defeat must not counterfeit victory; boss victory should be permanent across save/load.
6. Fort north exit → `northroad` → Kingdom capital → existing `05_capital` transition. No fake developer teleport or invented Story stage. The separate **direct road to northroad route is intentionally preserved**, as this fort is currently an optional detour; do not silently change canonical storyline requirements.

## 3. Browser real-play acceptance suite

New `tests/browser_vertical_slice_e2e_test.py` operates **actual game UI only** for all progress. It starts fresh using the normal title button, moves with keyboard along legal tiles and uses the rendered battle buttons. A read-only BFS chooses walkable cells, **not** a developer warp. Random encounters are fought using ordinary commands. The script exercises:
- Genuine village appointment, existing house/NPC continuity, road gate/wolf, fort approach.
- Two authentic treasure acquisitions with repeat attempt (no duplicate reward).
- Guardian encounters and both lever actions with repeat checks; existing limited fort recovery.
- Human-clicked boss fight choice, real damage/healing, victory/defeat flags and capital transition.
- Save via ordinary menu before departure, road, after wolf, fort, levers, boss; reload/Continue, persistent flags.
- Existing independent real main v23 fixture / backup restoration / defeat tests, and responsive browser viewport snapshots at 1365×900 / 1024×768 / 390×844.
- Actual **automation wall-clock** time, move count, battle IDs and commands, elapsed dialogue automation time, dialogue advance count, completed events, accidental blocked steps, headless Chromium animation gaps / slow-frame samples.
- Pre, in-event, encounter, boss, after-victory and new capital screenshots, and `vertical_slice_e2e_metrics.json` **only when Actions can execute the script**.

Automation play duration is **not a human reading-time estimate**. Script navigation cannot reliably measure subjective wayfinding, enjoyment, pacing or emotional attachment. Real screenshots are unmodified captured game images, not generated visuals.

`tests/browser_road_cave_quality_e2e_test.py`, `tests/road_cave_combat_quality.test.js` from inspected Phase 4 source validate reversible art, battle presentation, bass/lever cues, flags and snapshots. Existing `browser_ryune_acting_e2e_test.py` covers Portrait A/B with the original 22 appointment lines.

## 4. CI proof and strict status

| Requirement | Phase 5 merged current HEAD proof |
|---|---|
| `npm run check` incl. full Story 00–19 tests | **NOT YET VERIFIED** |
| Locked four-hero asset SHA and sprite consistency | **NOT YET VERIFIED** |
| World / combat / Ryune real Chromium screenshots | **NOT YET VERIFIED** |
| Normal Play New Game → Old Fort boss → capital | **NOT YET VERIFIED** |
| Save/Continue, real main v23 compatibility & backup | **NOT YET VERIFIED** |
| Responsive mobile and input lock | **NOT YET VERIFIED** |
| User evaluation of aesthetics/fun | **UNDECIDED** |

A workflow has been created at `.github/workflows/vertical-slice-e2e.yml` to execute all gates in order with a shared Chromium install, read-only pinned main fixture, 7-day artifacts and branch-scoped concurrency. However, immediately after adding it, run **`37971473156` failed with 0 executed job steps**. The second run **`37971870362` also failed before job steps**. These are **not test results** and must never be recorded as evidence that the new branch passes or that game logic fails. The connector provides no usable job log / cause; check Actions repository billing/allowance, queue/policy and workflow YAML before retesting. GitHub billing remaining minutes and spending are **UNVERIFIED**.

Historical green PR #41 run `37970478373` and Triton run `37970484136` prove that **previous** HEAD's acting and source controls worked; do **not** substitute them as tests of Phase 5. Historical PR #39 integrated run `37967259690` likewise does not prove the new merged HEAD.

## 5. Remaining faults, gaps and severity

| Priority | Concern | Mitigation / acceptance |
|---|---|---|
| **S1 BLOCKER** | Latest Phase 5 CI jobs did not execute a single test step; no first-to-last recorded result | Restore runnable Actions, inspect check-run annotations and re-run exact final HEAD; obtain screenshots + metrics |
| **S1 UNVERIFIED** | Natural cave puzzle/boss may reveal collision, encounter, game-over or save softlocks | Run normal-player Chromium test; repair game itself where reproducible; never disable tests to force green |
| **S1 UNVERIFIED** | Real v23/backup recovery on merged head | Run pinned production main fixture and corrupt-primary recovery checks |
| **S2** | NPC portrait/hero/environment artwork still differs in resolution and silhouette; Phase 4 candidate painting is not automatically approved as final art | Side-by-side screenshots at same scale with player assessment |
| **S2** | Original route offers optional fort detour; player may finish segment by staying on road and miss boss | Decide whether the fort is a required chapter beat, improve breadcrumb without fabricating events, or explicitly market it as optional |
| **S2** | Boss escalation (65% and 30% HP) may need tuning for a first-playthrough party after random encounters | Collect actual fight count, outcome, party HP/MP, turns, and normal-player playthroughs |
| **S2** | Mobile UI / battle actors / interaction affordance and excess dialogue/time between scenes still need subjective human inspection | Review raw viewport screenshots and play both Portrait modes |
| **S3** | Optional offshoots, voice/hand bespoke motion, broader NPC animation parity, sound design and polishing | Separate future changes; preserve story/locked PNGs |

## 6. Rollback and adoption decision

- All changes isolated in `pixel-vslice-integration-v1`. **No `main` write**. Development baseline rollback: leave Draft PR unmerged and return to PR #41 HEAD `253d5d85feed3613cd8e2c3c34b8f2bf0982c410`.
- Candidate can disable only new road/cave pixel overlay via `RoadCaveQuality.enabled=false` for visual A/B; *this does not roll back boss mechanics*. For full regression rollback use the prior branch commit or make normal forward revert commit; do not force-push history.
- This report distinguishes objectively implemented code from user-accepted game experience. **Completion status stays REVISE/BLOCKED** until same SHA has all CI green, real play evidence is checked, and the user explicitly approves the artistic/playable vertical slice.
