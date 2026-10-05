# KAREN_PIXEL_PROTOTYPE_RESULT.md

## Gray Crown — Karen Pixel Acting Prototype Result

**Status:** COMPLETE FOR PHASE 1 / **VERDICT: REVISE**  
**Branch:** `pixel-karen-acting-prototype`  
**Main baseline preserved:** `b8e0c19fd233e7b8645853f4b2f340ef67767b87`  
**Prototype evaluated HEAD:** `1ec75ba96855300cee4b8509eb6a7e8c77b5ffca`  
**Canonical adoption:** NO — main is not changed.

---

# 1. Final verdict

> **REVISE**

Pixel-native itself is promising enough to continue testing, but the present 48×48 Karen art is **not yet strong enough to justify GO**.

The technical architecture passed.  
The current visual prototype did not yet prove that 48px is clearly superior to the existing 32px presentation as a finished Gray Crown character.

Therefore:

- do **not** merge Pixel-native into main yet
- do **not** proceed to Triton yet
- do **not** remove normal dialogue portraits yet
- revise Karen visual scale / pixel design / map integration first
- rerun the same A/B test after revision

---

# 2. What was actually implemented

Prototype branch contains:

- independent Karen 48×48 animation assets
- 8 animations:
  - Idle
  - Walk
  - Turn
  - Talk
  - Surprise
  - Approach
  - Whole-body Laugh
  - Run
- data-driven animation metadata
- minimal animation runtime
- transient actor state
- minimal SceneRunner
- camera override / return
- small sound cues
- Portrait ON / OFF
- Motion Only
- existing 32px Karen baseline comparison
- Developer Mode launch buttons
- Node regression tests
- Browser E2E
- automatic A/B evidence screenshots
- scene cancellation / lock cleanup hardening

No Story, map, battle, or save schema change was required.

---

# 3. Technical result

## Technical verdict: GO

The following hypothesis was confirmed:

> A 48×48 source actor can run inside the current 32px logical world without replacing collision, map coordinates, or save data.

The implementation keeps:

- Logical World = 32px tile
- Karen visual source cell = 48×48
- actor foot anchor = logical tile position

The current v23 architecture therefore does **not** need a full engine rewrite to test Pixel-native acting.

---

# 4. Regression result

Latest GitHub Actions run:

- Workflow: **Karen Pixel Prototype Check**
- Run: **37306711238**
- Conclusion: **SUCCESS**

Node:
- **52 / 52 PASS**
- 0 fail

Existing browser regression:
- Startup / Alpha 1 / stress / Save-Continue: PASS
- Developer Mode isolation: PASS
- Ash Road flow: PASS
- Serad Frontier Section 1: PASS
- Serad Frontier Section 2: PASS

Prototype browser E2E:
- 48 Motion Only: PASS
- 32 baseline: PASS
- Portrait OFF: PASS
- Portrait ON: PASS
- scene end control restore: PASS

No v23 regression was detected by the current automated gates.

---

# 5. 32px vs 48px A/B

## What 48px improves

The 48px Karen is much easier to identify at a glance.

Compared with the current 32px baseline:

- red hair is clearer
- warm off-white / muted red color blocks are clearer
- arm and torso movement has enough room to be visible
- Laugh / Surprise / Approach can use the whole body
- character acting has substantially more readable silhouette space

This confirms that 32px is restrictive for the intended acting language.

## What is not yet good enough

In the current evidence image, 48px Karen reads as visibly larger and denser than the surrounding 32px NPC population.

This creates a visual-layer mismatch:

- Karen can look like she belongs to a different sprite standard
- nearby Mika and other residents look unusually small beside her
- character-detail density and environment-detail density do not yet feel unified
- the 48px source is more readable, but readability alone is not enough to call it superior

So:

> **48px is technically viable and acting-friendly, but this exact 48px art treatment is not yet the final answer.**

Do not lock 48px yet.

---

# 6. Karen identity result

## Clearly present

- red / red-brown hair
- warm off-white + muted red upper color mass
- practical clothing
- forward-facing activity
- larger bodily reactions than a generic idle sprite
- fast movement-oriented scene construction

## Partially demonstrated

- VILLAGE RUNNER
- approachability
- body-first reaction
- whole-body laugh
- quick turn

The animation generator does change torso lean, arms, head/hair and vertical position rather than only changing a face frame, which is correct in principle.

## Not yet proven strongly enough

From the current captured evidence alone, the prototype does **not** yet prove:

- that a player would identify her specifically as Karen without prior knowledge
- that she consistently reads as a 23-year-old adult woman rather than simply a larger stylized protagonist
- that her low partial hair tie reads clearly at gameplay distance in every direction
- that all eight animations feel natural in motion rather than merely functioning technically
- that the right-hip sword reads correctly in every direction during the full animation cycle

These require the revised visual pass and direct motion review.

---

# 7. Portrait ON vs OFF

## Portrait OFF result

Portrait OFF has a major advantage for the Pixel-native hypothesis:

