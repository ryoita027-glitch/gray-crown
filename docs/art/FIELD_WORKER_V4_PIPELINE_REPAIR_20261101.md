# Field-worker V4 PNG pipeline repair — 2026-11-01

**ART HOLD — no production art acceptance.**

## Verified starting point
- Parent: Draft PR #193 HEAD `775a5d1fd76864094b9f55f71a13cf8a711f424f`; frozen PR #98 and `main` remain untouched.
- `tools/art/field_worker_v4_toolgrip_pilot.js` requires `./pixel_png_rgba_codec.js`, but the required file was absent from the #193 branch. Therefore its documented rebuild command could not run from a clean checkout.
- Existing V2, V4 and 44px board PNGs were inspected directly through GitHub. The V4 art remains HOLD, especially for wrist/elbow continuity and side/back silhouette.
- The missing codec is now supplied with strict RGBA/CRC/size checks and five PNG row filters. Added regression tests for source/candidate fidelity and lossless roundtrips.

## Actual art review during this run
- Tested a source-derived 4-direction sleeve/wrist/hand-plane experiment against V4 at the same enlarged pixel scale. Differences were 18/15/13/17 source pixels by direction, with a single alpha change.
- **Rejected, not committed:** the lighter sleeve became a rectangular patch and did not improve the elbow/wrist structure consistently. Recoloring isolated pixels again would not address the underlying anatomy.
- No new approved sprite, no game-runtime sprite switch, no new player-visible improvement.

## Verification and remaining gates
- The codec's small synthetic PNG roundtrip and corrupt-CRC rejection were executed locally using Node and passed.
- The exact new GitHub branch's `node --test tests/pixel_png_rgba_codec.test.js`, V4 generator rebuild, full project suite, real Chromium Ryune scene capture and gameplay A/B are **not yet executed**. Do not treat a syntax pass or isolated codec check as art approval.
- Next: run the clean-branch Node tests and `node tools/art/field_worker_v4_toolgrip_pilot.js`; then create a coherent shoulder/elbow/hand silhouette, not scattered palette patches. Review 44px field placement and four directions before adding walking/working frames.
- No paid API or GitHub Actions execution requested. Story, Save v23, balance, buildings and other character sprites unchanged.
