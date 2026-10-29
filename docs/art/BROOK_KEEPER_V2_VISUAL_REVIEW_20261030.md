# Brook keeper V2 — visual pilot (2026-10-30)

**State: DRAFT / NO-GO / not accepted.** Continuation of Draft PR #116, based on `a2b66074f92e1a828225008f3a214f218f19a341`. Frozen PR #98, main, existing V1 sprite, four protagonists, Story 00–19, Save v23, maps and combat are untouched.

## Visual changes
- New opt-in 48×192 RGBA image: `assets/npc/brook_keeper_style_study_v2_48x192.png`, four separately refined 48×48 directions.
- V1 20-color palette, exact silhouette, transparent footprint, footline and role-specific equipment are retained. Refined cap planes, cheek restraint, tunic folds, collar, shoulder/cuff, belt, tool and back rope-coil shading. An intermediate over-detailed face treatment created noisy moustache-like pixels at 44px and was rejected; the facial pixels were restored to V1 except for minimal shadows.
- Open `tools/brook_keeper_v5_style_review.html` to compare fallback 32px, V1, V2, field worker V2, mayor V5, messenger V5 and four heroes on the same background and footline. Inspect all directions at 1× before 4×.
- `index.html?gcBrookKeeperArt=2` shows V2 only on brook keeper; `=1` shows V1; normal URL keeps original 32px. Failed or malformed PNG loads revert to the existing NPC renderer. No walking/working frames are claimed.

## Evidence and limits
- Local Pillow review: 48×192 RGBA, 4 distinct directional paintings, alpha footprint and footline byte-for-byte identical to V1, 20 colors; local same-scale 44px A/B composite inspected.
- Node regression checks added for four directions, palette/silhouette stability, opt-in selection and visual-review references. **Repository-wide Node tests, Chromium in-game captures and full playthrough were not run in this environment**. A structure test is not artistic acceptance.
- V2 changes at 44px are subtle; face and equipment still need in-game side-by-side review against mayor/messenger V5. **Not approved for default use.** Character work takes priority over house/environment art.
