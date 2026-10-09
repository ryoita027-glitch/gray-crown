# Gray Crown — PHASE8_ASHROAD_SERAD_QUALITY_REVIEW_v1

**2026-10-10 JST · Phase 8, Ash Road → first Serad front arc · DRAFT / NO-GO**
**Branch:** `pixel-production-ashroad-serad-v1`, based on **Phase7 PR #45** candidate `72caa9c5cc4fb22c5da90497fe74b1da87438bce`.
**Production `main`:** `d689aabb5146c9f45466a4f74f397e664c08fb4f` (v23), deliberately unchanged.

## 1. Prerequisite audit / exact scope

The user authorized moving to the **next engineering phase**. The capital PR #45 remains **Draft and unaccepted**, Phase6 audit PR #44 remains **Draft**, and Phase7 recovery PR #47 is a separate Draft based on PR #44 rather than PR #45. None of them has been silently merged. Hosted Actions had **zero executed steps** when quota/runner constraints affected prior pushes. This stage is therefore a **reversible code candidate**, not a formal production/creative signoff and not authorization to introduce Story20+.

The next existing logical story arc is Stage 09 Granz briefing / 10 Ash Road / 11 exit / 12 Serad arrival / 13 field hospital / 14 Vark battle victory / 15 first Serad duty complete. Stage16–19 remains as existing second-frontier story and is **not expanded here**.

## 2. Existing canonical route, mandatory conditions and optional material

| Existing location | Objects and NPCs | Story requirements or content |
|---|---|---|
| `capital` after ceremony | `alpha.capital.whiteStagNight`, `alpha2.capital.granzBriefing` | Must first complete white-stag night and Granz briefing before north gate |
| `ashroad` | `refugee`, `fieldPriest`, `scorchedOrders`, `imperialPatrol`, `burnedCart`, `burnedHomestead`, `ruinedShrine`, `ashCache` | Refugee, scorched orders and actual imperialRaid battle victory are **all mandatory** for `alpha2.ashroad.complete`; secondary homes/cart/priest/shrine/cache remain optional |
| `frontier` | `frontierOfficer`, `frontierMedic`, `vanguardCaptain`, `kingdomGuard`, `imperialGuard`; `fieldHospital`, `watchTower`, `frontierCache`, `frontierBarricade`, `frontierNotice` | Commander briefing → field hospital → Vark battle → commander report; original Stage12→13→14→15; no fight can unlock early |
| `frontierfield` | `frontierScout`, `woundedImperial`; `stretcherTracks`, `imperialSatchel`, `withdrawalOrders`, `fieldGraves`, `brokenSignalPost`, `scavengerWolves` | Existing second frontier Stage16–19 untouched; **art-only** first pass |

Pre-change static topology inspection: each is 24×15; naive immovable map tile/object/NPC BFS from genuine map-entry cell (11,13) reaches an adjacent player cell for **all existing interactive points**: `ashroad` 282 passable cells, `frontier` 266, `frontierfield` 282. This is a **static reachability check**, not a proof that all scripted gates can be traversed in a real browser.

## 3. Actual implementation (no original Story/data changes)

| File | Purpose | Authority |
|---|---|---|
| `js/render/ash_frontier_environment.js` | New toggled 32px terrain/pixel accents, original object/NPC overlays, only for three existing maps | PROVISIONAL render |
| `js/render/world.js` | Guarded rendering hooks before existing fallback; original road/fort, Ryune and capital render stay in place | Original gameplay untouched |
| `js/systems/audio.js` | Three map-scoped four-note synth sequences, with existing audio toggle and battle priority | PROVISIONAL sound |
| `index.html`, `tests/harness.js` | Same-load-order new renderer script; no new framework | Technical |
| `tests/ashroad_serad_first_arc.test.js` | Visual opt-out, correct map scope and NPC adjacency, strict original Ash Road/Serad milestone/event/battle gates, v23/audio | New Node tests |
| `tests/browser_ashroad_serad_e2e_test.py` | Actual New Game input chain from village through original Gray Horn boss → capital → night → Granz → Ash Road mandatory story → real imperialRaid battle → Serad arrival → hospital → actual Vark battle → Stage15; Save/Continue, 390px, art A/B | Prepared browser test; **not yet executed on merged HEAD** |
| `tools/run_local_quality.py` | Appends Phase8 test to **existing** Actions-free full local suite, keeping its first-failure logs and v23 fixture | Local-only acceptance tool |
| `docs/visual/ASHROAD_SERAD_ENVIRONMENT_STANDARD_v1.md` | Reversible pixel grammar, neutrality of unapproved cultural elements | PROVISIONAL |
| `docs/audit/PHASE8_ASHROAD_SERAD_QUALITY_REVIEW_v1.md` | This inventory / risk matrix / acceptance conditions | This report |

