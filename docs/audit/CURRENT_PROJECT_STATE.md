# Gray Crown — Current Project State (Phase 1)
**Effective 2026-10-10 JST.** Read this document, then the matching work order, before coding. Snapshot of the accepted **development candidate**, not a release or a change to main.

## Authority boundary
- **LOCKED production baseline:** `main` remains v23 / Save schema 23 / Story 00–19; production HEAD at approval `d689aabb5146c9f45466a4f74f397e664c08fb4f`.
- **LOCKED development decision:** user approved a Pixel-native **next-development baseline** on 2026-10-10, allowing art/UI residuals to remain backlog and Portrait A/B to remain unresolved. This **does not** authorize a merge to `main`, final art redesign, canon changes, or a v24 release.
- **Integrated candidate:** `integration/phase1-pixel-native-baseline-20261010`, from PR #38 and PR #37, keeping both histories via the two-parent merge commit `2938145f0bc4302a392827236a3005b5925a1408`. This remains Draft/validation subject to the branch CI. Rollback point: PR #36 `9bbea4da0878f17109e4ceaf45f033ed73f17883`.
- **Source precedence:** production behavior is `main`; Pixel-native candidate implementation is this integration branch; this file + `docs/visual/SOURCE_OF_TRUTH_STATUS.md` document its development contract. Historical experiment notes never supersede tested live code.

## Verified implementation inventory
| Scope | Status | Authority / open work |
|---|---|---|
| Karen VILLAGE RUNNER / red low-tied silhouette | LOCKED | approved regression control; no source rewrite |
| Triton GROUND ANCHOR / dark hair and broad low stance | LOCKED | approved independent identity; no source rewrite |
| Sophie STEADY HANDS | LOCKED | active appeal v3 runtime, historical Direction Lock v2 retained as heritage |
| Margaret MEASURED LINE / white-silver hair | LOCKED | active appeal v7 runtime, historical Direction Lock v5 retained as heritage |
| 48×48 4-direction frames / Medium44 world / logical 32px tile | LOCKED | candidate technical contract; no subjective final-scale guarantee |
| Field actor foot anchor [24,44] and direction order down-left-right-up | LOCKED | `js/render/world.js` and source sheet convention |
| Field and battle 4 unique character sheets | LOCKED | live PNG references and `js/render/battle.js` |
| UI/commercial polish / player menu / battle composition | PROVISIONAL | technical tested, visual refinements remain |
| Ryune village + four interiors pixel renderer | PROVISIONAL | environment candidate #38 with old-render before/after switch |
| NPC renderer and environments outside Ryune group | PROVISIONAL | mixed density and procedural legacy remain |
| Portrait ON/OFF and global default | UNDECIDED | keep both implementations, do not delete or flip |
| Old 32px art-as-final / 42px alternate scale / v4 Margaret crushed face | SUPERSEDED | history only, fallback compatibility where still executed |
| Save schema 23, Story 00–19 | LOCKED | no data/canon/schema migration authorized |
| Existing regression and specialized Chromium gates | LOCKED | test semantics must not be deleted or weakened |
| Phase-1 integrated CI and broader art/mobile approval | PROVISIONAL | must verify **this exact HEAD**, not inherit parents' green badges |

**Historical completed gate:** Triton Second Character Validation PASS. This is a retained proof-of-completion marker for legacy CI, **not** a pending or restarted work item.

## Work already done — DO NOT restart
Karen/Triton/Sophie/Margaret front-Idle, directions, eight animation categories, initial runtime integration, PR #30–#38 prototypes, real-world/road/battle/save gates and Ryune visuals are **implemented**. Starting Karen's first front Idle or generating Sophie/Margaret from old v2/v5 sources is obsolete.

## Open work and release boundaries
- Visual acceptance remains a quality backlog: NPC/hero density, silhouette overlap, non-Ryune backgrounds, combat composition, narrow mobile hierarchy, cinematic pacing.
- Portrait mode is UNDECIDED. A/B visual evidence is **not** selection approval.
- Verified main-v23 compatibility currently covers a real **fresh** main-produced save, not arbitrary progressed personal archives.
- No `main` merge, branch deletion, force-push, story extension, v24 or final emblems/weapons without separate approval.
- Next work: `docs/audit/NEXT_WORK_ORDER.md` and `docs/audit/VERTICAL_SLICE_PRODUCTION_PLAN_v1.md`.

## Historical (retained, not current instructions)
`docs/pixel/PIXEL_CHARACTER_STANDARD_v2_FOUR_PROTAGONIST.md`, `docs/audit/PIXEL_NATIVE_ADOPTION_REVIEW_v1.md`, `docs/visual/RYUNE_ENVIRONMENT_REVIEW_v1.md` and earlier branch/PR history remain for provenance. The old FOUR PROTAGONIST RUNTIME HARMONIZATION and four-protagonist environment integration gates are **completed historical phases**, not the next task.
