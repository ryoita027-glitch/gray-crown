# Margaret V3 hair-mass native-44px comparison — 2026-11-01
**ART HOLD. DO NOT MERGE.**
Base PR #221 HEAD `e842f24c157d1a3a73caf0cbfc3a2741f6966d47`; source Margaret PNG blob `910458eabfcfaef7442f885f319d0e2a09c88a66`, V5 NPC blob `b169b58a846e1812dc42f566ca1843a6088e901f`.

## Change
Actual 192×192 PNG trial, 4 directions × 4 idle frames. Hand-authored direction-dependent lower hair contours and toned-down pale hair flecks from y27 downward. Unlike V2, no violet border was added. 876 RGBA pixels changed (238 alpha removals; 638 recolors), direction counts 228 / 202 / 215 / 231. Face, clothing, clasp, footline y42–47, and source/runtime PNG are untouched.

## A/B
44px native comparison board: original / V3 / V5 farmer / V5 mayor / V5 messenger, front / left / right / back on identical checkerboard. It is a **static PNG board, not a real game screenshot**.

**Visual judgment: HOLD.** Lower hair is quieter and less bright; however the silhouette may lose layered volume and neck/shoulder mismatch remains. No formal adoption or commercial-quality claim. Need actual Ryune game scene at 44px, animation across idle/walk/talk/turn, and a qualitative comparison with the V5 NPCs.

## Evidence / verification
- `docs/art/evidence/margaret_idle_hair_mass_v3_HOLD.png`
- `docs/art/evidence/margaret_idle_hair_mass_v3_native44_AB_NPC.png`
- `tools/art/margaret_idle_hair_mass_v3.py` regenerates and checks both PNGs via `--check`.
- Original source SHA and PNG dimensions checked; original y42–47 untouched by edit loop.
- Full checkout Python --check, Chromium field screenshots and npm suite **not run** in this isolated connector session. No Actions or paid APIs invoked.

Next: run `python tools/art/margaret_idle_hair_mass_v3.py --check`, inspect the 44px live village scene and animated directions. Reject if hair shape or expression suffers. Fix neck/shoulder manually before propagating to other actions; do not move to buildings yet.
