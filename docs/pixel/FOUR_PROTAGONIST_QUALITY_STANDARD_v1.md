# Gray Crown — Four Protagonist Quality Standard v1

**Status:** ACTIVE PROTOTYPE QUALITY GATE  
**Scope:** Karen / Triton / Sophie / Margaret field-event Pixel Actors  
**Branch:** `pixel-margaret-fourth-character-front-gate`  
**Main:** unchanged; no merge authority is granted by this document.

## Purpose

The four protagonists must stop being judged one at a time. From this point, they are reviewed as one authored cast.

The objective is not identical anatomy. The objective is:

> **equal production quality, equal small-scale readability, distinct identity, one visual language.**

Karen, Triton, Sophie and Margaret may keep different height, width, stance, hair mass and acting amplitude. They may not look as though they came from different production pipelines.

## Non-negotiable evidence rule

Every comparison board is composed mechanically from the actual PNG files being evaluated.

Allowed:
- exact PNG load;
- exact frame crop;
- nearest-neighbor resize;
- grayscale conversion;
- alpha/silhouette extraction;
- deterministic labels/backgrounds outside sprite pixels;
- numeric pixel analysis.

Forbidden:
- AI redraw inside comparison evidence;
- beautification;
- interpolation/smoothing;
- replacing committed controls with presentation art;
- editing one character during the act of comparison.

Image generation may be used only for separate concept-direction references, never as comparison proof.

## Review axes

Every character is judged on the same seven axes.

### 1. Face readability
At Medium44, the face must remain readable as a face rather than a compressed color block.

Review:
- eye separation;
- face/hair separation;
- brow/eye/mouth hierarchy where present;
- internal contrast;
- absence of destructive resampling.

### 2. Apparent occupancy at Medium44
The visible figure must occupy a believable protagonist-scale area.

Equal quality does not mean equal height, but no protagonist may look accidentally miniature or oversized because of transparent padding.

### 3. Head/body balance
The cast shares a Chibi grammar.

Character-specific anatomy is allowed, but:
- head size must remain protagonist-grade;
- torso mass must survive at 44px;
- adult identity must come from posture/clothing/acting, not from making one character a different sprite genre.

### 4. Outline / separation
Pale hair, dark hair, skin, clothing and hands must remain readable on both light and mid-value backgrounds.

External silhouette should be strong enough to separate the actor from the field without turning internal facial gaps into heavy borders.

### 5. Hair silhouette identity
Before costume detail is read, the hair mass should separate the four:
- Karen: low partial tie + loose active hair;
- Triton: heavy shoulder-length mass;
- Sophie: gathered/braided honey hair;
- Margaret: simple high ponytail / pale vertical elegance.

### 6. Four-direction stability
Down / left / right / up must remain the same person:
- compatible occupied scale;
- consistent head mass;
- stable foot grounding;
- hairstyle readable from appropriate directions;
- no direction with an accidental size or detail collapse.

### 7. Eight-animation integrity
Idle / Walk / Turn / Talk / Surprise / Approach / Laugh / Run must:
- exist at the shared frame budget;
- preserve the character's visual identity;
- remain readable at Medium44;
- use character-specific acting rather than copied motion language.

## Shared technical contract

- source frame: 48×48 RGBA;
- directions: down / left / right / up;
- logical world: 32px;
- default prototype render: Medium44;
- foot-anchor family: [24,44] unless separately justified;
- nearest-neighbor presentation;
- exact eight animation categories.

## Quality target bands

These are guardrails, not anatomy templates.

At Medium44, a protagonist front frame should normally:
- retain a visible height of roughly 34–43 px;
- retain a visible width of roughly 18–36 px, with character-specific exceptions documented;
- keep the visible figure grounded near the lower part of the cell;
- retain non-trivial face-region contrast and multiple dark detail pixels;
- preserve enough palette separation that face/hair/body do not collapse into one value mass.

A metric outside a target band is a review trigger, not automatic permission to distort a canonical body.

## Cast-level requirement

A character passes only if:
1. their own sprite is readable;
2. the four-character board reads as one game;
3. their silhouette remains individually identifiable;
4. no other protagonist must be degraded to make them fit;
5. the full existing regression suite remains green.

## Locked controls and active prototype authority

- Karen remains the permanent Visual Regression Control until explicitly reopened.
- Triton remains a locked control.
- Sophie remains USER APPROVED / LOCKED; the active technical source is Direction Lock v2, which removes detached micro-pixel debris without redesigning the approved identity.
- Margaret v4 is historical and retired because the Medium44 face was rejected as too crushed.
- Margaret v5 is the active prototype source and runtime authority on this branch. It preserves the face/head pixels at 1:1 and the eight runtime categories are regenerated from that source.

From this point onward, the four-character quality phase must not silently rewrite any of these active sources. Any subjective visual redesign requires a new candidate gate and explicit review before promotion.

## Promotion sequence

The first harmonization pass has completed this sequence for Sophie v2 and Margaret v5:

1. Generate cross-character evidence and metrics.
2. Record cast-level review result.
3. Produce candidate corrections only where evidence identifies a real defect.
4. Rebuild the exact same evidence from candidates.
5. Obtain/retain the required visual authority for identity-changing decisions.
6. Promote source locks.
7. Regenerate the eight runtime animations where the source changed.
8. Run browser E2E + full `npm run check`.
9. Re-verify immutable controls.

After the final harmonization CI is green, the next technical gate is four-protagonist environment integration. This still does not authorize main merge or formal Pixel-native adoption.

## Main merge rule

This document does not authorize main merge.

Pixel-native adoption, Source-of-Truth reconciliation and main merge remain separate explicit decisions.
