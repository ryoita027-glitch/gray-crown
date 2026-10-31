# Margaret 44px contact continuity — authored poses (2026-11-01)

**Status: ART HOLD.** This is a *stacked, reversible* correction to [PR #212](https://github.com/ryoita027-glitch/gray-crown/pull/212), not an approved visual adoption. Parent baseline: `bc39796589b4c8217c6eccc2ac9e3924dc4bac40` (PR #212). The frozen integrated QA PR #98 and `main` remain untouched.

## Observed defect in the preceding trial

PR #212 adjusted only the ordinary world walk renderer: Margaret's 48px PNG has opaque shoe pixels as low as source y45–46, but the shared walk anchor was y44. The trial therefore placed her field sprite at source anchor y46. **Authored dialogue and moment animations use a separate renderer** (`GC.Animation.drawActor`) whose Margaret definitions still used y44. When a dialogue pose replaced the field sprite, Margaret could jump vertically by 2px and her contact shadow also changed shape/position. This was a *source-code mismatch*, not yet a visually verified player-reported defect.

## Actual branch changes

- `js/data/animations.js`: Margaret's eight original authored actions (idle, walk, turn, talk, surprise, approach, laugh, run) share source anchor `[24,46]`; the other three protagonists remain at `[24,44]`. Update Margaret's visual rule metadata accordingly. **All original PNG bytes and action timing are unchanged.**
- `js/render/world.js`: derive the walk anchor from the same authored animation definition rather than maintaining a second Margaret-only constant.
- `js/systems/animation.js` and `js/systems/commercial_acting.js`: only dialogue-created actors opt into the field sprite's 44px shadow (center footY−1, radius 10×4, alpha .28), preventing a shadow jump when the renderer switches. Other animation users keep their old shadows.
- `tests/margaret_native44_ground_contact.test.js`: assert the draw origin for all eight actions and all heroes, plus dialogue/field shadow parity.

## Executed verification

In the GitHub connector's isolated JavaScript environment, the **actual saved branch source** of `animations.js`, `animation.js`, `world.js` was loaded and evaluated with a mocked Canvas/Image. Field-versus-authored-pose draw rectangles and shadow ellipses matched in **128 cases** (4 protagonists × 8 actions × 4 directions). A separate execution of the actual `commercial_acting.js` verified dialogue rendering for all four heroes: `dy=86` for Karen/Triton/Sophie, `dy=84` for Margaret, all with a shadow at `(80,125)` and radii `10×4`. These are code-level geometry checks, **not Chromium screenshots or an aesthetic PASS**.

The parent trial's [44px walk A/B](https://github.com/ryoita027-glitch/gray-crown/blob/art/margaret-native44-ground-contact-20261101-0721/docs/art/evidence/margaret_walk_ground_contact_native44_AB_20261101.png) remains the only source-based visual board; it is **not a new screenshot**. This run did not create a new character sprite.

## Remaining visual review / acceptance gates

1. In the actual Ryune village, compare unmodified PR #98 versus this stacked trial at identical 100% viewport, camera, pose, and background, standing next to the V5 mayor and messenger.
2. Inspect Margaret's transitions among idle, walk, talk and turn for shoe contact, shadow consistency and any new 2px vertical displacement in authored scene choreography. Verify on desktop and mobile, with and without reduced motion.
3. Review the entire four-hero group, including Margaret's disproportionately broad hair mass and head/neck/shoulder construction. The anchor correction does **not** solve those aesthetic problems.
4. Run the full Node and real Chromium regression suites on a checkout before any adoption. **Not run in this environment**; no paid GitHub Actions triggered.

**No changes to story, save schema v23, balance, building tiles, original sprites, PR #98 or main. Do not merge or claim art approval.**
