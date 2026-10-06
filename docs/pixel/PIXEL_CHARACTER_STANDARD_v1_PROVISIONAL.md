# Gray Crown — Pixel Character Standard v1

**Status:** PROVISIONAL  
**Scope:** field / event Pixel Actor for protagonist-class characters  
**Evidence base:** Karen Chibi + Triton GROUND ANCHOR  
**Production status:** NOT ADOPTED TO main  
**Game baseline:** v23 / Save schema 23 / Story 00–19

---

# 0. Purpose

This document converts the successful Karen + Triton prototype results into a reusable character-production standard.

The goal is **not** to make every hero use the same body.

The goal is:

> **share one technical language while preserving each character's silhouette, center of gravity, hair behavior, color mass and acting personality.**

This is a provisional production contract for the next reproducibility test.

It is not yet a final game-wide art or runtime policy.

---

# 1. Evidence behind this standard

This v1 exists because two deliberately different protagonists now work under the same prototype architecture.

## Karen — VILLAGE RUNNER

Validated qualities:

- 48×48 source cell
- approximately 44px Medium gameplay occupancy
- red / red-brown hair
- low partial tie + loose moving hair
- warm off-white + muted-red upper-body identity
- forward / light / quick movement
- large whole-body emotional reactions
- exactly eight prototype animation categories

## Triton — GROUND ANCHOR

Validated qualities:

- same 48×48 source-cell architecture
- approximately 44px Medium gameplay occupancy
- heavy dark shoulder-length hair
- broad faded-blue waist / side block
- broader shoulder and waist mass than Karen
- lower, planted center of gravity
- less vertical bounce
- restrained heavy-hair motion
- exactly the same eight technical animation categories, but different motion personality

The important result is:

> **same architecture does not require same anatomy or same acting.**

---

# 2. Shared technical rules — PROVISIONAL STANDARD

## 2.1 Source cell

Default protagonist field/event source cell:

`48 × 48 px`

Each frame is authored inside a transparent RGBA 48×48 cell.

Do not create separate 44px or 41px art sets for scale tests.

The same 48px source is rendered at different screen scales.

---

## 2.2 Logical world

The existing world remains:

`32px logical tile`

Character rendering size does not redefine:

- collision
- map tile coordinates
- movement pathfinding
- event trigger coordinates
- save position semantics

Visual actor size and logical collision remain separate concerns.

---

## 2.3 Direction order

Prototype directional sheets use:

1. down
2. left
3. right
4. up

Runtime direction metadata must remain explicit.

Do not infer direction from filename order without metadata.

---

## 2.4 Foot anchor

Current validated default:

`[24,44]`

The renderer scales around the world-space foot point.

Required invariant:

> changing Full / Medium / Compact must not move the actor's feet to a different logical ground position.

Karen and Triton both currently use `[24,44]`.

However:

- the standard does **not** require every future hero to use identical internal body placement;
- a future character may use a different anchor if the visual design genuinely requires it;
- changing the anchor requires explicit comparison evidence and anchor-drift tests.

The anchor is a ground-contact rule, not an anatomy template.

---

## 2.5 Render filtering

Pixel Actors use nearest-neighbor rendering.

Do not add smoothing or interpolation that creates blurred pixel edges.

Scale behavior should preserve the authored pixel structure as much as the Canvas renderer allows.

---

# 3. Screen scale standard

Three prototype comparison conditions remain available.

| Mode | Scale | Role |
|---|---:|---|
| Full | 1.0 | detail / dominance reference |
| Medium | 44 / 48 | current default prototype candidate |
| Compact | 41 / 48 | fallback world-fit reference |

## Current default

> **Start a new protagonist at Medium 44.**

This is a starting condition, not a permanent law.

Do not force every hero to have the same visible body height.

Characters may occupy different amounts of their 48px cell because of:

- canonical height
- body width
- hair volume
- stance
- costume mass
- center of gravity

The test is not "are all heads on one horizontal line?"

The test is:

> **do they look like distinct people from the same game, grounded in the same world?**

---

# 4. 48px art translation rules

A high-resolution concept may be used as visual reference, but it is not automatically a production sprite.

Triton validation established that literal downsampling loses important identity.

Therefore:

> **production 48px art must be translated for 48px readability, not merely shrunk.**

Priority order:

1. silhouette
2. center of gravity
3. hair mass
4. major costume mass
5. character color block
6. face read
7. limb separation
8. small detail

If a detail does not survive at Medium 44, it must not be allowed to damage a more important large form.

Avoid:

- excessive tiny hair strands
- costume micro-detail that turns into noise
- one-pixel decoration that competes with the face
- anatomy copied from another hero just to reuse animation
- making every adult woman the same narrow-waist / long-leg Chibi body

Adult identity should survive through:

- posture
- clothing structure
- proportions inside the Chibi grammar
- movement
- interpersonal distance
- confidence / restraint
- role and life history

not by abandoning the Chibi language.

---

# 5. Shared prototype animation contract

Every protagonist reproducibility test must provide exactly these eight categories before a technical GO:

