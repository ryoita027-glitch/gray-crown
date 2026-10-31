# Field worker V3b — 44px face/material study (2026-10-31)

**ART HOLD / DO NOT MERGE.** This is a real four-direction 48px PNG pilot, not accepted game art. The player-facing game still uses the original NPC unless earlier opt-in studies are enabled.

## Provenance and isolation
- Exact parent: Draft PR #114 HEAD `e383de3fba920b70fd685e0ec1bd814000ecd614`; source V2 Git blob `a39fd00215fb227c4031d3fbf53f2ebe182ca2c9`.
- V5 reference: `assets/npc/featured_residents_charm_v5.png`, blob `b169b58a846e1812dc42f566ca1843a6088e901f`.
- [V3b candidate](../../assets/npc/studies/field_worker_v3b_face_material_HOLD_48x192.png) and [native 44px four-direction board](evidence/field_worker_v2_v3b_farmer_mayor_native44_HOLD.png).
- Rebuild with `python tools/art/field_worker_v3b_face_material_pilot.py` (free Pillow); source and V5 blob checks stop generation if inputs change.
- The board columns are V2 original / V3b / V5 farmer / V5 mayor; rows front / left / right / back; same 44px nearest-neighbor source sampling and flat neutral background.

## Actual pixel work
- Hand-selected details in straw-hat material planes, cheek/eye shading, collar, olive work vest, belt and boot wear. Existing worker's face identity, work tool, silhouette, four directions, and footline are retained. **No copy/paste from V5 characters.**
- Per-direction changed RGBA pixels: **53, 20, 19, 27**; alpha-mask differences **0**.
- PNG RGBA decode/encode roundtrip checked pixel-for-pixel in the isolated JavaScript test environment. This is not the full project test suite.

## Visual decision
- At native 44px the hat band and vest/face separation are slightly more legible than V2; enlarged comparison shows the new material accents clearly.
- However the original boxy shoulder/body shape and rigid tool pose remain. V5 farmer and mayor still have substantially stronger head/shoulder silhouette and garment depth. The change is small at actual game scale and does **not** establish commercial visual superiority. **ART HOLD, not a production replacement.**
- No walking/working animation frames beyond the four standing directions are claimed. No game screenshot, Chromium A/B, full Node suite, or all-hero cohesion test was run.

## Next
Rework the worker's head/shoulder/upper-arm and tool silhouette as a coherent 48px form, not more tiny palette patches. Compare the revised art in Ryune beside V5 farmer/mayor and all four heroes at 44px; reject it if the full game view reads worse. Only after character-wide acceptance proceed to buildings. No changes to main, frozen PR #98, Save v23, story, balance or approved art. No paid services or Actions minutes.
