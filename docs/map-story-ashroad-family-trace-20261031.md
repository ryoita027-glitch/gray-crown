# 2026-10-31 21:39 JST — Ash-road family trace (Draft)

## Verified repository facts
- Base: map/story Draft #185 HEAD `e3539f749b69f775f4fed1db0cc4453f0622869a`, main HEAD `d689aabb5146c9f45466a4f74f397e664c08fb4f`. Draft #186 changes save logic, #187 changes Sophie art; neither touches this slice. All remain unmerged.
- Existing ash-road map has a burned homestead (4,5), refugee mother (8,5), scorched orders (18,5), and a walkable side road connecting the first two. The canonical mother scene says her husband disappeared after the home burned; **his fate is unknown**.
- Save v23 already persists `state.events.choices`. No new inventory, schema, map footprint, enemy, compulsory detour, or karma score.

## Player-facing slice
- After examining the homestead, players may clear soot from the three child-height marks. The existing charred post's small pixel notches visibly brighten; skipping leaves it unchanged, and the choice remains available.
- The refugee mother recognizes the marked post, either after her first scene or on a voluntary revisit. Her husband's fate stays unresolved. She acknowledges the player's specific action once; repeat dialogue and journal do not duplicate.
- If the marks were cleared before reading the imperial order, Karen's existing line connects the civilian-protection clause to the child's marks. No added compulsory line or premature revelation.
- The mother is only four walkable tiles from the house. This is an optional short return, not a mandatory fetch quest. No item/XP reward.

## External player evidence checked 2026-10-31
- Steam *Sea of Stars* reviews (October 3–10) include both praise for exploration's hidden discoveries and criticism that detours often reward trivial items or little narrative value: https://steamcommunity.com/app/1244090/reviews/
- The Oct 21 negative reviews describe shallow character dialogue and overly linear progression: https://steamcommunity.com/app/1244090/negativereviews/
- **Confirmed:** these are individual public reviews, not a representative sample. **Inference:** a small optional action with visible change, a resident's recognition and later story echo may be more meaningful than another consumable. **Unverified:** whether actual Graygrow players notice the 1px marks, revisit the mother, or find the pacing rewarding. No competitor's story, map, characters, or dialogue copied.

## Checks and boundaries
- Edited JS parsed with V8, and isolated function smoke checks cover optional action, one-time journal, NPC callback, repeat and order-scene echo.
- Added Node harness regression tests for walkable side path, visual accent, Save v23, both visit orders, skip, duplicate prevention, and canonical script immutability. **Node suite not executed in this connector runtime.**
- Browser movement, 44px readability, Save/Continue integration and human evaluation remain **not tested**. Draft only; do not merge without these gates.
