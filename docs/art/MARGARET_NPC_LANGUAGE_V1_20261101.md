# Margaret / V5 NPC visual-language trial — 2026-11-01 16:18 JST

**ART HOLD / NOT APPROVED / DO NOT MERGE.** Reversible art-evidence branch stacked on Draft PR #236 HEAD ff6697fe8f1f2cfa0cbaea681615f3fe563956f6. Frozen PR #98, main, production character PNGs, buildings, Save v23, story, battle and balance are unchanged.

## Source and visual reference

- Exact source: assets/characters/margaret/margaret_idle.png, Git blob 910458eabfcfaef7442f885f319d0e2a09c88a66, 192×192 RGBA, 4 frames horizontally × down/left/right/up vertically.
- Reference: assets/npc/featured_residents_charm_v5.png, Git blob b169b58a846e1812dc42f566ca1843a6088e901f, 432×192 indexed PNG, V5 mayor cell column 3, messenger column 4.
- Existing docs/art/GRAY_CROWN_ART_BIBLE_v2.md, Margaret direction lock v5 and earlier #218/#221/#224/#233/#236 trials were consulted. No duplicate style bible.
- **Corrected inspection distinction:** the four 48px cells across an idle row are **animation frames**, not directions. Directions are four rows. The new A/B correctly displays down/left/right/up in separate rows.

## Actual new assets and code

1. docs/art/evidence/margaret_idle_npc_language_v1_HOLD.png: actual 192×192 RGBA 16-frame trial, Git blob ecd817651a2eecc9e634a8e408969366eab703be. Preserves original alpha/silhouette, face rectangle, skin base, and foot/shoe rows. Hair color planes are slightly less violet and exterior contour uses restrained neutral plum/charcoal to bring Margaret nearer the V5 NPC edge hierarchy without copying their face/costume.
2. docs/art/evidence/margaret_idle_npc_language_v1_native44_AB.png: 176×288 comparison PNG, Git blob 9d770284280722ac7f94d0b483f5a3fe1a9e5a05. Four direction rows × (original, trial, V5 mayor, V5 messenger), 44px nearest-neighbor on common grass/checker and y54 footline.
3. tools/art/margaret_npc_language_v1_trial.js: deterministic source-SHA-locked offline generator, producing the two PNGs without editing source.
4. tools/art/png_rgba_portable.js: dependency-free PNG reader/writer used for binary generation and readback (RGBA and indexed inputs).
5. tools/art/margaret_npc_language_v1_review.html: four-direction, four-idle-frame native44 review board with background switch and comparison PNG export.
6. tests/margaret_npc_language_v1_trial.test.js: source/face/foot/alpha/16-frame/PNG-roundtrip assertions; **not run as Node test command in this environment**.

## Verification actually performed

- Fetched exact original Margaret and V5 NPC binary blobs through the GitHub connection; decoded both (192×192 RGBA and 432×192 indexed). PNG encode/decode roundtrips had zero RGBA differences.
- Generated the trial from the same transform function text as committed generator, and visually inspected the 44px four-direction A/B (also enlarged for inspection).
- Trial vs original: 5,683 changed pixels across 16 idle frames; **0 alpha differences, 0 protected face-rectangle differences, 0 foot-row differences**. Each frame has 316–422 changed pixels. Counts are technical checks, **not an art-quality score**.
- Re-fetched both committed binary PNGs from GitHub; exact Git blob SHA and dimensions matched.
- JavaScript source syntax parsed successfully for codec, generator, test, and HTML script. This is **not equivalent** to executing Node tests or real Chromium.

## Visual verdict: HOLD, not a commercial-quality win

At native44 the neutral contour can separate parts of the silver hair from the background a little more clearly. However, the visual gain is small, and the V5 mayor/messenger still use different face, torso, and material-shading construction. Margaret's large side/back hair silhouette, head–neck–shoulder relationship, and player-scale mismatch remain unresolved. A darker outline by itself is not a complete design fix; this trial must **not** replace the live sprite.

## Not performed / next work

- No actual Ryune village Chromium screenshot; local repository checkout is unavailable because direct GitHub DNS/network access is blocked. The A/B is **real source pixels**, but a **static mock background**, not the game.
- No all-eight-action sprite reconstruction, walking/acting continuity test, battle display comparison, full npm check or human full-screen aesthetic approval. No paid API or Actions run.
- Next: use a full repository checkout to run the generator and Node test, open the 44px review in Chromium, then inspect Ryune game screenshots with mayor/messenger at the same camera state. If trial is not clearly better, reject; then rebuild Margaret's head/neck/shoulder **geometry** in the original pose rather than repeating palette-only edits. Keep environment/building art on hold until the character cast passes visual review.
