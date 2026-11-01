# Margaret identity-safe hair material A/B — 2026-11-01 20:18 JST

**ART HOLD. Do not merge, replace game sprites, or call this a verified visual improvement.**

## Baseline and scope
- Based on exact #246 head `17df481077f445008887d0a3aac7eb993c675c04`, itself stacked on #244. #98 and main untouched.
- Actual approved idle source blob `910458eabfcfaef7442f885f319d0e2a09c88a66`; V5 resident baseline `b169b58a846e1812dc42f566ca1843a6088e901f`.
- #246 front structural redraw is a **visual NO-GO**: its pale rounded helmet, missing readable bangs/eyes, and flattened face are a clear loss of Margaret's approved character identity at native 44px. The previous HOLD assessment was too permissive.
- New comparison columns: **original / identity-safe neutral hair / #246 rejected front / V5 mayor / V5 royal messenger**. Rows are front, side, side, back, footline normalized. It is an isolated static A/B, **not a game screenshot**.

## Actual pixel work
- 192x192 RGBA experimental idle atlas (4 directions x 4 frames). Hair material colors only in local region x=9..39,y=7..25. Five palette entries shifted toward neutral silver, away from lavender cast.
- **3572 changed RGBA pixels; zero alpha changes; zero skin base-color changes; zero changes to feet or pixels outside y=7..25.**
- Original face, bangs, silhouette, pose, clothes, long hair and feet preserved. No live asset overwritten.
- Reproducible source-blob-locked generator: `node tools/art/margaret_identity_safe_hair_study.js`. Generated PNG and native44 A/B committed as isolated evidence.

## Visual verdict
- The neutral-silver material is subtly less lavender but the **44px change is small**; head/neck/shoulder construction, NPC stylistic mismatch, and the lack of live Ryune context remain unresolved. **HOLD** candidate.
- #246 remains **NO-GO**; never copy its reconstructed front face to other directions.
- This comparison establishes that reducing purple alone is insufficient; next work should preserve original face/hair identity while reconstructing shoulder contact in the actual scene, and verify 44px and 40px live A/B.
- The comparison's mayor/messenger sprites are reference baselines, not designs to clone.

## Validation and limitations
- PNG decode/encode roundtrip and pixel protection checks executed with a pure JS codec in the isolated asset generation run.
- Generator included for reproducibility; **native Node CLI execution in a full checkout, Chromium real-game capture, whole-game suite, and art approval not performed** (GitHub clone DNS inaccessible in this runtime).
- No paid API, Actions run, production image change, building art change, story, balance, or save schema change.
