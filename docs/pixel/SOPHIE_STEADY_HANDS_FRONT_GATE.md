# Sophie — STEADY HANDS Front Idle Validation

## Status

**Branch:** `pixel-sophie-steady-hands-validation`  
**Character:** Sophie — STEADY HANDS  
**Phase:** front-facing visual design only  
**v1:** **VISUAL REVISE**  
**v2:** **USER VISUAL REVIEW PENDING**  
**Four-direction / animation production:** NOT AUTHORIZED

## Current candidate

`docs/pixel/reference/sophie_steady_hands_front_candidate_v2_48.png`

The v2 candidate is a 48×48 RGBA front-only source candidate.

It intentionally raises the visual-density and protagonist-quality bar over v1 while keeping Sophie's locked identity.

Exact eye color remains unresolved canon. The neutral iris pixels in the candidate are provisional readability pixels only.

## Why v1 was revised

v1 preserved the broad identity but was too simple compared with locked Karen and Triton.

The problem was not STEADY HANDS itself.

The problem was:

- face readability too low;
- hair mass too simple;
- costume hierarchy too plain;
- protagonist-grade visual density below Karen / Triton;
- hand-focus insufficiently attractive at gameplay scale.

Therefore v1 must not be expanded to four directions or animation.

## v2 target

Sophie remains:

- 23-year-old adult woman;
- 158cm, smallest hero;
- soft standard body;
- honey / light golden-brown hair;
- gentle slightly drooping eyes;
- off-white / cream dominant clothing;
- muted green concentrated around wrists / hands / practical treatment storage;
- one low soft bundle / braid;
- calm posture;
- hands as the primary acting hook;
- kind, reassuring, but immovable where life is concerned.

## Quality rule

Sophie must not be made visually simpler merely to differentiate her.

All protagonists must occupy the same **Visual Quality Tier**.

Difference must come from identity, not from lower detail or lower face quality.

## Required contrast

### Karen — VILLAGE RUNNER
- forward;
- light;
- active;
- red-haired;
- whole-body emotional energy.

### Triton — GROUND ANCHOR
- broad;
- planted;
- low center;
- dark heavy hair;
- horizontal stability.

### Sophie — STEADY HANDS
- smallest footprint;
- softer rounded body;
- honey hair;
- calm face;
- hand-focused attention;
- cream + restrained green.

## Mechanical comparison rule

Karen and Triton must never be regenerated for comparison.

Evidence is built only from:

- `docs/pixel/reference/karen_chibi_direction_v1.png`
- `docs/pixel/reference/triton_chibi_direction_lock_v1.png`
- `docs/pixel/reference/sophie_steady_hands_front_candidate_v2_48.png`

Allowed operations:

- crop;
- nearest-neighbor resize;
- grayscale;
- silhouette;
- deterministic labels / layout.

Image-generation comparison boards are prohibited.

## Acceptance Gate

User reviews:

1. face quality vs Karen / Triton;
2. protagonist-grade cuteness at 48px;
3. readability at Medium44;
4. distinct face before hair color;
5. honey-hair silhouette;
6. small adult body without child read;
7. cream + green hierarchy;
8. both hands readable;
9. STEADY HANDS identity;
10. no generic healer / nun shorthand;
11. same-game Pixel Artist feel;
12. no quality-tier drop.

Decision:

# **Sophie Front — PASS / REVISE / FAIL**

Only PASS authorizes:

front lock  
→ left / right / back  
→ four-direction atlas  
→ eight Sophie-specific animations  
→ Karen / Triton / Sophie gameplay comparison  
→ Full48 / Medium44 / Compact41  
→ full CI  
→ Standard update.

Margaret and environment production remain paused.
