# KAREN_PHASE3_REDIRECTION.md

## Gray Crown — Karen Pixel Acting Phase 3 Priority Correction

**Status:** ACTIVE DIRECTION FOR PROTOTYPE REVIEW  
**Technical:** GO  
**Visual:** FAIL / REDESIGN REQUIRED  
**Formal Pixel-native adoption:** NOT YET  
**main merge:** PROHIBITED

---

# 1. Superseded interpretation

The previous Phase 3 implementation idea tested whether the existing Phase 2 Karen could be made acceptable mainly by reducing render scale / screen occupancy.

That experiment may remain on:

`pixel-karen-scale-integration`

for comparison.

However:

> **It must not be used as the final Karen solution or as evidence for formal adoption.**

The problem is not only world scale.

---

# 2. Corrected problem statement

Direct 32px vs Phase 2 comparison shows that the current 48px Karen gained information but lost visual appeal.

Primary failures:

- oversized / square head impression
- stretched face
- awkward side-profile nose / mouth
- heavy box-shaped torso
- lower body / equipment merging into a dark mass
- hair reading as a brown block rather than attractive red hair
- NPC-like ruggedness appearing before protagonist charm

Therefore the current decision is:

> **Technical GO / Visual FAIL / REDESIGN REQUIRED**

---

# 3. New order

1. Treat legacy 32px Karen as a Visual Anchor.
2. Analyze why its simplification works.
3. Keep 48×48 source architecture.
4. Keep all eight animation categories.
5. Keep SceneRunner / camera / Portrait A-B infrastructure.
6. Redesign the 48px Karen face, proportions, hair, torso, legs and color mass.
7. Compare new 48px vs legacy 32px.
8. Only after the new design passes Visual review, resume World Scale Integration.

---

# 4. What must transfer from 32px

Not exact pixels.

Transfer:

- compact face information
- coherent hair mass
- clean color blocks
- light silhouette
- immediate protagonist readability
- strong simplification
- visual rhythm

The new 48px must add acting room without becoming more cumbersome.

---

# 5. Current active branch

Visual redesign work:

`pixel-karen-visual-anchor-redesign`

Scale-only branch:

`pixel-karen-scale-integration`

Status of scale-only branch:

**COMPARISON / TECHNICAL REFERENCE ONLY**

Do not merge either branch to main without a later explicit decision.
