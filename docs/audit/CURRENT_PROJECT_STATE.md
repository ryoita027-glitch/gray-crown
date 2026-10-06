# Gray Crown — Current Project State

Status inspected: 2026-10-06 (JST). Repository: `ryoita027-glitch/gray-crown`.
This document describes the experimental integration branch. It does not promote it to production.

## Source of Truth

| Scope | Authority |
|---|---|
| Production game | `main`, v23, Save schema 23, Story 00–19 |
| Locked character identity | `docs/characters/CHARACTER_VISUAL_IDENTITY.md` |
| Karen costume | `docs/characters/KAREN_COSTUME_DESIGN_v1.md` |
| Provisional art direction | `docs/art/GRAY_CROWN_ART_BIBLE_v2.md` |
| Approved Karen Chibi source | `docs/pixel/reference/karen_chibi_direction_v1.png` |
| Animation integration record | `docs/pixel/KAREN_CHIBI_INTEGRATION_RESULT.md`, PR #17 |
| Chibi scale experiment record | `docs/pixel/KAREN_CHIBI_SCALE_INTEGRATION_RESULT.md`, PR #18 |
| Current work order | `docs/audit/NEXT_WORK_ORDER.md` |

The user confirms the Karen Chibi design is approved. Do not restart its front-Idle design gate.
Earlier realistic-proportion Karen experiments and their scale verdicts are historical only.
Original Canon / Character Bible / Culture / Shape Language / Costume Rules sources are still absent from this repository; do not reconstruct them from memory.

## Verified GitHub baseline

| Branch | Observed HEAD | Role |
|---|---|---|
| `main` | `d689aabb5146c9f45466a4f74f397e664c08fb4f` | Production |
| `pixel-karen-acting-prototype` | `3ced39795e9479198dc7116b36071740f948f212` | Technical foundation, draft PR #6 to main |
| `pixel-karen-chibi-direction` | `22e10359c81a9cd7506ba1fca95b9dc54eee7496` | Completed Chibi animation integration, draft PR #17 |
| `pixel-karen-chibi-scale-integration` | `5fcbcf2703acf7c228941ac386e7c5c958caa035` | Latest implemented experiment, draft PR #18 |
| `pixel-triton-second-character-validation` | `5fcbcf2703acf7c228941ac386e7c5c958caa035` | Reserved branch only; no Triton implementation |

These are an audit snapshot, not a substitute for fetching fresh branch heads before writing.

## Completed Karen work

- Four directions and exactly eight animation categories: Idle, Walk, Turn, Talk, Surprise, Approach, Laugh, Run.
- 48×48 source cells, 32px logical world, foot anchor `[24,44]`.
- Karen + Mika scene; Motion Only and Portrait OFF / ON comparisons.
- Legacy 32px baseline retained.
- Chibi scale comparison: 48 Full / 44 Medium / 41 Compact.
- PR #18 selects 44 Medium as an experimental candidate, not a final game-wide standard.
- Portrait OFF is a provisional preference; the system remains available.

## CI evidence and its exact scope

| Stage | Successful run | Tested commit | Current HEAD difference |
|---|---|---|---|
| Animation | 37384493234 | `869ea25842cde6ed0c099fa94d0d56ba73c8744d` | One result document only |
| Scale | 37386602760 | `4f12fb96c43ea7b46745d3e1db854eaea1f45c16` | One result document only |

The scale run reports 54 Node tests plus production, developer, animation and scale browser gates passing. Both HEAD differences were checked through GitHub compare. Do not describe the document-only HEADs as having separate successful CI runs.

## Active engineering work

`repo-karen-integration-handoff` branches from the observed scale HEAD. It synchronizes stale handoff documents and consolidates the read-only CI gate. Runtime code and approved PNGs remain unchanged.

The new workflow runs on PR updates targeting any branch, production pushes after adoption, and manual dispatch. It includes the scale gate in `npm run prototype-check` and runs the animation gate once. Dedicated work must have a PR to receive automatic CI. Older branches keep their old workflows until this maintenance change is integrated.

## Next development gate

Triton Second Character Validation is the next experiment recorded by PR #18. Preparation may proceed from the locked GROUND ANCHOR identity. Final Triton design remains a user decision; use `docs/pixel/TRITON_SECOND_CHARACTER_VALIDATION_PLAN.md`.

Pixel-native formal adoption, game-wide scale, final Portrait policy and main integration remain undecided. No v24, new story chapters, NPC mass migration or Sophie / Margaret production is authorized by this handoff.

## Unresolved canon

Do not invent exact eye colors, surnames, final weapons, final Stage B costumes, Kingdom / Empire / religious emblems, hero certification marks, Shion's crown, military insignia, new scars, keepsakes or backstory.

## Write and approval policy

Fetch target HEAD and affected blobs before writing. Use dedicated branches and expected-SHA updates; never overwrite concurrent work. Continue reversible technical work autonomously. Ask the user for final character design, story canon, formal adoption and main merge decisions.
