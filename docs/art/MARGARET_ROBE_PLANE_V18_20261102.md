# Margaret V18 — robe/shoulder plane A/B (2026-11-02 JST)

**ART HOLD / DO NOT MERGE.** Based on V17 Draft #283 exact HEAD `180b450ee7708bb06373ee5ef6d6d9a13e8aaf0d`; PR #98, main and production sprites remain untouched.

## Visible experiment
V17A's face and silver hair are preserved. The dark rectangular robe body is given a deliberately larger, readable front color plane and center seam, with small asymmetric sleeve/side/back seam cues. **A** uses restrained cool-silver fabric; **B** tests a broader warmer ivory panel. Both are genuine 192×192 RGBA 4-direction × 4-frame PNGs, not a CSS recolor. The authored foot pixels and transparency are preserved. These are stationary-only experiments; walk, talk, battle, and other actions are not redrawn.

- `assets/character_trials/margaret_idle_robe_plane_v18A.png` — cool narrower central panel.
- `assets/character_trials/margaret_idle_robe_plane_v18B.png` — broader warmer central panel.
- `docs/art/evidence/margaret_v17_v18_native44_npc_AB.png` — same native44 checker/ground line, 4 direction rows. Columns: V17A, V17B, V18A, V18B, V5 mayor, V5 royal messenger. NPC columns are preserved directly from V17 evidence.
- `?heroIdleArt=15` / `?heroIdleArt=16` — opt-in stationary V18A / V18B in the real renderer; default remains the approved walk sprite.
- `tests/browser_margaret_v18_real_canvas_e2e.py` — when run in a full checkout, captures same-state 4-way actual village canvas across desktop/phone and all directions. This script has **not** been run in this environment.

## Visual assessment
I inspected the actual generated 44px board. The front robe reads as a more distinct light-vs-dark construction than V17, but **B can become an overly pale central stripe**, and neither option resolves the head/hair size, face, neck/shoulder anatomy or the pronounced silhouette mismatch with the V5 adult NPCs. The side/back differences are much smaller. **Neither option is approved.** Do not mistake changed pixels or PNG validity for commercial art quality.

## Verified / not verified
Generated V18A, V18B and common-ground 264×240 board from SHA-locked source PNGs using a dependency-free JS PNG codec and visually inspected the result. The image binaries were stored as Git blobs. Native Node test execution, full `npm run check`, actual Chromium Ryune screenshot, walk/dialogue/battle continuity and human art acceptance **NOT RUN** due to local private-repo checkout DNS failure. A new deterministic generator, unit tests and real-canvas capture script are included for full-checkout execution.

Next: run `node --test tests/margaret_robe_v18.test.js tests/margaret_v18_live_preview.test.js` and `python tests/browser_margaret_v18_real_canvas_e2e.py` at exact branch HEAD, compare V17/V18 with all four heroes and V5 NPCs in the actual village, and reject visually inferior panels. Do not start architecture until cast-wide style alignment is reviewed. No paid APIs or Actions were used.
