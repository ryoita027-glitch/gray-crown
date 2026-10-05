# NEXT_WORK_ORDER.md

## Gray Crown v23 — Current Visual Production Order

**Repository:** ryoita027-glitch/gray-crown  
**Canonical branch:** main  
**Current phase:** Four Hero Visual Identity Lock completed  
**Do not start v24.**

---

# COMPLETED

- Game baseline v23 remains stable.
- Current hero walking sprite is documented as ACTIVE / PROVISIONAL.
- Margaret runtime hair is synchronized to white / silver-white.
- Karen Visual Identity: **VILLAGE RUNNER / LOCKED**.
- Triton Visual Identity: **GROUND ANCHOR / LOCKED**.
- Sophie Visual Identity: **STEADY HANDS / LOCKED**.
- Margaret Visual Identity: **MEASURED LINE / LOCKED**.
- Four-hero silhouette / pose / color-mass differentiation rules are locked.
- Unresolved eye colors, surnames, final weapons, final hero costumes, emblems and insignia remain unresolved.

---

# NOW

## 1. Build GRAY_CROWN_ART_BIBLE_v2.md as PROVISIONAL

Do not treat the old Art Bible as final.

The new Art Bible must define:

- line quality
- face rendering
- eye rendering technique
- hair rendering technique
- skin
- cel shading
- shadow hierarchy
- color / saturation
- cloth
- leather
- metal
- lighting
- background density
- composition
- standing illustration
- daily-life illustration
- event CG

Core principle:

> Gray Crown combines the visual appeal of a classic JRPG with the credibility of people who actually live in the world.

Do not reduce AI-feeling by making the work dull.

The following are allowed when intentional:

- beautiful faces
- attractive eyes
- strong designed hair highlights
- clear cel shading
- memorable color
- dramatic composition

The problem is not beauty. The problem is unselected, uniform luxury.

### Stop condition

Finish the PROVISIONAL Art Bible before generating any image.

---

# AFTER ART BIBLE v2 PROVISIONAL

## 1. Karen Stage A — one image only

Evaluate in this order:

1. Is she attractive as a character?
2. Is the attraction specifically Karen's?
3. Does she feel like Gray Crown?
4. Are there AI-like inconsistencies?

Do not generate four heroes together.

## 2. Karen reproduction test

Use the same Karen design in:

- normal standing
- conversation
- walking
- sitting
- smile
- serious expression
- battle-ready posture

Verify that hair structure, face, body, costume construction, color mass, right-hip sword carry and age remain consistent.

## 3. Provisional Style Anchor

Only after Karen reproduction succeeds.

Karen alone is not enough for a final Style Anchor.

---

# AFTER KAREN REPRODUCTION

## Second-character validation

Use Triton or Sophie.

Conditions:

> clearly a different person

and simultaneously:

> same game / same illustrator

If the second character becomes Karen-face, return to the Visual Identity and Art Bible.

---

# AFTER SECOND CHARACTER VALIDATION

- Create final multi-character Style Anchor.
- Create formal Character References one character at a time.
- Compare formal references to runtime pixel sprites.
- Only then remake Pixel Sprites if needed.

---

# AFTER CHARACTER FOUNDATION IS STABLE

Build the early-game Vertical Slice to near-final quality.

Scope should remain narrow and include:

- characters
- backgrounds
- UI
- battle presentation
- event presentation
- BGM / SE

The goal is a short playable section that can honestly represent final Gray Crown quality.

---

# NOT YET

- v24
- north old checkpoint content
- new story maps
- new bosses
- formal Four Generals design
- formal Shion design
- final Stage B hero costumes
- final weapon designs
- Kingdom / Empire emblems
- hero certification insignia
- religious emblem
- rank insignia
- mass character image generation
- event CG batch production
- background batch production
- final Pixel Sprite rebuild before Character Reference
- treating current runtime sprites as canonical character design

---

# Regression policy

Document-only Visual Identity / Art Bible updates do not require gameplay code changes.

Any runtime asset or code change must preserve:

- JavaScript syntax
- Node regression suite
- Browser v21 Gate
- Serad Frontier Section 1 E2E
- Serad Frontier Section 2 E2E

Do not alter the stable game foundation without a concrete reason.
