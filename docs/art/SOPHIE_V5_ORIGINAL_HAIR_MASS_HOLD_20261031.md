# Sophie V5 — original-derived lower hair mass optical study (2026-10-31 JST)

**ART HOLD / NOT APPROVED.** This is an isolated study, not a production change or a claim of commercial-quality improvement.

## Source and scope
- Independent base: Draft #160 HEAD `8be76f570e1076d482c705c2498dc34fb839d9c9`. Deliberately **not** based on rejected Sophie V2/V3/V4.
- Exact original production sprite: `assets/characters/sophie/sophie_walk.png`, Git blob `47065a719b16b3da0c3f0f2457d69ccfcf8a8a04`.
- New **actual 288×192 RGBA PNG**, four directions × six walk frames: `assets/characters/sophie/studies/sophie_v5_original_hair_mass_hold_walk.png`.
- A/B PNG: [original top / study bottom at 44px source sampling](evidence/sophie_v5_original_hair_mass_native44_AB.png). Four directions, same frame (0), same background, same pixel scaling. The preview is enlarged 4× for inspection; **not** an actual game screenshot.
- Reproducible offline generator: `tools/art/sophie_v5_original_hair_mass_study.py` (Pillow, no API).
- Only lower outer hair regions (local y23–35, x8–17 and x31–40) are candidates for local color-plane cleanup. Source original's face/eyes (y0–22), central torso, lower legs/footline (y36–47) and alpha masks are unchanged. No face replacement, no outfit/identity changes.

## Actual checks and art assessment
- Original source PNG decoded from GitHub, RGBA 8-bit, 288×192; study PNG generated and uploaded as a new Git blob.
- **1,635 changed opaque pixel positions** across 24 frames, directions [456,325,326,528]. Alpha mask identical, face and footline untouched. These are technical invariants, **not** visual acceptance.
- At native 44px the lower hair has marginally calmer warm-brown groupings while the original face remains attractive. However the difference is subtle and may flatten hair texture. The head/shoulder ratio and the V5 Mayor/Envoy quality gap are **not proven resolved**. **ART HOLD.**
- [Same-scale Sophie original / V5 HOLD / Mayor V5 / Envoy V5 comparison](evidence/sophie_v5_original_vs_mayor_envoy_native44_20261031.svg): four directions, actual source PNGs, 44px display boxes. **Not** a real game screenshot.\n- Existing [four-hero/V5 Mayor/Envoy reference](evidence/four_heroes_v11_v5_native44_anchor_20261031.svg) remains the comparison anchor; no claim that this study surpasses it.

## Outstanding
- Real Chromium screenshot in Ryune village with V5 Mayor/Envoy and consistent world scale: **NOT RUN**.
- Full `npm run check`, 8 action-sheet completeness, all frames in live animation, human art acceptance: **NOT RUN**.
- The PNG is **not connected to production runtime**, not an eight-action replacement, and should not be merged as an approved character.
- Next art work must target **actual neck/shoulder silhouette and robe anatomy** from the original source; avoid repeating marginal pixel smoothing as a substitute for visual improvement.

`main`, frozen #98, production sprites, buildings, gameplay, story, Save v23, and other automations remain untouched. No paid APIs or GitHub Actions triggered.
