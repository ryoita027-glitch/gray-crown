# Gray Crown — CAPITAL_ENVIRONMENT_STANDARD_v1
**Status: PROVISIONAL VISUAL PRODUCTION DIRECTION — not an art approval.**
**Scope: only** `capital`, `capitalinn`, `capitalarmory`.
**Implementation:** `js/render/capital_environment.js`; toggled using `CapitalEnvironment.enabled`. Read with `docs/visual/PIXEL_NATIVE_PRODUCTION_STANDARD_v1.md` and current `VISUAL_ASSET_MANIFEST.md`.

## 1. Authority and locked invariants

- Keep the 4 playable characters' existing source PNGs exactly as they are, 48×48 frames / logical 32px collision / 44px displayed hero convention / foot anchor. Never regenerate, blur, scale with smoothing, shift palette, or change costume.
- Capital environment is **Canvas pixel-native procedural art**, not committed photographic or AI-generated PNG art. Pixel blocks use integral positions with no gradient/soft cinematic particles. Scene camera uses existing `viewScale()`; no new map coordinates, collision tiles, navigation, NPC roster or exits.
- All `maps.capital*` tiles/objects/NPC IDs and locations, `NPC_STYLE` reference colors and original `EVENT_DEFS` lines/effects remain unchanged. Neutral cloth and shape accents are **not heraldry**; no kingdom/imperial coat of arms, military rank insignia, religious icon, sanctioned weapon or formal hero costume is created.
- Outside the three maps this module's `paintTile()`, `street()`, `interior()`, `npcAccent()`, `objectAccent()` must be no-ops. `CapitalEnvironment.enabled=false` provides original pre-Phase-7 render for matching A/B capture. Never use an image generator to fabricate benchmark screenshots.

## 2. Distinctive city neighborhoods

| Existing district / map coordinates | Material / language | Story-space purpose |
|---|---|---|
| Northern castle front and ceremonial terrace (`capital` upper half) | lighter squared stone blocks, restrained vertical masonry, simple neutral drapes and viewing steps | scale of the state and the highly staged reception |
| West commercial stalls (`capital`, around market NPC `capitalVendor`) | warm plank counters, cloth bales, clay/wood crates and goods | economic activity, merchants and ration queues share the city |
| East military and logistics zone (`capital`, near `capitalRecruit` / barracks) | cold grays, rectangular masonry, supply stacks | practical apparatus behind the highly public ceremony |
| `capitalinn` / 白鹿亭 | brown wood, tableware, bedding and shared table; softened indoor synth sequence | travel, fatigue, conversations, cost of lodging |
| `capitalarmory` / 兵装店 | iron-gray stone, maintenance bench, repair metal rather than finalized new weapons; restrained percussive synth | army demand and repeated repairs |

These differences must be visibly legible in **actual runtime at 44px hero / 32px tiles**. No giant one-off full-map illustration may supersede collision and NPC placement.

## 3. Layering, occlusion, NPCs

The order is: existing tile map → deterministic `CapitalEnvironment.paintTile` on accepted tile types → existing decorative/functional map geometry → Capital environment district and room accent layers → original object shapes with optional accents → original NPC skins with small role accents → playable four-person render. Effects do not create colliders; any appearance of a physical obstacle on an actually traversable cell is a visual bug to fix.

The original village renderer is preserved. Capital NPCs remain procedural 32px approximations while four heroes remain locked native sprite sheets. `npcAccent` differentiates official, recruit, seller, innkeeper, smith, apprentice, flower girl, ration mother and commander by silhouette/role objects rather than globally repainting faces. This **does not yet constitute art parity with the four heroes**.

The original `npcVisible` and `capitalOfficial.hideWhen` rules control post-ceremony NPC visibility. Post-event discarded flower petals use `isEventComplete('alpha.capital.ceremony')` and `returnedKingdom` **read-only**; no additional world flag saved. It is not a newly introduced plot revelation.

## 4. Event, sound and UI contract

- Event owner: `js/data/events.js` `alpha.capital.ceremony` exact 12 original lines and 3 original effect records. `CapitalActing.sceneFor(def)` maps original lines to `GC.Cinematic.startScene` and supports Portrait ON/OFF nonpersistent comparison. **No content duplication** in the controller.
- Acting IDs: Karen quick forward impulse; Triton still planted; Sophie moves closer when she notices spectators; Margaret delays gaze and remains measured. Use the existing `SceneRunner` and restoration semantics. No new hero sheet frames.
- `mapMusicTheme('capital')` remains capital; `capitalInn` and `capitalArmory` keys give contrasting *Web Audio synthesized provisional loops*; `ceremonyBell` is a simple synthesized cue. No audio asset licensed, no final professional mix.
- Existing HUD, dialogue overlay, UI scale, menu and battle components unchanged. Any proposed new capital-only HUD must be separately justified.

## 5. Visual review, test policy and acceptable limits

Compare raw, directly captured Chromium pixels with `CapitalEnvironment.enabled=false/true`, same state, viewport and camera, capturing exterior districts plus two interiors, 1024×768 and 390×844. Automatically verify no horizontal overflow, 4 unique protagonist sprites, open traversable path to official/inn/armory and scene actor cleanup. The script-generated save in another context can be used for Portrait A/B, but screenshots must disclose this controlled **presentation-only** duplication.

Art cannot be LOCKED until the user judges scale, NPC identity, legibility, city-village contrast and rhythm. Material references in this file are **not** decisions about official kingdom symbols, hairstyles, colors of eyes, costumes or ideology.

**Safe revert:** leave Phase-7 Draft PR unmerged; compare original without overlays via `CapitalEnvironment.enabled=false`. Disable only the art and not the event changes. Full rollback uses previous Phase-5 HEAD, never force-push or delete historical records.
