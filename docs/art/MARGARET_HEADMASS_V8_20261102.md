# Margaret V8 head-mass and outer contour trial — 2026-11-02

**ART HOLD — DO NOT MERGE.** Branch `art/margaret-headmass-contour-native44-v8-20261102-0326` based on exact PR #260 HEAD `2767165d08db990ae245639bbfa05e6f32ba56ba`. The approved source atlas, `main`, frozen PR #98, story, save v23, balance and buildings are untouched.

## Real image work

Source is the actual `assets/characters/margaret/margaret_idle.png` Git blob `910458eabfcfaef7442f885f319d0e2a09c88a66`; V5 mayor and kingdom messenger are taken from `assets/npc/featured_residents_charm_v5.png` blob `b169b58a846e1812dc42f566ca1843a6088e901f` (front columns 3 and 4). New experimental 192×192 RGBA `assets/character_trials/margaret_idle_headmass_v8.png` is generated from source by `node tools/build_margaret_headmass_v8.js`.

- Preserve the original face/eye/nose/neck core exactly, keep hair color family and accessories, retain every lower-body/shoe pixel in the held pose.
- Bring only the far left/right upper hair contours inward by one source pixel, with a short taper at rows 19–22. Use an existing muted lavender shade at exposed outer hair edges rather than adding a new shiny palette or purple glow.
- Hold all four frames to the same grounded pose, avoiding the previously confirmed whole-body 1px bounce. This is deliberately a **static** idle candidate, not a new authored animation.
- Apply consistently to all four directions; do not overwrite the approved original or any walk/action asset.

## Comparable evidence

- [Four-direction 44px original / V8 A/B](evidence/margaret_headmass_v8_native44_AB.png) — each row down/left/right/up, original left and V8 right; same 44px nearest-neighbor scaling, grass, shadow and contact line.
- [V5 mayor / kingdom messenger / original Margaret / V8 Margaret](evidence/margaret_headmass_v8_vs_v5_npc_native44.png) — same nominal shoe contact, front direction. **Source-rendered boards, not real game screenshots.**

## Isolated in-game review

`?heroIdleArt=4` selects V8 **only for stationary Margaret**; the other three heroes use existing static idle frame 0. Walking always uses the original walk art. Modes 1, 2 and 3 and default play remain unchanged. Mode 4 intentionally does not play the bobbing frame cycle. The game falls back to approved walking art if the trial atlas fails to load.

## Technical evidence and art judgment

Isolated source-level V8 execution: `{"changedPixels":3191,"alphaChangedPixels":492,"native44ChangedPixelsByDirection":[65,79,75,59],"artVerdict":"HOLD"}`. Exact RGBA decode/encode round-trip verified for candidate and two comparison boards. Updated renderer parsed in V8. Native `node --test`, full `npm run check`, Chromium Ryune scene capture, mobile view, animation/acting review and art approval **NOT executed** in this environment because a complete checkout cannot be obtained (GitHub DNS blocked locally). No paid Actions run.

**Art verdict: HOLD.** The top silhouette is a little tighter and outer hair edges more defined, but the 44px difference is modest. The hero remains too pale and large-haired compared with the more cohesive V5 NPC face/shoulder/value grouping. This does **not** resolve the full-cast style mismatch and must not be called a commercial-quality improvement until the actual village screen shows a clear advantage. If the narrowing makes the hair less distinctive or any side pose seems pinched, reject V8. Next priority is full-scene real-canvas A/B, then a more deliberate head/shoulder redrawing using a source-locked face rather than repeating cosmetic color edits.
