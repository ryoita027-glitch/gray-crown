# Margaret V9 — actual village-canvas A/B gate (2026-10-31)

**ART HOLD / no production adoption.** Parent: Draft PR #149 exact HEAD \`b4c18d17da94f27dd3fc740f1c67d73669c2a621\`. Frozen PR #98, \`main\`, production sprite PNGs, save v23, gameplay, buildings and approved V5 NPCs are unchanged.

## Why this run changed the review method, not the sprite

The previous V1–V9 studies generated many pixel edits and static 44px galleries, but none established that Margaret looked better **in the actual village renderer beside the mayor and envoy**. Repeating a small palette change or automatic head shrink without a true game-context review is not justified.

Inspected the committed V9 288×192 atlas and the real 432×192 V5 NPC atlas. V9 still has a disproportionately broad hair/head silhouette, compressed-looking body and crowded shoulder region at 44px. Two **uncommitted** experimental trims were previewed: an outer-hair edge trim that barely changed the silhouette, and a 2px crown compression plus shoulder trim that produced a flat/square crown. Both were rejected; **no new art PNG was adopted or uploaded**.

## Actual implementation

Added \`tests/browser_margaret_v9_live_canvas_ab_e2e.py\`. In a complete local checkout:

\`\`\`bash
python tests/browser_margaret_v9_live_canvas_ab_e2e.py
\`\`\`

- Serves the real project locally, starts a fresh browser-context New Game and loads the actual four-hero party and V5 NPCs.
- Baseline uses the **unchanged production** \`assets/characters/margaret/margaret_walk.png\`.
- The second browser context intercepts **only** that image request and responds with \`assets/characters/margaret/studies/margaret_silver_planes_v9_walk.png\`. No game source or production PNG is overwritten. Checks exactly one substitution.
- Requires 288×192 RGBA hero atlases, 432×192 V5 NPC atlas (its source is **palette-mode PNG**, not RGBA), unchanged alpha/footline, and RGB differences in all 24 candidate walk frames.
- Uses three **real village** camera/party setups (wide, envoy contact, mayor contact), four directions, 44px default hero scale, original NPC footline. Calls the actual synchronous world draw with a reset camera for each setup and refuses A/B pairs whose recorded camera, party position or pose differs. Captures **24 unscaled 768×480 game-canvas screenshots** (12 baseline + 12 V9).
- Builds three side-by-side 4-direction PNG montages, one per scene, and a JSON manifest with source SHA-256, atlas changes, runtime status, screenshot names and pixel-difference counts.
- All generated evidence goes under \`prototype_artifacts/margaret_v9_live_canvas_ab_20261031/\` and does **not** enter the shipped assets.

## Verification actually performed

- Re-read actual GitHub source for the live world renderer, hero atlas load, V5 NPC static columns and the prior browser capture script.
- Verified the source PNG IHDRs through the connected repository: Margaret production and V9 are RGBA 288×192; V5 featured residents is **indexed/palette PNG** 432×192. Corrected the preflight to accept V5's real pixel format.
- Python syntax compilation passed for the new script.
- Local **synthetic fixtures** passed the atlas preflight (24/24 frames, alpha preserved, palette V5 accepted) and montage builder (3/3 output PNGs, 12/12 image differences). These fixtures are **not** real game captures.
- **Not run:** this new script against a full game checkout, actual Chromium screenshots, full Node suite, all eight Margaret actions, art acceptance. The private GitHub checkout remains unavailable in the execution container because \`github.com\` DNS cannot resolve. No paid Actions or CI job was triggered.

## Art decision and next gate

**HOLD.** No claim that V9 improves the player-visible result. Next, run this committed script on the exact branch HEAD with a complete checkout and inspect all three full-scene A/B montages at native pixels, focusing on face readability, head-to-body scale, silhouette, crowd differentiation, foot contact and the V5 NPC anchors. If V9 is not clearly better, reject it and begin a hand-shaped, direction-consistent head–neck–shoulder redraw from the original high-detail atlas; do not repeat blind recolors, automatic shrink, or move to buildings.
