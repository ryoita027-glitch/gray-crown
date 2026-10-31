# Sophie original-source pixel workbench — 2026-10-31 20:23 JST

**ART HOLD / NOT PRODUCTION.** This is a practical visual art project file, not a finished or approved character redraw. No official sprite, game rendering, map, story, battle, Save v23, or building was changed.

## Why this changes the workflow
Draft #181 rejected two mechanical V7/V8 head/neck attempts. Earlier V2–V6 similarly lost the original's expressive face or garment detail. Instead of another bulk recolor, this run creates a **source-faithful, directly editable 48px pixel workbench**. It lets the next artist redraw individual pixel clusters while inspecting the same native 44px frame beside the actual V5 Mayor and Royal Messenger, and export a complete candidate sprite sheet without touching production.

## Actual committed file
- `tools/art/sophie_original_native48_pixel_workbench.html`: standalone offline HTML with **embedded original GitHub PNG bytes** (not synthetic approximations), full 288×192 source atlas and V5 432×192 reference.
- 4 directions × 6 source walking frames; 48×48 editable pixel canvas; sampled original palette; pencil, eraser, eyedropper, 20-level undo/redo, per-frame reset.
- Native Canvas `drawImage` comparison of original, edited, V5 mayor (zero-based column 3), V5 envoy (column 4), with `imageSmoothingEnabled=false`, identical 44×44 matte cells. Four direction rows and selectable walk frame.
- Independent PNG exports: edited full 288×192 sprite sheet and 176×176 same-scale comparison. **No automatic production replacement**.
- `tests/sophie_original_native48_workbench.test.js`: embedded PNG Git blob identity, dimensions, JS syntax and preview/export contract checks.

## Fixed provenance
- Parent: Draft PR #181 exact HEAD `3161b9c86ea042852c7b470177f43d7432ce17b8`.
- Sophie original: `47065a719b16b3da0c3f0f2457d69ccfcf8a8a04`.
- V5 atlas: `b169b58a846e1812dc42f566ca1843a6088e901f`.
- Production source remains unmodified. This branch is reversible and stacked on the existing art Draft.

## Evidence and limits
- **Verified in this run:** source Git blobs retrieved and SHA checked before embedding; generated HTML inline JavaScript parsed with `new Function` without syntax error; file committed to GitHub. The standalone test is committed but has **not** been executed against a full repository checkout.
- **Not verified:** actual browser Canvas rendering of this new complete HTML, drawing interaction, download behavior, in-game Chromium screenshot, full Node/npm tests, all eight actions, commercial visual approval. No GitHub Actions or paid API used.
- **Player-facing game visual improvement: NONE yet.** The editor creates a means to author a real redraw; it is not itself a prettier game screen.

## Next visual task
Use the source-faithful workbench to paint a coherent **front-frame neck/shoulder/upper-arm redraw** while preserving the original face, orange hair silhouette and robe detail. Inspect the exported actual 44px A/B beside V5; reject if inferior. Only then extend the accepted structure to the other three directions and all six walk frames, followed by remaining actions and **real village game capture**. Do not edit buildings before character cohesion is visually established.
