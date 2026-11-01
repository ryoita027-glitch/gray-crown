# Margaret idle hair silhouette — 44px A/B (2026-11-01)

**ART HOLD / experimental only.** Parent HEAD: `b7d4bb526c7bf70646800d07bcb37266009f876f` (Draft PR #215), stacked on Draft PR #212. Original source PNG SHA `910458eabfcfaef7442f885f319d0e2a09c88a66`. NPC style reference `assets/npc/featured_residents_charm_v5.png` (v5 mayor/messenger); see `docs/visual/NPC_VILLAGER_STYLE_GUIDE_v1.md`. No edits to `main`, frozen PR #98, source character PNG, Save v23, gameplay, or environment.

## Real asset produced
- `docs/art/evidence/margaret_idle_hair_silhouette_v1_48x192.png`: **new, reversible** 48px 4-direction × 4-frame Margaret idle candidate, not wired to runtime.
- `docs/art/evidence/margaret_idle_hair_silhouette_v1_native44_AB.png`: 44px display A/B; left original, right candidate, rows down/left/right/up; same first frame, same neutral checker background and sampling.
- `tools/art/margaret_idle_hair_silhouette_v1.py`: reproducible offline Pillow generator and safety assertions. Run `python tools/art/margaret_idle_hair_silhouette_v1.py --check` on a full checkout.

## Visual intention and observation
Current Margaret has a larger pale side/back hair silhouette than the 32px V5 village cast, making her visually prominent in a way that is not always desirable. This trial gently contracts the lateral hair-mass envelope below the face with direction-specific taper; no new color, ornament, lighting, skin tone or hair identity is introduced. Original hair crest, face, ponytail clasp and shoe-contact rows are preserved. **This is a pixel remap, not a hand-painted finished redesign.** The front-right mass becomes slightly less broad at native 44px; the left/right/back differences are subtler. The remaining shape is still busy and may contain compressed strands. Aesthetic approval is NOT established.

## Verification performed
- Fetched actual source sprite from fixed branch; decoded original RGBA and encoded new PNG.
- Candidate: 192×192 RGBA (48×48 cells × 4 columns × 4 directions), **604 changed RGBA pixels**.
- Encoded PNG decoded back pixel-perfectly in isolated JS; face rows y0–23 and contact rows y42–47 unchanged for all 16 cells.
- Source and candidate placed at 44px on identical background for all four directions (first idle frame only).
- Python generator syntax compiled in local environment using a synthetic image; **full source-based Python generator check not executed locally** because private repo clone is blocked.
- **Not executed:** full `npm run check`, real Chromium gameplay/camera screenshots, animated 4-frame review, 8-action coherence, aesthetic approval.

## Next gate
1. Run the generator `--check` on a full checkout; compare generated RGBA and 44px board with committed assets.
2. Inspect all 4 idle frames at native 44px against original in real Ryune village beside mayor/messenger and other heroes; reject if the side ponytail loses natural shape.
3. If the silhouette is genuinely better, manually retouch joins/outlines, then propagate consistent anatomy through walk/talk/run and other authored poses **before** any opt-in runtime swap.
4. Do not switch production art, buildings, or approve/merge this trial until full visual + functional checks.
