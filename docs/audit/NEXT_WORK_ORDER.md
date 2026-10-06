# Gray Crown — Next Work Order

Production remains **main / v23 / Save schema 23 / Story 00–19**.
Pixel-native remains experimental and is not merged to main.

## Current priority

> **Triton Front Repair v3 — User Visual Gate**

Branch:

`pixel-karen-triton-face-differentiation-fix`

Draft PR:

**#22 — Repair Karen Triton visual differentiation gate**

## Karen — LOCKED

Karen is the permanent Visual Regression Control.

Do not change Karen to solve Triton/Sophie/Margaret problems.

The source atlas and all eight runtime PNG Git blobs are pinned and CI-verified before/after regression.

## Triton v3 candidate

Candidate:

`docs/pixel/reference/triton_idle_front_repair_candidate_v3_48.png`

Git blob:

`ab99446bcfc4fe2d7c21e86894e725c07b122491`

Status:

**front-only candidate / not official source / not propagated**

v3 changes only 29 face pixels relative to v2.

Pixel-perfect scope:

- actual diff bbox: `[20,9,29,15]`
- outside allowed face patch: 0 changed pixels
- alpha silhouette change: 0
- body / stance / costume / outer hair silhouette remain unchanged

## Comparison policy

Comparison-board image generation is **BANNED**.

Use only actual PNGs and deterministic mechanical composition.

Allowed:

- crop
- nearest-neighbor
- grayscale
- silhouette
- raw pixel difference
- labels outside sprite pixels

The earlier AI-generated v3 comparison board is discarded and cannot be cited as evidence.

## Latest technical gate

Workflow run:

**37421248534 — SUCCESS after same-head rerun**

Head:

`03eedebfb1976903ea4aae388ab676e77bffd067`

Artifact:

**11393042711 — karen-pixel-prototype-evidence**

Artifact digest:

`sha256:2cbff9ec8fce5566fa2d8aca48fd9d892367062fe9b03954a3b6ba499955a91f`

Verified:

- Karen unchanged
- Triton v3 face-only pixel scope
- real-PNG mechanical evidence
- Node 58 / 58
- full browser regression
- Karen unchanged after regression
- Save schema 23

Technical PASS does not equal Visual PASS.

## Mandatory stop

The next required decision is:

> **Triton Front v3 — PASS / REVISE / FAIL**

Do not propagate v3 to left/right/back until the user decides PASS.

## If PASS

Proceed autonomously:

front v3 accepted  
→ left / right / back translation  
→ four-direction mechanical Evidence  
→ eight-animation regeneration  
→ Karen hash verification  
→ animation personality verification  
→ matched gameplay comparison  
→ 48 / 44 / 41 scale confirmation  
→ full CI  
→ Standard update  
→ Sophie may resume

## If REVISE

Continue front only.

Do not touch Karen.

## Paused

- Sophie
- Margaret
- NPC migration
- main merge
- v24
- formal Pixel-native adoption
