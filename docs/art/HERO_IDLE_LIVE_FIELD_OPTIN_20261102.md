# Four-hero authored idle poses — live field opt-in (2026-11-02)

**ART HOLD. Not approved for main, frozen PR #98, or the commercial build.**

## Player-visible issue and what changed

The live world renderer normally draws the first frame of each hero's **walk** atlas even when standing. Authored 4-frame **idle** atlases exist for Karen, Triton, Sophie and Margaret but were not being used in the ordinary stationary field draw. This creates a genuine game-visible source mismatch, not merely a comparison-board problem.

This isolated branch changes the real `js/render/world.js` draw path behind an **off-by-default** review switch:

- Normal game (`index.html`): **unchanged**. At rest, walk frame 0 remains the source.
- Trial (`index.html?heroIdleArt=1`): standing heroes use authored idle frame 0 at the same existing 44px size and the same individual foot anchor. Moving heroes continue using the six-column walk atlas. All four characters are handled separately; no new palette, faces, clothing or animation data is invented.
- If an idle atlas fails to load or is not 192×192, that hero falls back to the existing walk atlas instead of disappearing.
- Acting/cinematic paths are not overridden. No image assets, dialogue, save v23, battle balance, environment, or architecture were changed.

**Why frame 0 only?** This isolates the actual pose/source difference from breathing/bobbing motion. Animated idle timing, head/shoulder redesign, and transition quality are separate art gates, not automatically accepted.

## Visual reference inspection

Read the real `assets/npc/featured_residents_charm_v5.png` sheet (blob `b169b58a846e1812dc42f566ca1843a6088e901f`) and the Margaret idle/walk sheets (blobs `910458eabfcfaef7442f885f319d0e2a09c88a66` / `1923f1315c377418cea0f2f94ab6431c987f2dd7`). The V5 village chief and kingdom messenger have a relatively tight hair/neck/shoulder mass and grounded outfit silhouette. Margaret's high silver-lavender ponytail, larger hair silhouette and violet costume are distinct and **must not be copied over**. The idle atlas itself is existing authored art, not a new redraw; this branch does **not** solve her structural hair/neck issue or prove the idle pose is aesthetically superior.

Existing `docs/art/GRAY_CROWN_ART_BIBLE_v2.md` remains provisional. Character identity and 44px source display remain locked until real-canvas comparison is reviewed.

## Tests and actual acceptance

- `node --test tests/hero_idle_art_optin.test.js`: tests default source, opt-in idle source, moving source, and missing-atlas fallback against the actual renderer function.
- `python tests/browser_hero_idle_art_optin_e2e.py`: designed to capture **16 real 768×480 game-canvas PNGs** and **8 two-column A/B boards**, four directions at desktop and phone viewports, in the same seeded Ryune scene. It checks four hero draw sources, 44px display, state/camera/party positions, and rejects any changed canvas pixels outside the four transformed hero sprite bounds (2px raster allowance). It saves a manifest with exact tested HEAD. This is an executable gate, not pre-existing screenshot evidence.
- Visual review must inspect native 44px **full scene** for silhouettes, ground contact, scale relative to mayor/messenger, motion-to-idle transition, crowd readability, and unintended changes. A source-switch PASS is not an art PASS.
- **Run status in this environment:** renderer source-selection cases executed in an isolated V8 harness; four scenarios passed (default/idle/moving/fallback). `world.js` and the Node test parse in V8. Full Node suite, Python browser script, actual Chromium game capture, and manual game-canvas art acceptance are **NOT RUN**: a complete local Git checkout is unavailable because container DNS cannot resolve GitHub. Do not claim 16 screenshots or visual improvement.

## Decision

**HOLD.** This is a reversible, player-visible runtime art trial, not a newly approved sprite. If the authored idle looks worse at native size or changes foot contact, disable `heroIdleArt=1`; the default remains untouched. Before broader rollout, capture real game A/B, inspect all four characters and directions, then address Margaret's head–neck–shoulder geometry with original identity preserved. Buildings remain deferred.

## Source and safety

Branch starts at the exact frozen parent of this experiment: PR #253 HEAD `0c7dd1efdf10076189ab68e521c170b3aa9607b5`. No merges, no changes to PR #98 or main, no paid Actions/API use.
