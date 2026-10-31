# Triton idle silhouette experiment — 2026-11-01 (ART NO-GO)

Base: frozen PR #98 head `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`. Source: `assets/characters/triton/triton_idle.png` Git blob `e6ca25a935e773cf17dd35e2355c28d647ffd7ef`, 192×192 RGBA (4 directions × 4 idle frames, each 48px).

## Actual binary image experiment
- Generated a full 4-direction × 4-frame candidate PNG and a **native 44px** side-by-side evidence PNG.
- A: original (left); B: outer dark-hair row-edge trim (middle); C: same trim plus naive outward shoulder contour extension (right).
- Same 44px nearest-neighbor display size, same muted green-gray background, first frame of each direction in each row.
- Trim edits: 600 alpha pixels across 16 frames. Shoulder extension: 128 written pixels; final candidate differs at 728 pixel locations.
- The PNG candidate was decoded after encoding and compared byte-for-byte at RGBA pixel level (PASS).

## Visual verdict — **NO-GO / reject**
At 44px, A and B differ too little to improve the oversized head / neck / shoulder relationship. C produces obvious protruding dark wedges at the shoulder sides in the enlarged review, especially front view, which reads worse than the original and does not match the V5 NPC anchor's anatomically integrated arm/shoulder shapes. No character appeal or player-visible quality gain. A numeric pixel-difference pass is NOT an art pass.

This is evidence of a failed structural hypothesis, **not** a replacement for manual pixel drawing. Do not apply automated row-boundary expansion to other characters. Next should manually redraw the shoulder/sleeve/upper-arm silhouette in a fixed 48px frame and verify each direction at 44px before propagating across actions.

## Safeguards
No production PNGs, runtime, map/building, story, save v23, PR #98 or main modified. No Chromium in-game capture or full suite run. The candidate is a rejected isolated study; never merge or adopt without a new visual review.
