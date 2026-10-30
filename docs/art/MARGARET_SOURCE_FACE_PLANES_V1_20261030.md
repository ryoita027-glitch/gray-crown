# Margaret source-derived face/neck/robe pixel study — 2026-10-30

**ART HOLD — NOT APPROVED.** This is a reversible candidate from exact PR #136 head `0d11bc1185e842e94756192cbe780ea8566eda8d`. No main/PR #98/default asset is modified.

## Actual artwork produced

- `assets/characters/margaret/studies/margaret_original_face_planes_v1_walk.png`: 288×192 RGBA 24-frame walk atlas, original source dimensions, four directions × six frames. Derived from original `margaret_walk.png` blob `1923f1315c377418cea0f2f94ab6431c987f2dd7`, not the simplified V4 series.
- `docs/art/evidence/margaret_source_face_planes_v1_44px_ab_20261030.png`: actual 44px nearest-neighbor frame-0 comparison, rows front/left/right/back; columns original Margaret, candidate, V5 mayor (source atlas column 3), V5 kingdom messenger (source atlas column 4). Same grass, same pose frame, same top origin.
- Changed source pixels by direction (all six frames): front 1891, left 1730, right 1838, back 1583. Counts are *not* art scores.

## Art intent and first-pass review

The existing original has attractive detailed hair and clothing but pale lilac shading that makes the adult face difficult to distinguish. This candidate preserves the original silhouette, book, dress and walk frames, replaces selected lavender hair clusters with neutral pearl masses, hand-places a warmer face plane, smaller eye clusters, exposed neck, and restrained collar/robe lines. It is a **targeted pixel redraw over the actual source**, not a resampling algorithm.

**Visible strengths:** face is more separate from hair at native 44px; skin is warmer and the dark eyes are less lost in the purple shadows. **Remaining defects:** the hand-patched face can look pasted-on or doll-like; side profile and mouth need frame-specific drawing, hair shadow clusters are still noisy, and shoulders/body remain inconsistent with the V5 references. The back direction is mainly palette/collar work. **Do not promote to runtime or mark visually approved.**

## Validation and limitations

- Generated actual 288×192 PNG and 256×256 A/B PNG from decoded source blobs; output PNG chunks include valid CRC32 and zlib Adler32.
- All four directions and 24 walk cells are present, with unchanged atlas dimensions. The generator does not establish walk-animation visual continuity.
- **Not run:** Chromium actual village capture, eight-action animation completion, game-wide regression, human art approval. Original assets and all gameplay code remain unchanged.
- No paid APIs, Actions minutes, story/save v23/balance, building or map changes.

## Next work

Review at 1× alongside Karen/Triton/Sophie and V5 anchors. Redraw face/neck per pose and all eight animation sheets only if the first-pass silhouette passes art review. Then opt-in in-game A/B with original source; reject any visual regression. Buildings stay out of scope until characters converge.
