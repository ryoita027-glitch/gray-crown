# Four Hero Appeal Upgrade v1

Status: ACTIVE PROTOTYPE / NO MAIN MERGE

This branch upgrades the four protagonists from "technically valid sprites" to a cast whose roles and appeal read immediately in the actual game.

## Design intent
- Karen: energetic forward-moving heroic lead; warm red, lively face, low partial tie.
- Triton: grounded warrior; dark hair, broader planted silhouette, sharper calm eyes.
- Sophie: gentle healer; warm honey hair, soft green accents, rounded kind expression.
- Margaret: calm intelligent mage; silver-lavender ponytail, strong dark-plum contrast, elegant readable silhouette.

## Runtime rules
- 48x48 source cells, directions down/left/right/up.
- Anchor family [24,44].
- Eight animation categories preserved.
- No auto-cropping at runtime.
- All transparent edges must be binary alpha; RGB under alpha 0 is cleared.
- World/battle party sheet must be mechanically rebuilt from the same runtime Walk assets.
- Comparison evidence must be mechanically composed from committed assets only.

## Acceptance
1. All four faces read at Medium44.
2. Character role is legible from silhouette/color before text labels.
3. Margaret no longer reads as a pale amorphous blob.
4. No cutout halo returns in actual game rendering.
5. Browser E2E + full regression stays green.
6. Visual promotion remains a user gate; main stays untouched.
