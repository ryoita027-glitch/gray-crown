# Gray Crown — Ryune optional character micro-acting standard v1

**Status:** Draft — implementation candidate only. Approval of final art, acting quality and integration is pending actual browser/human review.

## Production goal

Increase the four childhood friends' individual charm through **small, situation-specific movement** in optional village moments, not extra cutscenes, compulsory scenes, generic fake talking, or many unrelated animations.

The character source artwork remains the four already-approved 48×48 RGBA PNG animation sheets. Rendering stays pixel-native with the existing 44px displayed scale and fixed feet. This milestone does **not** create new PNG designs, equipment, jewelry, emblems, canonical dialogue outcomes, Story milestones or game systems.

## Clear acting grammar

| Hero | Visual language | Implementation gate | Unacceptable |
|---|---|---|---|
| Karen | Quick response; gentle brief laughter on an actual playful line | ~45ms start delay; 850ms talk; one explicit well memory joke only | Exclamation marks triggering fake jumps; continuous bouncy idle |
| Triton | Grounded shoulders; stable feet; conversational dry humor | ~155ms start; 670ms talk; single restrained listening glance | Repeated stamping or aggressive full-body reactions |
| Sophie | Deliberate, comforting hand-focused existing talk frames | ~130ms start; 890ms talk; no random out-of-place walking | Childish hopping or treatment gestures without a patient |
| Margaret | One delayed consideration before speaking | ~290ms start; 700ms talk; quiet listener turn on a relevant line | Same large expressive motion as Karen |

The **only optional context pairs** enabled for a responsive short listener glance are:

- Ryune well: Karen ↔ Triton
- Karen's family table (post-appointment only): Karen ↔ Triton
- Orphanage toy chest: Sophie ↔ Karen
- Mayor house books: Margaret ↔ Triton
- East cottage soldier letter: Triton ↔ Karen
- West field: Triton ↔ Margaret
- East brook: Sophie ↔ Karen

The actual language and event consequences are owned by `js/data/events.js`. Presentation never invents dialogue.

## Gating / visual rules

1. Original prop description remains the first inspection. Optional character moment only occurs if the player voluntarily inspects the prop a second time; no popup or surprise cutscene.
2. The listener must be an existing visible party member, within Manhattan 0.45–3.1 tiles of the talking actor. Remote NPCs/party members do not turn toward invisible dialogue. At most **one** listener reacts per page; the other party members continue ordinary idle.
3. Listener delay: usually 180ms; Sophie 260ms; Margaret 330ms. One 230ms authored `turn` pose, followed by idle facing the speaker. No position edit, auto approach, camera shake, particles or secondary idle bounce.
4. Talk animation is finite per dialogue page, with character-specific start and stop. No punctuation-only `surprise` or permanent talking while the reader is paused. The full-scene redraw cycle is capped at 1.75 seconds per spoken line.
5. "Soldier letter" is quiet: all visible talk segments at that prop are at most 490ms; no comedy or celebratory poses. Karen's brief well joke may use the existing `laugh` sprite; nobody else bounces to accompany it.
6. If reduced-motion is requested by the browser, if a combat or official cinematic is running, or if the character PNG has not loaded, the renderer safely uses the existing default sprite pipeline. No forced animation in a controlled cutscene.
7. All character poses are tied to the source-defined PNGs in `assets/characters/{id}/{id}_{animation}.png`, not generated live art, CSS translations, procedural body replacements or PNG overwrites.
8. The production world, NPC hitboxes, walking queue, Story 00–19, Save schema 23, optional rewards, and intro north-gate requirements are left unchanged.

## Implementation

- `js/systems/commercial_acting.js`: character-specific finite cues; optional-scene lifetime; limited partner listener reaction, no world writes.
- `js/systems/events.js`: starts the optional presentation scope only on listed event IDs and closes it before applying the original event effects.
- `js/render/world.js`: passes current visible party positions to the visual cue layer each draw frame, without mutating world positions or changing sprite asset selection.
- `tests/ryune_microacting.test.js`: timing, geometry, distance gates, safe cancellation, original Story/Save invariants and scene availability.
- `tests/browser_ryune_microacting_e2e_test.py`: actual player clicking the original well, then voluntarily triggering its micro-acting dialogue, screenshot and restored idle.
- `package.json`: `npm run ryune-microacting-acceptance` and default browser gate.

## Acceptance, not a claimed PASS

The authored source has been fetched from GitHub and its JS parsed; a V8 execution of the actual `commercial_acting.js` on a stub world has verified all four timings, pair turn, proximity safety, no remote listener, and event-scope cleanup. **This does not replace the project's actual Node test suite or Chromium rendering.**

At the exact PR head, run:

```bash
npm test
npm run ryune-microacting-acceptance
npm run check
```

Visually compare original and enhanced sprites at 100% and 150% browser viewport; check foot anchors, turn animation facing, tiny talk timing, long dialogue read time, real mouse/keyboard completion, save/Continue, and performance/RAF scheduling. Any awkward naturalness should be reverted or toned down; adding effects never takes priority over believability.

## Next opt-in enrichment

Only after real-play acceptance: add more brief **event-specific** poses to characters whose existing motion actually supports them. Prioritize Sophie handling a medical object with visible hands, Margaret looking at an existing book, Karen leaning forward to help, and Triton grounding his stance at a meaningful moment. Require authored existing frame support and visual approval first. Do not blindly reapply a talk/laugh animation to every line.