The following are **NOT changed**: `js/data/maps.js`, `js/data/npcs.js`, `js/data/events.js`, `js/data/battles.js`, `js/systems/story.js`, `js/core/save.js`, `assets/characters/**`, all prior kingdom and empire culture docs. Story00–19, 14 original battle definitions and schema23 remain unchanged.

## 4. Evidence, limitations and severity

| Gate | Phase8 status |
|---|---|
| New renderer isolated JavaScript compilation | **PASS — independent V8 function compilation**, not full Node suite |
| Ash, Serad and aftermath pixel overlay opt-out | **PASS — independent V8 Canvas fillRect stub**, not a screenshot |
| Existing Story and NPC map reference reachability | **PASS — isolated pure JavaScript/BFS**, not actual event traversal |
| `npm run check` full regression | **NOT EXECUTED on exact Phase8 HEAD** |
| Four approved PNG hash gate | **NOT EXECUTED on exact Phase8 HEAD**; no images changed |
| Correct battle action, puzzle, dialogue input progression | **NOT YET VERIFIED** |
| Phase8 natural-play to Story15, no Dev Mode | **NOT YET VERIFIED** |
| Authentic same-state before/after captures | **NOT YET CAPTURED** |
| Save/load and genuinely old main v23 backup compatibility | **NOT YET VERIFIED** |
| User approval of aesthetics, pacing, emotional stakes | **PENDING** |

**S1 BLOCKER inherited:** Phase5 and Phase7 integrated real-browser acceptance not proven on their latest SHA. Even though a prior archived historical original build underwent normal-play checks, its screenshots do not prove Phase8 current art.

**S1 POSSIBLE:** New browser script follows the *entire* Phase5/7 path and may encounter real original interaction bugs, as distinct from an authored E2E selector bug. Do not mark 'PASS' merely because test files compile. The patrol and Vark encounter waits avoid generic auto-battle test helpers until command UI actually opens.

**S2 REVIEW:** Distinction between civilian loss, relief camp and front-line logistics may be visually too low-contrast or visually busy at 390px. Four playable sprites versus procedural NPCs need raw screenshot comparison. Synthesized loops require listening evaluation.

**S2 DESIGN:** Existing content includes a priest/wayside shrine, but religious symbols/dogma remain undecided. Current decorations are neutral relief cloth, **not** formal religion or new canon. No new insignia/ranks.

**S3:** Broader encounter balance, native bespoke NPC animation atlas, optional field exploration and licensed recorded audio remain future work. Existing balance/loot was intentionally not changed without actual play data.

## 5. Local Actions-free verification and rollback

After checking out this **exact** branch on a computer:
```powershell
py -3 tools/run_local_quality.py --mode quick --install
py -3 tools/run_local_quality.py --mode full --install --with-v23
```
The local full suite now also runs `tests/browser_ashroad_serad_e2e_test.py`. No GitHub-hosted minutes, PR auto-merges, source replacements or character-sheet regeneration; stop at the first error and retain console log, `prototype_artifacts/ashroad_serad_v1/*`, exact HEAD SHA and genuine game screenshots.

Only after true same-SHA tests, game-input progression, saves, visual comparisons and subjective user review should the draft be proposed for adoption. Formal Go/No-Go and Portrait/art decisions remain with the user.

**Rollback**: keep this branch as Draft (unmerged) and return to Phase7 PR #45 HEAD `72caa9c5cc4fb22c5da90497fe74b1da87438bce`, or set `AshFrontierEnvironment.enabled=false` for art-only A/B. Never force-push or touch `main`.
