# Margaret Runtime Integration Result v2

## Status

**MARGARET v5 RUNTIME PROTOTYPE INTEGRATION ACTIVE — PROTOTYPE ONLY**

Branch: `pixel-margaret-fourth-character-front-gate`  
Draft PR: #29

This document supersedes the earlier v1/v3/v4 runtime notes for the active Margaret prototype.

It does not authorize merge to `main` and does not make whole-game Pixel-native adoption final.

## Why v5 is active

The v3/v4 occupancy work proved that Margaret needed comparable Medium44 presence beside Karen, Triton and Sophie, but the later head-resampling approach crushed facial readability.

v5 corrects that specific failure:

- the approved face/head pixels are preserved at 1:1;
- body occupancy is corrected below the face;
- the external silhouette is strengthened without filling internal face/hair gaps;
- the simple high ponytail remains the primary silhouette hook;
- the shared 44px runtime scale remains unchanged.

## Active source

`docs/pixel/reference/margaret_chibi_direction_lock_v5_48.png`

Technical contract:

- 192×48 RGBA;
- four 48×48 direction cells;
- order: down / left / right / up;
- foot-anchor family: [24,44];
- deterministic source reproduction checked by CI;
- source and runtime hashes pinned by `tools/verify_margaret_direction_lock.py`.

## Active runtime assets

The shared eight animation categories are regenerated from v5 and synchronized to:

- `assets/characters/margaret/margaret_idle.png`
- `assets/characters/margaret/margaret_walk.png`
- `assets/characters/margaret/margaret_turn.png`
- `assets/characters/margaret/margaret_talk.png`
- `assets/characters/margaret/margaret_surprise.png`
- `assets/characters/margaret/margaret_approach.png`
- `assets/characters/margaret/margaret_laugh.png`
- `assets/characters/margaret/margaret_run.png`

Runtime metadata remains registered in `js/data/animations.js`.

## Cast-wide exact-pixel quality state

The active four-protagonist quality evidence measures the front Medium44 visible footprint as:

| Character | Visible width | Visible height |
| --- | ---: | ---: |
| Karen | 24 px | 40 px |
| Triton | 26 px | 40 px |
| Sophie | 30 px | 39 px |
| Margaret v5 | 28 px | 40 px |

The goal is not identical width. The important result is one protagonist-scale band without Margaret's earlier accidental undersizing, while preserving four distinct silhouettes.

## Validation

The harmonized prototype gate verifies:

- Karen immutable visual regression control;
- Triton direction lock;
- Sophie v2 technical-cleanup lock;
- Margaret v5 direction/runtime lock;
- Margaret v5 deterministic source reproduction;
- exact-pixel Medium44 front / face / grayscale / silhouette / four-direction evidence;
- numeric occupancy, face-contrast and silhouette metrics;
- all eight runtime categories for all four protagonists;
- Sophie browser E2E;
- Margaret browser E2E;
- full Gray Crown `npm run check`;
- immutable-control re-verification after runtime testing.

One complete regression retry is allowed only for the known intermittent frontier browser pathing flake. A deterministic second failure remains a true failure.

## Still unresolved

No change to these unresolved items:

- exact eye color;
- final fourth-character palette;
- surname;
- final weapon;
- final hero costume;
- magic visual language;
- heraldry / religious / certification marks;
- formal whole-game Pixel-native adoption;
- final Portrait policy;
- main merge.

## Next technical phase

After the final harmonization gate is green, proceed to **Four Protagonist Environment Integration** against:

- Ryune village;
- grass field / road;
- house exterior;
- house interior.

That environment gate must use the exact committed runtime PNGs before any formal adoption decision.
