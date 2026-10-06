# Gray Crown — Current Project State

Status inspected: 2026-10-06 (JST). Repository: `ryoita027-glitch/gray-crown`.
This document describes the experimental Pixel-native stack. It does not promote it to production.

## Source of Truth

| Scope | Authority |
|---|---|
| Production game | `main`, v23, Save schema 23, Story 00–19 |
| Locked character identity | `docs/characters/CHARACTER_VISUAL_IDENTITY.md` |
| Provisional art direction | `docs/art/GRAY_CROWN_ART_BIBLE_v2.md` |
| Pixel Character Standard | `docs/pixel/PIXEL_CHARACTER_STANDARD_v1_PROVISIONAL.md` |
| Karen Chibi source | `docs/pixel/reference/karen_chibi_direction_v1.png` |
| Karen animation result | `docs/pixel/KAREN_CHIBI_INTEGRATION_RESULT.md` |
| Karen scale result | `docs/pixel/KAREN_CHIBI_SCALE_INTEGRATION_RESULT.md` |
| Triton validation plan | `docs/pixel/TRITON_SECOND_CHARACTER_VALIDATION_PLAN.md` |
| Triton final result | `docs/pixel/TRITON_SECOND_CHARACTER_IMPLEMENTATION_RESULT.md` |
| Current work order | `docs/audit/NEXT_WORK_ORDER.md` |

## Production

`main` remains the v23 production baseline.

Unchanged:

- Story 00–19
- Save schema 23
- battle foundation
- logical 32px maps and collision

No Pixel-native prototype branch has been merged into main.

## Karen prototype — completed evidence

Karen VILLAGE RUNNER currently proves:

- approved Chibi visual direction
- four-direction 48×48 source
- exactly eight animation categories
- foot-anchor scaling
- Portrait ON / OFF and Motion Only comparison
- Full 48 / Medium 44 / Compact 41 scale comparison
- Medium 44 as the selected prototype condition
- distinct forward / light / active acting identity

Portrait OFF remains a provisional preference only.

## Triton second-character validation — completed evidence

Triton GROUND ANCHOR proves that the same architecture can support a substantially different hero:

- broader shoulder / waist mass
- lower center of gravity
- heavy dark shoulder-length hair
- low faded-blue horizontal color block
- four-direction 48×48 source
- exactly eight animation categories
- reduced vertical bounce
- heavy-hair tip-only motion
- planted walk / laugh / run
- Karen + Triton matched-framing comparison
- Full 48 / Medium 44 / Compact 41 scale comparison

Implementation commit:

`43ab43be257e7db144c3e4b76171488580b1ae9d`

Draft PR:

**#20 — Triton second-character pixel validation**

Successful workflow:

**37401209352 — SUCCESS on rerun of the same implementation head**

Final verified scope:

- Node regression: **58 / 58 PASS**
- V21 Browser Gate: PASS
- Frontier Section 1: PASS
- Frontier Section 2: PASS
- Developer Mode: PASS
- Karen animation / scale gates: PASS
- Triton comparison / eight-animation / scale gates: PASS
- control restoration: PASS
- Save schema remains 23

Evidence artifact:

- id: **11385149436**
- digest: `sha256:b384f11ba8fe998fb3e363025a0869dce711bb55aae3967c6795059629dc154a`

## Pixel Character Standard v1 — PROVISIONAL

Created on:

`pixel-character-standard-v1-provisional`

Authority:

`docs/pixel/PIXEL_CHARACTER_STANDARD_v1_PROVISIONAL.md`

The standard separates:

1. shared technical rules;
2. character-specific identity rules;
3. unresolved / user-decision rules.

Current shared prototype rules include:

- 48×48 source cells;
- down / left / right / up directional order;
- logical 32px world unchanged;
- nearest-neighbor rendering;
- foot-anchor-based scaling;
- current anchor `[24,44]` as validated default, not immutable anatomy law;
- Full 48 / Medium 44 / Compact 41 comparison modes;
- Medium 44 as the default starting condition;
- exactly eight v1 prototype animation categories;
- frame-budget contract 4 / 6 / 3 / 4 / 4 / 4 / 6 / 6;
- character-specific motion inside shared category semantics;
- high-resolution references must be translated, not blindly downsampled;
- Karen is not an anatomy template;
- Portrait and legacy 32px comparison remain available.

The Standard is **PROVISIONAL**. It is not formal game-wide Pixel-native adoption.

## Current architecture verdict

# **GO FOR THIRD CHARACTER VALIDATION**

Two-character reproducibility is now established strongly enough to challenge the standard with a third visual problem.

The next character is:

> **Sophie — STEADY HANDS**

Do not begin Margaret at the same time.

## Next development gate

Start Sophie with **one front-facing 48×48 Idle candidate only**.

The Sophie gate must verify that the shared standard can support:

- 23-year-old adult identity at 158cm;
- the smallest hero without making her childlike;
- softer standard body shape;
- rounder face and gentler eyes;
- honey-colored hair with one low soft bundle / braid;
- off-white as the large body color mass;
- green concentrated around the hands;
- smaller steps;
- hand-focused acting;
- quiet support / practical care;
- serious or angry stillness rather than exaggerated bounce.

Do not expand to four directions or eight animations until that front design direction is accepted.

## Unresolved / user decisions

Still undecided:

- formal Pixel-native adoption;
- final game-wide player-character scale;
- final Portrait policy;
- final NPC migration / resolution policy;
- battle sprite standard;
- main integration strategy;
- final Stage B costumes;
- final weapons;
- exact eye colors;
- surnames;
- Kingdom / Empire / religious emblems;
- hero certification marks;
- military insignia;
- v24 story development.

Do not invent these as part of visual implementation.

## Write policy

Fetch current branch head and affected blob SHA before every write.
Preserve reversible prototype work.
Do not overwrite concurrent Work changes.
Final main merge, formal adoption and canon changes require explicit user approval.
