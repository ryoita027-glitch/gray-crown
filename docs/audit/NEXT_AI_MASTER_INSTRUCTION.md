# NEXT_AI_MASTER_INSTRUCTION.md

## Gray Crown v23 — Visual Production Handoff

This is the current handoff for an AI continuing Gray Crown without the prior chat.

---

# 0. Repository first

Repository:

**ryoita027-glitch/gray-crown**

Canonical branch:

**main**

Before doing work:

1. inspect the current main head
2. inspect active branches / relevant PRs
3. inspect the current diff
4. never overwrite newer GitHub work with an old ZIP

Game baseline remains **v23**.

Do not start v24 unless the user explicitly changes phase.

---

# 1. Current visual phase

The four protagonist Visual Identities are now **LOCKED**.

Authoritative file:

**docs/characters/CHARACTER_VISUAL_IDENTITY.md**

Locks:

- Karen — **VILLAGE RUNNER**
- Triton — **GROUND ANCHOR**
- Sophie — **STEADY HANDS**
- Margaret — **MEASURED LINE**

This lock defines the major identity: face/body direction, posture, hair structure direction, color-mass logic, silhouette, personal visual hook and Stage A→B development logic.

It does **not** define every costume or weapon detail.

---

# 2. Core hero differentiation

## Karen

- 23F / 165cm
- healthy middle build
- round expressive eyes
- arched brows
- red hair
- naturally sun-touched skin
- left-handed
- forward center of gravity
- low partial hair tie
- red concentrated in a short upper garment
- identity: approachable, active, moves toward people

## Triton

- 23F / 171cm
- most trained / athletic
- sharper face
- narrow eyes
- straight brows
- broader mouth
- dark shoulder-length hair
- right-handed
- low stable center of gravity
- blue concentrated as a low horizontal mass around waist / side
- identity: grounded physical confidence, reliable friend, sharp eyes + broad laugh

## Sophie

- 23F / 158cm
- soft standard build
- rounded face
- slightly drooping eyes
- honey / light brown-gold hair
- right-handed
- small movements
- one low soft hair bundle / braid
- off-white / white major field + green concentrated near the hands
- identity: comforting, practical helper, gentle but immovable where life is concerned

## Margaret

- 23F / 167cm
- slender but healthy
- narrower oval face
- observant narrow eyes
- small mouth
- right-handed
- vertical organized posture
- **long white / silver-white hair**
- one side intentionally opened / tidied
- white vertical outer field + thin dark center line
- identity: orderly, observant, intellectual; her white hair is not the entire design

---

# 3. DO NOT INVENT

The following remain unresolved:

- exact eye colors
- surnames
- final weapon designs / names
- final Stage B hero costumes
- Kingdom emblem
- Empire emblem
- hero certification insignia
- religious emblem
- official religious color
- Shion crown
- Kingdom / Empire rank insignia
- new keepsakes, scars, family gifts, romances, or backstory additions

Do not let an image model decide these.

---

# 4. Current runtime sprite

assets/hero_party_walk.png

- 96×512
- 32×32 cells
- 3 frames
- 4 directions
- 4 characters
- Row 0 Karen
- Row 1 Triton
- Row 2 Sophie
- Row 3 Margaret

Technical format is stable.

**Design is PROVISIONAL.**

Never reverse-engineer final Character Design from the sprite.

Mandatory order:

**Character Design → Character Reference → Pixel Sprite**

---

# 5. Next task

Create:

**GRAY_CROWN_ART_BIBLE_v2.md**

Status:

**PROVISIONAL**

Do not generate images before this provisional Art Bible exists.

The new Art Bible is not a prohibition list. It must answer:

> How does the Gray Crown illustrator draw?

Define:

- line
- face
- eyes
- hair
- skin
- cel shading
- shadows
- color
- cloth
- leather
- metal
- light
- background density
- composition
- standing art
- daily-life art
- event CG

Core visual statement:

> classic-JRPG character appeal + real people who visibly live in this world

Beautiful and striking is allowed.

Do not solve AI-feeling by reducing attractiveness or saturation indiscriminately.

---

# 6. After provisional Art Bible

Generate **Karen Stage A only**, one image.

Evaluation order:

1. attractive as a character
2. attractive in a Karen-specific way
3. Gray Crown identity
4. absence of AI-like inconsistency

If successful, do not batch produce.

Run Karen reproduction tests:

- normal standing
- conversation
- walking
- sitting
- smile
- serious
- battle-ready

The same Karen must remain the same person.

---

# 7. Style Anchor rule

Karen reproduction success allows a **Provisional Style Anchor** only.

Then test Triton or Sophie.

The second person must be:

> clearly different

and:

> same game / same illustrator

Only after two characters succeed may a final multi-character Style Anchor be locked.

Copy illustrator technique, not Karen anatomy.

Technique may transfer:

- line treatment
- cel-shadow logic
- eye rendering density
- hair rendering technique
- skin
- cloth
- leather
- metal
- lighting
- background density

Do not transfer:

- face proportions
- eye shape
- brows
- nose
- jaw
- body proportions
- hairstyle
- pose
- expression
- color-mass layout

---

# 8. Vertical Slice later

After the Character Foundation is stable, polish one short early-game Vertical Slice to near-final quality across:

- character art
- background
- UI
- combat presentation
- event presentation
- BGM / SE

Do not expand content breadth before proving final-quality depth.

---

# 9. Missing historical source files

The original Canon / Character Bible / Culture / Shape Language / Costume Rules / old Art Bible source files are still not present in the repository.

Do not silently reconstruct them from memory.

The current locked Visual Identity uses already confirmed project decisions only.

If a recovered original contradicts a current lock, report the conflict instead of silently rewriting either side.

---

# 10. Stop rule

For the next task, stop after **GRAY_CROWN_ART_BIBLE_v2.md PROVISIONAL** is complete.

Do not jump directly into image generation in the same step unless the user explicitly requests continuing beyond the Art Bible.
