# Triton Second Character Validation — Final Result

## Status

**Branch:** `pixel-triton-second-character-validation`  
**Implementation commit tested:** `43ab43be257e7db144c3e4b76171488580b1ae9d`  
**Draft PR:** #20  
**Source architecture:** 48×48 cell  
**Logical world:** 32px tile  
**Selected prototype screen occupancy:** **44px Medium**  
**Design identity:** Triton A — GROUND ANCHOR  
**Decision:** **TECHNICAL GO — SECOND CHARACTER VALIDATED**  
**Production main merge:** NOT PERFORMED  
**Pixel-native formal adoption:** NOT YET

## Completed

1. Back-facing Triton pose added.
2. Four-direction Idle source atlas completed in down / left / right / up order.
3. Karen + Triton matched-framing comparison added.
4. Exactly eight Triton animation categories implemented:
   - Idle — 4 frames
   - Walk — 6
   - Turn — 3
   - Talk — 4
   - Surprise — 4
   - Approach — 4
   - Laugh — 6
   - Run — 6
5. Full 48 / Medium 44 / Compact 41 scale comparison added.
6. Deterministic Triton asset generation and verification added.
7. Save schema remains 23 and logical map tile remains 32.

## Character-specific acting

Triton intentionally does not reuse Karen's motion personality.

- Idle: low-amplitude body motion.
- Walk: less vertical bounce; stable stride.
- Hair: heavy shoulder-length mass with tip-only lag.
- Talk: arm motion without Karen-like light whole-body bounce.
- Surprise: compact reaction rather than a large jump.
- Approach: torso commitment with a planted step.
- Laugh: broad upper-body reaction while keeping the stance grounded.
- Run: stronger leg separation with restrained hair motion.

The purpose is to preserve **GROUND ANCHOR**, not create a recolored Karen animation set.

## Karen / Triton comparison

The Medium comparison uses matched camera framing and the same source-cell architecture.

Target distinction is preserved in implementation:

- Karen: forward / light / red-haired / vertically active.
- Triton: planted / horizontally stable / dark-haired / broader shoulder and waist mass / lower center of gravity.
- Triton's faded-blue waist block remains the low horizontal visual hook.

Karen remains the control, not an anatomy template.

## Scale verdict

### Full 48
Retains the most source detail but is the most dominant against the existing 32px world population and furniture.

### Medium 44
**Selected prototype condition.**

It preserves the advantages of the 48px source architecture while matching the world scale closely enough to use for both Karen and Triton prototype validation.

This is now stronger evidence than Karen alone because the same architecture supports two characters with substantially different silhouette, weight, posture and motion personality.

### Compact 41
Retained as fallback. It fits the old world more tightly but gives up more facial, waist-block and acting readability.

## Regression evidence

GitHub Actions run: **37401209352**  
Workflow: **Karen Pixel Prototype CI**  
Tested implementation head: **43ab43be257e7db144c3e4b76171488580b1ae9d**

The first attempt stopped in the pre-existing Frontier Section 2 browser walk gate with `AssertionError: walk failed`. Triton Node tests had already passed. The failed job was re-run on the **same head without code changes** and completed successfully, confirming the first failure was not caused by the Triton implementation.

Final successful evidence:

- Node tests: **58 / 58 PASS**
- Triton metadata/grid tests: PASS
- V21 Browser Gate: PASS
- Alpha2 Frontier Section 1: PASS
- Alpha2 Frontier Section 2: PASS on rerun
- Developer Mode: PASS
- Karen Pixel / Chibi gates: PASS
- Karen scale gate: PASS
- Triton Karen-comparison browser gate: PASS
- Triton eight-animation browser sequence: PASS
- Triton 48 / 44 / 41 scale gate: PASS
- control restoration: PASS
- Save schema: 23
- logical tile: 32

## Evidence artifact

Artifact id: **11385149436**  
Name: `karen-pixel-prototype-evidence`  
Digest: `sha256:b384f11ba8fe998fb3e363025a0869dce711bb55aae3967c6795059629dc154a`

Triton evidence includes:

- `triton_karen_idle_medium.png`
- `triton_medium_walk.png`
- `triton_medium_talk.png`
- `triton_medium_laugh.png`
- `triton_medium_run.png`
- `triton_scale_full_idle.png`
- `triton_scale_medium_idle.png`
- `triton_scale_compact_idle.png`

## Decision

# **TECHNICAL GO**

The second-character reproducibility question is answered positively:

> The same 48×48 Pixel-native source architecture and approximately 44px on-screen scale can support both Karen and Triton without requiring the same body, silhouette, posture, hair behavior or acting personality.

This does **not** mean:

- game-wide Pixel-native adoption is final;
- 44px is permanently locked for every hero;
- Portrait OFF is final policy;
- main should be merged now;
- Sophie / Margaret should be mass-produced immediately.

## Next authorized phase

Prepare **Pixel Character Standard v1 — PROVISIONAL** from the two-character evidence.

That standard may define shared technical rules such as:

- 48×48 source cells;
- logical 32px world unchanged;
- foot-anchor-based scaling;
- approximately 44px default hero occupancy as a starting point;
- nearest-neighbor rendering;
- eight acting categories;
- per-character silhouette / center-of-gravity / hair-motion differences;
- no requirement for identical visible height or internal foot placement.

Sophie and Margaret production should begin only after the provisional standard is reviewed.
