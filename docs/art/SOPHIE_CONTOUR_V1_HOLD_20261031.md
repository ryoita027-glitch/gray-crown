# Sophie silhouette contour V1 — native 44px A/B (2026-10-31)

**ART HOLD; NOT approved.** Source: Sophie production walk blob `47065a719b16b3da0c3f0f2457d69ccfcf8a8a04`. Fixed base commit `8be76f570e1076d482c705c2498dc34fb839d9c9` (Draft PR #160). V5 Mayor and Envoy are reference style anchors, not face/color templates.

[Actual PNG A/B at native 44px](evidence/sophie_contour_v1_native44_ab_20261031.svg). Both columns embed actual 288×192 RGBA PNGs, four directions × two walk frames shown at identical size, pose, and background. **Static source-asset comparison; NOT an in-game screenshot.**

This study tests Sophie's overly wide hair silhouette identified in PR #160. Front edge tapers 1px, side-view rear hair tapers 1–2px while preserving forward-facing facial edge, back hair tapers 1–2px. Original edge pixels form the new silhouette outline. No face/core repaint, recolor, row deletion, full-sprite rescale, or production adoption. This remains a limited contour experiment, not a genuine adult jaw/neck/shoulder redraw.

- Walk atlas: 4 directions × 6 frames, source and candidate 288×192 RGBA8.
- Pixel changes: 1591; alpha changes: 1074; central face x19–30/y10–23: 0; feet y35–47: 0.
- Round-trip decoded PNG pixels equal generated pixels: PASS. **Technical integrity does not mean visual approval.**
- Chromium village screenshot, all eight actions, visual judgment at game scale, full tests: **NOT RUN**.
- Production art, other characters, buildings, story, balance, save v23, PR #98 and main untouched. No paid APIs/Actions.

**Art decision: HOLD pending visual review.** If cropped hair edges look abrupt or head/neck ratio remains poor, reject. Next art task is direction-specific redraw of adult jaw, neck, shoulders, and coherent hair masses, compared to V5 anchors in the real village canvas, not more mechanical trims.
