# Margaret V10 — upper-body material separation (2026-11-02 05:25 JST)

**ART HOLD. NOT AN APPROVED DESIGN. DO NOT MERGE.**

Baseline: PR #264 exact HEAD `c608eaea1af5ee073a5f6c27d7c5a936d3036701`; approved source `assets/characters/margaret/margaret_idle.png` (blob `910458eabfcfaef7442f885f319d0e2a09c88a66`). V5 NPC reference `assets/npc/featured_residents_charm_v5.png` (blob `b169b58a846e1812dc42f566ca1843a6088e901f`).

This is a **different axis from V9's head-width change**: the original face, head silhouette, silver hair, skin, transparency and contact pixels are retained. An experimental collar/shoulder value plane is placed only on existing plum-colored pixels in source-local y25–36. Front has a restrained V-shaped dark collar, while side/back use hair-adjacent shadow and broad garment grouping. No new alpha pixels or facial edits. Four directions × four held idle frames (no whole-body bounce).

Real PNG files:
- `assets/character_trials/margaret_idle_shoulder_plane_v10.png` (192×192 RGBA)
- `docs/art/evidence/margaret_shoulder_plane_v10_native44_AB.png` (left approved original / right V10, 44px native size, same grass and foot alignment; rows down/left/right/up)
- Rebuild with `node tools/build_margaret_shoulder_plane_v10.js`

The experimental game renderer selects the new atlas **only when stationary and `?heroIdleArt=6` is explicitly provided**. Normal play, other characters, moving Margaret and prior modes remain unchanged. This does not claim that the source board is a real Chromium game capture.

Measured difference from approved original at 44px: down 88, left 61, right 63, up 64 pixels. These counts do **not** establish aesthetic improvement. The visible change is modest; the fundamental head/neck/shoulder proportion and gap to mayor/messenger V5 remain unresolved. **No artistic GO**. Do not repeat micro-palette edits in lieu of a true silhouette and acting redesign.

Validation: exact PNG source decoding and candidate creation were executed in an isolated JS environment; repo-side Node tests and real Chromium capture are **not yet executed**. Next gate: run `node --test tests/margaret_shoulder_plane_v10.test.js`, run actual village scene A/B, review NPC proximity, then decide GO/NO-GO. Keep this draft separate from PR #98 and main. No paid CI.
