# Margaret front-facing head/neck/shoulder structural redraw — 2026-11-01 19:19 JST

**ART HOLD — front-facing idle study only. DO NOT MERGE / DO NOT USE IN GAME.**

## Source and isolation
- Stacked on #244 exact HEAD `aefe27d20b17cbe66152a31d5dfeccdb0dc7382f`; approved Margaret idle blob `910458eabfcfaef7442f885f319d0e2a09c88a66`, V5 residents blob `b169b58a846e1812dc42f566ca1843a6088e901f`.
- Original game PNG is unchanged. This is a new experimental 192×192 RGBA atlas. Other three directions and all seven other actions are **untouched**.
- Existing Art Bible v2 and cast/NPC contact audit were consulted; no duplicate style guide.

## Actual pixel work
- Rebuilt front-facing head geometry in all four idle frames: tapered face and jaw, short shaded neck, collar-to-shoulder bridge, and three controlled silver hair masses.
- Kept silver-white hair, purple costume, gold pin, original body/boots and overall pose. Face and bangs are an unapproved redesign.
- Changed **1430 RGBA pixels**, including **323 alpha changes**. Other directions and foot rows 39–47 are unchanged.
- `docs/art/evidence/margaret_front_structural_redraw_HOLD.png`: trial PNG.
- `docs/art/evidence/margaret_front_structural_redraw_native44_AB.png`: original/trial/V5 mayor/V5 messenger at 44px, same grass/checker and contact-normalized foot line, four directions (lower three rows unchanged).
- `tools/art/margaret_front_structural_redraw.js`: exact-source-locked offline generator.

## Visual assessment and limits
- PNG source SHAs verified and generated PNGs roundtrip-decoded without pixel difference.
- New front has a more clearly defined face/neck at small scale, but hair may appear flat or helmet-like; new face may lose Margaret's approved character identity. Lower-hair-to-head join and side/back continuity are not resolved. **HOLD, not a verified commercial-quality improvement.**
- **Not executed:** real Ryune Chromium screenshot, native Node/npm suite, other 7 actions, battle/dialogue visual review or user art approval. Local direct git clone DNS-blocked; no Actions or paid API invoked.
- Next: live 44px village screenshot, review this front alongside NPCs, refine face/hair identity and extend to other directions/actions only if the visual comparison is genuinely better. No building changes before character acceptance.
