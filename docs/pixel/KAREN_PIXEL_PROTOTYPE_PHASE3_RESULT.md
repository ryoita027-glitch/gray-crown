# KAREN_PIXEL_PROTOTYPE_PHASE3_RESULT.md

## Gray Crown — Karen Pixel Acting Phase 3 / World Scale Integration Result

**Status:** COMPLETE FOR PHASE 3  
**Verdict:** **GO TO SECOND CHARACTER**  
**Recommended display mode:** **48×48 source cell + Compact Integration (41/48 render scale ≈ 0.8542)**  
**Branch:** `pixel-karen-scale-integration`  
**Phase 3 implementation HEAD before result doc:** `f14686413fd4e94cafabbd559c7bdc08261a6cda`  
**Prototype parent HEAD:** `5b772ba6d6fd00550ae0c8029e17ca927c87e36d`  
**Main baseline preserved:** `b8e0c19fd233e7b8645853f4b2f340ef67767b87`  
**Canonical Pixel-native adoption:** NOT YET  
**Main merge:** NO

---

# 1. Final Decision

> **GO TO SECOND CHARACTER**

Karenの48px source architecture自体は維持しつつ、screen occupancyを縮めることで、Phase 2のCharacter readabilityとActing spaceを大きく失わずにRynne Villageへかなり自然に馴染ませられることを確認した。

ただし採用するのは「48pxをそのまま48px相当で大きく表示する」方式ではない。

Phase 3の最良条件は:

> **48×48 source cell / Compact Integration / render scale 41/48**

である。

これは「通常Character Standardを41px cellへ変更する」という意味ではない。

- Source / animation architecture = 48×48
- Logical world = 32px tile
- Screen occupancy = approximately 41px class
- Foot anchor = logical tile foot point

というHybridである。

---

# 2. What Changed

Phase 3ではKaren assetそのものを3セット作らなかった。

同じPhase 2 assetへPrototype-only render modeを追加した。

Scale conditions:

- `pixel48-full` = 1.0
- `pixel48-medium` = 44 / 48 ≈ 0.9167
- `pixel48-compact` = 41 / 48 ≈ 0.8542
- `legacy32` = existing 32px baseline

変更対象:

- `js/systems/animation.js`
- `js/systems/cinematic.js`
- `js/dev/developer.js`
- `index.html`
- `tests/pixel_native_prototype.test.js`
- `tests/browser_karen_pixel_prototype_e2e_test.py`
- `.github/workflows/karen-prototype-check.yml`

変更していない:

- Karen Phase 2 pixel assets
- 8 animation categories
- dialogue text
- scene command order
- Rynne Village map
- Mika design
- collision
- logical 32px world
- save schema
- battle
- Story 00–19
- current 32px baseline asset

---

# 3. Technical Result

## Technical: PASS

Render scaling is applied around the **foot anchor**, not around sprite center.

The renderer calculates destination size from the 48px source while keeping the logical foot point fixed.

This prevents:

- floating feet
- sinking feet
- collision-size expansion
- logical coordinate drift

Automated invariant test confirms that Full / Medium / Compact all keep the scaled anchor at the logical foot point within rounding tolerance.

Save schema remains:

> **23**

Logical tile remains:

> **32px**

No persistent Phase 3 state was introduced.

---

# 4. Scale Integration

## A — Current Phase 2 / Full 48

Result:

**Too large for final integration.**

Advantages:

- maximum Character detail
- strongest silhouette readability
- facial / hair / clothing information easiest to read

Problems:

- Karen dominates Mika too strongly
- pixel density difference is immediately visible
- Karen looks closer to a separate visual layer
- the scale mismatch is noticed before acting

Full 48 is not recommended as the normal gameplay display scale.

---

## B — Medium / 44px-class

Result:

**Substantial improvement, but still slightly oversized.**

Advantages:

- Phase 2 identity remains clear
- acting remains strong
- size mismatch is reduced
- off-white / muted red / hair tie remain readable

Problems:

- Karen still carries noticeably more physical presence than Mika
- world integration is improved but still not the best condition

Medium remains a useful fallback / comparison condition, but it is not the Phase 3 winner.

---

## C — Compact / 41px-class

Result:

**Best overall integration.**

Compared with Full and Medium:

- Karen no longer reads as obviously gigantic beside Mika
- foot placement remains stable
- the protagonist still has enough visual prominence
- red-brown hair remains readable
- the low partial tie / loose-hair mass remains readable
- warm off-white + muted-red color mass survives
- body and limb separation remain materially better than the 32px baseline
- the character no longer dominates the environment as aggressively

There is still a deliberate protagonist-detail advantage over generic village NPCs, but it no longer reads primarily as a scale error.

For the purpose of this Prototype, this is acceptable world integration.

---

# 5. Karen Identity

Compact Integration preserves the Phase 2 Karen identity sufficiently.

Still readable:

- adult rather than child-proportioned body
- red / red-brown hair
- low partial tie + loose hair
- warm off-white shirt
- muted-red short work vest
- belt / lower-body separation
- forward-active posture
- healthy body impression

The visual footprint is smaller, but the design does not collapse into “generic red-haired sprite”.

The exact eye color remains unresolved and was not invented.

Left-handed identity and right-hip sword rule remain unchanged in source asset / metadata.

---

# 6. Acting Readability

The animation set is unchanged:

- Idle
- Walk
- Turn
- Talk
- Surprise
- Approach
- Laugh
- Run

Therefore Phase 3 isolates scale rather than animation redesign.

At Compact scale:

- whole-body Laugh remains visible
- forward Approach gesture remains readable
- Turn remains distinguishable
- run / movement silhouette remains much richer than legacy32
- arm / torso motion retains enough pixel room to function

