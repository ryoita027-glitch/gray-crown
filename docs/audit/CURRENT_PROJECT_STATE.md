# Gray Crown — Current Project State

Status inspected: 2026-10-06 (JST). Repository: `ryoita027-glitch/gray-crown`.
This document describes the experimental Pixel-native stack. It does not promote it to production.

## Source of Truth

| Scope | Authority |
|---|---|
| Production game | `main`, v23, Save schema 23, Story 00–19 |
| Locked character identity | `docs/characters/CHARACTER_VISUAL_IDENTITY.md` |
| Provisional art direction | `docs/art/GRAY_CROWN_ART_BIBLE_v2.md` |
| Karen Chibi source | `docs/pixel/reference/karen_chibi_direction_v1.png` |
| Karen animation result | `docs/pixel/KAREN_CHIBI_INTEGRATION_RESULT.md` |
| Karen scale result | `docs/pixel/KAREN_CHIBI_SCALE_INTEGRATION_RESULT.md` |
| Triton validation plan | `docs/pixel/TRITON_SECOND_CHARACTER_VALIDATION_PLAN.md` |
| Triton final result | `docs/pixel/TRITON_SECOND_CHARACTER_IMPLEMENTATION_RESULT.md` |
| Current work order | `docs/audit/NEXT_WORK_ORDER.md` |

## Production

`main` remains the v23 production baseline. Story 00–19, Save schema 23, battle foundation and logical 32px world geometry remain unchanged.

No Pixel-native prototype branch has been merged into main.

## Completed Karen prototype

- Cute Chibi Pixel RPG heroine direction.
- Four-direction 48×48 source.
- Exactly eight animation categories: Idle, Walk, Turn, Talk, Surprise, Approach, Laugh, Run.
- 32px logical world with foot anchor `[24,44]`.
- Portrait ON / OFF and Motion Only comparisons.
- Full 48 / Medium 44 / Compact 41 scale comparison.
- **44 Medium** selected as Karen's prototype scale candidate.
- Portrait OFF remains a provisional preference only.

## Completed Triton second-character validation

Locked identity: **Triton A — GROUND ANCHOR**.

Implemented on `pixel-triton-second-character-validation`:

- front candidate translated into true 48px source language;
- left / right references retained;
- back view added;
- four-direction Idle atlas;
- exactly eight animation categories;
- heavy-hair tip-only motion;
- lower-bounce grounded walk;
- broad planted laugh;
- stable run;
- Karen + Triton matched-framing comparison;
- Full 48 / Medium 44 / Compact 41 scale comparison.

The system therefore has evidence from two characters with deliberately different silhouette, weight, posture, color placement and motion personality.

## CI evidence

Triton implementation commit:

`43ab43be257e7db144c3e4b76171488580b1ae9d`

Draft PR:

**#20 — Triton second-character pixel validation**

GitHub Actions run:

**37401209352 — SUCCESS on rerun of the same implementation head**

The first attempt stopped in the existing Frontier Section 2 browser walk gate. No code change was made before rerun.

Final successful scope:

- Node regression: **58 / 58 PASS**
- V21 Browser Gate: PASS
- Frontier Section 1: PASS
- Frontier Section 2: PASS
- Developer Mode: PASS
- Karen animation / scale gates: PASS
- Triton Karen-comparison gate: PASS
- Triton eight-animation sequence: PASS
- Triton Full / Medium / Compact scale gate: PASS
- control restoration: PASS
- Save schema remains 23

Evidence artifact:

- id: **11385149436**
- digest: `sha256:b384f11ba8fe998fb3e363025a0869dce711bb55aae3967c6795059629dc154a`

## Current architecture verdict

**GO for a provisional cross-character Pixel Character Standard.**

Current evidence supports:

- 48×48 source cells;
- logical 32px world;
- nearest-neighbor rendering;
- foot-anchor-based scaling;
- approximately 44px Medium as the current hero-scale starting point;
- eight shared acting categories;
- character-specific silhouette, body weight, center of gravity and hair motion.

This is not yet formal game-wide adoption.

## Next development gate

Prepare **Pixel Character Standard v1 — PROVISIONAL** from Karen + Triton evidence.

Do not begin Sophie and Margaret together. After the standard is reviewed, Sophie should be the next single-character reproducibility test.

## Unresolved / user decisions

Still undecided:

- formal Pixel-native adoption;
- final game-wide player-character scale;
- final Portrait policy;
- main integration strategy;
- final Stage B costumes;
- final weapons;
- eye colors;
- surnames;
- Kingdom / Empire / religious emblems;
- hero certification marks;
- military insignia;
- v24 story development.

Do not invent these as part of visual implementation.

## Write policy

Fetch current branch head and affected blob SHA before every write. Preserve reversible prototype work. Do not overwrite concurrent Work changes. Final main merge, formal adoption and canon changes require explicit user approval.
