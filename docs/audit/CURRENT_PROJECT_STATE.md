# Gray Crown — Current Project State

Status: 2026-10-06 JST.

## Production

Production remains **main / v23 / Save schema 23 / Story 00–19**.

Pixel-native is not merged to main.

## Karen

Karen — VILLAGE RUNNER is approved and frozen as the **Visual Regression Control**.

Authority:

- `docs/pixel/reference/karen_chibi_direction_v1.png`
- eight committed Karen runtime PNGs

Karen must not be changed to accommodate another character.

## Triton

Triton — GROUND ANCHOR is now complete for the protagonist validation phase.

Visual authority:

- `docs/pixel/TRITON_CHIBI_DIRECTION_LOCK_v1.md`
- `docs/pixel/reference/triton_chibi_direction_lock_v1.png`

Triton completion: **PASS**.

# **Triton Second Character Validation PASS**

Completed and verified:

- 4-direction 48×48 source;
- exactly eight runtime animation categories;
- deterministic runtime regeneration;
- Karen / Triton actual-game matched comparison;
- Full48 / Medium44 / Compact41 scale comparison;
- Medium44 selected;
- all browser regression gates;
- control restoration;
- Save schema 23 unchanged;
- all nine locked Karen visual blobs unchanged.

Final completion CI:

- run: **37436833623**
- tested head: `69d01fba95d8f18b7d1eeacfb7f7a3de96f8a5e4`
- artifact: **11398669794**
- digest: `sha256:0e67a662aece3df4cf95a25a15b728b6eeefd9961f7de2c7acc9c4d731558d9c`

## Pixel Character Standard

`docs/pixel/PIXEL_CHARACTER_STANDARD_v1_PROVISIONAL.md`

is updated from the completed Karen + Triton evidence.

It now explicitly prevents:

- one shared face template;
- one shared anatomy template;
- color-only differentiation;
- same standing pose;
- same movement curves;
- comparison-board AI redraws.

The Standard remains PROVISIONAL until Sophie and Margaret pass.

## Active phase

> **Sophie — STEADY HANDS front Idle validation**

Sophie starts with one front-facing visual candidate only.

Required identity challenge:

- 23-year-old adult woman;
- 158cm / smallest hero;
- softer body;
- honey-colored hair;
- gentle / slightly drooping eyes;
- off-white + green;
- hands as the main acting focus;
- reassuring, practical presence;
- stubborn stillness where life is concerned.

Do not proceed to Sophie's four directions or eight animations until the user approves her front design.

## Margaret

Paused until Sophie passes.

## Comparison policy

Locked-character comparison boards use actual committed/source PNG mechanical composition only.

Image-generation comparison boards are prohibited.

## Still not authorized

- main merge;
- formal Pixel-native adoption;
- Portrait deletion;
- NPC mass migration / final NPC scale policy;
- v24.