- the player's eye remains on the game-space actors
- more of the dialogue presentation belongs to the actual scene
- the large portrait no longer competes with Karen's body acting
- speaker name still provides explicit speaker identification

This is a meaningful improvement in visual focus.

## Portrait ON result

Portrait ON still provides:

- immediate face/emotion readability
- strong speaker recognition
- familiar RPG dialogue grammar

But it visually competes with the reason for building Pixel Acting in the first place.

## Current judgement

> **Portrait OFF is the better direction for the Pixel-native test, but it is NOT formally locked yet.**

The current 48px art is still too provisional to use this test alone as justification for deleting portraits.

Keep the portrait system intact.

---

# 8. Map compatibility

Current result: **REVISE REQUIRED**

The prototype works spatially, but not yet aesthetically.

Main issue:

> Karen's body scale and pixel-detail density are too different from the current village NPC standard.

This is more important than whether “48” is mathematically correct.

Revision should test at least one of:

1. keep 48×48 source cell but reduce the occupied silhouette inside the cell
2. revise character proportions to sit closer to the map's existing visual scale
3. test a smaller visual target such as 40–44px body occupancy while retaining 48px source cells
4. if needed, compare a deliberately improved 32px/40px-style actor rather than assuming 48 must win

Do not rescale the entire map or NPC population for this Prototype.

---

# 9. Animation issues

Technically all eight animation states work.

Visual issues still needing review:

- frame-to-frame acting strength is hard to judge from still evidence alone
- Laugh needs to read as Karen rather than generic “bounce”
- Turn should feel quick without looking like a frame snap
- Approach must show social forwardness, not simply positional tweening
- Run should preserve adult body proportions and right-hip equipment consistency
- Talk should not become repetitive arm waving

The next Karen revision should improve these, not add more animation categories.

---

# 10. AI / Pixel production result

The current prototype assets were generated by a deterministic Python/Pillow pixel generator.

Therefore:

- generative image AI output used directly as final frames: **none**
- AI-pixel cleanup burden: **0**
- frame consistency: structurally controllable
- palette consistency: structurally controllable
- pixel noise / anti-aliasing risk: low

However, deterministic generation created a different problem:

> visual construction is too schematic to be accepted as final character art.

There was at least one implementation correction to frame-coordinate generation before assets were accepted into the branch.

This means future production cost is not dominated by AI cleanup; it is dominated by **actual pixel character design and animation polish**.

---

# 11. Measured prototype work window

Repository history shows:

- infrastructure commit: 11:21:29Z
- asset / metadata work: 11:38:24Z
- scene / portrait work: 11:41Z
- A/B + regression tests: 11:45:36Z
- cleanup hardening: 11:59Z
- final regression assertion fix: 12:01:25Z

So the implementation commits span roughly **40 minutes from first runtime infrastructure to final green prototype HEAD**, or about **59 minutes including the preceding Pixel-native design-doc branch commits**.

This is a repository execution window for this prototype, **not a human production-hours estimate**.

The previous 20–40h planning estimate should therefore not be treated as measured human labor.

For commercial production, the expensive part remains the final-quality pixel art and animation review that this technical prototype intentionally did not solve.

---

# 12. Remaining bugs / risks

No blocking runtime regression remains in the latest successful workflow.

Remaining risks are visual / production risks:

- visual scale mismatch with NPCs
- final-quality Karen design not proven
- direct motion quality needs human viewing
- adult age readability not yet strong enough to lock
- exact 48px standard is not justified yet
- final Portrait decision remains open

---

# 13. GO / REVISE / NO-GO

## **REVISE**

Why not GO:

- technical system works
- Pixel Acting direction has promise
- 48px gives useful acting space

but:

- current 48px Karen does not yet look integrated enough with the existing map/NPC world
- visual quality is intentionally prototype-level
- “Karenらしさ” is not yet proven strongly enough by the visual evidence
- 48px is not yet clearly superior overall to justify migration

Why not NO-GO:

- technical architecture worked without destabilizing v23
- 48px clearly improves body-action readability
- Portrait OFF demonstrates the intended focus shift
- the problems are revisable art-scale/design problems, not a failed Pixel-native concept

---

# 14. Recommended next action

Do **one Karen revision only**.

Do not add animations.

Target the same eight animations, same scene, same Mika, same camera conditions.

Revision goal:

> **make Karen feel like she belongs to Rynne Village while preserving the extra acting readability that the 48px source enables.**

Then rerun:

- 32 baseline vs revised Karen
- Portrait ON vs OFF
- Motion Only
- full regression

Only after that second Karen A/B should the project choose:

- GO → Triton
- REVISE again
- NO-GO

---

# 15. STOP

This document completes Prototype Phase 1 evaluation.

Do not automatically begin:

- Triton
- Sophie
- Margaret
- NPC migration
- battle migration
- Pixel Cinematic production
- main merge

User approval is required before the next Karen revision or any wider migration.
