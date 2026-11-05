# Gray Crown — RYUNE_ACTING_REVIEW_v1
**2026-10-10 JST — Phase 3 candidate.** Branch: `pixel-vslice-ryune-acting-v1`, based on accepted Phase-1 **development** HEAD `994178432e44cdb06dd592fdd2d39bc418d90acc` (PR #39). No `main` merge. PR #40 Ryune Art v2 is an unapproved **parallel** aesthetic draft, not silently imported.

## Provenance, controls and scope
- Character contracts: `docs/pixel/PIXEL_CHARACTER_ACTING.md`, `docs/characters/CHARACTER_VISUAL_IDENTITY.md`, `docs/pixel/PIXEL_CHARACTER_STANDARD_v2_FOUR_PROTAGONIST.md`. The latter two include historical status but remain the original acting/identity evidence; no unconfirmed Character Bible is fabricated.
- **Canonical event text and choices/effects unchanged** in `js/data/events.js` (`alpha.village.appointment` has 22 exact lines, four original effects). The event runner `js/systems/events.js` routes **only** the initial village appointment to existing `GC.Cinematic.startScene()`; all other events use their original code.
- `js/systems/ryune_acting.js` adds **only presentation** cues by matching exact line indices while existing dialogue is visible: turn, native 48px animation, short tweened temporary actor moves, camera focus, one soft existing step SFX. No large event engine rewrite.
- The four actors are individual **48×48-source/44px-display** PNGs, not fresh generations. Save schema 23, world actor logical positions, directions, collision/trail, story and event idempotence remain authoritative.
- **Portrait ON** is the existing default. **Portrait OFF** is a testable alternative via `GC.RyuneActing.setPortraitMode('portraitOff')` before starting a fresh appointment. This is non-persistent A/B instrumentation, not a product option or a decision to remove portraits.

## Per-character acting implementation (motion distinct, not recolored clones)
| Actor | Existing acting identity | In-scene cues | Limitations |
|---|---|---|---|
| Karen | VILLAGE RUNNER | approaches envoy first, shifts forward before commitment, pulls back to consult companions | same approved PNG, not a new facial expression |
| Triton | GROUND ANCHOR | turns/holds position, then deliberately closes distance to Karen as supportive protection; no laugh jump | true custom "step-between" pose would need later artist-approved frames |
| Sophie | STEADY HANDS | small controlled approach on orphanage/rice mention; restrained hands-led Talk frames | specific wound-check/anger frames not authored in this event |
| Margaret | MEASURED LINE | turns/gaze to speaker, idle stillness on key replies, slower expressive response | gaze before full-body turn is conveyed via timing cues, not a new eye-sprite or new lore |

**Shared acting must not flatten personalities.** The existing protagonist PNGs have per-character animation FPS; 48px image sources and direction convention unchanged.

## NPC priorities and implemented art
Existing `NPC_STYLE` + `drawNpcCommercial` differentiated role silhouettes, **without changing map IDs/placement**. Selected contacts: `messenger` upright/cape shoulders; `mayor` elder collar; `father`/`karenFather` strong shoulder; `caretaker`/`karenMother` clasped hands; `mika`/`orphan`/`theo` short child silhouette; `baker` apron mass; `farmer` workwear hem. They use consistent pixel-grid accents and retain their existing costume palettes. **These are not final designs**: no new Canon weapons, emblems, religion, uniforms or personal stories were established. NPCs outside the selected early roster continue with the shared reusable renderer.

## Acceptance & real screen capture
Run `npm run check`, four-protagonist source/manifest checks and `python tests/browser_ryune_acting_e2e_test.py`. The browser test drives actual new game → envoy via ordinary keyboard, runs **exact same 22 original lines** in two isolated fresh contexts for A Portrait ON and B Portrait OFF, captures before/line milestones/after and mobile, and asserts:
- character-specific actor positions/animations and matching original speaker order;
- input locked during dialogue, duplicate appointment dispatch ignored, Save/Load disabled;
- event/Story flag exactly once, camera/position/facing/trail/input restoration, no browser exceptions;
- Save schema 23 re-save, reload/Continue and no unintended replay.
- Test screenshots must be from the actual game in Chromium, **never AI-generated or recomposited**.
CI exact HEAD / run / artifact are reported in the Draft PR comment after validation; any red gate means technical **REVISE**.

## Portrait A/B: evaluation protocol (final user decision required)
| Criterion | A: Portrait ON | B: Portrait OFF + acting |
|---|---|---|
| Speaker identity | established avatar + speaker name | speaker name + 4 on-map active bodies and gaze |
| Emotion | static portrait plus line and body cues | relies more heavily on body/line pacing and camera |
| Attention on actors | portrait competes with world actors | more of the world staging remains visible |
| Dialogue obstruction | large avatar occupies overlay | text has more width; still needs screen-size review |
| Length | same 22 lines, no added text | same 22 lines, no added text |

**Do not assert a subjective winner from automatic tests.** Inspect screenshots and regular-speed play: who speaks, silent reactions, screen time, read legibility, pacing on mobile. Keep Portrait ON/OFF as **UNDECIDED** pending explicit user signoff.

## Risks, recovery, next gates
- Current v1 concentrates on the appointment; generic village talk receives NPC silhouette improvements but does not yet have a fully voiced multi-actor event scene or new bespoke NPC animation sheets.
- Temporary actors replace the exploration party only while cinematic active. Camera should restore in `startScene`'s `finally`; cancellation must not complete the event; scene save is blocked by existing transient-state guards.
- Existing SceneRunner and dialog key handling are preserved; fix any automated-test timing regressions **without deleting or weakening story checks**.
- Genuine added quality remains an iteration; close-up motion is using current 8-category sprites, and distant silhouettes may still overlap.
- Rollback: keep Draft unmerged / reset development target to Phase-1 baseline `994178432e44cdb06dd592fdd2d39bc418d90acc`; no forced history editing. `main` v23 untouched.

**Review status before real CI:** implementation candidate, technical GO pending test, aesthetics UNDECIDED.
