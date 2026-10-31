# Field-worker V5 four-direction arm / tool-grip structural pilot — 2026-11-01

**Visual decision: NO-GO. This is an actual 48×192 RGBA sprite experiment, not a production sprite change.**

## Starting point and isolation
- Parent: Draft PR #196 HEAD `cb479d30b2f1dc3130b7cb824f4926f4e2c99f94`. PR #98's frozen `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c` and `main` remain untouched.
- Source: `assets/npc/field_worker_style_study_v2_48x192.png`, verified Git blob `a39fd00215fb227c4031d3fbf53f2ebe182ca2c9`.
- Reference: current V5 farmer / mayor atlas `assets/npc/featured_residents_charm_v5.png`, visually reviewed at 44px. The candidate does **not** copy V5 faces, outfits or pixels.
- Previous V4 and its missing-codec repair remain separate Draft PRs #193 and #196. No art is switched on in the live game.

## Actual work and A/B
- Authored `tools/art/field_worker_v5_anatomy_nogo.py` to generate a source-derived **four-direction 48×192 RGBA PNG** and a side-by-side **native 44px A/B PNG** (V2 left, candidate right, down/left/right/up top to bottom). This is a source-faithful art edit, not a replacement generated from an unrelated template.
- Repositioned the original dangling tool-side hand toward the shaft and attempted a bent elbow and cuff on each direction. Hat, face, torso identity and feet were deliberately preserved.
- Executed the generator locally against the exact V2 PNG, and re-opened the 44px result. Changed pixels by direction: **49 / 73 / 74 / 50**. The script asserts source Git blob, RGBA dimensions, changes in all four directions and unchanged y=0–22 and y=42–47. Python compilation passed.
- Local generated outputs: `field_worker_v5_anatomy_NO_GO_48x192.png`, `field_worker_v2_v5_anatomy_native44_AB.png`. Rebuild with `python tools/art/field_worker_v5_anatomy_nogo.py` (requires free Pillow).

## Why NO-GO
- The side poses now read as a **stiff horizontal forearm** reaching backward; elbow-to-wrist continuity and anatomical depth are worse than intended.
- The front and back grips are small and visually ambiguous at 44px. The back pose can leave an isolated low pixel from the former hand. The original V2 and V5 reference retain stronger overall material rendering.
- Therefore the generated PNG is **not** committed as a production asset or substituted into the game. Pixel-diff counts and technical checks do not imply better art.

## Verification boundary
- **Performed:** real source PNG decoding, 4-direction RGBA generation, pixel guards, Pillow PNG export, native 44px static comparison, Python compile.
- **Not performed:** clean GitHub checkout execution of the new generator, full Node/npm check, Chromium screenshot of actual Ryune village, walking/work animations, NPC crowd review, commercial art acceptance.
- No GitHub Actions, paid API, story, Save v23, balance, architecture or production asset changes.

## Next art task
Do not continue accumulating hand recolor patches. First compare the **four playable heroes**, especially Margaret's scale/contrast and Karen's head, alongside V5 mayor/envoy at the same footline in the actual village. Then revise the field worker's full shoulder-to-tool silhouette only if a genuine game-size improvement can be shown. Buildings remain out of scope until character art is visually unified.
