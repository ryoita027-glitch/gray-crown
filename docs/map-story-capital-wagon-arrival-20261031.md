# 2026-10-31 — Aldina south-gate produce wagon (12:40 JST)

## Baseline / ownership
- Repository: `ryoita027-glitch/gray-crown` (private). Main HEAD checked via GitHub compare: `d689aabb5146c9f45466a4f74f397e664c08fb4f`.
- This Draft stack starts from PR #163 exact HEAD `a6388cfbe088073ea7e5f791ef4034b4e0c2144b` (upstream chain #146 → #153 → #155 → #157 → #159 → #161 → #163). It is **not** a standalone main-ready change. PR #98 remains frozen. PR #164 is separate visual-art work touching `js/render/world.js`, so do not merge/rebase these independently without resolving the overlap.
- Read existing north-road vista, capital layout, ration mother/recruit, the prior story test, and the live world renderer. The old-road vista displays wagons waiting outside Aldina; the south gate previously had no corresponding interactive arrival scene.

## Player-facing vertical slice
1. A small produce wagon is now visible on the east layby at (14,13), next to the **existing** south-gate paving (14,12). The central 11/12 avenue remains unblocked; no new map size or travel gate.
2. The wagon's one-line inspection recognizes the prior optional old-road vista if visited. Players may help push the wagon to the ration lane or postpone with no punishment or lost chance.
3. Helping commits `early.capitalWagonGuide='guided'` once, records a journal entry, changes the wagon to ruts at the gate, and displays two sacks at (15,8) beside the existing ration mother. Triton acts physically, the wagon keeper thanks them, and Sophie hopes the food reaches people.
4. The ration mother's existing first conversation, revisits and optional personal ration donation acknowledge the delivery without claiming it solves the food crisis. After `returnedKingdom`, the existing serious aftermath dialogue wins; early sacks are not rendered.
5. The original ration gift cost, new recruit-water response, war narrative, Save v23 schema, NPC coordinates and central path remain unchanged. No extra rewards, hidden karma, combat, spoilers or mandatory stop.

## External signal, 2026-10-31 (facts vs inference)
- **Confirmed design literature, not player consensus:** [Masuda & Yamada, 2025, Japanese Design Society / J-STAGE](https://www.jstage.jst.go.jp/article/jssd/72/0/72_672/_article/-char/ja) discusses density, diversity and context sensitivity of spatial cues as influences on exploration motivation.
- **Confirmed practitioner presentation, not a JRPG outcome study:** [CEDEC 2025, Team ASOBI, smooth and surprising level design](https://cedil.cesa.or.jp/cedil_sessions/view/3106) emphasizes naturally understandable play and surprise. The examples are from a different genre and no layout/scene was copied.
- **Individual player experience, not representative evidence:** [Japanese Chained Echoes review, 2026-09-15](https://gp-wt.com/post-9205/) covers a classic top-down JRPG. Prior PR #163 separately recorded individual Steam reviews dated Oct 24–29; no independently verified new Oct 30–31 Steam review was available in this pass.
- **Inference:** closing the gap between a distant observed wagon queue and a real, optional, stateful city encounter may improve environmental continuity and the feeling that a short detour matters. No human player has validated that inference.
- **Differentiation:** the city's ceremonial splendor and a small ration-line act coexist; one wagon's delivery is tangible without falsely resolving wartime scarcity or turning compassion into a currency reward.

## Verification and hold
- V8 compilation of the exact committed `js/data/maps.js`, `js/systems/events.js`, `js/render/world.js` and `tests/capital_wagon_queue.test.js`: **4/4 PASS**.
- Isolated V8 execution of the actual committed map generation, extracted wagon event and renderer branch: **11/11 PASS** (placement, adjacent route, BFS, prior vista recognition, postponement, one-time flag/journal, short revisit, late-war precedence, cart before, sacks after, no late sacks). This is not the integrated game.
- Added four Node-harness regression tests covering route, optional choice, ration echo, render state and Save/Continue. **Not run in the full harness**.
- **Not run:** `node --test tests/capital_wagon_queue.test.js tests/capital_ration_gift.test.js`, `npm run check`, actual Chromium 44px visual inspection, integrated Save/Continue and human 5–10 minute playtest. Private clone from local container fails DNS resolution of github.com. No paid Actions run.
- **Draft / HOLD / NO-GO**. Before any merge: checkout the exact PR HEAD, run those Node tests plus the full suite, walk northroad → south gate → ration mother → ceremony and back in Chromium, verify interaction marker/scale, and inspect the overlay with PR #164's world renderer. Check that the sack placement is not mistaken for loot and that the gate object does not visually obscure the main avenue.

## Next highest-impact weakness
The south-gate scene is still unverified in a real camera viewport; if the optional cart is visually hidden by the city overlay, adjust its 44px silhouette and/or placement rather than adding more NPCs or dialogue. After that, test whether the four-party vista-to-city beat is memorable without slowing the first arrival.
