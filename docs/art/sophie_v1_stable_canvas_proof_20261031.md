# Sophie V1: stable real-Canvas A/B evidence gate — 2026-10-31

**ART HOLD — no sprite accepted, no production visual improvement claimed.**

## Fixed source and isolation
- Base: Draft PR #164, commit 80d12e89ed8dec00c67535f3d923b4738f5cfe78.
- Earlier art: PR #162 Sophie contour V1; PR #160 four-hero / V5 Mayor and Envoy anchor board.
- Frozen integration PR #98 stays on 075f9cb7dc0321361ad1a8674adbc0938ce3ed8c.
- This branch changes only the opt-in comparison UI and its dedicated test. The production Sophie PNG, V5 NPC PNG, 48px source frames, 44px field display, movement, maps, story, save v23, buildings and game balance remain unchanged.

## Why the earlier visual gate was not sufficient
The old comparator called the live world renderer twice, but its game-world draw function advances camera/actor visual state and schedules further frames. It did not prove that the background and NPCs were identical between the original and candidate. A static PNG A/B and a mocked draw-call test cannot establish whether a live screenshot isolates Sophie's changed pixels.

## Implemented
- Captures **original → V1 → original** from a restored visual snapshot, with matching map, camera, actor positions, animation phase, and follower goals.
- Checks full-canvas RGBA of the first and third original renders. **Any drift invalidates the comparison** rather than being mistaken for a Sophie change.
- Rejects a zero-pixel difference (candidate off-screen, hidden or not loaded), or a diff spanning more than 96×96 screen pixels (not safely attributable to a single 44px Sophie sprite).
- Draws two actual game-canvas frames side by side, outlines the changed bounding box, and adds a **3× nearest-neighbor crop of the same region** beneath each. Exports a single PNG only after the stability checks pass.
- Rejects a capture while a follower is still converging on its goal, not just while its movement queue is nonempty.
- Restores the opt-in toggle and the visual snapshot and resumes the normal renderer even after a rejected capture.

## Verification actually performed
- Connected GitHub source and current Draft PR metadata read; PR #98 not modified.
- New JS and Node test file syntax checked.
- Dedicated tests/sophie_contour_live_ab.test.js executed using the actual source strings and a mocked Node filesystem / DOM / Canvas environment in a V8 harness: **PASS** for A-B-A order, pixel diff bounds, original-state restoration, drift rejection, no-diff rejection, wide-diff rejection, follower-not-settled rejection, opt-out, and 288×192 PNG header expectations.
- **NOT RUN:** the dedicated test under actual Node against a full private checkout; real Chromium game screenshots; a visual verdict against the V5 Mayor/Envoy; eight-action asset review; full game regression. Local container cannot clone the private GitHub repository due unavailable external DNS/network. No Actions or paid APIs were invoked.

## Art decision and next step
**HOLD.** This is a stronger visual-evidence gate, not an improvement to Sophie's design. Open the isolated branch with the URL parameter gcSophieContour=1, bring Sophie, the Mayor and Envoy into the village viewport, stop movement and take the A/B PNG in all four directions. Judge adult face, hair volume, neck/shoulder continuity, clothing silhouette, foot contact and crowd scale at native 44px. If V1 still looks worse or merely smaller, reject it and redraw the full head/neck/shoulder hair mass rather than applying another 1px trim. Only after that should the remaining actions and any production integration be considered.
