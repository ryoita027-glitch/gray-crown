# Real-game hero/V5 contact visual gate — 2026-10-30

**ART HOLD.** This is a reproducible visual-capture gate, **not a new approved sprite, artistic PASS, or production change**.

## Source and isolation

- Parent: PR #131 exact HEAD `1d77c80f4402195b307b8660bcf1eecfe0ee7522`. PR #130 is the parent scale experiment. PR #98 stays frozen at `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`.
- Existing actual original hero PNGs are drawn by `js/render/world.js` at their native 48px source crops; mayor and messenger are drawn from `assets/npc/featured_residents_charm_v5.png`. Neither image nor default renderer has been edited here.
- Previous real-source alpha finding: V5 mayor/messenger have bottom opaque row 47. The `gcV5Footline=44` downward shift is **rejected**; this capture tool never enables it. Original Margaret has bottom opaque row 46, but this alone does not prove that the pixel is a shoe.
- Previous independent V4F redraw remains **NO-GO** for face and clothing quality. Do not use it as the basis for other heroes.

## What is newly implemented

`tests/browser_hero_v5_visual_ab_e2e.py` opens the **actual running game** with Chromium from a full local checkout, enters the game, loads original four-hero and V5 NPC PNGs, and captures the unmodified `#game` canvas. It covers:

- Village wide (12,12), messenger contact (12,8), mayor contact (7,10).
- Four leader directions: down/left/right/up.
- Original hero display 40/42/44px, each with unchanged y44 foot anchor and opt-in `gcHeroFootline=alpha`.
- 72 PNG captures (3 scenes × 4 directions × 3 sizes × 2 hero anchors), plus three same-source, same-scene unscaled A/B montages and a JSON manifest.
- The V5 NPC anchor remains default. The 48px PNG source size, loaded atlas, four distinct hero positions, and browser page errors are checked. Screenshots show the **game canvas**, not a synthetic stand-in.

**Run in the exact PR branch checkout:** `python tests/browser_hero_v5_visual_ab_e2e.py`. Results appear under `prototype_artifacts/hero_v5_visual_ab_20261030/`. This requires the already-pinned `playwright` and `pillow` packages and locally installed Chromium. Do not run paid GitHub Actions.

## Visual acceptance must be manual

Inspect the native panels without resampling. Compare character-to-tile scale, four distinct adult faces/hair silhouettes, shoulder/head proportion, shoes versus shadows, V5 mayor/messenger clothing detail, dialogue label overlap, and consistency when turning. Reject any option that hides facial expression or clips feet. A screenshot's successful creation is **not** an art approval.

**Not yet verified:** The full repository cannot be cloned into this execution container (network access is unavailable). Therefore the browser capture script has not been executed against the complete game and no actual gameplay screenshot is claimed in this run. Local Python syntax compilation succeeded on the authored script; full regression, actual screenshot generation, 8-action coverage and user art review remain outstanding.

## Next action

Run this visual gate on the full checkout; inspect all three montages and actual PNGs, reject visually worse scales/anchors. Then return to **original-source Margaret face, neck/shoulder and torso** instead of low-detail V4-series redraws, followed by the other three protagonists. Do not start building/environment redesign until the character system is visually coherent. Do not merge this branch or alter `main`, Save v23, story, game balance, approved assets, or PR #98.
