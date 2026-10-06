# Karen / Triton Face Differentiation Repair Gate

## Status

**Branch:** `pixel-karen-triton-face-differentiation-fix`  
**Draft PR:** #22 `Repair Karen Triton visual differentiation gate`  
**Production main:** untouched  
**Sophie / Margaret:** paused  
**Technical status:** **PASS**  
**Visual status:** **TRITON FRONT REPAIR V2 READY FOR USER VISUAL GATE — NOT APPROVED**

## Source of Truth

Karen control source:

`docs/pixel/reference/karen_chibi_direction_v1.png`

Karen committed runtime PNGs remain the visual regression control.

Triton current four-direction source:

`docs/pixel/reference/triton_idle_4dir_v1.png`

Triton front repair candidate:

`docs/pixel/reference/triton_idle_front_repair_candidate_v2_48.png`

Candidate Git blob:

`436599e39171595a258f0b6ec7249f1b645cb7d7`

The repair candidate is **not** the locked Triton source yet.

## Karen Visual Regression Control

Karen is pinned and may not change as part of Triton repair.

Start-of-repair and current Git blob IDs are identical:

| Asset | Locked Git blob |
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

CI checks these exact blobs both before and after the full prototype regression.

A Triton change that modifies any Karen control PNG fails automatically.

## Latest CI

Workflow run:

**37417702972 — SUCCESS**

Tested head:

`789bec76e53b2321e53da0a19d38845f6a21da3b`

Artifact:

- id: **11391474329**
- name: `karen-pixel-prototype-evidence`
- digest: `sha256:34e87f42657edff92c7a9acde0cfcd3c59c680372418837384524a2182fed4ec`

Verified:

- Karen regression control before work: PASS
- deterministic source-faithful Evidence generation: PASS
- full prototype regression: PASS
- Karen regression control after work: PASS
- artifact upload: PASS

This is a **Technical PASS only**.

## Evidence rules

Comparison evidence is assembled from committed repository PNGs.

Allowed:

- crop
- nearest-neighbor enlargement
- grayscale
- alpha silhouette
- fixed face-region crop
- alpha / RGBA difference

Not used:

- AI redraw
- beautification
- interpolation
- color redesign
- generated comparison poses
- generated replacement Karen

The repair candidate itself is a committed 48×48 Triton-only asset and is compared against the locked Karen control.

## Evidence generated

Current-source evidence:

- `karen_triton_source_front_x10.png`
- `karen_triton_source_front_grayscale_x10.png`
- `karen_triton_source_front_silhouette_x10.png`
- `karen_triton_source_face_region_x10.png`
- `karen_triton_source_face_region_grayscale_x10.png`
- `karen_triton_source_atlas_x6.png`
- `karen_triton_source_alpha_difference_x10.png`
- `karen_triton_source_rgba_difference_x10.png`

Repair-v2 evidence:

- `karen_triton_repair_front_x10.png`
- `karen_triton_repair_grayscale_x10.png`
- `karen_triton_repair_silhouette_x10.png`
- `karen_triton_repair_face_region_x10.png`
- `karen_triton_repair_face_region_grayscale_x10.png`
- `triton_current_vs_repair_v2_x10.png`
- `triton_current_vs_repair_face_grayscale_x10.png`
- `triton_current_vs_repair_rgba_difference_x10.png`

## Metrics

- Karen front alpha bbox: `[11,0,37,44]`
- current Triton front alpha bbox: `[12,2,36,45]`
- repair-v2 Triton front alpha bbox: `[12,2,36,45]`
- current front alpha IoU vs Karen: `0.675978`
- repair-v2 front alpha IoU vs Karen: `0.675978`
- current face alpha IoU vs Karen: `0.726937`
- repair-v2 face alpha IoU vs Karen: `0.726937`
- candidate exactly equals Karen: false
- candidate exactly equals current Triton: false

These metrics prove deterministic file difference only.

They do **not** approve character design.

## Visual review — repair v2

The repair-v2 front candidate improves the specific facial identity problem without changing Karen.

### Clear improvement

Compared with current Triton:

- the visible eye reads narrower;
- the brow/upper-eye line is straighter and calmer;
- the mouth is visibly broader;
- the face reads more vertically than Karen's open round face;
- the expression is less like Karen's large reactive-eye template.

The existing GROUND ANCHOR body read is preserved:

- wider shoulder/body mass than Karen;
- planted separated feet;
- low horizontal faded-blue waist mass;
- heavy unbound dark shoulder-length hair;
- no Karen-style partial tie;
- no red short-upper color structure.

### What remains a human judgment

At 48px, the remaining question is not whether the files differ.

The user must decide whether repair v2 is attractive and distinctive enough to count as **Triton herself** while still belonging to the same game.

In particular:

- are the narrow eyes strong enough without becoming a cold "cool swordswoman" stereotype?
- does the broad mouth preserve the possibility of Triton's hearty approachable laugh?
- does the face feel longer/sharper than Karen without becoming masculine caricature?
- does the overall result read as reliable / grounded / strong / unexpectedly approachable?

## Current decision

# **TECHNICAL PASS / VISUAL USER GATE**

No more Triton directional or animation production is authorized before user judgment.

Required user choice:

- **PASS** — accept Triton repair-v2 front identity.
- **REVISE** — direction is correct but needs another front-only edit.
- **FAIL** — front design still collapses into the wrong identity/template.

## After user PASS only

1. propagate the accepted Triton identity to left / right / back;
2. regenerate the existing eight Triton animation categories;
3. preserve Triton's lower-bounce / heavy-hair / planted motion personality;
4. confirm all Karen Git blobs remain byte-identical;
5. rebuild Front / Grayscale / Silhouette / Face / Four-direction Evidence;
6. run full technical regression;
7. perform matched gameplay / 44px scale confirmation;
8. update Pixel Character Standard;
9. only then resume Sophie.

Until user PASS:

- do not replace `triton_idle_4dir_v1.png`;
- do not regenerate Triton runtime sheets;
- do not resume Sophie;
- do not begin Margaret;
- do not merge into main;
- do not formally adopt Pixel-native.
