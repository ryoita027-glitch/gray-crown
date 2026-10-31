# Sophie V2 — independent head / neck / shoulder redraw (2026-10-31)

**ART NO-GO / not approved.** This is a substantial **new pixel drawing** rather than another 1–2px edge trim. It is an isolated diagnostic and **must not replace the approved Sophie sprite**. Parent is Draft PR #167 fixed commit `75939183be44a1356362eb621651a5017622a04a`; it inherits #164, #162 and #160. Frozen PR #98 remains `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`.

## Actual files / usage

- New source sprite study: `assets/characters/sophie/studies/sophie_v2_handdrawn_walk.png` (indexed PNG, losslessly equivalent RGBA, 288×192, four directions × six walk frames, 48×48 cells).
- [Original / V1 / V2 / V5 Mayor / V5 Envoy at **44px**, same pose, same field-green background](evidence/sophie_v2_structural_44px_original_v1_v5_20261031.svg). This SVG embeds the actual source PNG bytes. **It is a static sprite review, not a Chromium screenshot.**
- On this branch only, `?gcSophieContour=2` loads and displays the new V2 PNG in the real field renderer. `?gcSophieContour=1` continues to use the earlier V1 PNG. Without the query parameter, the approved original is loaded. The existing A/B UI automatically labels the selected variant and uses the same original → candidate → original stable-frame gate.

## Design experiment

The 48px original Sophie has a large detailed head/hair volume and dense hair edge; the V5 Mayor/Envoy use a more restrained field-scale head and clearer shoulder/torso segmentation. V2 tests an **independently constructed adult silhouette**: head starting at y7–8, face/jaw ending near y23, visible neck-to-collar bridge, narrower shoulders and sleeves, clear waist and boots, and low tied hair with direction-specific mass and slight delayed movement. The approved cream/white, green, warm brown hair, gentle expression, healer identity and foot anchor are retained as design intent; no V5 face or palette is copied. No row deletion, stretching or post-hoc cropping of the old head was used.

**Visual judgment: NO-GO.** Although V2 makes the head/neck/shoulder segmentation more legible and reduces the oversized silhouette, the hand-drawn pixel density is currently **too simple**, with flat facial planes, overly blocky boots, and reduced expressive detail compared with the approved original and V5 NPC anchors. It risks a new toy-like mismatch. Do not promote V2. This is a useful structural prototype, not a commercially improved sprite. The static board is not sufficient to prove gameplay quality.

## Verification performed

- Local Pillow opened the exact uploaded PNG bytes and confirmed lossless RGBA pixels, 288×192 dimensions and 24 nonempty 48px cells.
- Four directions each have **five unique walk-frame pixel states** across six slots; feet stay at y46 and top bounds at y7–8. SHA256: `04362a0fcbd56aa253293f4dac4cf1991f53571a6efd7c4ed53873c06a291b3b`.
- Connected GitHub blob SHA `857e424fbc4eb36a0d10d216efe6c7a2fa32dbf8` matched the independently calculated Git blob hash for the local PNG.
- **NOT RUN:** actual Chromium village screenshot, full Node/Python game regression, eight-action sprite coverage, real NPC/crowd/camera visual acceptance. Local environment cannot clone the private repo due to network/DNS restrictions; GitHub Actions paid or exhausted quota not used.
- **Do not mistake PNG integrity or branch renderer wiring for art acceptance.**

## Next art pass

Retain the **original** as the production baseline. Use this V2 only as an anatomy/layout underdrawing; repaint front/side/back faces, large hair locks and garment folds at V5-like pixel density without flattening the character's identity. Compare original versus the next candidate at native 44px with Mayor and Envoy in the actual village Canvas, then extend to idle/talk/acting/battle before any adoption. Keep buildings and environment unchanged until the character family is visually consistent.

No main/PR #98 rewrite or merge. No story, Save v23, balance, NPC reference art or building changes. No additional paid services.
