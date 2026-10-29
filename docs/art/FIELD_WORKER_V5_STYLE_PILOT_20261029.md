# Gray Crown — Field Worker V5 Style Pilot (2026-10-29)

## Source / isolation
- Source of truth: `ryoita027-glitch/gray-crown`.
- Exact parent: frozen PR #98 SHA `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`.
- Branch: `art/fieldworker-v5-style-pilot-20261029`.
- All changes are **experimental / opt-in**. Main, PR #98, save schema v23, story, map, balance, and original character PNGs remain unchanged.
- Prior PR #104 A/B/C Karen variants were rejected in PR #105; do **not** reintroduce those rejected changes.

## Actual visual references
Inspected the binary PNG atlas `assets/npc/featured_residents_charm_v5.png` (432×192, nine 48px columns, four direction rows). The village mayor is column 3 and kingdom messenger is column 4 (zero-indexed); these are **existing** characters, not a single shared face template.

Observed shared style language:
1. Warm, controlled ink around meaningful silhouette breaks; facial features are readable without glossy eyes or bloom.
2. Head-to-body proportion is less toy-like than the large-headed hero sprites; grounded boots and recognizable clothing mass remain visible at 44px.
3. Fabric/leather/skin/metal have distinct value clusters. Dark edges describe form, not uniform black grids.
4. Props tell a role (messenger's equipment, mayor's office clothing) but do not cover the face.
5. The muted environment palette is compatible with character-specific colors; copying skin tones, facial ratios, haircuts or poses across the cast is prohibited.

The four hero idle atlases were also visually inspected. Their large heads, high-frequency hair highlights, and character-specific color masses differ from the V5 NPCs. This is a real consistency problem, but changing their pixels without an accepted A/B is not justified. Karen remains unchanged in this PR.

## Actual authored pilot
- New `assets/npc/field_worker_style_study_48x192.png`: **48×48 native** × **four separately drawn directions** (down, left, right, up), RGBA, 30 colors, 3,356 bytes. This is a new hand-constructed pixel sprite, not a recolor of mayor/messenger and not a resized screenshot.
- Character: `fieldWorker` / 「畑の手伝い人」, map `ryunefields` at (9,5). Straw hat, rolled linen sleeves, muted green work vest, asymmetrical tool/strap, separated legs and worn boots; the face is smaller and more adult than the generic 32px fallback.
- A **single idle pose per direction**. No walk cycle or field-work gesture has been painted; do not call this a completed NPC replacement.
- `js/render/opening_pixel_assets.js`: load and draw the 44px candidate **only** under `?gcFieldWorkerArt=1`, at the same 30px tile footline as V5 NPCs. If PNG is missing, malformed, or still loading, use the old procedural 32px sprite. Normal URL does not request the candidate.
- `js/render/world.js`: move the near-player name label above the hat only when the opt-in image is actually ready; preserve all other NPC label positions.
- `tools/field_worker_v5_style_review.html`: standalone `file://` A/B reviewer of **old 32px vs new 44px**, alongside mayor/messenger V5 and the four original hero Idle PNGs, same direction, neutral ground and footline, 1×/2×/4×. Includes a link to test the candidate in the real game and a PNG export attempt.
- `tests/field_worker_style_study.test.js`: inspect actual PNG pixel rows and direction differences; verify opt-in and comparison paths.

## Evidence / limitations
- The candidate PNG was rendered and visually inspected at 6× nearest-neighbor in a local image viewer. It has a distinct silhouette and grounded boots, but the candidate's cloth and face treatment are **still flatter than the richer V5 atlas**. It is **not visually approved** and may require manual refinement.
- Pillow binary audit: 48×192 RGBA; 30 distinct colors; all four direction rows nonempty and different; visible feet at row 46; SHA-256 `66f3f8b7c09a4d0c2bd99841f2b4345d55fd38c249262d8edcf17c23973482f0`.
- The isolated Node PNG/contract test was executed locally against the real candidate PNG but with **mocked source files** for the JS/HTML presence assertions: 3/3 PASS. The real updated GitHub JS and reviewer inline script compiled under V8 via `new Function`. This is **not** a repository checkout or full Node suite PASS.
- Not run: actual repository `node --test`, `npm run check`, real Chromium screenshots, actual village field movement, Save/Continue, mobile, or full three-route acceptance. GitHub Actions runner allocation / account minutes remain a separate blocker; no paid CI was initiated.
- Do not merge this Draft into main. This is one genuine visual asset and a reversible in-game pilot, not an accepted unified cast.

## Next visual gate
1. On a full checkout, run `node --test tests/field_worker_style_study.test.js`, `npm run check` and open `tools/field_worker_v5_style_review.html`.
2. Open `index.html?gcFieldWorkerArt=1`, travel to `ryunefields`, and capture the actual 44px candidate beside the unmodified mayor/messenger under equivalent zoom. Inspect hat/name collision, hoe silhouette, foot contact, facial expression, left/right/back, mobile HUD and sprite load fallback.
3. Improve face and cloth clusters by hand where they are visibly too flat. Do not automatically enlarge, recolor or copy V5 faces.
4. Only if a real-game A/B clearly beats the fallback **and** belongs with the V5 anchors, author independent idle/work/walk frames, then move to the next unfeatured NPC. Keep hero design and environment passes later, as requested.
