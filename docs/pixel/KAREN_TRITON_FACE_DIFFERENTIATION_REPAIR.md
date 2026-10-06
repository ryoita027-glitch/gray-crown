# Karen / Triton Face Differentiation Repair Gate

## Current status

- Branch: `pixel-karen-triton-face-differentiation-fix`
- Draft PR: #22
- Karen: **LOCKED / VISUAL REGRESSION CONTROL**
- Triton Technical Architecture: **PASS**
- Triton Front Visual: **v4 deterministic candidate**
- Sophie / Margaret: paused

## Progress review

Stable:

- main / v23 / Save schema 23 / Story 00–19;
- Karen approved source and 8 runtime sheets are hash-pinned;
- 48×48 source architecture and ~44px Medium rendering work;
- Triton GROUND ANCHOR body, stance, dark heavy hair silhouette and faded-blue waist mass work;
- Triton eight-animation technical system works;
- AI-generated comparison boards are permanently banned;
- Technical PASS and Visual PASS are separate.

Current blocker:

> Triton's front face needs protagonist-level charm and readability without collapsing back into Karen's face template.

## v4 implementation strategy

The prior attempt to commit a new binary candidate exposed an avoidable binary-transport problem.

Therefore v4 is represented by a deterministic pixel patch over committed v3:

`tools/generate_triton_front_v4_candidate.py`

It generates:

`prototype_artifacts/triton_idle_front_repair_candidate_v4_48.png`

This is a real 48×48 RGBA PNG, not a generated comparison board.

Advantages:

- every changed pixel is reviewable in Git;
- the candidate is reproducible byte-for-byte in CI;
- body / silhouette scope can be verified;
- Karen is never passed through an image generator or modified.

## v4 visual target

- Chibi protagonist face with clearer read at gameplay scale;
- eyes remain narrower than Karen, but regain readable pupil/sclera structure;
- straight stable brows;
- compact, natural Idle mouth with room for broad Laugh animation later;
- slightly longer/sharper facial read than Karen;
- heavy dark hair remains, but the central face is less visually crushed;
- reliable / strong / grounded / approachable.

Eye color remains unresolved canon; the current implementation color is provisional only.

## Pixel scope

v3 → v4:

- exact changed pixels: **76**
- allowed face patch: `[18,8,31,18]`
- body outside face patch must be pixel-perfect;
- alpha silhouette must be pixel-perfect;
- Karen must remain hash-identical.

## Mechanical evidence

CI creates:

- `karen_triton_v4_front_mechanical_x10.png`
- `karen_triton_v4_grayscale_mechanical_x10.png`
- `karen_triton_v4_silhouette_mechanical_x10.png`
- `karen_triton_v4_face_mechanical_x10.png`
- `karen_triton_v4_face_grayscale_mechanical_x10.png`
- `triton_v3_v4_mechanical_x10.png`
- `triton_v3_v4_face_grayscale_mechanical_x10.png`
- `triton_v3_v4_rgba_difference_x10.png`

Only actual PNG pixels are mechanically composed.

## Decision boundary

After Technical PASS, the user still decides:

**Triton Front v4 — PASS / REVISE / FAIL**

No directional or animation propagation before PASS.
