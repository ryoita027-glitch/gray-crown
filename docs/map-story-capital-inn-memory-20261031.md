# 2026-10-31 — Aldina inn: let the street remain in the party's memory

## Baseline and isolation
- Parent Draft PR #172 head `3532cd4c80044f62ca8691e2ead0dbedb18bb1e2`; production `main` at inspection `d689aabb5146c9f45466a4f74f397e664c08fb4f`. This is a stacked Draft, **not** a merged release.
- Read canonical `js/data/events.js` first-night event, `js/systems/events.js` city encounters and event playback, `js/data/maps.js`, `js/render/world.js`, the existing capital tests and prior Draft #172.
- Other active Drafts include #171 (Sophie visual), #169 (Sophie art) and #166 (save recovery). This change is confined to existing `js/systems/events.js` dialogue and a new test. It does not touch sprite sheets, map tiles, NPC locations, render files, core save or the other task schedules.

## Player-facing slice
- **Problem found in canonical source:** the first night unconditionally said Margaret saw the ration queue even when a player could walk directly to the ceremony and inn without visiting it. This inadvertently grants the party knowledge the player did not acquire.
- **Now:** if the ration mother has not been met, Margaret's line avoids claiming to have seen the queue. The original line is retained if that encounter actually occurred.
- If the player helped move the south-gate vegetable cart, the White Stag innkeeper notices the delivery (before the first night's rest). Triton recalls the physical work during the night's conversation.
- If the player separately asked a citizen at the fountain, Karen recalls that voice. If the player instead quietly compared the poster and queue, Margaret reflects on the contrast. At most **two** extra night lines are inserted, and players who skipped the detours receive no extra scene.
- The canonical ceremony, first-night story advance, recovery, quest, item rewards, late-war scenes and save schema 23 are unchanged. The adaptation reads existing persistent choices only and never edits the source EVENT_DEFS.
- **Differentiation hypothesis:** the main story remembers small, voluntary acts of help and observation, rather than turning them into a new checklist or a loot transaction.

## Market evidence checked 2026-10-31
- **Observed individual review, negative:** [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/) contains an Oct 28 review praising art/exploration but criticizing a cast whose actions feel unimportant, and an Oct 24 review criticizing excessive explanation and insufficiently distinct character voices. Steam page excerpt does not display the year beside the day; the review date year is not asserted here.
- **Observed individual review, positive:** the same listing has an Oct 28 review praising small world details and a cast worth following. These are opinions from individual players, not representative market statistics.
- **Observed individual review, negative:** [Sea of Stars reviews](https://steamcommunity.com/app/1244090/reviews/) includes Oct 10 criticism of bland main characters despite appealing art. No claim of population-level consensus.
- **Inference, unverified:** a short, choice-sensitive night payoff may make optional exploration feel acknowledged and character voices more specific, while fixing the false-memory line. No human trial or retention metric has validated this.
- No other game's text, characters, scene layout, dialogue or quest mechanics are copied.

## Validation and acceptance
- Code was written to the branch and the complete changed JS file compiled using the JavaScript V8 parser in the connected tool environment.
- New `tests/capital_inn_civic_memory.test.js` covers skipped-queue continuity, asked/observed divergence, wagon delivery recognized by innkeeper and night, no repeatable reward, canonical first-night completion, and Save/Continue.
- **NOT RUN:** Node harness suite, `npm run check`, browser playthrough, save reload in actual Chromium, and human 5–10 minute test. The private GitHub repo cannot be cloned in the available container (network DNS unavailable); do not mistake parser checks for these tests.
- Next player-first acceptance: from south gate, compare direct ceremony→inn with wagon→ration→fountain→ceremony→inn. Count dialogue lines, inspect the first night for unnecessary repetition, confirm the optional callbacks are noticed, and ensure no collision or visual conflict with ongoing art PRs. Only then consider promotion.
