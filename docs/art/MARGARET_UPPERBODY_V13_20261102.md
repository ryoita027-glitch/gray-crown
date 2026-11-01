# Margaret V13 — upper-body silhouette comparison (2026-11-02 08:20 JST)
**ART HOLD / NOT APPROVED.** Based on frozen PR #270 HEAD `eefd155b716ba56ba7153f884f0b83ceb5e34f00`. Never merge to main/#98 without visual review.

## What was actually made
Two real 192×192 RGBA sprite atlases, 4 directions × 4 identical stationary frames, derived from the V12 experimental idle PNG (locked blob `e3cba2a0b1f63ea47cf6599d58c01dc01dbd01bc`). The *canonical* Margaret image is not edited.
- A: upper hair/shoulder x-scale 0.84 (rows 0–17), 0.88 (18–26), 0.94 (27–32).
- B: stronger 0.76 / 0.81 / 0.90 scaling. This is an alternative for review, **not an accepted improvement**.
- Rows 33–47 (feet and lower body) and the face/neckline centre x18–29, y14–26 are preserved pixel-for-pixel from V12. No additional shine, purple glow, ornamentation or new identity details. The operation is a geometric diagnostic, **not an authored replacement for the head/neck/torso redraw**.

Visual board: `docs/art/evidence/margaret_upperbody_v13_native44_AB.png`. Columns are **V12 / A / B / V12 repeated as a reference**; rows down/left/right/up. Native 44px nearest-neighbour, identical green ground and bottom-opaque-pixel anchor. This is **not a Chromium game screenshot**. V5 mayor/messenger comparison remains in `docs/art/evidence/margaret_headheight_v12_native44_npc.png`.

## Pixel evidence
A differs from V12 by **131 / 161 / 173 / 130** source pixels per direction; B by **169 / 208 / 213 / 174**. This confirms material changes but **does not prove better art**. At native44 B is noticeably narrower but risks a compressed, pinched face/hair mass; the neck-shoulder connection is still not convincingly authored. **Neither A nor B is approved.** Do not keep mechanically compressing the sprite in further variants.

## Reproduction and checks
- `node tools/art/build_margaret_upperbody_v13.js` regenerates both PNGs and the native44 board from a blob-locked V12 source.
- `node --test tests/margaret_upperbody_v13.test.js` checks identity-preserving regions, 4 directions/4 frames and byte-identical regeneration.
- `python tests/browser_margaret_upperbody_v13_live_ab.py` captures 24 actual village canvas PNGs and 16 A/B boards (desktop and phone, four directions, live walk vs approved idle vs V13B). This **has not run** because the private repository cannot be cloned into the isolated browser environment (github.com DNS resolution failed). No full Node suite or full regression claimed.
- Independent PNG RGBA encode/decode roundtrip of all three produced files was checked in this run. No paid GitHub Actions triggered.

## Next art task
Before another mechanical adjustment, redraw Margaret's **head-to-neck-to-shoulder shape as one coherent 48px composition**, keeping her silver hair, facial identity, mage outfit, pose and grounded feet. Capture actual village canvas alongside V5 mayor/messenger and all four protagonists at 44px; reject any worse silhouette. Buildings stay out of scope until all character art is visually consistent.
