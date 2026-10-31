# Paired visual-state camera A/B — 2026-11-01

**ART HOLD / DO NOT MERGE.** Isolated successor to Draft PR #202 (HEAD `121780a8798c983ad8dac01862f363e817295578`), stacked on #200 and frozen #98. Production render settings, original PNGs, story, save v23 and main remain unchanged.

## Confirmed defect in previous evidence generator

The earlier `tests/browser_pixel_camera_motion_ab_e2e.py` called `GC.Render.World.drawScene()` repeatedly and assumed that the same assigned camera coordinates guaranteed the same render state. Inspection of the actual `js/render/world.js` contradicts that assumption: every `drawScene()` advances camera easing by 0.22, party/follower walk queues and phases; the mode setter also schedules a new frame. Thus A and B could differ for reasons **other than camera pixel snapping**, even when gameplay state JSON was unchanged. An image-hash difference is not proof of visual improvement.

## Implemented fix

- Snapshot the entire mutable `GC.Render.World.VISUAL` state after starting a village scene; cancel queued animation frames/timers.
- Before **each** A and B render, restore that snapshot and assign the same fractional camera offset, reset the acting throttle and cancel the frame scheduled by mode switching.
- Freeze `Date.now()` to the timestamp at capture start within the synchronous evaluation to avoid NPC phase changes between modes. Restore it in `finally`.
- Assert exact equality of post-render camera coordinates, hero coordinates, travel phase and follower phases for each A/B pair.
- Measure RGB pixel differences for each pair, record fraction and bounding box in the evidence manifest, alongside PNG SHA-256 and the captured camera coordinates.
- Preserve 16 native canvas PNGs and two 100%-scale A/B sheets (desktop and phone) when run with a full checkout.

## Verification and limits

- Python syntax: **PASS** on the local authored version.
- A Node.js mock of the browser evaluation verified four A/B pairs with advancing camera/actor state are identical after reset: **PASS**.
- Pillow RGB-difference helper: 1-pixel and 0-pixel synthetic fixtures: **PASS**.
- **Actual game Chromium captures: NOT RUN** (this execution has GitHub connector access but no full repository checkout in the local runtime; direct git clone failed on DNS resolution).
- Full Node suite, walking animation, art adoption and gameplay acceptance: **NOT RUN**.
- The change is **test evidence correctness only**; there is **no claim of improved live game visuals**.

## Next visual step

Run the corrected capture in a full clean checkout, inspect the village at 100% scale, then assess Karen's head proportions and Margaret's white-hair silhouette against the V5 mayor and royal messenger. Only accept visually superior art after 4-direction animation and in-game comparison. Buildings remain out of scope until character consistency is verified.
