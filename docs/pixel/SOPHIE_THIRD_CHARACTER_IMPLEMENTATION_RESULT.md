# Sophie Third Character Validation — Implementation Result

## Status

**Branch:** `pixel-sophie-steady-hands-validation`  
**Draft PR:** #23  
**Identity:** Sophie — STEADY HANDS  
**Visual authority:** Sophie Chibi Direction Lock v1  
**Acting authority:** Sophie Acting Reference v1  
**Technical status:** **PASS**  
**Final character status:** **USER VALIDATION PENDING**

## Approved visual source

Current 48×48 technical source:

`docs/pixel/reference/sophie_chibi_direction_lock_v1_48.png`

- source atlas: 192×48
- cell: 48×48
- order: down / left / right / up
- SHA-256: `3291a1331fb1a41d85bd023e2f9907e798926746c856c92c63c7eb5aa26c3e36`

The source is derived from the user-approved Sophie design direction and must not be treated as permission to redesign Sophie.

## Four directions

Technical source includes:

1. Front / down
2. Left
3. Right
4. Back / up

The four directions preserve:

- honey / light golden-brown hair;
- compact adult silhouette;
- cream-dominant clothing;
- muted green accents;
- visible hand-focused identity;
- smaller spatial footprint than Karen / Triton.

## Eight animation categories

Committed runtime assets now exist for:

1. Idle — 4 frames
2. Walk — 6 frames
3. Turn — 3 frames
4. Talk — 4 frames
5. Surprise — 4 frames
6. Approach — 4 frames
7. Laugh — 6 frames
8. Run — 6 frames

Runtime sheets are generated deterministically from the locked Sophie source.

Sophie-specific motion rules:

- smaller step / bounce amplitude than Karen;
- lighter body weight than Triton;
- hands carry Talk / Approach / Surprise;
- Laugh remains warm but compact;
- Run remains urgent without Karen-level whole-body bounce;
- lower hair / clothing lag is restrained.

## Runtime metadata

`js/data/animations.js` now registers Sophie beside Karen and Triton.

Shared architecture:

- 48×48 source
- anchor `[24,44]`
- 32px logical world
- shared eight category names

Sophie-specific identity remains separate through face, silhouette, body scale, color mass and motion personality.

## Actual-game comparison

Browser validation places locked Karen, locked Triton and Sophie together in the actual v23 village scene.

Evidence:

- `sophie_karen_triton_idle_medium.png`
- `sophie_medium_walk.png`
- `sophie_medium_talk.png`
- `sophie_medium_laugh.png`
- `sophie_medium_run.png`

At Medium44:

- Karen reads as forward / red / active;
- Triton reads as dark-haired / broad / planted;
- Sophie reads as honey-haired / cream-green / smallest and softer;
- Sophie remains visible against the village background;
- Sophie does not read as a Karen or Triton recolor.

## Scale validation

Evidence:

- `sophie_scale_full_idle.png`
- `sophie_scale_medium_idle.png`
- `sophie_scale_compact_idle.png`

All three render modes execute successfully:

- Full48 = 1.0
- Medium44 = 44 / 48
- Compact41 = 41 / 48

Medium44 remains the default comparison condition.

## Regression / control integrity

Full regression workflow:

**Gray Crown Triton Completion CI — run 37519907901**

Result:

# **SUCCESS**

Tested head:

`d3c89af41285ec56fcf3b953c85aee496f1deda0`

Artifact:

- id: **11439257252**
- digest: `sha256:72cfe2e5eb80268601ff19c1b33b2f615408b115826574f33eb1704fff6f24e1`

Verified:

- repository hygiene: PASS
- production baseline / authority: PASS
- Karen visual regression control: PASS
- Triton Direction Lock: PASS
- Triton deterministic runtime integrity: PASS
- JavaScript syntax: PASS
- Node regression: PASS
- all browser gates: PASS
- Sophie actual-game comparison: PASS
- Sophie eight-animation browser sequence: PASS
- Sophie 48 / 44 / 41 scale: PASS
- control restoration: PASS
- Save schema remains 23

Sophie-specific technical CI also passed:

**Gray Crown Sophie Character Validation CI — run 37519908085 — SUCCESS**

## Decision boundary

Technical validation is complete.

Automation does not decide the final character-design verdict.

The next required human decision is:

# **Sophie Character Validation — PASS / REVISE**

PASS authorizes Margaret Front Idle work.

REVISE keeps work on Sophie only.

Environment production remains paused in either case until all four protagonists pass.
