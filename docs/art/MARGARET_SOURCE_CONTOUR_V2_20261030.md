# Margaret original-contour V2 pixel study — 2026-10-30

**Status: ART HOLD. Do not promote to runtime.**

## Exact source / isolation

- Parent: PR #138 head 6293a85a7d40eae8588c635fb5bfb7a1f297ce6a.
- Original: assets/characters/margaret/margaret_walk.png, blob 1923f1315c377418cea0f2f94ab6431c987f2dd7.
- Prior V1 study: assets/characters/margaret/studies/margaret_original_face_planes_v1_walk.png, blob 7766e044b90662a4e208296cb703b65fd82649cb.
- New candidate: assets/characters/margaret/studies/margaret_original_contour_v2_walk.png (288×192 RGBA; 48×48 cells, four directions × six frames).
- Same-background native 44px A/B: docs/art/evidence/margaret_original_v1_contour_v2_44px_ab_20261030.png — columns original / V1 / V2; rows front / left / right / back. This is **not** a Chromium game screenshot.
- Rebuild: python tools/art/generate_margaret_source_contour_v2.py (Pillow required).

## Actual visual changes and review

V1 replaced large face rectangles with warm skin colors, causing a pasted-on doll-face effect. V2 **starts from the original PNG** rather than overpainting V1. It limits warm skin to a narrower opaque face area, retains the source jaw/silhouette and clothing, neutralizes selected high-value violet hair highlights into three silver tones, and retains the dark source contours. Side faces receive direction-aware eye/cheek/neck patches. Alpha silhouette is unchanged.

At 44px, V2 is **closer to the original's coherent silhouette** than V1; V1's face looks enlarged and detached. But V2 is also subtle: the original face remains difficult to read, side-eye/neck placement is not convincingly adult or natural, and the hair retains excessive internal noise. Aesthetic improvement over the original is **not demonstrated**. Neither V1 nor V2 is approved.

## Validation and limits

- Generated real PNG artwork and a 44px A/B PNG using original GitHub binary. Four directions and 24 walk cells retained.
- Alpha channel preserved by construction; no runtime PNG is replaced.
- **Not performed:** real village Chromium capture, eight actions, walk-cycle flicker review, full regression, human approval.
- V5 mayor / messenger separately shown in docs/art/evidence/margaret_source_face_planes_v1_44px_ab_20261030.png; this V2 comparison does not replace that reference.
- main, frozen PR #98, production assets, story, Save v23, buildings and maps untouched. No paid tools or Actions minutes.

## Next art gate

Review original/V1/V2 at 1× next to V5 anchors and the other three protagonists in a real field screenshot. Prefer per-pose manual face/neck silhouette drawing to further recolor passes. Reject if adult expression or outfit readability regresses. Buildings remain out of scope.
