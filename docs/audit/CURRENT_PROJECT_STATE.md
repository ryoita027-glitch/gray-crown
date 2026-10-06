# Gray Crown — Current Project State

Status: 2026-10-06 JST

## Production

- main
- v23
- Save schema 23
- Story 00–19
- logical 32px world
- Pixel-native not merged to production

## Karen

Karen VILLAGE RUNNER is approved and frozen.

Source:
`docs/pixel/reference/karen_chibi_direction_v1.png`

All eight Karen runtime PNGs remain hash-pinned as Visual Regression Control.

Karen must not be changed to accommodate another character.

## Triton

Technical architecture is validated:

- 48×48 source
- ~44px Medium candidate
- 8 animation categories
- GROUND ANCHOR acting architecture
- SceneRunner / scale / control restoration
- Save unaffected

Visual identity repair remains active on PR #22.

v3 was technically valid but did not reach the desired protagonist-level facial quality.

v4 is now a deterministic front-face candidate generated from committed v3 by:

`tools/generate_triton_front_v4_candidate.py`

The candidate is written to the CI evidence artifact, then compared mechanically against locked Karen.

No AI-generated comparison board is authoritative.

## Current gate

# TRITON FRONT V4 — TECHNICAL GATE THEN USER VISUAL GATE

Required technical checks:

- Karen hashes unchanged
- v4 generation hash stable
- exactly 76 changed pixels
- changes stay inside face patch
- alpha silhouette unchanged
- mechanical front / grayscale / face / silhouette evidence
- full prototype regression

After those pass, the user decides Visual PASS / REVISE / FAIL.

## Paused

- Sophie
- Margaret
- NPC migration
- main merge
- v24
- formal Pixel-native adoption
