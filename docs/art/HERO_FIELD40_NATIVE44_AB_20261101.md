# Hero native-44 vs 40px field-scale trial — 2026-11-01

**ART HOLD / DO NOT MERGE.** Stacked on Draft PR #224 HEAD `315ca7fb220512e483b6c12a9cbab6b91a893adc`. Frozen PR #98 and main remain unchanged.

## Why this trial exists
The source art is 48×48px per cell. The field and conversation render at 44px, and featured V5 mayor/messenger also render at 44px. The original protagonist head/hair mass—especially Margaret—still reads large relative to the torso and NPCs. Repeated mechanical contour trims (Margaret V1–V3, Triton tests) have not resolved that structural difference. This trial tests the **whole 4-hero party** at 40px without modifying any approved PNG, 48px source crop, character identity, collisions, tile sizes, Save v23, story or balance.

## Implemented changes
- `js/data/animations.js`: single reversible `GC.Data.Animations.artDisplaySize=40` setting (restore to 44 to revert).
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
- The modified Node test file was updated but **not executed against a full repository checkout** in this connector session. Full npm suite, real browser, movement/idle/talk/turn transition, battle scene and 100%-scale desktop/mobile evaluation remain **NOT RUN**.
- Test at fixed Ryune camera and background, compare 44/40 for all four heroes next to mayor/messenger, check shadow, footline, head and eye readability, and animation at 4 directions. Do not adopt without visible improvement and complete QA.

No paid API or GitHub Actions run. Do not merge this Draft into main or PR #98.
