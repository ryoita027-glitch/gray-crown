# Camera movement pixel stability — real-game evidence gate (2026-11-01)

**ART HOLD / DO NOT MERGE.** Stacked exclusively on Draft PR #200 (`4cca48b776dbe6a0872ffb4b8b85ffe91d3ef1d4`), itself based on frozen PR #98 (`075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`). This is a targeted extension of the existing visual experiment, not a new art bible or a change to the playable default.

## Problem addressed

PR #200's first browser script captures only a static A/B/C image after a delay. It cannot distinguish camera translation shimmer from character art, and its images may be taken at different animation times. The real renderer interpolates camera positions at fractional world coordinates while drawing 48px source heroes into 44px destinations, then applying village zoom 1.16. Passing unit tests cannot establish visual improvement.

## New real-game comparison

`python tests/browser_pixel_camera_motion_ab_e2e.py` uses the **actual village canvas**, the same gameplay state, same sprite frames, same viewport, same zoom, and same deterministic camera offset for A and B. Within a single synchronous browser evaluation, it draws A (fractional camera) and B (camera translation snapped to screen pixels) at four offsets. It captures 16 actual canvas PNGs (desktop and phone) and two **native-100%** A/B contact sheets. No bilinear scaling is used in the contact sheets. A SHA-256 manifest binds all images to the checked-out Git commit. The script checks that gameplay state did not change.

This tests **camera translation only**, not whether sprites' heads, silhouettes, animation, or environment have been artistically improved. The village location is seeded for reproducible art review, not story or progression testing.

## Review / adoption gate

1. Execute the browser script in a clean checkout with installed `requirements-ci.txt` and Chromium. Verify 16 PNGs and 2 contact sheets; inspect at 100% zoom.
2. Compare A and B for the same offset, then scan the four offsets in order. Check village tile edges, face pixels, shoes, ground contact, NPC-to-hero relative scale and shimmer. Avoid declaring a winner solely from image hashes.
3. Independently capture actual walking in all four directions and check NPC crowds and dialogue before any production camera change.
4. Even if B looks better, source 48→44 sampling and 1.16× world zoom may still produce uneven source-pixel widths. Fixing that requires a separate reversible design and visual review.

## Verification performed

- Python syntax compilation of the new script: **PASS** (local standalone file).
- Full GitHub checkout, actual Playwright browser screenshots, native-scale image review, `npm run check`, complete gameplay regression: **NOT RUN** in this execution environment.
- No image, game renderer, character atlas, map, story, save v23 or default gameplay changed. No Actions or paid service invoked.

**Decision: HOLD.** This branch makes visual evidence reproducible; it does **not** claim a commercial-art upgrade or adopt any camera setting. After real-game evaluation, return to original-source character redesign (Karen head proportions and Margaret silhouette first), with V5 mayor and messenger as style references. Buildings remain out of scope.
