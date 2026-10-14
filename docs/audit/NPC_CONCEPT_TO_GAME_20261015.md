# Gray Crown — Concept design → native game sprites, execution record (2026-10-15)

## Non-negotiable quality rule
**Not yet approved as an attractive finished product.** The player explicitly objected to "toy villagers", and repeated concept-art generation without integration was an incomplete answer. This PR actually converts existing generated 9-person designs into the renderer's own pixel sources; individual appeal, face readability and full-game acceptance remain open. No hero assets, portrait designs, maps, saves, quests, or hitboxes are modified.

## Source / target identity mapping
Baker Eda, farmer Boru, elder Nana, village mayor, royal messenger, child Ren, capital florist, new recruit and commander Granz retain their distinct generated designs (hair/headgear, expressive eyes, clothing, role-specific items and visual personality). Source character sheets were generated and examined in the conversation; final game assets below are edited, cropped, segmented, retouched pixel conversions, **not the high-res sheets passed off as in-game assets**.

- `assets/npc/featured_residents_charm_v3.png`: 9×4 directions, 48×48 cells each, indexed transparent PNG, 432×192.
- `assets/npc/featured_resident_actions_charm_v3.png`: 9×2 expression/action variations, 48×48, indexed transparent PNG, 432×96.
- `js/render/opening_pixel_assets.js`: runtime swaps to new sprite and action atlas. Previous art remains stored separately, never deleted.
- `js/data/npcs.js`: nine in-game dialogue portrait crops refer to the same NEW base image as the world scene. Main character hero portraits have not been modified.
- Head and lower body were rescaled independently for better 48px readability, with inspected native-pixel output; side and back source captures used design turnarounds, not an unaltered front mirror. Right-facing source uses deliberate mirrored side artwork. Transparency, sheet dimensions and frame ordering checked.
- **Same-location comparison:** append `?npcArt=legacy` to this branch's game URL to show the historical pre-concept named residents (including NPC portrait and acting frames). Remove the query to restore the new default. This does not change world state, hero art or gameplay flags.

## QA performed / reproducibility
- The generated sprite masks, pixel conversions, four-view contact sheet and PNGs are saved as downloadable working artifacts in the conversation. Pixel conversion was actually executed using Python/Pillow/OpenCV on each generated design; images were not merely described.
- Native PNG transparency failure in the first paletted export was detected and fixed **before GitHub integration**. The corrected PNGs are non-opaque over background and have Git blob SHA `a4710dc859c8e28847d1016bc37bb0202a800f0e` and `992a5b94e74f72a909ce0240f8deab18f19240d9`.
- New Node tests verify CRC, zlib-decodability, alpha transparency, all 36 cells, two local action frames each, renderer sprites/portraits, old/new query selection and unchanged hero portrait renderer; existing resident-specific tests are updated for new filenames.
- The existing Python standalone HTML packer scans and inlines `assets/` paths (not one hardcoded PNG filename); the new art paths are included automatically.
- Technical PNG and source tests are not a proxy for subjective human attachment. Exact-HEAD full browser play, normal save/continue, independent novice appraisal, room/door proportions and production approval are **not yet proven**.

## Aesthetic findings still blocking product release
1. The new 48px faces are more detailed than the previous blocky shared face, but the full-size concept art contains facial subtleties that simply do not survive 48px without more manual re-pixeling.
2. Side/back are genuinely different views, but movement/gesture frame coverage remains thin, particularly from nonfront directions. This is a working preview, not complete walk cycles.
3. Other 37 procedural villagers still use a simpler shared template. The village at full density could look visually uneven.
4. The newest source branch's complete gameplay screenshot and same-camera A/B comparison must be captured; earlier archived v21/v35 historical images are NOT current branch proof.
5. Do not merge any stacked art PR into `main` or declare commercial quality until the end-to-end initial experience and human look-based acceptance passes.

## How to check
```bash
npm run town:npc-charm-v3-unit
npm run town:art-unit
npm run opening:player-first-unit
npm run release:checked
```
Start game with this PR branch once built, review in-game new art, then `?npcArt=legacy` with same save/camera. Prioritise initial village pan, close NPC interactions, repeated town NPC silhouettes, castle and narrow/mobile layouts.
