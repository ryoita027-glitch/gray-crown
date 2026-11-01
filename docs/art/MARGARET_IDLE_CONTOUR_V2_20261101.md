# Margaret idle contour V2 — 44px and V5 NPC A/B (2026-11-01)

**ART HOLD. NOT production-ready.** Separate stacked branch from PR #218 HEAD `dd2872bbac3ae417508d2e07fca7151180d31877`; no modification to main, frozen PR #98, other PR heads, approved character sprites, gameplay, Save v23, or buildings.

## Actual pixel-art work
- Input: `assets/characters/margaret/margaret_idle.png` Git blob `910458eabfcfaef7442f885f319d0e2a09c88a66` (192×192, 48×48 cells, four directions × four idle frames).
- V5 comparison: `assets/npc/featured_residents_charm_v5.png` blob `b169b58a846e1812dc42f566ca1843a6088e901f`. Runtime `featuredNames` mapping confirms farmer col 1, mayor col 3, messenger col 4.
- **Candidate sprite**: `docs/art/evidence/margaret_idle_contour_v2_HOLD_48x192.png`.
- **44px native A/B board**: `docs/art/evidence/margaret_idle_contour_v2_native44_AB_NPC.png`, columns **original / V2 / V5 farmer / V5 mayor / V5 messenger**, rows front / left / right / back; first idle frame only, identical checker and pixel scaling. `margaret_idle_contour_v2_4x_review.png` is nearest-neighbor enlarged for pixel inspection.
- `tools/art/margaret_idle_contour_v2.py` regenerates and verifies all three PNGs using Pillow: `python tools/art/margaret_idle_contour_v2.py --check`.

## Visual changes and assessment
Compared with the previous V1 uniform horizontal remap, V2 uses direction-specific row boundaries to trim hair-only outer curls; it retains skin, clothing, crest, and shoe rows. Hair-facing transparent boundaries receive a single mid-dark violet edge plane, and isolated near-white hair highlights are subdued. **No global palette quantization, no skin/outfit recolor.** The sprite still reads as Margaret, with the same hair clasp and long asymmetrical side mass.

**44px visual decision: HOLD, not accepted.** The darker contour makes some pale strands more distinct against the ground, but the hair is still visually much busier and lighter than the mayor/messenger V5 silhouettes; some edges look too violet and stiff. Head/neck connection and perceived scale remain unresolved. Do not claim commercial improvement. A static checker board is not an actual Ryune village screenshot.

## Executed checks
- Source and V5 blobs verified by exact Git SHA before editing.
- Candidate PNG, native44 board and 4× board encoded and re-decoded with **zero RGBA mismatch** in the isolated image generation run.
- **1,950 changed RGBA pixels** across 16 cells; direction totals **461 / 461 / 586 / 442**; **208 alpha-mask changes**. All original y42–47 footline pixels preserved. Only known hair-palette pixels can be removed; skin and garment alpha preserved.
- Reproducible Python source committed; **full-checkout Python --check, full Node suite, real Chromium field capture and animated idle/walk/talk consistency NOT executed**. No visual approval.

## Next
1. Run Python `--check` on a complete checkout and inspect all four idle frames at 44px on a live Ryune village scene with Karen/Triton/Sophie and V5 mayor/messenger.
2. If the violet rim is too harsh, **reject V2** and redesign the hair masses and neck/shoulder junction manually rather than adding more mechanical color filters.
3. Only after real-game A/B superiority, propagate the same design language through walk, talk, turn and other poses. Do not alter buildings until characters are consistently approved.
