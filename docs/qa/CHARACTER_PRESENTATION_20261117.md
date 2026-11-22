# Character presentation — 2026-11-17

## Implemented

The field now draws each hero's authored four-frame idle animation when stopped, and the existing six-frame walk when moving. Idle phases are staggered between characters; prefers-reduced-motion freezes idle at frame zero. If the idle atlas is unavailable, the existing walk/fallback presentation remains available.

The field now shares the cinematic image cache and alpha treatment (threshold 128). Battle images use the same treatment, with cached data URLs and recursion protection. Unsupported or tainted canvas reads retain the original image instead of losing the character. Recovered battle loads clear the previous missing-asset state. PNG sources, face/hair/clothing designs, map scale and save schema are unchanged.

Field and cinematic foot positioning now uses measured idle-frame-zero sole baselines per direction. This correction is fixed across frames to preserve authored stepping/breathing, rather than cancelling motion by dynamically bounding every pose.

| Hero | Down | Left | Right | Up |
|---|---:|---:|---:|---:|
| Karen | 44 | 44 | 44 | 44 |
| Triton | 44 | 44 | 44 | 45 |
| Sophie | 45 | 45 | 45 | 45 |
| Margaret | 47 | 47 | 47 | 47 |

Numbers are exclusive alpha-bottom coordinates in 48px source cells. All use the existing 44px field display size and tile +30 footline. Native canvas checks assert these values against the actual eight idle/walk PNGs. Battle receives the alpha correction; its CSS placement is not newly validated by this check.

## Evidence and validation

- 423 Node tests passed, zero failures/skips, including six new presentation tests covering threshold/color preservation, failure safety, repeated DOM normalization, all directional geometry, idle/walk/reduced-motion selection and unavailable atlases.
- Source and standalone DOM button integrations passed. Canvas mocked in these DOM checks; no visual acceptance claimed.
- Actual raster decode and offline Canvas rendering of eight native atlases passed; all normalized pixels have binary alpha. Sixteen directional sole measurements agree with metadata.
- `tools/render_character_presentation_evidence.cjs` produces before/front, after/front, after/left at 3x nearest-neighbor display. Before reconstructs the previous field's walk-frame-zero/raw-alpha/[24,44] behavior; after calls the actual current `drawHeroSpriteSheet`. It is not a browser screenshot.
- JavaScript syntax, repository hygiene, authority, existing approved-source clean-runtime gate, six Python release integrity/rights tests and standalone/player builds passed.
- Existing source PNGs remain byte-for-byte unchanged. No new gameplay assets or external runtime dependencies.

## Honest remaining art work

This is presentation harmonization, not finished character-design unification. The actual comparison still shows different head/body mass and pixel detail density between Karen/Triton and Sophie/Margaret. Featured residents' side/back art also remains materially weaker than their fronts. These cannot be fixed by an alpha threshold alone.

A separate generated Sophie four-direction candidate was produced from the actual Sophie/Karen/Triton references. It is 2172x724, not a production 192x48 atlas; it has unreviewed costume details and has not passed 48px face readability or eight-action consistency checks. It is NOT used in game and does not replace the current design lock. The deliverable includes it only as a clearly named art candidate.

Browser acceptance remains blocked by the previously observed Chromium socket permission failure. No new workaround was attempted. Desktop/mobile layout, audio, actual browser Save/Continue and full route playthrough remain unverified. Draft PR only; no main merge or commercial-quality sign-off.
