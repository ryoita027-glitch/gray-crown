# Four-hero idle motion — native 44px field experiment (2026-11-02)

**ART HOLD / DO NOT MERGE.** This is an off-by-default visual experiment stacked on Draft PR #256, not a new approved character design. No changes to PNGs, story, save schema v23, balance, NPCs, buildings or `main`.

## Why this run

The live renderer now has an opt-in authored idle source for Karen, Triton, Sophie and Margaret (PR #256), but it holds **frame 0 forever**. All four existing 192×192 idle sheets contain four authored frames in each of four direction rows. This run exposes those frames as a slow, reversible visual trial in the **actual field draw path**, without inventing or recoloring artwork.

- Default `index.html`: approved walk frame 0 at rest, exactly as before.
- `index.html?heroIdleArt=1`: existing static authored idle frame 0 comparison, unchanged.
- `index.html?heroIdleArt=2`: four authored idle frames play `0→1→2→3→2→1`, 420ms each, only while the corresponding hero is stationary. Moving heroes still use the approved six-column walk atlas.
- A missing idle image falls back to walk art; the existing 44px size, individual foot anchor, actor positions, camera and world geometry are unchanged.
- Idle redraws are scheduled at the next 420ms frame boundary only in mode 2. Default play and mode 1 retain the previous low-work scheduler. This experiment does **not** override cinematic/acting sprites.
- `HERO_RUNTIME.idleFrameTimeOverride` exists solely to sample individual hero frames while keeping the NPC and environment clocks fixed for visual A/B.

## Art review — reference language and current limitations

The actual V5 featured-residents sheet (`assets/npc/featured_residents_charm_v5.png`) remains the mayor/kingdom-messenger visual reference: compact neck–shoulder transitions, restrained highlights and legible grounded silhouettes. The four hero idle sheets were visually inspected in their native sheet form. The character identities remain distinct: Karen's red hair and forward weight, Triton's compact weight, Sophie's warmer curves, Margaret's large silver-lavender hair and vertical silhouette. The new runtime motion does not repair Margaret's head–neck–shoulder geometry, large head, purple-shadow density or the heroes/NPC size disparity.

**No player-visible art-quality gain has been established.** In particular, the four authored frames may create flicker, a foot-contact wobble or a jump when switching from walking. These are aesthetic gates, not solved by passing a frame-index test. Do not adopt motion in default play until full-scene native-44px A/B has been reviewed.

## Reproducible checks and evidence gate

- `node --test tests/hero_idle_fourframe_motion.test.js tests/hero_idle_art_optin.test.js`: deterministic source-selection, frame sequence, motion/stillness, 44px, missing-image fallback and timer contract.
- `python tests/browser_hero_idle_fourframe_motion_e2e.py`: when a full checkout and Chromium are available, captures **32 genuine 768×480 game-canvas screenshots** and **8 four-column comparison boards**, two viewports × four directions × four idle frames. NPC/world time stays frozen while the hero-only frame override advances. It rejects any changed pixels outside the four hero sprite rectangles and checks source, row, frame, 44px size and identical camera/positions. Outputs `prototype_artifacts/hero_idle_fourframe_motion/`.
- Review the generated boards at native 44px for silhouette clarity, animation cadence, body bob, contact shadows, hair motion, and mismatch against the V5 village chief/messenger. Also test actual walking→stopping transitions, conversations, phone view and lower-performance hardware.

### Executed in this run

- GitHub connector read the exact PR #256 head `2c66845c15e297d0f79f345df1ed44cf43d03bce`, inspected the V5 NPC sheet and four hero idle sheets, and wrote the experiment to an independent branch.
- V8 compiled the modified full `world.js` and the new Node test source. A real-source isolated draw harness verified idle frames `0,1,2,3,2,1,0`, frame-zero comparison, moving walk source, missing-image fallback, 44px and frame-time override. **PASS in isolated V8**, not native Node.
- **NOT RUN:** native Node tests, full `npm run check`, Python browser capture, real Chromium gameplay, player visual acceptance. Local `git ls-remote` still fails DNS resolution for `github.com`; a full checkout is unavailable.
- GitHub Actions was not manually started. No paid service used.

## Adoption decision

**HOLD**. The previous approved default and the static mode 1 remain unchanged. If the full-scene comparison reveals wobble or a weaker pose, discard mode 2. Prioritize fixing Margaret's structural head/neck/shoulder problem before expanding to NPC or architectural assets. Never merge this stacked Draft to `main` without visual and full-game acceptance.
