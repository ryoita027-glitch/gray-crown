# Hero native-44 vs 40px field-scale trial — 2026-11-01

**ART HOLD / DO NOT MERGE.** Stacked on Draft PR #224 HEAD `315ca7fb220512e483b6c12a9cbab6b91a893adc`. Frozen PR #98 and main remain unchanged.

## Why this trial exists
The source art is 48×48px per cell. The field and conversation render at 44px, and featured V5 mayor/messenger also render at 44px. The original protagonist head/hair mass—especially Margaret—still reads large relative to the torso and NPCs. Repeated mechanical contour trims (Margaret V1–V3, Triton tests) have not resolved that structural difference. This trial tests the **whole 4-hero party** at 40px without modifying any approved PNG, 48px source crop, character identity, collisions, tile sizes, Save v23, story or balance.

## Implemented changes
- `js/data/animations.js`: PR #227 initially defaulted to 40px with `?heroArtSize=44` override. **In the stacked 13:22 review branch only**, the unapproved 40px experiment now requires `?heroArtSize=40`; the default is the established 44px.
- `js/render/world.js`: field walk uses that size while retaining source-specific shoe anchors (Margaret y46, others y44), shadow and logical foot coordinates.
- `js/systems/commercial_acting.js`: conversation actor uses the same size.
- `js/systems/animation.js`: default authored animation for the four heroes inherits the same size; explicit custom renderScale and non-hero actors are preserved.
- `tests/margaret_native44_ground_contact.test.js`: size-independent source-foot anchoring and authored-action parity expectations.

## Controlled source-art visual evidence
[Four heroes 44px / 40px and V5 mayor / messenger](evidence/hero_four_native44_vs40_v5_npc_AB_20261101.png).

Four rows = down / left / right / up. Columns = Karen 44/40, Triton 44/40, Sophie 44/40, Margaret 44/40, V5 mayor 44, V5 messenger 44. All sprites use original idle PNG first frames and nearest-neighbor scaling, checker background and common 48px review cells. The NPC comparison pixels are copied from the prior V3 native-44 board generated from `featured_residents_charm_v5.png`, not a newly rendered live scene. The trial 40px sprites are vertically placed using authored foot anchors; the NPCs use their prior native-44 board position.

**Aesthetic assessment: HOLD.** 40px reduces the four heroes' screen footprint, but makes facial details smaller and does not fix Margaret's head/neck/shoulder construction. No clear commercial-quality gain can be established from this static board. The change must be rejected if the actual village view loses expression or causes apparent party/NPC scale inconsistency.

## Verification / remaining gates
- Source PNG identities and dimensions checked through GitHub blobs; original four hero idle assets 192×192 and V5 atlas reference unchanged.
- Static source-art 44/40 board generated and decoded for preview. This is **not** a Chromium screenshot or a real village A/B.
- **Executed in isolated JavaScript with the actual saved branch sources:** 128/128 field-versus-authored geometry and shadow cases at 40px and 128/128 with the 44px URL override, across 4 heroes × 8 actions × 4 directions. Nonhero default scale remained 1. This is a mocked Canvas/Image test, **not a real game screenshot**.
- The modified Node test file was updated but **not executed against a full repository checkout** in this connector session. Full npm suite, real browser, movement/idle/talk/turn visual transitions, battle scene and 100%-scale desktop/mobile evaluation remain **NOT RUN**.
- Test at fixed Ryune camera and background using this Draft's default 40px and `?heroArtSize=44` override, compare 44/40 for all four heroes next to mayor/messenger, check shadow, footline, head and eye readability, and animation at 4 directions. Do not adopt without visible improvement and complete QA.

No paid API or GitHub Actions run. Do not merge this Draft into main or PR #98.

## 2026-11-01 13:22 JST — same-state real-game A/B gate and safe default (stacked review branch)

- Branch: `art/hero-field44-default-optin40-live-ab-20261101-1322`, based on PR #227 HEAD `7bb9974ad7d78d5ff07f68b85e284c75a1dae0be`. **Do not merge**. Original #227 branch, PR #98 and main were not changed.
- Restored 44px as default in `js/data/animations.js`. The unapproved 40px scale is now **opt-in** using `?heroArtSize=40`, avoiding silent art regression if this branch is previewed. Source PNGs and world logic unchanged.
- Added `tests/browser_hero_field40_44_same_state_ab_e2e.py`. A full checkout with local Chromium/Pillow/Playwright runs `python tests/browser_hero_field40_44_same_state_ab_e2e.py` and captures **actual game canvas** for 4 directions at 1365×900 desktop and 390×844 phone viewports: 16 PNGs, 8 native-pixel side-by-side boards, per-pair RGB diff, SHA256 manifest. The test seeds the real village at (9,8), where the existing mayor (6,9) and royal messenger (12,6) remain on the same map. This is a **seeded visual fixture**, not a story playthrough.
- Within each A/B pair, time is frozen, renderer animation scheduling is suppressed, visual state is reset to the same source coordinates and facing before each synchronous `GC.Render.World.drawScene()`, and post-render camera/follower state must match. The browser test fails on a large unrelated pixel difference; a technical PASS never implies artistic adoption.
- **Executed in connector V8:** the saved actual `animations.js`, `animation.js` and `world.js` sources with a mock Image/Canvas environment: 128/128 geometry cases at 44px and 128/128 at 40px PASS. Five URL parsing cases PASS. **Executed locally:** Python syntax compile and synthetic Pillow diff fixture PASS.
- **Not executed:** the complete-checkout Chromium test, actual village screenshots, full npm test, and human visual A/B review. This environment cannot clone the private repository through container DNS; no actual real-game screenshot or player-facing visual improvement is claimed. The static original board remains evidence only, not a replacement for live comparison.
- **Art decision: HOLD**. Evaluate 44px vs 40px at actual viewport scale, NPC relative proportions, Margaret head/neck/shoulder shape and facial legibility before accepting any new default. Do not start buildings while character identity remains unresolved.
