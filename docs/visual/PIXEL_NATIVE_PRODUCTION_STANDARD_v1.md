# Gray Crown — Pixel-native Production Standard v1
**Status:** LOCKED technical standard for **next-development candidate only**; aesthetic judgement remains PROVISIONAL. No automatic `main` adoption.

## Geometry and packing (LOCKED)
- Source: 48×48 RGBA pixels **per frame**. Runtime field display: 44×44 logical canvas pixels (Medium44); map collision tiles remain 32×32.
- Sheet layout: **4 rows** of directions in this exact order `down, left, right, up`. Columns per animation: `idle=4, walk=6, turn=3, talk=4, surprise=4, approach=4, laugh=6, run=6`. Thus Walk = 288×192 and Idle = 192×192 source pixels. Filenames `assets/characters/<id>/<id>_<animation>.png`.
- Field runtime `HERO_RUNTIME`: frame 48×48, `display=44`, foot `anchor=[24,44]`; image smoothing **off**, integer-aligned draw destination. Any new scale/anchor variation needs a side-by-side real-game proof and explicit user approval.
- NPC/movement/collision use existing map data; rendered formation may use spare walkable tiles on two-cell reversals **without** changing saved trail or hero coordinates.

## Color, alpha, contour and shadow
- Each character retains its own established silhouette and color masses; do not impose a shared face, outline density or saturation template. Use bounded deliberate flat-shade ramps and readable silhouette separation; exact color values not finalized unless pinned in active PNG.
- **Derived/fresh assets:** RGBA alpha must be 0 or 255, with RGB zero under fully transparent pixels where generated verification requires it. Source-approved Karen/Triton images remain byte-for-byte unchanged, even if historic edge alpha differs. Existing runtime normalization handles edge halos. No automated per-frame trimming, color key, anti-aliased resizing or downsample blur.
- Field and indoor shadows must be restrained, readable and ground-anchored; do not introduce cinematic lighting, bloom or floating glitter. Depth-order actors by world foot position; NPC and furniture occlusion are map-specific review cases.

## Runtime layers and identity protections
- Primary field draw: per-character 48px Walk; battle: individual 48px Idle sources; historical combined `hero_party_walk.png` is a compatibility fallback only. Direction/anchor hash assertions belong in CI.
- Karen: VILLAGE RUNNER, red/russet hair, low tied silhouette, energetic body; immutable regression control.
- Triton: GROUND ANCHOR, dark shoulder hair, broad shoulder and grounded posture; immutable second-character control.
- Sophie: STEADY HANDS, shorter/smaller, honey hair, hands and gentle demeanor; **active appeal v3** source, original v2 lock document historical.
- Margaret: MEASURED LINE, white/silver-lavender high ponytail, measured controlled action; **active appeal v7** source, earlier v5 lock historical.
- Do not alter identities, pupils, anatomy or acting from AI-generated visual boards. Runtime 8-category assets are finished and must not be regenerated opportunistically.

## Environments and effects
- Ryune `village`, `karenhome`, `orphanage`, `mayorhouse`, `cottage`: integer-grid deterministic pixel renderer `js/render/ryune_environment.js` with before/after E2E switch; coordinates, entrances, collision and NPC placements stay with map data. Other maps use current legacy/provisional rendering until separately reviewed.
- NPCs currently use role/palette-driven Canvas chibi and are **PROVISIONAL** for actor-density parity; no mass redesign without review. Render behind/in front using meaningful foot Y/depth, not arbitrary sprites atop roofs or interactive blockers.
- UI/combat layout is technical candidate, **PROVISIONAL** artistically. Preserve per-character battle Idle images, enemy family rendering, player controls, responsive canvas pixelation and accessible battle command functionality.

## Portrait / unresolved content
Portrait ON/OFF remains `UNDECIDED` and both modes must stay testable. No change of default based on screenshot capture. Do not lock final eyes, surnames, weapons, costumes, official heraldry, religion, crowns, flags, military insignia, or new personal backstories.

## Promotion gate (required)
1. Verify existing commit and assets' Git blob SHA against `VISUAL_ASSET_MANIFEST.md` (SHA-256 runtime assertions remain separate).
2. Run source-lock/regeneration validators in **read-only** mode; never write committed PNGs from CI.
3. Verify 4 directions, 8 categories, alpha, 48px dimensions, Medium44 scale and correct character runtime imports.
4. Actual Chromium Village/Road/Interior/Battle screenshots at desktop+mobile, dialogue Portrait A/B and save/Continue regression; judge silhouettes and occlusion by eye in addition to machine tests.
5. Only then make a dedicated review and update the manifest/hashes; aesthetic approval and `main` merge require independent user decisions.
