# KAREN_VISUAL_ACCEPTANCE_GATE.md

## Gray Crown — Karen Visual Anchor Redesign Acceptance Gate

**Branch:** `pixel-karen-visual-anchor-redesign`  
**Evaluated visual:** first 32px-anchor redesign at HEAD `5efa63a58d4790ba9e120686c985b5aaeb27b84a`  
**Technical architecture:** GO  
**Visual verdict:** **VISUAL PASS (SECOND REVIEW) — CURRENT-HEAD CI PENDING**  
**Scale Integration:** NOT STARTED  
**Triton:** NOT STARTED  
**main merge:** PROHIBITED

---

# 1. CI status

The first GitHub Actions attempts for this visual-redesign branch did not execute test steps.

They completed with the job in **cancelled** state before any step ran.

Therefore:

- this is **not evidence of a code/test regression**
- it is also **not a current-HEAD regression PASS**
- the last full technical baseline on parent branch `pixel-karen-acting-prototype` at `5b772ba6...` remains green
- the acceptance verdict below is a **visual verdict**, not a replacement for the pending current-branch CI rerun

A rerun has been requested. No visual PASS is being inferred from CI.

---

# 2. Evidence reviewed

Reviewed directly:

- legacy 32px Karen
- redesigned 48px Karen front
- redesigned 48px Karen left/right side
- redesigned 48px Karen back
- Karen + village background scale-context mock using the same Phase 2 scene framing
- Portrait OFF scene context
- Portrait ON scene context
- Walk frames
- Approach frames
- Laugh frames
- Run frames
- Surprise frames

The redesign assets are deterministic and generated from the branch's current 48px generator.

---

# 3. Face

## PASS

- head no longer reads as the Phase 2 square block
- face is much more compact
- adult/chibi balance is better
- front face reads more immediately as a heroine
- side profile is substantially improved from Phase 2

## Remaining issue

During Laugh, the dark horizontal mouth becomes visually too heavy.

At enlarged inspection it can dominate the face and partially undo the compact/cute face improvement.

The side profile also remains slightly rigid around nose/mouth projection.

**Face result: REVISE SMALL.**

---

# 4. Hair

## PASS

- red / red-brown reads before equipment
- main hair mass is cleaner than Phase 2
- hair is no longer primarily a brown helmet block
- loose hair structure is readable
- overall color is more protagonist-like

## Remaining issue

The low partial tie is readable, but the tie/tail shape is still too rectangular and detached-looking in some views.

It should read as a small silhouette hook, not a block attached to the head.

**Hair result: REVISE SMALL.**

---

# 5. Body

## PASS

- torso is no longer a heavy box
- off-white sleeves lighten the body
- muted-red vest reads as short
- belt location is clear
- legs are separated
- pants and boots do not merge into one black mass
- healthy build is preserved
- body is not excessively thin

**Body result: PASS.**

---

# 6. Color mass

The intended read works:

1. red hair
2. face
3. off-white
4. short muted-red vest
5. separated lower body

The sword/pouch are secondary.

**Color result: PASS.**

---

# 7. 32px anchor comparison

The redesign is much closer to the 32px anchor's strengths than Phase 2.

It successfully recovers:

- simplification
- lighter body
- cleaner silhouette
- stronger red-hair read
- more readable protagonist color mass

However the gate is not merely “better than Phase 2.”

The required standard is:

> 48px appeal >= legacy 32px appeal  
> AND  
> 48px acting capacity > legacy 32px acting capacity

The new 48px is close, but the face/tie issues prevent calling the attractiveness advantage decisive yet.

**32 vs 48 result: REVISE.**

---

# 8. Acting

## Walk
Readable. Body and leg rhythm remain coherent.

## Approach
Forward/social energy is visible when combined with runtime movement. The pose itself remains controlled.

## Laugh
Whole-body expression is present and clearly stronger than 32px, but the mouth treatment needs one small correction.

## Run
The design remains stable across frames. Hair and lower body remain recognizable.

## Side motion
No Phase 2-level facial collapse, but side face can be simplified one step further.

**Acting result: PASS WITH FACE REVISION.**

---

# 9. Portrait

Portrait OFF continues to support the Pixel-native objective better:

- attention remains on the game actor
- the scene feels less split between portrait and world
- speaker name still identifies the speaker

Portrait ON still improves explicit facial readability but competes with Pixel Acting and has a style mismatch with the prototype actor.

