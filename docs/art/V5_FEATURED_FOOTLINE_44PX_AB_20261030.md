# V5 featured NPC footline — source-preserving 44px A/B (2026-10-30)

**ART HOLD / not approved.** Isolated from PR #130 exact HEAD `5272c3eee56d2309a708e4f54567e304d6d015c4`. Frozen PR #98 `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`, `main`, and approved PNGs were not changed.

## Why this is a player-visible issue

Actual source inspection: `assets/npc/featured_residents_charm_v5.png` (SHA `b169b58a846e1812dc42f566ca1843a6088e901f`) contains mayor and royal messenger. The source is a 48px frame atlas. `OpeningPixelAssets.tryFeatured` draws it at 44px with its **source y=48** at the world shadow/foot point (`footY=n.y*32+30`). The detailed original protagonist sprites instead use **source y=44** at that point. Therefore a *source pixel at y=44* in the V5 NPC is rendered about **3.67px above** the ground coordinate; a source pixel at y=44 in the protagonist is rendered at the ground coordinate. This is a **coordinate difference**, not proof that every NPC actually floats 4px: the lowest opaque shoe pixel can differ by direction/pose.

## Changes

- `js/render/opening_pixel_assets.js`: reversible `?gcV5Footline=44` draws the same V5 source frame at `footY-round(44*44/48)` instead of `footY-44`. Default, legacy NPCs, all original PNGs, poses, facing, source crops, horizontal centers, shadows, movement and collisions remain unchanged. Can combine with `?gcHeroDisplay=40` or `42` for existing protagonist scale study.
- `tools/v5_featured_footline_44px_ab.html`: actual PNG source comparison, four directions of mayor and messenger, old/new at the same 44px, same field background, same pose, same shadow and ground guide. Original Margaret included for reference. The page also measures the last opaque pixel within central source x13–34 (alpha >=64) for each direction, to test whether the source-y44 hypothesis is anatomically correct.
- `docs/art/evidence/v5_featured_footline_real_44px_ab_20261030.svg`: self-contained embedded actual-source comparison with the same conditions, no stock art or regenerated NPC.
- `tests/test_v5_featured_footline_study.js`: deterministic 4-direction × 2-NPC × 4-query draw-coordinate/legacy-default isolation check. Added to repository but **not executed against a full local checkout** during this run.

## Visual verdict and next gate

**No visual adoption.** Both V5 source and original Margaret were inspected as real PNG images. This study directly addresses a 4px class of hero–NPC contact-point mismatch, without sacrificing V5 facial or costume detail. It is not yet known whether the source y=44 anchor is the best shoe-ground point for each V5 direction and action pose. The self-contained SVG and HTML were created but **not rasterized in a browser or captured inside the running game** during this run. Do not claim the trial looks better until these comparisons are performed.

Next: run the HTML alpha-footline measurement and inspect 44px V5 mayor/messenger A/B in the same real village frame, including gestures, before accepting any source-foot correction. Then return to **original-source** Margaret face/head/shoulder work and the four protagonists; do not propagate low-detail V4F art or start building redesign.

## Verification and isolation

The change is gated by a URL query and has no effect on the production default. No `main`/PR #98 changes, no new dependencies, no paid API/Actions, no story, Save v23, balance, building or environment changes. Full repo test suite and live game visual capture: **not run**. Passing the source-coordinate test later is not aesthetic approval.