| Animation | Frames in v1 prototype | Meaning |
|---|---:|---|
| Idle | 4 | default stance / breathing / personality at rest |
| Walk | 6 | normal locomotion |
| Turn | 3 | directional pivot |
| Talk | 4 | speaking state |
| Surprise | 4 | immediate reaction |
| Approach | 4 | deliberate interpersonal step / closing distance |
| Laugh | 6 | strong positive emotional reaction |
| Run | 6 | urgent locomotion |

These frame counts are a **v1 interoperability budget**, not permanent final-production canon.

They exist so new heroes can be compared under the same technical load.

After all four heroes are validated, final production may revise counts if evidence justifies it.

---

# 6. Shared animation semantics, character-specific motion

The category name is shared.

The movement inside the category must not be cloned.

## Idle

Must communicate the character before dialogue starts.

Examples:

- Karen: forward-ready
- Triton: low and stable
- Sophie: hands ready to help
- Margaret: vertical and minimal

## Walk

Must preserve:

- character-specific stride
- body weight
- arm range
- hair response
- start / stop personality

## Turn

Do not use one universal turn.

A turn may be:

- fast whole-body
- planted pivot
- careful small rotation
- gaze/head-first measured turn

depending on character.

## Talk

Talk is not "wave one hand identically."

The body part carrying the acting should follow identity.

## Surprise

Do not make every hero jump.

Reaction magnitude is character-specific.

## Approach

Approach expresses interpersonal distance and intent.

Karen closes distance naturally.

Triton commits weight.

Future heroes may approach carefully or barely move.

## Laugh

Every hero must have a readable positive reaction, but it does not need the same amplitude.

Karen can bounce.

Triton stays grounded.

A restrained character may use a much smaller laugh.

## Run

Run must remain distinguishable from Walk while respecting body weight and hair physics.

---

# 7. Character identity contract

Before animation production, every new hero must have these fields locked or provisionally defined:

1. **Visual Identity name**
2. **identity sentence**
3. **primary silhouette hook**
4. **secondary hook**
5. **center of gravity**
6. **hair mass and motion rule**
7. **major color block**
8. **body-width / stance relationship to existing heroes**
9. **non-combat identity**
10. **acting core**

A valid new hero must still read as themselves when:

- weapon is hidden;
- exact hair color is mentally removed;
- profession iconography is reduced;
- costume micro-detail is ignored.

---

# 8. Do not use Karen as the anatomy template

Karen is the first validated actor, not the master body.

Forbidden production shortcut:

> Karen sprite → recolor → change hair → call it another hero.

Triton already proves this is unnecessary.

A new hero may differ in:

- shoulder width
- hip / torso relation
- leg mass
- head placement
- visible height
- foot spacing
- arm resting position
- hair volume
- face width / eye shape
- idle posture
- movement amplitude

while still using the same 48×48 technical architecture.

---

# 9. Current character-specific locks

## Karen — VILLAGE RUNNER

Preserve:

- forward / light impression
- red / red-brown hair
- low partial tie + loose hair
- warm off-white + muted-red upper block
- approachable face
- active whole-body acting
- fast approach
- larger laugh reaction
- stronger hair lag
- left-handed identity
- sword on anatomical right hip when weapon logic is relevant

Do not make Karen heavier and more planted to match Triton.

## Triton — GROUND ANCHOR

Preserve:

- planted / horizontal impression
- broader shoulders than Karen
- lower center of gravity
- heavy dark shoulder-length hair
- faded-blue low horizontal waist / side block
- sturdy off-white / gray upper mass
- reduced vertical bounce
- hair-tip motion instead of large whole-hair swing
- broad but grounded laugh
- right-handed identity

Do not turn Triton into a generic armored soldier or a recolored Karen.

---

# 10. Same-game visual language

Different characters must still feel authored by the same game.

Shared qualities:

- Chibi protagonist-focused face readability
- compact field/event body
- clean large silhouette masses
- controlled detail density
- readable color blocking
- nearest-neighbor pixel presentation
- practical Gray Crown clothing logic
- adult identity expressed through posture / behavior / clothing
- world-grounded feet

Shared language does **not** require:

- identical head size
- identical waist width
- identical leg length
- identical face shape
- identical animation amplitude
- identical hair physics
- identical visible height

---

# 11. Scale validation gate for every new protagonist

A new hero must be checked under:

- Full 48
- Medium 44
- Compact 41

At minimum capture:

1. matched-framing Idle with an existing validated hero;
2. Walk at Medium;
3. Talk at Medium;
4. one strong emotional animation at Medium;
5. Run at Medium;
6. Full / Medium / Compact Idle comparison.

Evaluate:

- face readability
- silhouette distinction
- color-hook readability
- foot grounding
- world furniture relationship
- NPC relationship
- protagonist presence
- animation readability
- whether Medium still feels like the same game as Karen / Triton

Default selection remains Medium unless evidence says otherwise.

---

# 12. Cross-character comparison gate

A new hero does not pass alone.

They must be placed beside at least one validated control under matched framing.

For the next character, the preferred controls are:

- Karen for forward / active contrast
- Triton for weight / grounded contrast

Pass conditions:

