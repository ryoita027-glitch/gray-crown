# Margaret V9 — head proportion / value trial (2026-11-02)

**ART HOLD; DO NOT MERGE.** Based on PR #262 exact HEAD `31f73f09eda039f50a8eae545a21fa11a4d9d873`. No edits to main, frozen #98, approved PNGs, buildings, story, balance or save v23.

The actual approved Margaret 192x192 idle atlas is source blob `910458eabfcfaef7442f885f319d0e2a09c88a66`. V5 mayor and royal messenger reference is `assets/npc/featured_residents_charm_v5.png` blob `b169b58a846e1812dc42f566ca1843a6088e901f`. Compared with V5 NPCs, Margaret's pale, wide upper hair mass reads unusually large and her outfit has weaker grouped values.

**Real binary trial:** `assets/character_trials/margaret_idle_head_proportion_v9.png` (192x192, 4 directions x 4 held frames). Source-locked generator `node tools/build_margaret_head_proportion_v9.js`. Three alternatives in the 44px four-way board `docs/art/evidence/margaret_head_proportion_v9_fourway_native44_ABCD.png`: original / A narrower head silhouette / B narrower silhouette plus muted hair perimeter / C value grouping alone. Rows: down, left, right, up. Same scale, same grass background, same position. This is **not** a Chromium screenshot.

Saved B preserves face/eye/neck core x16..31,y14..24 and all bottom pixels y35..47 from frame zero, and holds all four frames static to avoid the known 1px whole-body bob. 4,191 changed RGBA pixels across atlas; native44 direction differences [118,157,171,113]. Counts are not an aesthetic score.

`?heroIdleArt=5` selects B only when Margaret is stationary; other heroes use original idle frame 0. Movement continues to use approved walk atlases. Default gameplay and trial modes 1–4 remain unchanged.

**Visual verdict: HOLD.** B looks somewhat slimmer and the hair edge is more legible at 44px, but the profile locks risk looking compressed. This is not yet a credible full head/neck/shoulder solution and does not close the V5 NPC style gap. Revert if Margaret's identity is weakened. See existing V5 comparison `docs/art/evidence/margaret_headmass_v8_vs_v5_npc_native44.png`.

**Validation:** PNG assets and same-size A/B/C image were created from real pixels and stored; reproducibility tests are included. The full Node suite, real-game Chromium screenshot, mobile visual check, acting and animation review have **not** been executed in this run because the local container cannot resolve github.com to clone the full repository. No paid Actions run. Next gate: run `node --test tests/margaret_head_proportion_v9.test.js`, then real Ryune village canvas A/B before any artistic approval. Do not replace structural redesign with repeated tiny palette edits.
