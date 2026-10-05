# Gray Crown Visual Source of Truth Status

**Repository:** ryoita027-glitch/gray-crown  
**Canonical branch:** main  
**Game baseline:** v23  
**Character Visual Patch:** rev 23.1  
**Visual Identity phase:** **FOUR HEROES LOCKED**  
**Status:** READY FOR ART BIBLE v2 PROVISIONAL

## GitHub rule

Before every task, inspect the current GitHub main / working branch / diff. Do not overwrite newer GitHub work with an older ZIP.

## Current authoritative visual documents

- docs/characters/CHARACTER_VISUAL_IDENTITY.md — **LOCKED / PHASE 1 COMPLETE**
- docs/characters/KAREN_COSTUME_DESIGN_v1.md — **LOCKED**
- docs/visual/VISUAL_ASSET_MANIFEST.md — current runtime/provisional asset policy
- docs/audit/VISUAL_FOUNDATION_AUDIT.md — audit reference
- docs/audit/VISUAL_STATUS_MATRIX.md — current status matrix
- docs/audit/NEXT_WORK_ORDER.md — current execution order
- docs/audit/NEXT_AI_MASTER_INSTRUCTION.md — current AI handoff

## Locked hero Visual Identities

- Karen — **VILLAGE RUNNER**
- Triton — **GROUND ANCHOR**
- Sophie — **STEADY HANDS**
- Margaret — **MEASURED LINE**

Margaret hair color is **white / silver-white**.

## Still unresolved / do not invent

- exact eye colors for all four heroes
- surnames for all four heroes
- final weapon designs / names
- final Stage B hero costumes
- Kingdom / Empire emblems
- hero certification insignia
- religious emblem / official religious color
- Shion crown
- Kingdom / Empire rank insignia
- new keepsakes, scars, family gifts, or other backstory additions

## Recovery gap

These original authoritative source files are still not present in the repository and must not be reconstructed from memory unless the user explicitly asks for a reconstruction pass:

- GRAY_CROWN_CANON_v1.md
- CHARACTER_BIBLE_v1.md
- KINGDOM_CULTURE_v1.md
- EMPIRE_CULTURE_v1.md
- GRAY_CROWN_CULTURE_LOCK_v1.md
- CHARACTER_SHAPE_LANGUAGE.md
- COSTUME_RULES.md
- GRAY_CROWN_ART_BIBLE.md
- GRAY_CROWN_ART_BIBLE_v2.md

The current four-hero Visual Identity lock uses already confirmed project decisions and does not fill the unresolved items above.

## Current sprite contract

assets/hero_party_walk.png

- 96×512
- 32×32 cells
- 3 walk frames
- 4 directions
- 4 characters
- Row 0 Karen
- Row 1 Triton
- Row 2 Sophie
- Row 3 Margaret

Technical format: **KEEP**  
Runtime status: **ACTIVE**  
Design status: **PROVISIONAL**

Never derive final anatomy, face, costume, weapon, or hairstyle from the runtime sprite.

## Mandatory production order

**Character Visual Identity (DONE) → Art Bible v2 PROVISIONAL → Karen Stage A single-image test → Karen reproduction test → Provisional Style Anchor → second-character validation → final Style Anchor → Character Reference → Pixel Sprite**

## Next action

Create **GRAY_CROWN_ART_BIBLE_v2.md** as **PROVISIONAL**.

Do not generate Karen until that provisional Art Bible exists.
