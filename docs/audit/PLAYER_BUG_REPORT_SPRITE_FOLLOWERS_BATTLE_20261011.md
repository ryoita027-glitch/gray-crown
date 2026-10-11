# Gray Crown — Player-reported visual and combat defects
Date: 2026-10-11
Target: emergency corrective patch based on PR #65, not a new story feature.

## Reported problems and fixes

1. **Adjacent artwork leaks into combat characters.** The 48x48 pixel approved PNG sheets have 4 idle frames × 4 directions or 6 walking frames × 4 directions in the character animation definitions. The old battle UI used the *whole image as a CSS background*, with incompatible 44px and 80px sprite sizes and a 92px sideways slide on attack. The new battle markup isolates a child frame with exact 48px dimensions; idle background = 192×192px; walking = 288×192px; facing row = the right-facing third row; frame position changes in 48px increments. Source image is never stretched or adjacent frames shown. The attack uses genuine walking frames with a 28px lunge instead of shifting an improperly clipped idle image. CSS final authoritative rules override earlier responsive sizes. **Needs real browser screenshots at desktop/mobile to verify assets are correct.**
2. **Party followers are not lined up.** `partyTrailPoints()` formerly reordered actual walking history with the array `[0,2,4,1,3]`, then scattered party members into nearby cells. Replaced with chronological points two, four and six steps back; increased `state.trail` retention to ten cells. During the first few steps after map spawn, a walkable, distinct behind-the-leader formation is used instead of trusting short and often horizontal legacy transition seeds. Existing scripted travel, collision and party save data remain unchanged. A real zig-zag path still produces a **line along the walked route** rather than unnaturally snapping everyone into a rigid straight column around corners.
3. **Combat itself feels unchanged.** Instead of adding a button or another subsystem, an existing tactical move **Triton's Break (崩し)** now interrupts the next attack of an armored cave crawler or opening cave boss exactly once per enemy. The foe displays '体勢崩れ・次の行動不能', a distinct combat log and visual state. Consecutive Break cannot infinitely stunlock. Existing guarding, morale, reaction windows, damage and ordinary encounters remain. This is one focused gameplay change, **not yet a complete combat overhaul**.

## Actually verified

- Real `partyTrailPoints` source was executed independently in V8 for a straight path, turn, short backtrack, new-game village position with simulated obstacles and map-edge spawn. The result had three unique followers and no overlap with the leader in all cases.
- Real combat `battleAction('break')` and `enemyTurn()` source was executed independently: cave enemy lost 13 HP, `staggered=1`, the next enemy turn dealt zero damage and advanced to turn 2 with `staggered=0`. The same enemy is marked `staggerUsed=true`.
- The touched JavaScript scripts and new Node regression code passed V8 syntax checks. Existing CSS regression asserting the incorrect 44px sprite crop was updated to require 48px.
- `tests/visual_followers_battle_cells.test.js` added for repeatable Node validations (source and harness): line and turn positions, collision-safe short retrace, battle cells, solo party and one-use stagger.

## NOT verified
- Original asset generation source **was** inspected: `tools/generate_karen_prototype_assets.py`, `tools/generate_triton_prototype_assets.py` and `tools/generate_sophie_prototype_assets.py` create many current idle frames by shifting base poses by one pixel; walk frames use limited leg/arm manipulation. Thus the player's criticism that the art feels like a rigid picture being moved is **also supported at the asset level**. Correct cropping and real walk-sheet playback eliminate adjacent-frame bleed and massive fake slides, but do **not** turn these assets into hand-drawn, high-quality frame-by-frame animation. New manually designed key poses/frames and visual acceptance are necessary before describing the animation as commercial quality.
- Game bundle PNG bytes **cannot be visually inspected through the available GitHub connector** in this session. The exact frame arrangement is based on `js/data/animations.js`; if any PNG differs from that standard, it needs re-export or its true dimensions measured in browser.
- The complete Node suite, real Chromium rendering, game feel in battle, smooth follower interpolation and screenshot comparison were not run. GitHub Actions provisioning previously failed before any steps. No claim of commercial quality, visual QA completion or merged `main`.
- Older cosmetic CSS rules remain in the stylesheet but are overridden by authoritative final sprite-frame rules. Consolidating them is technical debt; do not call the current battle art complete.

## Required acceptance before merge
1. Fresh browser from village: idle and action frames show only one character per cell, no adjacent sheet bleed in Chrome, Edge and mobile-width viewport.
2. Walk ten tiles straight, turn twice, double back quickly, transition road/cave, save/load, confirm all visible active members trail without stacking or teleportation.
3. Fight wolf, crawler and boss: status and action results readable, Break interrupts crawler once, subsequent Break does not skip enemy forever, Guard and morale still work.
4. Only then consider refactoring sprite assets toward hand-approved pixel animation and deeper tactical redesign. Avoid adding systems to cover defective presentation.
