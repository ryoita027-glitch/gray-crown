# Margaret V6 independent head/neck/shoulder redraw — 2026-10-30

**ART NO-GO — DO NOT ADOPT.** Reversible study on exact PR #143 HEAD `03c989a1ea7e5cd707a821fdf3b8783f7898a34f`. This is a new hand-authored 48px pixel-art study, not a palette filter or 48→44 resampling trick.

## Actual asset
- `assets/characters/margaret/studies/margaret_independent_v6_no_go_walk.png`: RGBA 288×192, 4 directions × 6 walk-frame cells (24 cells). Generated offline with Pillow by manually specifying facial planes, silver-white hair masses, a shorter neck, two shoulder silhouettes, a dark robe, a center pale panel, a small book, shoes, and minor frame-dependent arm/leg movement.
- It preserves Margaret's adult white-haired scholar identity, purple outfit and book, but **does not preserve the original detailed costume exactly**. The experimental image is intentionally isolated and never wired into production.
- The existing V5 mayor and royal messenger remain the visual references. Do not copy their faces or clothing.

## Visual verdict
**NO-GO** after inspecting a 4× nearest-neighbor contact sheet: the redesign clarifies the three large hair planes and separates face, neck, robe and boots, but it is visibly **too geometric, simplified and toy-like** beside the higher-fidelity source and the V5 NPCs. The front robe looks flat, side profiles are stiff, the back hair reads as one uniform slab, and six walking frames have insufficient motion variation. It does not meet the player's commercial-art standard. Do not replace any original PNG or build later actions from this failed candidate.

This is a deliberate negative comparison to avoid another small crown/palette tweak. The study shows that merely reducing detail without preserving anatomy, cloth construction and character acting loses the existing character's appeal.

## Verification boundary
- The source PNG was generated and decoded locally with Pillow, dimensions and frame layout verified, and 4× nearest-neighbor preview inspected.
- **Not performed:** actual in-game Chromium capture, V5 mayor/envoy same-scene acceptance, eight actions, full Node/regression suite, frame-by-frame flicker acceptance or player art approval.
- A 44px source A/B comparison will be attached separately; it is a static sprite comparison, not gameplay evidence.
- No paid API, GitHub Actions or production sprite replacement. `main`, PR #98, PR #143, Save v23, story, maps, buildings and game balance remain unchanged.

## Next art pass
Return to the existing detailed Margaret source. Hand-redraw **a single direction and pose** with face/neck/shoulder coherence and a readable adult body first; preserve the existing robe tailoring and book, then compare it at native 44px beside V5 NPCs. Expand to all directions and actions **only after** that first pose visibly surpasses the original. Keep buildings deferred.
