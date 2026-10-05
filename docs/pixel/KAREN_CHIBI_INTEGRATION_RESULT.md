# KAREN_CHIBI_INTEGRATION_RESULT.md

## Gray Crown — Karen Chibi Animation Integration Result

**Branch:** `pixel-karen-chibi-direction`  
**Base:** latest `pixel-karen-acting-prototype` at branch creation  
**Runtime candidate:** Karen Chibi Direction Lock v1  
**main merge:** NOT PERFORMED  
**Pixel-native formal adoption:** NOT YET  
**Result:** **KAREN CHIBI ANIMATION INTEGRATION COMPLETE**

---

# 1. Scope completed

Implemented and verified:

- 48×48 source-cell Karen Chibi runtime assets
- 4-direction Idle
- Walk
- Talk
- Surprise
- Laugh
- Approach
- Run
- Turn
- existing Karen + Mika scene integration
- Motion Only
- Portrait OFF
- Portrait ON
- legacy 32px baseline retained
- runtime Evidence capture
- full existing regression gate

No Scale Integration was performed.

No Triton / Sophie / Margaret work was started.

No main merge was performed.

---

# 2. Visual source

Runtime source reference:

`docs/pixel/reference/karen_chibi_direction_v1.png`

The approved four-view Chibi design is normalized into four 48×48 directional source poses:

- down
- left
- right
- up

The runtime generator uses that source instead of reopening Karen's design direction.

Core retained identity:

- large readable Chibi head
- compact body
- large readable eyes
- red / red-brown hair as primary hook
- low partial tie + loose hair
- warm off-white sleeves
- short muted-red work vest
- leather boots
- VILLAGE RUNNER impression
- left-handed identity
- swordHip = right in locked runtime rules

---

# 3. Animation structure

Exactly eight categories remain:

1. Idle — 4 frames
2. Walk — 6 frames
3. Turn — 3 frames
4. Talk — 4 frames
5. Surprise — 4 frames
6. Approach — 4 frames
7. Laugh — 6 frames
8. Run — 6 frames

All use:

- frameW = 48
- frameH = 48
- four directions
- logical world tile = 32
- foot anchor = [24,44]

The Chibi pass changes the visual actor, not the logical world.

---

# 4. In-game visual evaluation

## 4-direction Idle

PASS.

The four directions remain recognizably the same Karen.

The strongest read at gameplay distance is:

1. red hair
2. large face / eyes
3. off-white upper body
4. muted-red vest
5. compact dark lower body

The head remains the visual center as intended.

## Village background

PASS for Chibi integration.

Karen is not lost against Rynne Village.

Her red hair, light sleeves and large face make her immediately findable as the protagonist.

The current 48px Chibi actor is visibly larger / more detailed than existing 32px Mika and generic NPCs.

That mismatch is **not solved or judged as final here**.

It is deliberately deferred to the next Scale Integration gate.

## Walk

PASS for functional integration.

The actor reads as walking rather than sliding.

The compact body stays intact while the limbs / hair create visible movement.

## Talk

PASS.

Small body movement is sufficient to distinguish a speaking state without requiring a new visual design.

The E2E timing assertion was corrected to observe the actual actor animation state rather than the instantaneous SceneRunner command.

## Laugh

PASS for integration.

The actor uses a larger whole-body response than Idle/Talk and preserves the large-head Chibi silhouette.

This is sufficient for the current integration milestone; final animation polish remains later work.

## Surprise / Approach / Run / Turn

All exist in the runtime 8-animation set and pass metadata / asset validation.

The current phase does not claim final commercial animation polish.

The requirement here is that the approved Karen can function as a game actor without returning to character redesign.

That condition is met.

---

# 5. Portrait comparison

## Portrait OFF

Current visual preference for Pixel-native testing.

Advantages:

- attention remains on Karen and Mika in the game world
- the Chibi actor becomes the emotional focal point
- speaker name still identifies the speaker
- less competition between two different Karen representations

## Portrait ON

Works technically and remains available.

Current issue:

- the older portrait has a different visual language from the Chibi actor
- it draws attention away from the in-world actor

No deletion or formal Portrait policy decision is made in this phase.

**Portrait system remains intact.**

---

# 6. Regression

Final successful workflow run:

- GitHub Actions run: **37384493234**
- head tested: **869ea25842cde6ed0c099fa94d0d56ba73c8744d**
- workflow conclusion: **SUCCESS**

Verified:

- Karen Chibi integration evidence gate: PASS
- Node regression: **52 / 52 PASS**
- V21 Browser Gate: PASS
- Alpha2 Frontier Section 1 E2E: PASS
- Alpha2 Frontier Section 2 E2E: PASS
- Developer Mode E2E: PASS
- Karen Chibi Integration E2E: PASS
- control restoration: PASS
- Save schema remains **23**
- original story / map / battle foundation remains intact

Two earlier runs hit timing failures in the pre-existing Serad Frontier Section 2 browser test at different locations.

The unchanged later run passed the complete Section 2 flow. No Karen-specific runtime regression was identified.

---

# 7. Evidence

Final workflow artifact:

- artifact id: **11378325114**
- name: `karen-pixel-prototype-evidence`
- SHA-256 digest: `34ed466786d7cf8dc2057b4f73707af42f03ec90089fd813c5e54f0798bca132`

Evidence contains:

- `karen_chibi_idle_down.png`
- `karen_chibi_idle_left.png`
- `karen_chibi_idle_right.png`
- `karen_chibi_idle_up.png`
- `karen_chibi_walk.png`
- `karen_chibi_talk.png`
- `karen_chibi_laugh.png`
- `karen_chibi_motion_only.png`
- `karen_chibi_portrait_off.png`
- `karen_chibi_portrait_on.png`
- `karen_32_baseline_laugh.png`

Evidence is intentionally limited to decision-relevant views.

---

# 8. Current judgement

## Character readability

PASS.

Karen is more immediately protagonist-like than the previous realistic-proportion 48px experiments.

The strongest improvement is not raw detail count but:

- large readable face
- strong red-hair silhouette
- compact body
- clear light/red color masses
- Chibi-compatible acting

## Game usability

PASS for Prototype integration.

The approved Karen can now exist as a runtime actor in the actual Karen + Mika scene with all eight animation categories available.

## Commercial-final polish

NOT CLAIMED.

This phase proves integration and visual direction, not final animation cleanup for the entire game.

---

# 9. Deliberately unresolved

Still not decided here:

- final screen occupancy
- Full 48 vs reduced display scale
- final NPC scale standard
- final Portrait policy
- Pixel-native adoption for whole Gray Crown
- other hero implementation

---

# 10. Completion decision

# **KAREN CHIBI ANIMATION INTEGRATION — COMPLETE**

The next authorized phase is:

> **Scale Integration using this new Karen Chibi runtime visual**

Do not reuse old Phase 2 scale-visual conclusions as the final answer.

Compare the new Karen under the same world context.

Do not start Triton until the new Karen passes the Scale Integration gate.