Compact loses some micro-detail compared with Full, but not enough to erase the intended Acting language.

This is the key reason Compact is preferred over simply returning to the existing 32px sprite.

---

# 7. Compact vs Existing 32px Baseline

## Existing 32px strengths

- naturally matches current NPC scale
- low visual cost
- current runtime baseline
- no integration concern

## Existing 32px weaknesses

- character construction is much harder to read
- clothing hierarchy is weak
- body acting has less room
- low partial hair tie / loose-hair structure is weak
- adult body differentiation is limited
- whole-body emotional acting is harder to stage

## Compact Hybrid strengths

- approaches the current world scale
- preserves substantially more Karen-specific visual information
- retains 48px-source animation flexibility
- preserves acting readability
- keeps 32px logical world unchanged

Result:

> **Compact Hybrid is a better direction than reverting to legacy32.**

---

# 8. Portrait ON / OFF

Medium was used for controlled dialogue A/B because it was the Phase 3 primary candidate when the test was specified.

The same conclusion from Phase 2 remains.

## Portrait OFF

Advantages:

- attention stays on Karen and Mika
- Actor motion remains the emotional center
- game-space conversation feels more coherent
- speaker name still identifies the speaker
- less competition between large portrait and Pixel Acting

## Portrait ON

Advantages:

- immediate face readability
- conventional JRPG dialogue grammar

Problems:

- portrait visually dominates the actor
- portrait rendering language differs from the Pixel actor
- part of the reason for building Acting is duplicated by the portrait

Current conclusion:

> **Portrait OFF remains preferred for Pixel-native normal dialogue.**

But:

> **Portrait system remains intact and is NOT formally removed or locked out.**

Second-character validation should happen before a global dialogue decision.

---

# 9. Pixel Quality

The source assets remain unchanged from Phase 2.

Render scaling uses nearest-neighbour Canvas rendering.

Compact scale introduces non-integer source-to-screen sampling, so individual source pixels are not guaranteed to map one-to-one to screen pixels.

Observed evidence remains acceptably crisp for this Prototype, but this is a production risk to revisit later.

Possible production follow-up after Second Character validation:

- keep 48px source architecture
- define a stable target screen footprint
- if necessary, author final assets to that footprint rather than relying on arbitrary fractional scaling

Do not solve this now.

---

# 10. Regression

Final successful workflow:

- Workflow: **Karen Pixel Prototype Check**
- Run ID: **37312870516**
- Head: `f14686413fd4e94cafabbd559c7bdc08261a6cda`
- Conclusion: **SUCCESS**

Node:

- **54 / 54 PASS**
- fail: 0

Browser:

- V21 browser gate: PASS
- Alpha2 Frontier Section 1: PASS
- Alpha2 Frontier Section 2: PASS
- Developer Mode E2E: PASS
- Karen Pixel Acting Phase 3 E2E: PASS

Phase 3 E2E verified:

- Full
- Medium
- Compact
- legacy32 baseline
- Medium Portrait OFF
- Medium Portrait ON
- player control restoration

Artifact:

- ID: `11345644735`
- SHA-256: `3ea34fadf288e4115c999fd07d690213e85e4c888d9874d1c93ddb548922e580`

---

# 11. Flake Record

An earlier Phase 3 run failed once in the existing Serad Frontier Section 2 test at `frontierMedic`.

Per Phase 3 instruction, the same HEAD was rerun without code changes.

On rerun:

- existing browser regression passed
- Serad Frontier Section 2 passed

Therefore that single failure is treated as an existing E2E flake, not evidence of a Karen scale regression.

A separate Phase 3 E2E failure occurred because the test attempted to click a Phase 2 legacy button hidden inside a collapsed `details` element.

That was a test-harness mistake, not a runtime failure. The unnecessary click was removed, and the final full gate passed.

---

# 12. Remaining Problems

The following remain unresolved:

1. Compact still has more detail density than generic NPCs.
2. Fractional nearest-neighbour scale is suitable for Prototype, but may not be the final production rendering strategy.
3. Only Karen has been validated.
4. A single protagonist cannot prove that the same visual language handles a different body type.
5. Portrait OFF is preferred but not globally locked.
6. Pixel-native is still not formally adopted across Gray Crown.

These are not blockers for the **Second Character Validation** gate.

---

# 13. Final Decision Gate

## **GO TO SECOND CHARACTER**

Reason:

- Full 48 is too large.
- Medium improves scale but remains slightly strong.
- Compact gives the best world integration.
- Compact preserves Karen identity.
- Compact preserves the useful acting advantage of the 48px source.
- Compact is clearly more expressive than the existing 32px baseline.
- Portrait OFF remains viable.
- Regression is green.
- No map / collision / save rewrite was required.

Recommended standard for the next validation:

> **48×48 source actor + approximately 41px-class screen occupancy + 32px logical tile**

This is still **PROTOTYPE STANDARD**, not final production lock.

---

# 14. Next Step

Per the Phase 3 instruction, the next gate should be:

> **Second Character Validation**

Recommended subject:

> **Triton**

Reason:

Karen and Triton have the strongest movement / silhouette contrast.

Karen:
- roundness
- forward movement
- open body
- medium healthy build

Triton:
- straighter shape language
- weight
- lower center of gravity
- stronger shoulder / back / leg impression

If the same Pixel Visual Language can make Triton clearly different without copying Karen's body / face / movement, the system becomes much more credible.

---

# 15. STOP

Do not begin Triton automatically.

Do not:

- merge to main
- declare full Pixel-native adoption
- delete portraits
- delete 32px assets
- migrate NPCs
- alter battle
- implement Pixel Cinematic production
- create Sophie or Margaret

Present Phase 3 result to the user and wait for approval.
