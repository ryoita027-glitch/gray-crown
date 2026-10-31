# Sophie V1 — actual village Canvas original/V1 review gate (2026-10-31)

**ART HOLD / NOT PRODUCTION-APPROVED.** This branch is based on Draft PR #162 fixed commit `881b09362bc3a90444636eb069a9f1e47247b177`. PR #98 stays pinned to `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`; `main`, approved sprites, save v23, story, balance and buildings are untouched.

## Actual visual change

The previously authored **real 288×192 RGBA Sophie V1 contour walk PNG** (`assets/characters/sophie/studies/sophie_contour_v1_walk.png`) is now selectable in the **actual field sprite renderer**, at the existing 44px display size and original anchor, via `?gcSophieContour=1` on this isolated branch. It covers all four directions and six walk frames already present in that PNG. Without the URL parameter the normal game continues to load and display Sophie's approved original; no candidate image is requested.

The opt-in panel below the game can toggle **original / V1** in the live scene, or capture both by calling the real `GC.Render.World.drawScene()` twice with the same game state, facing, source frame, display size, footline and camera origin. The two 768×480 canvases are placed side by side in a downloadable 1536×504 PNG. The reference V5 Mayor and Envoy are **not** replaced or shifted. The capture gate requires village, V5 NPC image ready, stopped movement, no battle/cinematic/active dialogue animation, original and candidate PNG ready, 44px hero display, and no conflicting hero-face trial. It restores the previous candidate toggle and camera after capture.

This is **not** an additional hair-pixel redesign. The V1 study is only a limited 1–2px silhouette taper from PR #162; its face/neck/shoulder anatomy and coherence with V5 remain unproven. In particular, **do not merge** merely because the image loads.

## Verification and limits

- GitHub repository metadata and PR #98, #99–#105, #160, #162 inspected; no existing branches or PRs were overwritten.
- Connected GitHub source verified for both Sophie PNGs: PNG signature, IHDR **288×192**. Both modified JS files compiled as functions in a JS engine; the new HTML script tag appeared once.
- A mocked DOM/Canvas exercise of the **actual new UI source** produced two draw calls in the correct order (original then V1), both with the identical camera, and restored the prior toggle. The dedicated `tests/sophie_contour_live_ab.test.js` is checked into this branch for local execution.
- **NOT RUN:** `node tests/sophie_contour_live_ab.test.js` against a complete checkout; Chromium game screenshot; visual A/B verdict; full eight-action coverage; complete regression tests. The private repository could not be cloned into the local container due to unavailable network/DNS. No GitHub Actions or paid API was invoked.
- **Art judgment: HOLD.** The player-visible change exists only when the opt-in URL is used on this branch; the production game has not improved.

## Next art gate

Run `node tests/sophie_contour_live_ab.test.js` and open the branch game with `?gcSophieContour=1`; capture Sophie beside the V5 Mayor and Envoy in all four directions. Judge native 44px head-to-shoulder silhouette, adult jaw, facial expression, garment silhouette, contact shadow, and coherence with other heroes and NPCs. If V1 remains too round or abruptly trimmed, reject it and **hand-redraw a coherent new head, neck, shoulder and hair mass**, rather than more 1px trims. Only after visual improvement and all actions pass should production integration be considered. Buildings remain out of scope.
