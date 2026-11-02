# Margaret V25 full-body walk study — 2026-11-03 JST

**ART NO-GO / DO NOT MERGE.** Parent: Draft PR #305 exact HEAD `1251998f96cdff52bf3ce64587d0b462ba06b615`. Production art, main, frozen PR #98, maps/buildings, story, balance, Save v23 and paid CI remain untouched.

## Actual trial
- New indexed 288×192 PNG: `assets/character_trials/margaret_walk_v25_body_motion_trial.png`, 4 directions × 6 frames × 48px cells; blob `5c1ebe5f0f8b496f563c70a375aaa1300932ad52`.
- Added 1px rising-step body bob, torso counter-lean, and sleeve/book-side sway to V24's planted boots. Kept original face shape, 30-color palette and ground row 44.
- Pinned reproducible Pillow generator, native44 V24/V25 comparison board output, Node regression source and browser HTML comparison against actual V5 mayor/messenger assets.

## Visual judgment
At 44px, motion is more visible than V24 but introduces a bouncing, mechanical appearance. Hair/arm overlaps and adult head–neck–shoulder anatomy remain weak relative to V5. **Reject V25 as production art**. A static board is not a live Ryune game screenshot.

## Verification
Local Pillow generation and all 24 frame geometry checks succeeded. `node --check` on the new test passed; native Node test execution with complete repository, full `npm run check`, browser playback of the reviewer, and actual Ryune game Canvas capture **NOT RUN**. No paid Actions.

## Next
Stop incremental V20–V25 mechanical edits. First draw a new adult full-body key pose grounded in the V5 mayor/messenger visual language; compare all four heroes at 44px. Only animate after a visually acceptable key pose. Do not move to architecture until the character cast is unified.
