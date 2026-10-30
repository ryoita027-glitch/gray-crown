# Margaret V8 reviewer: NPC reference frame-lock correction (2026-10-31)

**ART HOLD / no production adoption.** This branch starts from PR #147's exact HEAD `632633642da72facf7bf15a4813ee50e3597407d`. The frozen integration PR #98, `main`, production PNGs, story, Save v23, combat and buildings are untouched.

## Reproduced defect in the existing 44px visual comparison

`tools/art/review_margaret_v8.html` rendered every sprite with `(column + frame) * 48`. That is correct for a six-frame Margaret walk atlas, **not** for the V5 featured-NPC atlas: `featured_residents_charm_v5.png` is 432×192, or nine **different character columns** × four direction rows. Mayor is column 3 and Envoy is column 4.

At walk frame 0, Mayor and Envoy display their intended 48px source columns. At frame 1, the reviewer mistakenly shows the Envoy in the Mayor slot and another NPC in the Envoy slot. At frame 5, Envoy reads column 9, outside the 0–8 atlas columns. This makes any moving 44px V8-versus-V5 comparison unreliable and can create a false aesthetic verdict.

## Actual change

- The three Margaret atlases (V2/V7/V8) are marked `animated=true`; the Mayor and Envoy references are `animated=false`.
- A dedicated `sourceX(column, frame, animated)` function advances only animated six-frame sheets. The 44px scale, direction, background and existing V8 pixels remain unchanged.
- Added `tests/margaret_v8_npc_reference_frame_lock.test.js` to check source syntax, real PNG atlas dimensions, static V5 references across all six frames, and Margaret's six walk-frame bounds.
- The reviewer now states explicitly that NPC references are static character columns, not walk frames.

## Verification / art verdict

Re-fetched the committed reviewer from GitHub. Executed the **exact committed** `sourceX` function and reference metadata in an isolated JavaScript V8 check: Mayor and Envoy remain at columns 3 and 4 in all six frames; V2/V7/V8 advance from frame 0 to 5; corrected draw call is present. Independently read PNG IHDRs from the existing GitHub blobs: V5 NPC 432×192, Margaret V2 and V8 288×192.

**Not run:** the new `node --test` file against a full local checkout; Chromium screenshot of the village; live game 44px comparison; eight-action animation; whole-project regression. Private repository clone is blocked by DNS in the execution container; no paid Actions was invoked.

**Aesthetic verdict: HOLD.** This fixes a misleading visual review, **not** Margaret's oversized head, face/neck/shoulder silhouette, fragmented silver hair or mismatch with V5 NPCs. No new sprite has been approved or deployed. Before another cosmetic pixel pass, capture the actual village scene and inspect all four directions at 44px with correctly pinned NPC references; then redraw head–neck–shoulder forms without sacrificing existing costume detail.
