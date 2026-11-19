# KAREN_PIXEL_PROTOTYPE_PHASE2_RESULT.md

## Gray Crown — Karen Pixel Acting Prototype Phase 2 Result

**Status:** COMPLETE FOR PHASE 2 / **VERDICT: REVISE AGAIN**  
**Branch evaluated:** `pixel-karen-acting-prototype`  
**Evaluated HEAD:** `6f7375b44b9a35f9a4eb1f57dae2c24b3a635679`  
**Main baseline preserved:** `b8e0c19fd233e7b8645853f4b2f340ef67767b87`  
**Canonical adoption:** NO — `main` is unchanged.

---

# 1. Final verdict

> **REVISE AGAIN — Pixel-native is still promising, but not ready for formal adoption.**

Phase 2 improved Karen's 48px art substantially over the Phase 1 schematic block construction. The character now has a more readable adult silhouette, stronger face/hair separation, a clearer low partial hair tie, warm off-white sleeves, a short muted-red work vest, belt/pouch information, and a preserved right-hip sword structure.

However, the revised 48px actor still reads noticeably larger and denser than the surrounding 32px village population. The visual mismatch is smaller in quality terms but remains obvious in scale terms.

Therefore Pixel-native should **not** be merged into `main` yet.

---

# 2. What changed in Phase 2

Phase 2 intentionally kept:

- the existing 48×48 source-cell architecture
- the same eight animation categories
- the same Karen/Mika test scene
- the same camera conditions
- the same Portrait ON/OFF comparison
- the same 32px baseline
- the same logical 32px world
- Story / Save / map content unchanged

The Karen generator was revised to improve:

- body contour instead of large rectangular blocks
- face/hair separation
- low partial hair tie readability
- loose-hair motion mass
- adult torso/leg separation
- warm off-white shirt readability
- short muted-red work vest readability
- belt / pouch / boot / sword readability
- direction-specific silhouette
- controlled pixel outline and highlight structure

---

# 3. Technical result

## Technical verdict: GO

Latest Phase 2 verification:

- Workflow: **Karen Pixel Prototype Check**
- Run: **37309858245**
- Attempt: **2**
- Conclusion: **SUCCESS**

Passed:

- Syntax and Node regression
- Existing browser regression
- Karen Pixel Acting browser E2E
- Portrait ON / OFF evidence capture
- visual A/B evidence upload
- scene completion / input restoration gates

The first attempt of this run failed inside an existing Serad Frontier browser test at `woundedImperial`. The same HEAD was rerun without code changes and passed, so the observed failure is consistent with an existing browser-test flake rather than a Karen Phase 2 regression.

---

# 4. Phase 1 → Phase 2 visual improvement

Phase 1 Karen was too schematic:

- large flat rectangular torso
- weak face structure
- weak hair separation
- weak garment hierarchy
- minimal body contour

Phase 2 is clearly better:

- the head silhouette is more character-like
- face / cheek / eye / hair masses separate more clearly
- low partial tie and trailing hair read more strongly
- vest and shirt separate visually
- legs and boots read as distinct limbs
- belt equipment is more legible
- the actor reads more like a designed RPG character than a technical placeholder

This means the visual revision direction itself was successful.

---

# 5. Revised 48px vs existing 32px

## Revised 48px advantages

Compared with the existing 32px baseline:

- Karen is easier to identify immediately
- upper-body color mass is much clearer
- hair mass and tied/loose structure are easier to read
- arm/torso acting has more room
- whole-body reactions are much easier to stage
- clothing and equipment identity can survive animation
- the actor has enough visual information to support a Portrait-off presentation

## Revised 48px disadvantages

The main remaining issue is **world integration**.

In the same village frame:

- Karen is still visibly larger than ordinary NPCs
- Karen carries substantially more pixel-detail density
- nearby villagers look like a different sprite generation
- the scale difference draws attention before the acting does
- this can make Karen feel composited onto the map rather than born from the same visual system

So 48px now wins on character readability, but **does not yet win overall presentation quality**.

---

# 6. Portrait ON vs OFF

## Portrait OFF

Phase 2 strengthens the Portrait-off case because Karen herself carries more readable visual information.

Advantages:

- player attention remains in the game space
- Karen's body acting remains the emotional focus
- dialogue feels more spatially connected to the scene
- the large portrait no longer competes with the revised sprite

## Portrait ON

The current portrait still gives immediate face readability, but it now creates a stronger style mismatch:

- portrait rendering language differs from the pixel actor
- the eye is pulled away from Karen's animation
- the portrait occupies a large information area that duplicates the actor

## Phase 2 judgement

> **Portrait OFF remains the preferred Pixel-native direction, but portrait removal is still not formally locked.**

The system must remain reversible until the sprite/world scale issue is solved.

---

# 7. Formal Pixel-native adoption decision

## Decision: NOT YET

Do not formally adopt Pixel-native across Gray Crown yet.

Reasons:

1. The technical architecture is proven.
2. Karen Phase 2 is much better than Phase 1.
3. 48px clearly provides useful acting space.
4. Portrait OFF increasingly fits the intended presentation.

But:

1. Karen still looks too large/dense beside ordinary 32px NPCs.
2. One polished protagonist beside unchanged NPCs is not a coherent final visual language.
3. The current evidence still cannot prove that full-game migration cost is justified.
4. A single Karen test is insufficient to lock the final production standard.

---

# 8. Recommended next gate

Do **not** add new Karen animation categories.

The next visual test should change only scale integration:

- keep the 48×48 source cell
- reduce final on-screen occupied body scale / render scale
- target a visual body presence closer to the existing village population
- preserve the improved Phase 2 detail hierarchy
- rerun exactly the same A/B scene

Primary question:

> Can Karen keep Phase 2 readability while looking like she belongs naturally beside Rynne Village NPCs?

If yes, then run a second-character validation using Triton or Sophie before formal Pixel-native adoption.

If no, test a 40–44px visual actor standard or Hybrid presentation.

---

# 9. Current project decision

Current decision state:

- Pixel-native concept: **CONTINUE**
- technical architecture: **GO**
- Karen Phase 2 visual redesign: **IMPROVED / PASS AS REVISION**
- 48px final standard: **NOT LOCKED**
- Portrait OFF: **PREFERRED, NOT LOCKED**
- formal Pixel-native adoption: **NO, NOT YET**
- main merge: **NO**
- next required proof: **scale integration, then second-character validation**
