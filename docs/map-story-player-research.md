# Gray Crown — map/story player signals and playable decisions

Updated: 2026-10-30 (JST). This is a working design log, **not** a claim of human playtest acceptance.

## Evidence observed (public, external)
- *Octopath Traveler II* Steam-derived review summary (TrueGG, sampled as of 2026-10-21): 93.0% all-language Steam positive; 90.3% of 524 Japanese-language reviews positive. This is **overall sentiment**, not proof that any single mechanic causes positive reviews. https://truegg.app/game/1971650/octopath-traveler-ii/
- Two identifiable September 2026 Steam-purchase reviews reproduced by Verdict: praise character/world journeys while criticizing weak party integration, repetitive chapter loops and side quests whose next step is hard to infer. These are **individual reviews**, not a representative survey. https://www.verdict.games/game/octopath-traveler-2
- *Chained Echoes* Japanese-language review aggregate: 81/100 positive vs 89% across all languages (sample sizes 100 and 7,722 in the source). This supports checking Japanese feedback separately, not assuming universal tastes. https://gamelog-jp.com/game/1229240/

## Design hypothesis for this iteration (not a measured player outcome)
Existing Ryune brook and field exploration already lets one observation earn one ration; do not create another fetch loop. Add a **voluntary, ~one-minute party moment** at the existing brook stones. Karen asks, Margaret weighs evidence, Triton sees the practical alternative, and Sophie responds to the human consequences. The player can leave a water-level mark, secure loose stones, or leave the managed shoreline untouched. Each is respected, recorded in schema-23 choices, and reflected by the brook keeper. Two choices leave a small persistent change on the actual stone prop; the mark/secure outcomes are also acknowledged by Boru after a normal report. No route lock, inventory bonus, guaranteed irrigation fix, new character, extra map, or copied dialogue.

## Player-visible acceptance questions
1. Can a first-time player reach and activate the stones without a quest marker or backtracking requirement?
2. Does the choice feel optional, short and distinct from the existing report/treasure loop?
3. Are the chosen marks/stones visibly readable at normal game scale without looking like an obstruction?
4. Does the keeper/Boru respond to what the player actually chose, including after Save/Continue?
5. Do the field/brook report, departure, and existing story stages remain unaffected?

## Verification state
- Code and targeted Node regression test added on an isolated branch; tests are **not confirmed passed** until executed against this exact HEAD.
- Real Chromium play, human first-time playtest, 44px visual inspection and 3-route regression: **not performed in this run**.
- No claim that this specific choice is a market-proven trend or has improved player satisfaction. Validate with playtest before adoption.
