# Sophie V7/V8 — original-source structural frame-zero studies (2026-10-31 JST)

**ART NO-GO / DO NOT MERGE.** This run tested two distinct shape interventions against the original Sophie and the real V5 Mayor / Royal Messenger reference. Neither is approved production art. The original production sprite is better than V8 and is retained.

## Source and isolation
- Parent: Draft PR #178 HEAD `42d8b084374f224cff40fcc4bb3f4be475a8cfdd`. This is a separate stacked art branch; `main` and frozen PR #98 are not touched.
- Sophie production 4-direction × 6-frame walk: `assets/characters/sophie/sophie_walk.png`, blob `47065a719b16b3da0c3f0f2457d69ccfcf8a8a04`, 288×192.
- V5 NPC reference: `assets/npc/featured_residents_charm_v5.png`, blob `b169b58a846e1812dc42f566ca1843a6088e901f`, 432×192.
- Both experiments intentionally cover **only frame zero in each of four directions** (192×48), to reject weak art before creating 24 walking frames or eight actions.

## Actual outputs
- [V7 neck/shoulder pilot PNG](../../assets/characters/sophie/studies/sophie_v7_structure_frame0_4dir_NO_GO.png)
- [V7 original vs pilot, native 44px, with V5 Mayor and Messenger](evidence/sophie_v7_structure_native44_AB_NO_GO.png)
- [V8 broad hair/head silhouette pilot PNG](../../assets/characters/sophie/studies/sophie_v8_structure_frame0_4dir_NO_GO.png)
- [V8 original vs pilot, native 44px, with V5 Mayor and Messenger](evidence/sophie_v8_structure_native44_AB_NO_GO.png)

Both contact boards: columns = Sophie down/left/right/up, Mayor V5, Messenger V5; first row = original Sophie, second row = trial; reference NPCs unchanged in both rows. All 48px frames were sampled at `floor(x*48/44),floor(y*48/44)` onto 44×44 cells against identical opaque RGB (94,105,89) field matte. The boards are **source-derived static previews, not Chromium screenshots**.

## Experiments and visual decisions
**V7:** Small lower-hair edge taper, new dark neck/collar seam and warm robe collar accents. Pixels altered by direction [56,31,30,28], including alpha changes [28,16,16,17]. Source rows 0–24 (face/head) and 37–47 (shoes/footline) unchanged. The source face and distinctive orange hair survive, but at 44px the neck still reads as compressed and the hand-painted seam creates a questionable small patch. The V5 head/shoulder construction gap remains. **NO-GO; do not promote to full animation.**

**V8:** A more aggressive geometric experiment: taper head/hair outer boundaries from source y8–32 without painting over the central face. Pixels altered [168,123,120,154], including alpha changes [123,89,87,110]. At 44px the hair becomes visibly jagged, with cut strands and discontinuous outline. It is **clearly worse than the original** and must be rejected. The experiment proves that mechanically eroding the silhouette is not an acceptable shortcut to mature proportions.

These are separate source-derived studies, not a V7→V8 production progression. Neither modifies the approved 288×192 walk PNG, any other action PNG, runtime, world tiles, story, Save v23 or battle.

## Verification and limits
- The actual GitHub original PNG bytes were decoded and their real 48px frame pixels edited; V5 indexed-palette PNG was separately decoded and used in the same native-44px boards.
- Both new PNGs and contact boards were rendered for visual inspection, and their binary Git blobs were uploaded. Pixel-difference counts are **diagnostics, not quality scores**.
- **Not run:** local complete repository tests, Chromium Ryune village scene, actual game Canvas screenshot, 24-frame motion, eight-action coherence, human acceptance, 3-route play. No GitHub Actions or paid API was invoked.
- Formal player-facing visual improvement: **none**. No release or art acceptance claim.

## Next art gate
Do **not** repeat blanket edge trimming, color smoothing, or automatic silhouette erosion. Return to the original Sophie, make a genuinely hand-composed collar/neck/upper-arm/overlapping-hair redraw at the original 48px in a pixel editor, preserving the appealing face and fine garment detail. Compare its actual 44px village scene beside V5 Mayor/Messenger. Only after clear visible superiority expand to four directions, six walk frames, eight actions. Continue characters before buildings.
