# Karen / Triton Face Differentiation Repair Gate

## Status

**Branch:** `pixel-karen-triton-face-differentiation-fix`  
**Draft PR:** #22 `Repair Karen Triton visual differentiation gate`  
**Production main:** untouched  
**Sophie / Margaret:** paused  
**Technical status:** **PASS**  
**Visual status:** **TRITON FRONT V4 — USER VISUAL GATE**

## What is already stable

- production baseline remains main / v23 / Save schema 23 / Story 00–19;
- Karen VILLAGE RUNNER is approved and frozen;
- all nine Karen visual blobs are hash-pinned;
- 48×48 source architecture works;
- approximately 44px Medium rendering works;
- Triton GROUND ANCHOR body, stance, color mass and animation architecture work;
- locked-character comparisons use real PNGs only;
- AI-generated comparison boards are banned;
- Technical PASS and Visual PASS are separate.

## Why v4 exists

v3 improved Karen/Triton differentiation but still lost to Karen in facial readability and protagonist-level charm.

The v4 target is therefore:

- keep Triton's body / shoulder width / low center of gravity;
- keep heavy dark shoulder-length hair silhouette;
- keep off-white/gray + faded-blue horizontal waist mass;
- improve only the front-face read;
- narrow but readable eyes;
- straight grounded brows;
- compact natural Idle mouth;
- slightly longer / sharper facial read than Karen;
- reliable / strong / grounded / approachable, not cold.

Exact eye color remains unresolved canon.

## v4 source method

The v4 candidate is generated deterministically from committed v3 by:

`tools/generate_triton_front_v4_candidate.py`

Output:

`prototype_artifacts/triton_idle_front_repair_candidate_v4_48.png`

This avoids binary transport drift and makes every changed pixel reviewable.

The generation recipe contains exactly **76 changed pixels**.

Expected v4 raw RGBA SHA-256:

`ed42a5fcada5e77989e452d2870faf80ebc851515c6ae7bfb87f4fbaeadbc0a8`

## Pixel-perfect scope

Allowed repair patch:

`[18,8,31,18]`

CI verifies:

- exactly 76 changed pixels;
- no change outside the face patch;
- zero alpha changes;
- body / stance / clothing remain pixel-identical to v3;
- outer silhouette remains pixel-identical;
- Karen remains hash-identical before and after the full regression.

## Mechanical Evidence

Generated only from real committed PNGs plus the deterministic v4 output:

- `karen_triton_v4_front_mechanical_x10.png`
- `karen_triton_v4_grayscale_mechanical_x10.png`
- `karen_triton_v4_silhouette_mechanical_x10.png`
- `karen_triton_v4_face_mechanical_x10.png`
- `karen_triton_v4_face_grayscale_mechanical_x10.png`
- `triton_v3_v4_mechanical_x10.png`
- `triton_v3_v4_face_grayscale_mechanical_x10.png`
- `triton_v3_v4_rgba_difference_x10.png`

No image-generation model is used for these comparison boards.

## Latest CI

Workflow:

**Karen Pixel Prototype CI — run 37429109104**

Tested head:

`ccc93fdbebc9f052c039ed0f4200a0d6b51c31ce`

Result:

# **SUCCESS**

Verified:

- Karen Visual Regression Control before work: PASS;
- deterministic Triton v4 generation: PASS;
- Triton v4 face-only pixel scope: PASS;
- real-PNG mechanical evidence: PASS;
- full prototype regression: PASS;
- Karen Visual Regression Control after work: PASS;
- Save schema remains 23.

Evidence artifact:

- id: **11395929455**
- name: `karen-pixel-prototype-evidence`
- digest: `sha256:830ed71a23d32bce01274aa4cab5872116964f9860cee9201ffaf9a991714087`

## Current conclusion

# **TECHNICAL PASS / VISUAL USER GATE**

The system is no longer the blocker.

The next required decision is only:

> **Triton Front v4 — PASS / REVISE / FAIL**

CI cannot decide attractiveness or protagonist-level appeal.

## After user PASS only

1. translate the accepted v4 face language to left / right / back;
2. build the four-direction Triton source atlas;
3. mechanically compare all four directions against locked Karen;
4. regenerate Triton's eight animation categories;
5. preserve lower bounce / stable axis / heavy-hair-tip motion / grounded Laugh and Run;
6. verify Karen hashes again;
7. run matched gameplay comparison;
8. re-check Full 48 / Medium 44 / Compact 41;
9. run full CI;
10. update Pixel Character Standard;
11. resume Sophie.

Until PASS, do not begin those steps.
