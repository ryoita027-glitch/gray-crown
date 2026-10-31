# 2026-10-31 — White Stag waiting family: visible consequence of the room choice

## Source-of-truth and conflict check
- Checked current `main` HEAD `d689aabb5146c9f45466a4f74f397e664c08fb4f` and exact parent Draft #176 HEAD `424597278d5c2bf7afa294c810f7d51d120d52ed`.
- Inspected stacked map-story #157–#176 and latest open art #178 / save #177. This Draft is based on #176 and touches only `js/data/maps.js`, `js/data/npcs.js`, `js/systems/events.js` and one new test. No core save, renderer, sprites, other branches or main were changed.
- Checked the existing White Stag map (24×15; door 11,12, notice 6,5, hostess 8,6, soldier 15,8, bed 17,4), event dispatch, first-night scene, NPC style definitions and Save v23 choice key.

## Player-visible change
- The notice from #176 now has a **person** behind it: a mother waiting in the western part of the inn at (6,8). She is optional to talk to and hints at the existing board; the central route and bed remain clear.
- If the party gives up its military room, she notices immediately. The next morning she confirms her child finally slept through the night, while the guestbook shows their overnight stay and still-unknown destination.
- If the party does not offer its room, she is still seeking lodging. No hidden moral penalty, required dialogue, currency, reward farming or route lock. The mother is not shown on the much later kingdom-return stage.
- Her palette uses the existing refugee NPC colors, without introducing a new unreviewed sprite style. No other characters, layouts or cutscenes are copied.
- **Differentiator (hypothesis):** an optional inn notice is not only a choice prompt but a reachable person, an immediate reaction, and a quiet next-morning world-state consequence. The outcome is modest, not a claim that the war or displacement is resolved.

## Player signals — checked 2026-10-31 JST
- **Observed, individual negative review**: Chained Echoes Steam reviews dated October 28 criticize protagonists not making a difference despite strong exploration/art: https://steamcommunity.com/app/1229240/reviews/
- **Observed, individual positive review**: same listing October 28 praises little world details, cast and journey; another October 28 review praises character connections: https://steamcommunity.com/app/1229240/positivereviews/
- **Observed, individual mixed review**: October 24 review praises worldbuilding but criticizes exposition and indistinct voices: https://steamcommunity.com/app/1229240/reviews/
- **Inference:** show a consequence in a world object and a person with brief character-specific dialogue rather than adding mandatory exposition. These reviews do not establish general market preference or proven improvement for Graygrow.
- **Unverified:** Japanese review sampling, quantitative preference, actual first-time players' response, 44px readability and human testing.

## Validation / acceptance
- The changed JavaScript and new Node test were parsed by V8. Four isolated runtime dialogue checks passed: no offer/before night, offer/before night, offer/after night, no offer/after night. The existing 24×15 interior floor and obstacle coordinates were also reviewed; this is not a browser collision test.
- The new Node harness test covers the entrance-to-mother route, interaction before/after offering, no inventory reward, Save/Continue, next morning, skipping, and late-war hiding. **Node test itself and full `npm run check` have not run** because the private GitHub repository cannot be cloned from the isolated local runtime.
- Still required: actual browser playthrough and Save/Continue integration; verify family silhouette at 44px, interaction radius, room-night transition, whether the mother and notice feel redundant, and whether the scene becomes overly sentimental.
- Keep Draft. Do not merge into main before parent #176 and all stacked dependencies are reconciled and browser acceptance passes.

## Next bottleneck
Measure the south-gate → ceremony → White Stag → morning exit route, including the direct no-detour path. If the player is delayed by repeated ceremony/inn narration, shorten the **mandatory** lines rather than adding another optional quest.
