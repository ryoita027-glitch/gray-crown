# Gray Crown — Current Project State

Status inspected: 2026-10-06 (JST). Repository: `ryoita027-glitch/gray-crown`.

## Production source of truth

Production remains:

- `main`
- v23
- Save schema 23
- Story 00–19
- logical 32px world

Pixel-native prototype work is not merged into production.

## Karen — approved control

Karen VILLAGE RUNNER is approved and frozen as the **Visual Regression Control**.

Authority:

`docs/pixel/reference/karen_chibi_direction_v1.png`

plus the eight committed Karen runtime PNG sheets.

Karen may not be modified to make Triton, Sophie or Margaret fit.

CI pins and verifies all nine Karen visual blobs.

## Triton — technical architecture vs visual identity

Triton's technical architecture remains validated:

- 48×48 source
- approximately 44px Medium candidate
- eight animation categories
- grounded motion personality
- SceneRunner / scale / control restoration
- Save schema unaffected

However, Technical GO and Visual GO are separate.

The previous Triton front face was reopened because it remained too close to a shared Chibi face template.

Current repair branch:

`pixel-karen-triton-face-differentiation-fix`

Draft PR:

**#22 — Repair Karen Triton visual differentiation gate**

Current front candidate:

`docs/pixel/reference/triton_idle_front_repair_candidate_v3_48.png`

v3 changes only the face patch relative to v2:

- 29 changed pixels
- zero changes outside the allowed face patch
- zero alpha/silhouette changes

Body, stance, broad shoulders, low center, heavy dark hair silhouette and faded-blue horizontal waist mass remain v2-identical.

## Comparison evidence policy

Image-generation comparison boards are now prohibited.

Locked-character comparison evidence must use actual source/runtime PNGs with deterministic mechanical operations only.

The earlier AI-generated v3 board is discarded.

Permanent policy is recorded in:

`docs/pixel/PIXEL_CHARACTER_STANDARD_v1_PROVISIONAL.md`

## Latest technical evidence

Run:

**37421248534 — SUCCESS after same-head failed-job rerun**

Tested head:

`03eedebfb1976903ea4aae388ab676e77bffd067`

Final successful rerun verified:

- Karen lock before: PASS
- Triton v3 pixel scope: PASS
- mechanical Evidence: PASS
- Node: 58 / 58 PASS
- full prototype browser regression: PASS
- Karen lock after: PASS
- Save schema: 23

Evidence artifact:

- id: **11393042711**
- digest: `sha256:2cbff9ec8fce5566fa2d8aca48fd9d892367062fe9b03954a3b6ba499955a91f`

## Current human gate

# **TRITON FRONT V3 — USER VISUAL PASS REQUIRED**

CI cannot approve:

- attractiveness
- protagonist-level face quality
- Triton-specific charm
- whether the face is sufficiently separate from Karen while remaining same-game

Until the user chooses PASS:

- do not propagate v3 to other directions;
- do not regenerate Triton animations;
- do not resume Sophie;
- do not begin Margaret.

## Sophie / Margaret

Paused.

Sophie work already created remains preserved but is not active.

## Pixel Character Standard

Status remains **PROVISIONAL**.

It now permanently requires:

- Karen protection;
- Technical PASS / Visual PASS separation;
- real-PNG comparison evidence;
- no AI-generated comparison boards;
- pixel-perfect repair-scope validation where applicable.

## Still unresolved

- Triton v3 final visual approval
- formal Pixel-native adoption
- final game-wide hero scale
- final Portrait policy
- NPC migration policy
- battle sprite standard
- main merge strategy
- v24

Do not invent unresolved canon during this gate.
