# Sophie Chibi Direction Lock v1

## Status

**Character:** Sophie — STEADY HANDS  
**Visual status:** **USER APPROVED / LOCKED**  
**Branch:** `pixel-sophie-steady-hands-validation`

This lock supersedes all older Sophie front candidates v1 / v2 / v3 as active visual authority.

## Approved user references

Direction / four-view reference:

- uploaded image: `ソフィーの冒険者スプライトシート.png`
- SHA-256: `c3b796ec55b8a54bd413e17f326f256ce3e2869c99c70968f3b7523955a530bc`

Acting / eight-animation reference:

- uploaded image: `ソフィーの癒し手アニメーションシート.png`
- SHA-256: `b1bec435fbdfba0faa2212e66a965cbe2c492e7e4d7d20df608124c7e2366ec5`

## 48×48 technical source

Current production translation source:

`docs/pixel/reference/sophie_chibi_direction_lock_v1_48.png`

- dimensions: 192×48
- cell: 48×48
- order: down / left / right / up
- SHA-256: `3291a1331fb1a41d85bd023e2f9907e798926746c856c92c63c7eb5aa26c3e36`
- derived mechanically from the approved four-view design

This technical source may receive cleanup for pixel readability, but must not redesign Sophie.

## Locked identity

Preserve:

- 23 years old;
- 158cm / smallest protagonist;
- soft standard build;
- honey / light golden-brown hair;
- warm off-white / cream clothing mass;
- muted green accent;
- visible hands as primary identity hook;
- calm / kind / reassuring;
- stubborn where life is concerned;
- protagonist-grade cute Chibi face;
- layered honey-hair mass;
- practical gathered / braided hair structure;
- cream + brown leather + muted green palette;
- treatment/travel utility around waist and hands;
- small adult silhouette;
- hand-focused posing and acting.

## Historical candidates

These are no longer active authority:

- `sophie_steady_hands_front_candidate_v1_48.png`
- `sophie_steady_hands_front_candidate_v2_48.png`
- `sophie_steady_hands_front_candidate_v3_48.png`

## Control characters

Karen and Triton remain untouched.

- Karen = Visual Regression Control
- Triton = completed locked control

## Current implementation phase

Visual direction is locked.

Authorized now:

1. generate all eight Sophie runtime sheets from the 48×48 source;
2. preserve Sophie-specific hand-focused acting;
3. wire runtime metadata;
4. compare Karen / Triton / Sophie in gameplay;
5. validate Full48 / Medium44 / Compact41;
6. run full regression / CI;
7. determine Sophie Character Validation PASS.

Margaret and Environment remain paused.
