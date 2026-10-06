# Karen / Triton Face Differentiation Repair Gate

## Status

**Branch:** `pixel-karen-triton-face-differentiation-fix`  
**Draft PR:** #22 `Repair Karen Triton visual differentiation gate`  
**Production main:** untouched  
**Sophie / Margaret:** paused  
**Technical status:** PASS  
**Visual status:** **REVISE — FRONT FACE REPAIR REQUIRED**

## Source of Truth

Karen control source:

`docs/pixel/reference/karen_chibi_direction_v1.png`

Triton current source:

`docs/pixel/reference/triton_idle_4dir_v1.png`

Generated presentation boards that redraw locked characters are non-authoritative and must not be used for identity approval.

## Karen Visual Regression Control

Karen is pinned and may not change as part of Triton repair.

Start-of-repair Git blob IDs:

| Asset | Git blob |
|---|---|
| Karen source atlas | `d5aaf6029efaf246e9dc5afd75e1faa043870dbc` |
| idle | `782785fd504a4baba92be4ff099a827dd1ecac81` |
| walk | `2d1085e3e07aaa2550dccf2d33fe961ea6f2d3de` |
| turn | `5dca0ed451a45bc019d6654a8c3becfa22f9a4f1` |
| talk | `2e1fa043a623fe2e184998f8789790e891c411d7` |
| surprise | `776ec4c88acc0eff208050b440670f16cc3fb95b` |
| approach | `c089bad76a00c13b8866263f2649c4a5b0a0b959` |
| laugh | `cc2846879fe90b696f958a1708906f1d9d8b8787` |
| run | `d08632ecb9ceda11d900b8a0263790c92ebfef58` |

CI now checks these exact blobs both **before** and **after** the full prototype regression.

A Triton fix that changes any of them fails automatically.

## CI evidence

Workflow run:

**37416042278 — SUCCESS**

Tested head:

`454ce16a985d98ae76a6541c6f4f92372e79729e`

Artifact:

- id: **11392070085**
- digest: `sha256:7818a36d26ad4879855598c71b0407c512029e18029b24c7632d59f0f6ecac97`

Verified:

- Karen visual regression control before work: PASS
- source-faithful comparison evidence: PASS
- full prototype regression: PASS
- Karen visual regression control after work: PASS
- evidence upload: PASS

## Evidence generation rules

The comparison script reads only the committed Karen / Triton 192×48 source atlases.

Allowed transforms used:

- crop
- nearest-neighbor enlargement
- grayscale
- alpha silhouette
- fixed face-region crop
- alpha difference
- raw RGBA difference

No AI redraw, beautification, color reinterpretation, smoothing, or new pose generation is used.

Generated evidence includes:

- `karen_triton_source_front_x10.png`
- `karen_triton_source_front_grayscale_x10.png`
- `karen_triton_source_front_silhouette_x10.png`
- `karen_triton_source_face_region_x10.png`
- `karen_triton_source_face_region_grayscale_x10.png`
- `karen_triton_source_atlas_x6.png`
- `karen_triton_source_alpha_difference_x10.png`
- `karen_triton_source_rgba_difference_x10.png`
- `karen_triton_identity_metrics.json`

## Current source metrics

- Karen front alpha bbox: `[11,0,37,44]`
- Triton front alpha bbox: `[12,2,36,45]`
- front silhouette alpha IoU: `0.675978`
- face-region alpha IoU: `0.726937`
- exact front RGBA equal: false
- exact face-region RGBA equal: false

These metrics prove that the files are not identical.

They do **not** prove successful character design.

## Visual review of current committed source

### What already separates successfully

- Karen hair and Triton hair have clearly different mass / construction.
- Karen has more forward visual activity.
- Triton has a visibly broader / lower lower-body stance.
- Triton's faded-blue waist mass reads separately from Karen's short red upper-body mass.
- silhouette comparison remains distinguishable without color.

### What is still insufficient

The current Triton front face does not yet express the locked GROUND ANCHOR facial identity strongly enough at 48px.

Specifically:

- eyes are not clearly narrow / slit-like enough;
- straight-brow identity is weak;
- mouth is not visibly wider than Karen's;
- face / jaw does not read sufficiently longer and sharper;
- therefore the front face still risks reading as the same shared Chibi face technique with different hair.

## Current decision

# **TECHNICAL PASS / VISUAL REVISE**

Do not change Karen.

Revise **Triton front only** first.

Priority:

1. face length / jaw direction
2. narrow eye shape
3. straight brows
4. wider mouth
5. maintain broad shoulder read
6. maintain planted low center
7. preserve heavy shoulder-length hair
8. preserve off-white / gray + faded-blue low horizontal mass

Do not expand the repair to side / back or regenerate the eight animation sheets until the corrected front candidate receives user Visual PASS.

## Final user gate

The next human decision is:

> **Triton Front / Character Design Visual PASS**

Only the user can approve this.

After PASS:

1. propagate the accepted facial / body language to left / right / back;
2. regenerate Triton eight animations from the corrected source;
3. confirm Karen remains byte-identical;
4. rebuild source-faithful Evidence;
5. re-run full technical regression;
6. update Pixel Character Standard;
7. only then resume Sophie.
