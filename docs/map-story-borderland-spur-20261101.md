# 2026-11-01 04:43 JST — Halum checkpoint spur: access, discovery and visible consequence

## Repository and isolation
- Read latest main HEAD `d689aabb5146c9f45466a4f74f397e664c08fb4f`, active Draft PR #203 HEAD `c8f2714540057f3f5b7daedda8fa3f07fe203eb5`, maps, movement collision, world rendering, event handlers, Save v23 compatibility and harness.
- This is a **stacked Draft on #203**, not a direct main change. Art and save branches untouched.
- Reproduced a static **player-blocking route** in the current geometry: merchant at (18,10) blocks the eastbound road, wagon at (19,9) blocks the upper bypass, stone walls at y11–12 block the lower bypass. The checkpoint at (20,10) can be reached only by a large southern detour, despite dialogue saying "just east". A collision-aware 24×15 flood fill from (17,10) to the usable approach (19,10) was **false** before the fix.

## Player-visible vertical slice
- Shift merchant one tile north to (18,9), beside the wagon (19,9), keeping the main eastbound road open. Mark the two already-passable approach cells (19,10) and (20,10) as worn road D, making the old checkpoint a visible short spur rather than an unexplained dead end.
- After collecting the iron pin, repeat checkpoint interaction reminds the player to return west to the wagon; after repair it instead acknowledges reopening the old trading route.
- The innkeeper now explicitly recognizes the repaired wagon before offering the existing rest choice. No extra forced scene, reward, NPC, combat or Save v23 field; no future-story spoiler.
- Differentiator: the optional physical investigation is a very short readable route and its result is acknowledged in a **required** innkeeper conversation, not only optional chatter.

## Player evidence, checked 2026-11-01
- Steam Chained Echoes community/reviews: https://steamcommunity.com/app/1229240 . Displayed October 28 positive/negative reviews praise exploration detail while criticizing weak character agency; the page did not independently establish the publication year.
- An older, explicitly historical player review https://steamcommunity.com/id/vel8b8/recommended/1229240 criticizes unfulfilling short dead ends and artificial travel restrictions.
- **Observed fact:** these are individual player comments; **inference:** accessible visible landmarks and acknowledgement of a practical act should improve navigation and perceived agency; **unverified:** overall audience preference, 44px visual quality, actual completion time, human enjoyment. No other game's content copied.

## Verification
- V8 syntax parsed the complete modified map and events files. Pure 24×15 map evaluation confirmed route tiles, merchant relocation, blocked checkpoint and open approach; static collision-aware flood fill was true after the fix.
- Added `tests/borderland_spur_access.test.js` to exercise actual harness movement, checkpoint interaction, early pin discovery and the innkeeper response. **NOT RUN** in the complete Node harness (GitHub cannot be cloned from the execution container; DNS resolution fails). No browser, screenshot, real Save/Load or human test performed.
- Next gate: `node --test tests/borderland_spur_access.test.js tests/borderland_checkpoint_wayfinding.test.js`; then `npm run check` and actual browser walk from (17,10) via (18,10) to (19,10) facing the checkpoint, followed by merchant → inn. Verify the 44px spur contrast and collision against NPC/object rendering. HOLD / NO MAIN MERGE.
