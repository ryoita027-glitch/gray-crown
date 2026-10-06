# Karen / Triton Face Differentiation Repair Gate

## Status

**Branch:** `pixel-karen-triton-face-differentiation-fix`  
**Reason opened:** user-visible comparison output drifted into a shared face template.  
**Production main:** untouched  
**Sophie:** paused; do not continue until this gate closes.

## What went wrong

Recent generated comparison boards were not faithful to the repository's locked character identities.

They visually replaced Karen and Triton with near-identical faces / dark-hair templates and therefore must be treated as **NON-AUTHORITATIVE FAILED VISUALS**.

The repository's canonical Karen source still exists at:

`docs/pixel/reference/karen_chibi_direction_v1.png`

The Triton four-direction source still exists at:

`docs/pixel/reference/triton_idle_4dir_v1.png`

The problem is not that Karen was deleted. The problem is that later generated presentation art drifted away from the source of truth, and the visual validation was too permissive.

## Locked facial difference

### Karen — VILLAGE RUNNER

Must preserve:

- soft oval face
- round, emotionally readable eyes
- arched brows
- open / approachable expression
- healthy, active 23-year-old read
- red / red-brown hair
- low partial tie + loose hair
- slightly forward center of gravity

Karen's face should feel open and quick to react.

### Triton — GROUND ANCHOR

Must preserve:

- slightly longer / sharper face
- narrow / slit-like eyes
- straight brows
- somewhat wider mouth
- capable of a hearty broad laugh
- dark shoulder-length hair
- broader shoulders than Karen
- low planted center of gravity

Triton's face should feel observant and steady at rest, then unexpectedly open when she laughs.

## New mandatory visual test

A technical pass is no longer enough.

Before Triton can be considered visually validated, produce a comparison using the **actual repository source assets**, not regenerated stand-ins.

Required checks:

1. grayscale silhouettes differ;
2. face crop differs before hair color is considered;
3. eye shape differs;
4. brow shape differs;
5. mouth width differs;
6. jaw / face length differs;
7. shoulder width differs;
8. stance width differs;
9. hair mass differs;
10. Karen still reads as Karen when shown beside Triton.

## Failure conditions

Immediate REVISE if:

- Karen and Triton share the same eye template;
- the same mouth / jaw is reused;
- only hair color separates them;
- both have the same shoulder width;
- both use the same idle posture;
- comparison art redraws either character instead of using repository source;
- presentation boards are treated as source assets.

## Corrective rule

From this point:

> comparison images must be assembled from committed character assets whenever the purpose is identity validation.

Image generation may still be used to explore a new design, but it must not silently redraw already locked characters for comparison.

## Gate outcome

Current state:

**TRITON TECHNICAL GO remains valid.**  
**TRITON VISUAL DIFFERENTIATION verdict is REOPENED.**

Sophie production remains paused until Karen / Triton differentiation is confirmed or corrected.
