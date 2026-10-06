# Triton Second Character Validation — Implementation Result

## Status

**Branch:** `pixel-triton-second-character-validation`  
**Source architecture:** 48×48 cell  
**Logical world:** 32px tile  
**Prototype scale target:** 44 / 48 Medium  
**Design identity:** Triton A — GROUND ANCHOR  
**Production main merge:** NOT PERFORMED  
**Pixel-native formal adoption:** NOT YET

## Completed in this implementation

1. Back-facing pose added.
2. Four-direction Idle source atlas created in order: down / left / right / up.
3. Karen + Triton same-scene comparison added to automated browser evidence.
4. Exactly eight Triton animation categories implemented:
   - Idle 4
   - Walk 6
   - Turn 3
   - Talk 4
   - Surprise 4
   - Approach 4
   - Laugh 6
   - Run 6
5. Full 48 / Medium 44 / Compact 41 scale comparison added.
6. Save schema remains 23 and logical map tile remains 32.

## Character-specific acting

Triton deliberately does not reuse Karen's motion personality.

- Idle: low-amplitude body motion.
- Walk: less vertical bounce; stable stride.
- Hair: heavy mass with tip-only lag.
- Talk: arm motion without light whole-body bounce.
- Surprise: compact reaction rather than a large jump.
- Approach: torso commitment with planted step.
- Laugh: broad upper-body reaction while keeping feet grounded.
- Run: stronger leg separation but restrained hair motion.

The purpose is to preserve **GROUND ANCHOR** rather than create a recolored Karen animation set.

## Visual comparison target

The Medium comparison places Karen and Triton together under matched camera framing.

Expected read:

- Karen: forward / light / red-haired / active vertical motion.
- Triton: planted / horizontally stable / dark-haired / broader shoulders and waist / low center of gravity.
- Triton's faded-blue waist block should remain a low horizontal hook at gameplay scale.

## Scale criteria

### Full 48
Useful for face and clothing detail, but expected to be the most dominant against existing 32px world furniture and NPCs.

### Medium 44
Primary candidate. Must retain:
- dark heavy hair mass
- broad shoulder read
- blue horizontal waist block
- grounded legs
- distinct acting categories

while fitting the Karen-selected world scale.

### Compact 41
Fallback. Accept only if Medium remains too large; reject if face / waist block / grounded acting compress too much.

## Evidence gate

A successful fresh CI run must produce:

- `triton_karen_idle_medium.png`
- `triton_medium_walk.png`
- `triton_medium_talk.png`
- `triton_medium_laugh.png`
- `triton_medium_run.png`
- `triton_scale_full_idle.png`
- `triton_scale_medium_idle.png`
- `triton_scale_compact_idle.png`

and pass the Node metadata/grid tests plus the complete existing prototype regression.

## Decision rule

- **GO** only if 44 Medium preserves Triton's separate identity and all regression gates pass.
- **REVISE** if the architecture works but the sprite translation loses GROUND ANCHOR.
- **NO-GO** only if the shared 48px-source architecture itself cannot support Triton safely.

Sophie / Margaret production remains unauthorized until this second-character result is evaluated.