**No Portrait system deletion. No formal lock yet.**

---

# 10. Verdict

# **VISUAL REVISE**

This is **not** a root-level redesign failure.

Do not reopen:

- body structure
- costume structure
- animation categories
- SceneRunner
- 48×48 source architecture

Fix only:

1. Laugh / open-mouth weight
2. low partial-tie blockiness
3. side-profile nose/mouth rigidity
4. overly flat hair-highlight stripe where it contributes to blockiness

Then rerun the same Visual Acceptance Gate.

Do not begin Scale Integration until the revised 48px passes.

Do not begin Triton.


---

# 11. Second visual review — minimal revision

**Re-evaluated HEAD:** `af6dc894cb43914d2ea52e7a18904d8d0f4bab34`

Only the issues identified by the first VISUAL REVISE were changed:

- Laugh / open-mouth weight reduced
- low partial tie reduced and integrated into the hair silhouette
- side-profile nose / mouth projection reduced
- hair highlight changed from a flat rectangular stripe to a stepped highlight

No change was made to:

- body / costume structure
- 48×48 source architecture
- animation category count
- SceneRunner
- map / collision / Story / Save
- Portrait system
- Triton / Sophie / Margaret

## Face — SECOND REVIEW

The face now stays compact in normal and Laugh frames.

- neutral mouth is small
- Laugh mouth no longer dominates the lower face
- side profile no longer reads as a protruding snout
- front face preserves adult/cute balance

**Face result: PASS.**

## Hair — SECOND REVIEW

- main red-hair mass remains clean
- the partial tie is now a small hook rather than a block
- loose hair remains readable
- highlight contributes direction without flattening the head

**Hair result: PASS.**

## Body / color — SECOND REVIEW

No reopening was necessary.

The previously passing items remain passing:

- short muted-red vest
- visible warm off-white shirt
- separated legs
- separated pants / boots
- healthy middle build
- secondary equipment mass

**Body result: PASS.**  
**Color result: PASS.**

## 32px anchor comparison — SECOND REVIEW

At equal visible-height inspection, the revised 48px now retains the old 32px strengths while adding a materially stronger identity:

- compact face
- readable red-hair silhouette
- clearer Stage A color mass
- stronger adult protagonist read
- low partial tie
- more expressive limbs
- more room for whole-body acting

The 32px version remains lighter and simpler, but no longer has a clear attractiveness advantage.

Current visual judgement:

> **48px appeal >= 32px appeal**

while the existing animation space continues to provide:

> **48px acting capacity > 32px acting capacity**

**Anchor comparison result: PASS.**

## Acting — SECOND REVIEW

Direct frame-sequence inspection confirms that the revised visual remains stable through:

- Walk
- Approach
- Laugh
- Run
- Surprise

The face, hair mass, tie, torso and lower-body separation remain recognizable through the tested frames.

Laugh now reads as a larger Karen-specific body reaction without the previous mouth-weight problem.

**Acting visual result: PASS.**

## World context

At full 48px display, Karen still occupies more screen space than the 32px village NPCs.

That is **not treated as solved by this Visual Gate**.

It is the next independent question for World Scale Integration.

The current visual design is accepted before deciding whether Full / 44 / 41 display occupancy best fits Rynne Village.

## Portrait — SECOND REVIEW

Portrait OFF remains the stronger Pixel-native candidate because the eye stays on the actor.

Portrait ON remains available and is not deleted.

**Portrait policy remains provisional.**

---

# 12. Second verdict

# **VISUAL PASS**

The Karen visual redesign itself is now strong enough to proceed to the next gate.

However this does **not** authorize an immediate merge yet.

Current technical status for this exact HEAD:

- parent runtime baseline `5b772ba6...`: full CI PASS
- current redesign modifies the deterministic pixel generator / generated pixel appearance and documents
- local regenerated assets pass structural checks:
  - all 8 animation categories present
  - 48×48 source cells
  - correct sheet dimensions
  - four directions
  - no empty frames
  - binary alpha / no anti-alias alpha noise
- GitHub Actions for `af6dc894...`: currently queued

Therefore:

> **Visual Acceptance = PASS**  
> **PR #12 merge eligibility = HOLD until current-HEAD regression CI completes successfully**

Do not merge to `pixel-karen-acting-prototype` until the current HEAD is green.

Do not merge to `main`.

Do not begin Scale Integration on the prototype branch until the CI prerequisite is satisfied.

Do not begin Triton.
