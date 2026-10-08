# Margaret V4 — 44px Occupancy Correction Gate

Status: **REVISION REQUIRED / NOT APPROVED FOR MAIN**

## Authority
- Source of Truth: committed 192x48 four-direction RGBA reference and generated runtime PNGs on this prototype branch.
- Existing Karen, Triton and Sophie runtime PNGs are immutable visual controls.
- Recent generated concept images (turnaround, staged lineup, and animation planning sheet) are **visual references only**, NOT pixel-accurate committed runtime evidence. Never use a generated four-character comparison board as proof of relative scale.
- User-requested corrections: (1) match apparent occupancy at 44px, (2) larger chibi head, (3) thicker torso, (4) stronger silhouette/outline, (5) high ponytail visible from all four directions.
- Do not canonize eye color, fourth-character palette, final costume, emblems or weapons.

## Mandatory source-first sequence
1. Revise the actual 192x48 four-direction source (down/left/right/up) on a new candidate, retaining the original separately for rollback. **Do not** update the lock hash to match an unreviewed candidate.
2. Compute per-direction alpha bounding boxes, pixel occupancy, head-to-body ratio and foot-anchor alignment; compare with exact committed Karen/Triton/Sophie first-frame controls.
3. Compose the four-character Medium44 board mechanically from exact PNG pixels, nearest-neighbor only. The user must see this board rather than a generative illustration.
4. Check ponytail legibility in down/left/right/up and verify that the white hair has adequate edge contrast on the game background.
5. Only if the corrected four-direction source passes the visual gate, regenerate all eight runtime animation sheets using `tools/generate_margaret_prototype_assets.py`, then update committed PNGs and verify `animations.js`.
6. Run Margaret browser E2E, full `npm run check`, and Karen/Triton/Sophie regression checks.
7. Keep PR #29 in Draft; do not merge to main without user approval.

## Current limitation
The last generated concept sheets are higher-resolution illustrations and are not directly compatible with the 48x48 four-direction sprite grid. Treating them as completed runtime assets would be misleading. The existing v3 direction source and eight runtime sheets remain the actual prototype until a new candidate is committed and validated.

## Acceptance evidence
- New exact 192x48 source PNG and measured 4-direction occupancy table.
- Mechanical Medium44 comparison PNG using committed controls.
- Eight actual regenerated runtime PNGs with verified dimensions and frame counts.
- Green browser E2E and full regression CI.
- Explicit user review of the real comparison before main adoption.
