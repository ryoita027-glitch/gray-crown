# Gray Crown — Current Project State

Status: 2026-10-06 JST

## Production baseline

- repository: `ryoita027-glitch/gray-crown`
- production branch: `main`
- game baseline: v23
- Save schema: 23
- Story: 00–19
- logical world: 32px
- Pixel-native: experimental / not merged to main

## Karen — frozen control

Karen VILLAGE RUNNER is approved.

Authority:

`docs/pixel/reference/karen_chibi_direction_v1.png`

plus the eight committed Karen runtime PNG sheets.

Karen is the permanent Visual Regression Control for the current character-validation work.

She must not be changed to accommodate Triton, Sophie or Margaret.

## Triton — current state

Technical architecture is validated:

- 48×48 source
- ~44px Medium prototype occupancy
- eight animation categories
- GROUND ANCHOR acting architecture
- grounded movement
- heavy-hair-tip motion
- SceneRunner / camera / scale integration
- control restoration
- Save unaffected

Visual identity repair is active on:

`pixel-karen-triton-face-differentiation-fix`

Draft PR:

**#22 — Repair Karen Triton visual differentiation gate**

## Triton front v4

v3 was rejected visually because the face remained weaker than Karen.

v4 addresses facial readability while preserving the already-working body / stance / outer hair silhouette.

v4 is generated deterministically from v3 using:

`tools/generate_triton_front_v4_candidate.py`

Expected v4 RGBA SHA-256:

`ed42a5fcada5e77989e452d2870faf80ebc851515c6ae7bfb87f4fbaeadbc0a8`

Repair scope:

- 76 changed pixels
- face patch only
- zero alpha changes
- body outside face patch pixel-identical
- outer silhouette pixel-identical

## Comparison policy

Image-generation comparison boards are prohibited.

Evidence must use:

- committed Karen PNGs;
- committed Triton source PNGs;
- deterministic v4 PNG;
- crop / nearest-neighbor / grayscale / silhouette / raw pixel difference only.

## Latest technical result

Workflow run:

**37429109104 — SUCCESS**

Tested head:

`ccc93fdbebc9f052c039ed0f4200a0d6b51c31ce`

Evidence artifact:

- id: **11395929455**
- digest: `sha256:830ed71a23d32bce01274aa4cab5872116964f9860cee9201ffaf9a991714087`

Passed:

- Karen lock before
- Triton v4 generation
- Triton v4 pixel-scope gate
- mechanical visual evidence
- full prototype regression
- Karen lock after
- Save schema 23 preserved

## Current gate

# **TRITON FRONT V4 — USER VISUAL GATE**

Technical PASS is complete.

The remaining question is visual only:

- does Triton look attractive enough to stand beside Karen?
- does she read as a separate person even without color?
- are the eyes readable without becoming Karen's eye template?
- does she remain GROUND ANCHOR?
- does she look like a playable protagonist rather than a generic NPC?

Only the user may issue PASS.

## Paused until Triton PASS

- Sophie production
- Margaret production
- NPC migration
- main merge
- v24
- formal Pixel-native adoption
