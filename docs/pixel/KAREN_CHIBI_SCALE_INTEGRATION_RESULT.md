# Gray Crown — Karen Chibi Scale Integration Result

## Status

**Branch:** `pixel-karen-chibi-scale-integration`  
**Visual source:** Karen Chibi Direction Lock v1  
**Source architecture:** 48×48 cell  
**Logical world:** 32px tile  
**Selected prototype screen occupancy:** **44px Medium**  
**Decision:** **GO TO SECOND CHARACTER**  
**main merge:** NOT PERFORMED  
**Pixel-native formal adoption:** NOT YET

---

# 1. Purpose

This phase re-runs world-scale integration using the new approved Chibi Karen.

Old Phase 2 / old realistic-proportion Karen scale conclusions are not reused as visual evidence.

The test asks:

> Can Karen retain the 48px source-cell acting information while fitting Rynne Village naturally enough to proceed to a second-character reproducibility test?

---

# 2. Conditions compared

All conditions use the same Karen + Mika scene, same map, same camera, same dialogue and same Chibi Karen animation assets.

## A — Full

- source cell: 48×48
- render scale: 1.0
- approximate screen body occupancy: 48px class

## B — Medium

- source cell: 48×48
- render scale: 44 / 48
- approximate screen body occupancy: **44px class**

## C — Compact

- source cell: 48×48
- render scale: 41 / 48
- approximate screen body occupancy: 41px class

## D — Existing baseline

- legacy 32px Karen
- retained only as a non-destructive comparison

No alternate animation assets were created for the scale modes.

---

# 3. Foot-anchor implementation

Scaling is performed around the existing Karen foot anchor:

`[24,44]`

The logical tile remains 32px.

The renderer computes scaled destination width/height and derives the draw origin from the same world-space foot position.

This prevents scale mode changes from moving Karen's feet off the logical ground point.

Unit tests verify horizontal and vertical foot-anchor drift remains within rounding tolerance.

---

# 4. World Integration

## 48 Full

### Strengths

- strongest face readability
- strongest red-hair presence
- easiest to read clothing and small acting details

### Weakness

Karen remains too dominant relative to:

- Mika
- ordinary village NPCs
- road furniture
- fences / barrels / well-scale objects
- existing building proportions

The result still carries a visible "higher-resolution actor placed into a smaller world" feeling.

**Verdict: not selected.**

## 44 Medium

### Strengths

- visibly reduces the separate-scale feeling of Full
- Karen remains immediately findable as protagonist
- face remains readable
- red hair remains the primary hook
- low partial tie remains readable
- off-white + muted-red color mass remains clear
- Chibi proportions remain intact
- animation states remain visibly different
- enough visual separation from generic NPCs without making Karen feel like a giant

### Weakness

Karen is still richer and somewhat larger than old generic NPCs.

That is expected in this prototype because NPCs are intentionally not being redesigned during Karen validation.

The remaining mismatch is small enough to test system reproducibility with a second hero rather than redesign Karen again.

**Verdict: selected prototype candidate.**

## 41 Compact

### Strengths

- best raw fit with the existing 32px village population
- lowest world-scale mismatch

### Weakness

The reduction starts to cost the qualities that justified the 48px source architecture:

- facial read becomes weaker
- low tie / loose-hair distinction becomes less immediate
- limb acting becomes smaller
- fine red-hair silhouette breaks compress toward a denser mass
- Karen loses some protagonist presence

**Verdict: useful fallback, not selected.**

---

# 5. Karen Identity

At 44 Medium, the following remain readable at normal gameplay framing:

- Chibi large-head / compact-body grammar
- protagonist-focused face
- red / red-brown hair
- large clean hair mass
- low partial tie + loose hair
- warm off-white sleeves
- muted-red short vest
- compact boots / lower body
- forward, active impression
- approachable VILLAGE RUNNER identity

The scale change does not require a new Karen design.

---

# 6. Acting Readability at 44

44 Medium was checked in the existing scene for:

- Walk
- Talk
- Laugh
- Run

The remaining categories continue to use the same runtime animation set:

- Idle
- Turn
- Surprise
- Approach

## Walk

PASS.

Karen still reads as moving rather than sliding.

The compact Chibi body and red-hair mass retain enough movement to read at village scale.

