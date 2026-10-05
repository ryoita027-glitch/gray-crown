# NEXT_WORK_ORDER.md

## Gray Crown v23 — Current Visual Production Order

**Repository:** ryoita027-glitch/gray-crown  
**Canonical branch:** main  
**Current phase:** Art Bible v2 PROVISIONAL completed  
**Do not start v24.**

---

# COMPLETED

- Stable v23 game foundation preserved.
- Current hero walking sprite = ACTIVE runtime / PROVISIONAL design.
- Margaret runtime hair = white / silver-white.
- Karen Visual Identity = **VILLAGE RUNNER / LOCKED**.
- Triton Visual Identity = **GROUND ANCHOR / LOCKED**.
- Sophie Visual Identity = **STEADY HANDS / LOCKED**.
- Margaret Visual Identity = **MEASURED LINE / LOCKED**.
- Four-hero silhouette / color-mass / pose differentiation locked.
- docs/art/GRAY_CROWN_ART_BIBLE_v2.md = **PROVISIONAL**.
- Art Bible defines line, face, eyes, hair, skin, cel shading, shadow hierarchy, color, cloth, leather, metal, light, background density, composition, daily-life art, battle art, event CG and reproducibility gates.

---

# NOW

## Karen Stage A — first single-image Art Test

Generate **one image only**.

Purpose:

> Prove that the locked Karen design and provisional Gray Crown illustrator language can produce a character who is immediately appealing, specifically Karen, and reproducible.

### Required Karen identity

- 23-year-old adult woman
- 165cm healthy build
- round expressive eyes
- arched brows
- clean nose bridge
- red hair
- naturally sun-touched skin
- low partial hair tie
- approachable / active presence
- Stage A village-life continuity
- warm off-white base clothing
- short muted-red practical upper garment
- left-handed identity respected
- sword carry structure on right hip
- no final hero costume

### First-image evaluation order

1. **魅力的か**
2. **カレン固有の魅力か**
3. **Gray Crownらしいか**
4. **AI的な不自然さがないか**

Do not accept “not AI-looking” as sufficient if the character is not appealing.

### First-image restrictions

Do not invent:

- exact eye color as canon
- surname
- final sword design / name
- final Stage B costume
- Kingdom emblem
- hero insignia
- new keepsake / scar / family gift

Do not generate:

- Triton
- Sophie
- Margaret
- four-hero group
- formal Character Reference sheet
- Pixel Sprite

### Stop condition

After the first Karen Stage A image, **evaluate it before making another image**.

---

# AFTER FIRST KAREN IMAGE PASSES

Run Karen reproduction tests:

- normal standing
- conversation
- walking
- sitting
- smile
- serious expression
- battle-ready posture

Check consistency of:

- face shape
- eye shape
- brows
- nose
- mouth
- hair structure
- body proportions
- short upper-garment length
- sleeve construction
- belt / pouch positions
- right-hip sword carry
- boot length
- color mass

If Karen changes between images, return to Visual Identity / Art Bible instead of batch-producing.

---

# AFTER KAREN REPRODUCTION

Select a **Provisional Style Anchor** from successful Karen images.

Karen alone does not define the final Style Anchor.

Then test **Triton or Sophie**.

Condition:

> clearly a different person

and:

> same game / same illustrator

---

# AFTER SECOND-CHARACTER VALIDATION

- create final multi-character Style Anchor
- create formal Character References one hero at a time
- compare Character References against provisional runtime sprites
- remake Pixel Sprites only after Character References are locked

---

# AFTER CHARACTER FOUNDATION IS STABLE

Create a short early-game Vertical Slice at near-final quality across:

- characters
- backgrounds
- UI
- battle presentation
- event presentation
- BGM / SE

Depth before breadth.

---

# NOT YET

- v24
- north old checkpoint content
- new maps
- new bosses
- formal Four Generals design
- formal Shion design
- final Stage B hero costumes
- final weapon designs
- emblems / insignia / religious symbols
- mass image generation
- event CG batch production
- background batch production
- final Pixel Sprite rebuild
- treating runtime sprites as formal Character Design

---

# Regression policy

The Art Bible change is documentation-only and does not modify runtime behavior.

Any later runtime asset / code change must preserve:

- JavaScript syntax
- Node regression suite
- Browser v21 Gate
- Serad Frontier Section 1 E2E
- Serad Frontier Section 2 E2E