- silhouette difference is visible before color;
- face/body does not look like a reskin;
- center of gravity reads differently where identity requires it;
- hair mass has a separate physical logic;
- major color block remains character-specific;
- all characters still look like the same game.

---

# 13. Runtime metadata contract

Each character animation definition must explicitly provide:

- id
- src
- frameW
- frameH
- frames
- fps
- loop
- directions
- anchor
- offset
- prototype status while experimental

Animation timing may differ by character.

For example, a grounded hero can use lower FPS or smaller displacement than a light hero while keeping the same category and frame budget.

Do not encode identity only in filenames or comments.

---

# 14. File structure

Current repository convention:

```text
assets/characters/<character>/
  <character>_idle.png
  <character>_walk.png
  <character>_turn.png
  <character>_talk.png
  <character>_surprise.png
  <character>_approach.png
  <character>_laugh.png
  <character>_run.png
```

Reference source:

```text
docs/pixel/reference/
```

Generator / verifier:

```text
tools/generate_<character>_prototype_assets.py
tools/verify_<character>_prototype_assets.py
```

This can be changed later by a build-pipeline decision, but not casually during one character test.

---

# 15. Scene / cinematic integration

Pixel Actor animation remains transient scene state.

It must not require a Save schema change.

Scene completion must restore:

- input
- camera
- actor overrides
- dialogue lock state
- map position when using a reversible prototype scene

The current SceneRunner / camera override system remains the prototype integration route.

Do not create a second parallel cinematic engine for each character.

---

# 16. Portrait policy

Portrait policy remains unresolved.

Current prototype evidence favors Portrait OFF for in-world Pixel Acting because the Actor remains the emotional focus.

However:

- Portrait renderer stays available;
- Portrait ON comparison stays available;
- no existing Portrait system is deleted as part of character production;
- final policy requires a separate adoption decision.

---

# 17. Legacy 32px policy

The legacy 32px comparison remains available during the experimental phase.

Its role is:

- regression reference
- world-scale control
- proof that new art is adding value rather than only adding resolution

Do not delete the baseline merely because 48→44 currently performs better.

---

# 18. Battle scope

This standard currently governs field / event Pixel Actors.

It does **not** finalize:

- battle Ready
- Attack
- Hit
- Guard
- Skill
- Victory
- Down
- final weapon animation
- final weapon design

Battle migration is a later phase.

Do not force unresolved battle needs into field sprite design prematurely.

---

# 19. Validation / test contract

A new protagonist validation branch should verify:

## Asset invariants

- 48×48 frame cells
- expected directional rows
- expected frame-grid dimensions
- transparent RGBA source
- all eight categories exist
- metadata references resolve

## Runtime invariants

- animation fallback works
- one-shot completion works
- scale uses the foot anchor
- anchor drift remains within rounding tolerance
- camera returns
- transient actors clear
- input unlocks
- Save schema remains 23
- logical world remains 32px

## Browser evidence

- matched-character comparison
- eight-animation sequence
- Full / Medium / Compact comparison
- normal control restoration

## Regression

The existing production / prototype regression gates must continue to pass.

A new character is not allowed to "pass" by breaking the story path, save system or existing Karen / Triton tests.

---

# 20. Decision states

Each new hero phase ends with one of:

## GO

The shared architecture works and the character remains themselves.

Proceed to the next authorized character or standard refinement.

## REVISE

The architecture works, but the visual translation or acting does not preserve identity.

Revise that character; do not redesign the whole system automatically.

## NO-GO

Use only when evidence shows the shared architecture itself cannot safely support the character.

A visual miss alone is not sufficient for architecture NO-GO.

---

# 21. What is still undecided

This v1 does not decide:

- formal Pixel-native adoption for the whole game
- final game-wide hero scale
- final Portrait policy
- final NPC resolution / migration policy
- battle sprite standard
- Level 3 cinematic resolution
- final Stage B costumes
- final weapons
- exact eye colors
- surnames
- Kingdom / Empire / religious emblems
- hero certification marks
- military insignia
- v24 story scope
- main merge strategy

Do not turn provisional implementation convenience into canon.

---

# 22. Next character order

After this provisional standard is reviewed:

> **Sophie — STEADY HANDS** is the next single-character validation.

Do not start Margaret at the same time.

Sophie should begin with one front-facing Idle candidate only.

Her test should specifically challenge whether the standard can represent:

- a smaller 158cm hero
- softer standard body shape
- rounder face / gentler eyes
- honey-colored hair
- low soft bundle / braid
- large off-white body color mass
- green concentrated around the hands
- acting whose primary expressive focus is the hands
- small steps
- quiet support
- stillness when angry or serious

This is intentionally a different problem from both Karen and Triton.

---

# 23. Provisional adoption rule

This document becomes a stronger production standard only after:

1. Karen evidence remains valid;
2. Triton evidence remains valid;
3. Sophie passes without being forced into Karen or Triton's body language;
4. Margaret later passes with her own vertical / measured identity;
5. game-wide scale and Portrait policy receive explicit approval.

Until then:

# **PIXEL CHARACTER STANDARD v1 = PROVISIONAL**
