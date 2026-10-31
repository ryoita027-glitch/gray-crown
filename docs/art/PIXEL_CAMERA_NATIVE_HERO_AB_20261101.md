# Pixel-grid camera / hero native-size A/B — 2026-11-01

**ART HOLD / DO NOT MERGE.** This branch is a reversible *in-game visual diagnosis*, not a completed character redesign. It is stacked on the exact frozen PR #98 SHA `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c` without editing that branch, `main`, or any approved sprite.

## Why this experiment is needed

The real source was inspected. `assets/characters/{karen,triton,sophie,margaret}/*_idle.png` uses 48×48 cells, 4 directions × 4 frames. The runtime `js/render/world.js` reads the 48×48 walk cells and draws each at 44×44 using `imageSmoothingEnabled=false`. In the village `viewScale()` returns **1.16**, indoors **1.18**, and capital / other areas **1.25**. The camera is eased with fractional coordinates and transformed with `ctx.scale(target.scale,target.scale);ctx.translate(-VISUAL.camX,-VISUAL.camY)`. The V5 NPCs also render at 44×44 with the same `footY=tileY+30` as the heroes.

The scaling and fractional translation can produce uneven on-screen pixel widths and movement jitter, *but this is a hypothesis, not a proven explanation for the crushed-head or Margaret style problem*. The four original heroes and V5 mayor / royal messenger were visually inspected as real PNGs. Margaret's pale-violet silhouette differs substantially from the warm V5 residents; merely neutralizing her colour would not resolve anatomy or art-language mismatch.

## Real-game modes (opt-in only)

Open the actual game at `index.html?gcPixelReview=1`, start a new game, and use the bottom-left comparison panel:

- **A baseline**: unchanged current fractional camera, 44px hero and 44px NPC sprites.
- **B snap**: unchanged camera zoom and 44px sprites; snap the camera translation to device pixels after interpolation. This isolates the *movement-jitter* hypothesis without changing character anatomy.
- **C native**: world zoom 1×, 48px original hero sprites, 44px V5 NPCs. This deliberately breaks relative scale and is **diagnostic only**, not an art candidate.

All three share the same underlying source PNG, facing, animation frame, world, collision, story and save schema. Default URL is unchanged; no study UI is displayed. The study does not write to localStorage or game state.

## Evidence / acceptance

Run `node --test tests/pixel_camera_ab.test.js` and `python tests/browser_pixel_camera_ab_e2e.py` from a clean checkout. The latter is written to capture six actual village game screenshots (desktop + phone, A/B/C) plus a state-fidelity manifest. These commands are not claimed as run on the full GitHub checkout unless verified separately. The local isolated JavaScript study passed three logic cases before upload.

**Required human art review**: compare faces, hair silhouettes, NPC relationship, feet, world scale and camera shimmer at real 100% screen size, including moving the party in four directions. If B has no clear improvement or worsens tile movement, reject it. C must not be shipped as a hero-size fix without harmonizing the NPC scale. Continue original-source character redraws only after the rendering diagnosis. Do not edit houses or environment art yet.

## Scope protection

No original PNG changed; no production appearance changed; no game logic, story, battle, balance, maps, or save v23 changed. GitHub Actions was not triggered manually and no paid service was used. Art approval and full real-game acceptance remain **NO-GO**.
