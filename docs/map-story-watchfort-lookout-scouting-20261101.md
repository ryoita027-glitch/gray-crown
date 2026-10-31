# 2026-11-01 08:43 JST — ベルド砦・見張り台の任意偵察と兵士への報告

## Source / conflict review
- `main` HEAD `d689aabb5146c9f45466a4f74f397e664c08fb4f`; map-story previous Draft #213 HEAD `2df99270d83015385e7e0b17db8741ce4344fd44` (confirmed unchanged before writing). This Draft stacks directly on #213; #213 → #210 → #207 → #205 and older map-story PRs are **not merged**. Do not merge this directly into main.
- Inspected `js/data/maps.js` (watchfort 24×15, lookout (8,6), commander (8,11), guard (15,11), Klein (12,3)), `js/systems/events.js`, `js/systems/movement.js`, `js/render/world.js` (collision and markers), `js/systems/dialogue.js`, `js/systems/story.js`, `js/data/items.js`, `tests/harness.js`, #213 and #210 notes. Parallel menu PR #214 and visual PR #215 do not touch this scoped route. Only map tiles and fort interactions are edited.
- Existing fort lookout had descriptive dialogue but no action or downstream reaction; players could ignore the view without a tangible discovery. Bridge point-of-no-return warning from #213 is preserved.

## Playable improvement
1. The existing south plaza has a five-tile **worn stone spur** (x=9, y=6..10) ending beside the existing west lookout. It changes no map size, blockers, NPC placement or mandatory route.
2. From the lookout, players may inspect old repairs and spot a **possible** bridge weakness (not certainty of collapse). The optional discovery adds one journal entry and three short character reactions, each with a different perspective. Declining does not set a flag or block progress.
3. Reporting to the **existing** tired guard on the south plaza changes his dialogue and grants **one 薬草** once. Repeated interactions acknowledge the report but grant nothing further. Existing `state.events.choices['fort.bridgeScouted']`-style storage is used (`observed` → `reported`), with no new Save v23 schema field.
4. At the Klein crossing, Karen references the observed bridge weakness if discovered. Players who bypass the lookout retain #213's original warning and full encounter. Neither choice forces a detour or changes the bridge collapse, character lore, or route ending.

## Player evidence (checked 2026-11-01)
- **Confirmed individual Steam feedback:** *Sea of Stars* demo discussion (2023-02-11 onward): one player struggled to see an interactable environmental route; another valued organic visual cues and optional observation that rewarded curiosity. https://steamcommunity.com/app/1244090/discussions/0/3763356482614170773/
- **Confirmed individual Steam review:** *Chained Echoes* review (posted 2023-01-20, updated 2025-01-03) praises exploration and side activities, while noting pacing and progression limitations. https://steamcommunity.com/id/elcidolfas/recommended/1229240/
- **Inference:** a legible, optional route with a small discovery → NPC acknowledgement → one-use reward → bridge-scene echo should reward curiosity without adding mandatory walking. No claim of market-wide consensus or increased fun.
- **Not verified:** quantitative 2026 review trends, broad Japanese-language review sample, SteamDB correlations, human playtester satisfaction. No external plot/characters/maps were copied.

## Verification / HOLD
- Actual changed JS source parsed with JavaScript Function syntax compilation; exact anchors matched once.
- Source-derived 24×15 watchfort tile generation confirmed x=9,y=6..10 are all `D`; static walkability BFS on authored tile grammar and object/NPC blockers found entry→map 6 steps, entry→lookout 9, lookout→guard 10, guard→bridge 11 after gate unlock. This is **not** a browser playthrough.
- Added Node harness regression cases for optional decline, route movement, report one-time reward, Save v23 persistence, and contextual Klein warning; **not executed** in this environment.
- **Not run:** full Node suite, `npm run check`, actual browser 44px view, real movement with live input/collision, Save/Load runtime, human playtest. Keep Draft/HOLD.
- Recommended: `node --test tests/watchfort_bridge_scouting.test.js tests/klein_bridge_one_way.test.js tests/watchfort_reentry_context.test.js`; then `npm run check`; then real 5–10 minute run south entrance → commander → map → lookout → guard → north gate → Klein, both with and without scouting.
- Next: ensure native 44px worn-stone contrast and visible object marker make the optional lookout discoverable without making it a mandatory quest; inspect empire-village first five minutes for coherent humanizing NPC reactions.
