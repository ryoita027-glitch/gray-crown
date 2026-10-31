# 2026-10-31 19:43 JST — Capital first-night pacing, no piled-on echoes

## Checked source and dependencies
- Main HEAD: `d689aabb5146c9f45466a4f74f397e664c08fb4f` (unchanged).
- Exact map/story parent: Draft #179 HEAD `615212f4323786f212ca6e3b826eb1b5e70f1170`, itself stacked on #176 and earlier unmerged map/story drafts.
- Open save Draft #180 is on a separate save branch; art Draft #181 is an experimental **NO-GO** and not used. This change only touches `js/systems/events.js`, `tests/capital_inn_civic_memory.test.js`, and this note.
- Read the authored `alpha.capital.whiteStagNight` scene in `js/data/events.js`, the runtime `capitalNightEchoLines` adaptation, room-offer tests, fountain prerequisites, and existing inn story/event dispatch. Save schema 23 and authored scene remain untouched.

## Player-visible vertical improvement
- When the player explores both the south-gate vegetable cart and the fountain resident, the first-night scene formerly grew from **13 to 15** mandatory dialogue beats. The same optional information now replaces Sophie's existing line instead of appending two extra interruptions. The scene remains **13 beats** regardless of the optional combination.
- When the player quietly compares the victory poster and ration queue, Margaret's existing line carries that observation. When the player asks a citizen, Sophie recalls the actual citizen; when the party helps the cart, Sophie recalls the cart. Both choices can coexist without losing either callback.
- A player who never visited the ration queue is not credited with seeing it, even if a stale or injected fountain flag is present. The reserved-room setting still appears when offered. No new quest, reward, route lock, NPC, mandatory backtrack, save key or world-lore revelation.
- **Distinctive hypothesis:** player actions can color the same intimate four-friend scene, rather than adding separate exposition scenes; players who go straight to bed do not have to hear about unvisited locations.

## Player evidence / uncertainty
- Earlier same-day research note `docs/map-story-capital-inn-refugee-family-20261031.md` records individual Steam *Chained Echoes* reviews dated October 24–28, 2026: some criticize excessive exposition and indistinct voices, while others value the world detail and character relationships. Source: https://steamcommunity.com/app/1229240/reviews/
- 2026-10-31 follow-up web search did not yield a verifiable newly dated, comparable RPG review. **No new market-wide trend is claimed.** This pacing adjustment is a design inference, not demonstrated player preference or user-test evidence.
- We adapt the principle of short, contextual dialogue; no competitor script, scene or characters were copied.

## Verification
- GitHub-committed runtime and Node test files were re-fetched; both parsed in V8 (**2/2**).
- The real extracted `capitalNightEchoLines` function was run against the repository's authored 13-line night scene in **7 isolated state combinations**, all passed. Checks: scene length, cart/fountain callbacks, false queue claims, room-offer setting, no mutation of canonical lines or event state.
- Existing `capital_inn_civic_memory.test.js` was updated for the new fixed-length contract and the fountain's required queue prerequisite; a stale-flag/room-offer regression was added.
- **NOT RUN:** Node harness test suite, full `npm run check`, browser traversal/dialogue timing, Save/Continue integration, and human player study. The private repo is accessible via GitHub connector, but not cloned into this local runtime.
- **Draft / no merge:** verify actual 44px scene, choice and event sequencing, and night-to-morning progression on this exact branch before integrating stacked drafts.

## Next concrete friction
- Inspect the *mandatory* ceremony and Granz briefing dialogues in browser. If players must click through long exposition before regaining control, shorten or re-stage it without removing the core war-truth setup or the four protagonists' voices.
