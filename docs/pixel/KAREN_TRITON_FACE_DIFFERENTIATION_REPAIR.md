# Karen / Triton Face Differentiation Repair Gate

## Current status

- Branch: `pixel-karen-triton-face-differentiation-fix`
- Draft PR: #22
- Karen: **LOCKED / VISUAL REGRESSION CONTROL**
- Triton Technical Architecture: **PASS**
- Triton Front Visual: **v4 candidate ready for user review**
- Sophie / Margaret: paused

## Progress review

Completed and stable:

- production remains main / v23 / Save schema 23 / Story 00–19;
- Karen approved design and all eight runtime PNGs are pinned;
- 48×48 source architecture works;
- ~44px Medium render works;
- Triton GROUND ANCHOR body / stance / color-mass direction works;
- eight-animation architecture and grounded motion personality work;
- comparison boards are now real-PNG mechanical composites only;
- CI separates Technical PASS from Visual PASS.

The remaining blocker is **Triton's front-face quality**.

v3 was technically valid but visually rejected because the face remained less attractive / readable than Karen.

## v4 direction

v4 keeps the proven Triton body and external silhouette.

It changes only the internal face / immediate face-framing region to move toward:

- larger-head-feeling Chibi readability;
- narrow but clearly readable eyes;
- visible pupil/iris information without copying Karen's round-eye template;
- straight grounded brows;
- a restrained but wider-capable mouth;
- slightly longer / sharper face;
- clearer open face center under heavy dark hair;
- reliable / strong / grounded / approachable protagonist read.

Exact eye color remains unresolved canon. Any current iris color is implementation placeholder only.

## v4 source candidate

`docs/pixel/reference/triton_idle_front_repair_candidate_v4_48.png`

This file is a **front-only candidate**, not the official Triton four-direction source.

## Pixel-perfect scope

v4 is checked against v3.

Allowed patch:

`[18,8,31,18]`

Required:

- no changed pixel outside the face patch;
- no alpha/silhouette change;
- body / stance / clothing / waist blue mass unchanged;
- outer hair silhouette unchanged;
- Karen unchanged.

## Comparison evidence

Generated mechanically from committed PNGs only:

- `karen_triton_v4_front_mechanical_x10.png`
- `karen_triton_v4_grayscale_mechanical_x10.png`
- `karen_triton_v4_silhouette_mechanical_x10.png`
- `karen_triton_v4_face_mechanical_x10.png`
- `karen_triton_v4_face_grayscale_mechanical_x10.png`
- `triton_v3_v4_mechanical_x10.png`
- `triton_v3_v4_face_grayscale_mechanical_x10.png`
- `triton_v3_v4_rgba_difference_x10.png`

No image-generation model is used to build these boards.

## Decision boundary

CI may approve only:

- file integrity;
- pixel repair scope;
- Karen preservation;
- runtime regression.

Only the user may approve:

> **Triton Front v4 Visual PASS**

Do not propagate v4 to other directions until that PASS.
