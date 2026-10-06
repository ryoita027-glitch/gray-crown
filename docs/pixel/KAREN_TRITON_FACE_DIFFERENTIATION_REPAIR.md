# Karen / Triton Face Differentiation Repair Gate

## Status

**Branch:** `pixel-karen-triton-face-differentiation-fix`  
**Draft PR:** #22 `Repair Karen Triton visual differentiation gate`  
**Production main:** untouched  
**Sophie / Margaret:** paused  
**Technical status:** **PASS**  
**Visual status:** **TRITON FRONT REPAIR V3 READY FOR USER VISUAL GATE — NOT APPROVED**

## Source of Truth

Karen control source:

`docs/pixel/reference/karen_chibi_direction_v1.png`

Karen committed runtime PNGs remain the permanent Visual Regression Control.

Triton current four-direction source:

`docs/pixel/reference/triton_idle_4dir_v1.png`

Triton v2 front repair candidate:

`docs/pixel/reference/triton_idle_front_repair_candidate_v2_48.png`

Triton v3 front repair candidate:

`docs/pixel/reference/triton_idle_front_repair_candidate_v3_48.png`

v3 Git blob:

`ab99446bcfc4fe2d7c21e86894e725c07b122491`

v3 is a candidate only. It does not replace the current four-direction Triton source until explicit user Visual PASS.

## Karen protection

Karen was checked before and after this work.

Locked Git blobs remain:

| Asset | Git blob |
|---|---|
| source atlas | `d5aaf6029efaf246e9dc5afd75e1faa043870dbc` |
| idle | `782785fd504a4baba92be4ff099a827dd1ecac81` |
| walk | `2d1085e3e07aaa2550dccf2d33fe961ea6f2d3de` |
| turn | `5dca0ed451a45bc019d6654a8c3becfa22f9a4f1` |
| talk | `2e1fa043a623fe2e184998f8789790e891c411d7` |
| surprise | `776ec4c88acc0eff208050b440670f16cc3fb95b` |
| approach | `c089bad76a00c13b8866263f2649c4a5b0a0b959` |
| laugh | `cc2846879fe90b696f958a1708906f1d9d8b8787` |
| run | `d08632ecb9ceda11d900b8a0263790c92ebfef58` |

No Karen source/runtime PNG changed.

## v3 repair scope

The user requested a face-only revision from v2.

v3 therefore preserves v2:

- body
- stance
- shoulder width
- low center of gravity
- outer hair silhouette
- off-white / gray clothing mass
- faded-blue horizontal waist mass
- 48×48 source architecture

Edited areas:

- eyes
- brows
- mouth
- internal face shape
- immediate face-framing hair/skin pixels

Pixel-perfect CI result:

- v2 raw RGBA SHA-256: `e93344d80f9f7bdd2b07fa7ba70c9ac1a7e94b5aa0dcc4c8549ad5d79e6032ba`
- v3 raw RGBA SHA-256: `12c5ddf390b8f13512b64600720b7faf0db870150dd039fa209ad015284a768d`
- changed pixels: **29**
- allowed face patch: `[19,8,30,18]`
- actual changed bbox: `[20,9,29,15]`
- changed pixels outside face patch: **0**
- alpha changes: **0**
- body outside face patch: **pixel-perfect**
- outer alpha silhouette: **pixel-perfect**

This is the intended face-only repair.

## Comparison-board rule

Image-generation models are prohibited for Karen/Triton comparison boards.

The previous AI-generated v3 comparison board is **DISCARDED / NON-AUTHORITATIVE**.

All current v3 evidence is mechanically composed from actual PNGs with:

- direct PNG load
- crop
- nearest-neighbor enlargement
- grayscale
- alpha silhouette
- raw pixel difference
- deterministic labels outside sprite pixels

No AI redraw or interpolation is used.

## Mechanical Evidence

Generated from repository PNGs:

- `karen_triton_v3_front_mechanical_x10.png`
- `karen_triton_v3_grayscale_mechanical_x10.png`
- `karen_triton_v3_silhouette_mechanical_x10.png`
- `karen_triton_v3_face_mechanical_x10.png`
- `karen_triton_v3_face_grayscale_mechanical_x10.png`
- `triton_v2_v3_mechanical_x10.png`
- `triton_v2_v3_face_grayscale_mechanical_x10.png`
- `triton_v2_v3_rgba_difference_x10.png`
- `karen_triton_source_atlas_mechanical_x6.png`

## Latest technical CI

Workflow:

**Karen Pixel Prototype CI — run 37421248534**

Latest head tested:

`03eedebfb1976903ea4aae388ab676e77bffd067`

Final result after same-head failed-job rerun:

# **SUCCESS**

The first attempt failed in the pre-existing `browser_v21_gate.py` because a battle action button remained temporarily invisible until Playwright click timeout. No v3/Karen change was made. The failed job was rerun on the same head and passed.

Verified on final successful rerun:

- Karen visual regression control before work: PASS
- Triton v3 face-only pixel scope: PASS
- real-PNG mechanical evidence generation: PASS
- Node tests: **58 / 58 PASS**
- full prototype browser regression: PASS
- Karen visual regression control after work: PASS
- evidence upload: PASS
- Save schema remains 23

Latest rerun artifact:

- id: **11393042711**
- name: `karen-pixel-prototype-evidence`
- digest: `sha256:2cbff9ec8fce5566fa2d8aca48fd9d892367062fe9b03954a3b6ba499955a91f`

## v3 design target

v3 addresses the v2 weakness without reverting toward Karen's face template.

Target read:

- narrower than Karen, but readable eyes with visible iris/sclera information;
- straight, grounded brows;
- wider-than-Karen mouth, restrained in Idle;
- slightly longer / sharper face;
- more open face center despite heavy dark hair;
- reliable / strong / grounded / unexpectedly approachable;
- not a cold silent swordswoman;
- not a black-haired Karen.

## Decision boundary

Technical evidence cannot approve attractiveness.

Current state:

# **TECHNICAL PASS / USER VISUAL GATE**

Only the user may choose:

- **PASS** — v3 is the accepted Triton front identity.
- **REVISE** — v3 direction is closer but face still needs front-only work.
- **FAIL** — v3 does not meet Triton's protagonist-level identity.

## After user PASS only

1. propagate the approved v3 face language to left / right / back;
2. mechanically compare the completed four-direction atlas against locked Karen;
3. regenerate Triton's existing eight animation categories;
4. preserve lower bounce / stable axis / heavy-hair-tip motion / grounded laugh and run;
5. verify Karen 9 blobs remain unchanged;
6. rebuild Front / Grayscale / Silhouette / Face / Four-direction Evidence;
7. re-run gameplay matched comparison and 48 / 44 / 41 scale check;
8. run full CI;
9. update Pixel Character Standard;
10. only then resume Sophie.

Until PASS, do not start those steps.