## Talk

PASS.

The actor remains visibly in a speaking state without needing Portrait support.

## Laugh

PASS.

The larger whole-body reaction remains readable after reduction.

## Run

PASS.

The stronger forward movement / hair lag remains visible and distinct from Walk.

No animation category was added or replaced for the scale test.

---

# 7. Portrait comparison at 44

## Portrait OFF

**Current provisional preference.**

Reasons:

- attention remains on Karen and Mika in the village
- the Chibi actor remains the emotional focal point
- speaker identification remains clear through the name field
- less style competition on screen

## Portrait ON

Technical PASS.

However the existing portrait uses a visibly different character rendering language from the Chibi Pixel Actor and pulls attention away from the in-world acting.

### Decision

Portrait system is **not deleted**.

For Pixel-native prototype evaluation:

> **Portrait OFF remains provisionally preferred.**

Final Portrait policy is still unresolved.

---

# 8. 32px baseline comparison

The old 32px baseline still has useful strengths:

- simple world integration
- compact footprint
- low visual noise

The new Karen 44 Medium is preferred because it adds:

- much stronger face readability
- stronger Karen-specific hair identity
- clearer Chibi heroine appeal
- more readable acting
- more protagonist presence

while avoiding most of the Full 48 scale mismatch.

The relevant result is not "48 is better because it has more detail."

The result is:

> **48×48 source architecture rendered at approximately 44px gives a better balance than either Full 48 or the old 32px baseline for Karen.**

---

# 9. Technical Regression

Final successful workflow:

- GitHub Actions run: **37386602760**
- tested head: **4f12fb96c43ea7b46745d3e1db854eaea1f45c16**
- conclusion: **SUCCESS**

Verified:

- Karen Chibi Integration gate: PASS
- Karen Chibi Scale Integration gate: PASS
- Node regression: **54 / 54 PASS**
- V21 Browser Gate: PASS
- Alpha2 Frontier Section 1 E2E: PASS
- Alpha2 Frontier Section 2 E2E: PASS
- Developer Mode E2E: PASS
- Karen Chibi Integration E2E: PASS
- Scene completion: PASS
- control restoration: PASS
- Save schema remains 23
- logical tile remains 32
- all eight Karen animation categories remain unchanged

---

# 10. Evidence

Final artifact:

- artifact id: **11379761450**
- name: `karen-pixel-prototype-evidence`
- digest: `sha256:713090d4e13519a92e26c5d8e63e7f74617e98a81084d088d52200c177f123f6`

Scale comparison:

- `karen_chibi_scale_full_laugh.png`
- `karen_chibi_scale_medium_laugh.png`
- `karen_chibi_scale_compact_laugh.png`
- `karen_chibi_scale_32_baseline_laugh.png`

44 acting evidence:

- `karen_chibi_scale_medium_walk.png`
- `karen_chibi_scale_medium_talk.png`
- `karen_chibi_scale_medium_laugh.png`
- `karen_chibi_scale_medium_run.png`

44 dialogue evidence:

- `karen_chibi_scale_medium_portrait_off.png`
- `karen_chibi_scale_medium_portrait_on.png`

---

# 11. Remaining issues

The following remain deliberately unresolved:

- whether 44-class display becomes the final game-wide player-character standard
- whether other heroes use the exact same screen occupancy
- how much future generic NPC art should be upgraded
- final Portrait policy
- final production animation polish

These questions must not be answered from Karen alone.

---

# 12. Decision Gate

# **GO TO SECOND CHARACTER**

Karen now satisfies the prototype gate:

- Visual direction: PASS
- 8-animation runtime: PASS
- World integration: PASS at 44 Medium
- Karen identity: PASS
- Acting readability: PASS
- Portrait OFF scene readability: PASS
- Regression: PASS

This does **not** mean Pixel-native is formally adopted across Gray Crown.

It means Karen has proven enough of the system to proceed to reproducibility testing.

---

# 13. Next authorized phase

> **Triton Second Character Validation**

Purpose:

> Verify that the same Pixel Visual Language and 48px-source / ~44px-screen approach can represent a character with a substantially different silhouette, body weight, posture and personality.

Do not begin Sophie or Margaret at the same time.

Do not redesign Karen again unless Triton exposes a system-level problem.
