# Triton Second Character Validation — Final Result

## Status

**Branch:** `pixel-karen-triton-face-differentiation-fix`  
**Draft PR:** #22  
**Visual source:** **Triton Chibi Direction Lock v1**  
**Source atlas:** `docs/pixel/reference/triton_chibi_direction_lock_v1.png`  
**Source architecture:** 48×48 RGBA cells  
**Logical world:** 32px tile  
**Selected prototype screen occupancy:** **44px Medium**  
**Design identity:** Triton A — GROUND ANCHOR  
**Decision:** **TRITON SECOND CHARACTER VALIDATION PASS**  
**Production main merge:** NOT PERFORMED  
**Pixel-native formal adoption:** NOT YET

## Visual lock

The user-approved Triton direction is now the authoritative Triton visual direction.

Do not reopen old v2 / v3 / v4 face-repair directions unless the user explicitly reopens Triton design.

The approved direction preserves:

- protagonist-grade Chibi readability;
- dark unbound heavy hair;
- broader shoulders than Karen;
- low center of gravity;
- planted stance;
- off-white / gray main mass;
- faded-blue horizontal waist / side mass;
- calm but readable face;
- reliable / strong / grounded / approachable first impression.

Karen remains unchanged.

## Four-direction Idle

The approved lock is normalized to a 192×48 atlas in:

`docs/pixel/reference/triton_chibi_direction_lock_v1.png`

Compatibility alias:

`docs/pixel/reference/triton_idle_4dir_v1.png`

Both are byte-identical and use:

1. down
2. left
3. right
4. up

The four directions preserve Triton's heavy hair mass, shoulder width and low-center stance.

## Eight animation categories

Committed runtime sheets:

1. Idle — 4 frames
2. Walk — 6
3. Turn — 3
4. Talk — 4
5. Surprise — 4
6. Approach — 4
7. Laugh — 6
8. Run — 6

All eight committed sheets match deterministic regeneration from the approved lock.

Triton motion remains character-specific:

- Idle: low amplitude;
- Walk: reduced vertical bounce;
- Talk: restrained body axis;
- Surprise: compact rather than jumping;
- Approach: weight-committed;
- Laugh: broad but planted;
- Run: visible weight;
- Hair: heavy mass with tip-focused lag.

## Karen / Triton actual-game comparison

Browser evidence places Karen and Triton together in the live game scene at matched camera framing.

At Medium44:

- Karen remains forward / light / red-haired / vertically active;
- Triton remains planted / dark-haired / broader / horizontally stable;
- Triton does not read as a Karen recolor;
- Triton remains visible against the village background;
- both read as protagonist-class characters from the same game.

Evidence includes:

- `triton_karen_idle_medium.png`
- `triton_medium_walk.png`
- `triton_medium_talk.png`
- `triton_medium_laugh.png`
- `triton_medium_run.png`

## Scale verdict

### Full48
Useful for maximum facial and clothing detail, but more dominant against the 32px world.

### Medium44
# **SELECTED**

Medium44 preserves Triton's face, dark-hair silhouette, shoulder width and blue waist mass while fitting the existing world better.

### Compact41
Retained as fallback. It fits the world more tightly but gives up more protagonist and face readability.

Evidence:

- `triton_scale_full_idle.png`
- `triton_scale_medium_idle.png`
- `triton_scale_compact_idle.png`

## Karen Visual Regression Control

Karen remained completely unchanged.

CI verifies the approved Karen source plus all eight Karen runtime PNG Git blobs before and after the full test suite.

Result:

# **9 / 9 KAREN VISUAL BLOBS UNCHANGED**

Karen remains the Visual Regression Control.

## Final CI evidence

Workflow:

**Gray Crown Triton Completion CI**

Run:

**37436833623 — SUCCESS**

Tested head:

`69d01fba95d8f18b7d1eeacfb7f7a3de96f8a5e4`

Artifact:

- id: **11398669794**
- name: `gray-crown-triton-completion-evidence`
- digest: `sha256:0e67a662aece3df4cf95a25a15b728b6eeefd9961f7de2c7acc9c4d731558d9c`

Verified:

- repository hygiene: PASS
- project authority: PASS
- Karen lock before work: PASS
- Triton Direction Lock: PASS
- eight runtime sheets: PASS
- deterministic regeneration equality: PASS
- mechanical Karen / Triton four-direction evidence: PASS
- Node regression: PASS
- V21 browser gate: PASS
- Frontier Section 1: PASS
- Frontier Section 2: PASS
- Developer Mode: PASS
- Karen prototype browser gate: PASS
- Karen scale browser gate: PASS
- Triton actual-game / eight-animation / scale browser gate: PASS
- control restoration: PASS
- Karen lock after work: PASS
- Save schema remains 23

## Final decision

# **TRITON SECOND CHARACTER VALIDATION PASS**

Karen and Triton now demonstrate that the same Pixel Actor system can support two protagonist characters that differ in:

- face;
- silhouette;
- shoulder width;
- center of gravity;
- hair structure;
- color mass;
- standing pose;
- movement amplitude;
- animation personality;

without changing the 48×48 source architecture or the 32px logical world.

## Next phase

Update Pixel Character Standard v1 from the completed two-character evidence.

After that:

> **Sophie — STEADY HANDS**

starts with one front-facing Idle visual candidate only.

Do not begin Sophie four-direction or eight-animation work before user visual approval.
