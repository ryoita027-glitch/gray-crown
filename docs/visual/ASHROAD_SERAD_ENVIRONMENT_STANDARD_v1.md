# Gray Crown — ASHROAD_SERAD_ENVIRONMENT_STANDARD_v1
**Status: PROVISIONAL artwork standard, NOT formally approved.**
**Scope only:** `ashroad`, `frontier`, `frontierfield`.
**Target chapter:** existing Story 10–15; `frontierfield` has preliminary appearance only, with existing 16–19 Story and events unchanged.

## Source of Truth
- `js/data/maps.js` and `js/data/npcs.js` tile arrays, object and NPC IDs, collision and exits have final authority.
- `js/data/events.js` and `js/systems/story.js` define existing speech, chronology, `alpha2.ashroad.*` and `alpha2.frontier.*`. They were deliberately **not edited**.
- Four existing, exact-approved 48px-source Karen, Triton, Sophie and Margaret PNG animations and 44px logical screen size remain immutable.
- `js/render/ash_frontier_environment.js` is **derived visual presentation only**, deliberately reversible through `AshFrontierEnvironment.enabled=false`. None of its variables enter the saved state, Story stage or a new collision tile.

## Art intent and functional distinctions

| Existing location | Pixel treatment | What player should notice |
|---|---|---|
| 灰の街道 (`ashroad`) | Desaturated burnt earth, cracked clay, wagon-rut traces, no cinematic embers | War's economic damage, paths toward people and evidence |
| 避難民・従軍僧 (`ashroad`) | A bundle/child-bearing silhouette and a neutral relief apron; no invented religion symbol | People forced to prioritize survival |
| Burned homestead/cart/scorched orders | Retain existing interactable object locations; add grounded charred wood/paper cues | Evidence is not a random glittering pickup |
| セラド (`frontier`) | Cooler mud, earthworks, linen cots, medical sacks and command-route divisions | A working fortress with triage and logistics, not a festival |
| 前線将校・衛生兵・兵士 | Distinct shoulders, field supplies/outer coats, no ranks or official insignia invented | Authority versus care roles before the Vark battle |
| セラド北側・戦闘跡 (`frontierfield`) | Abandoned stakes, stretcher traces, subdued neutral cloth, churned earth | Consequences and retreat paths without adding Story16+ |

### Rendering limits
Every painted tile uses integral `32px` canvas rectangles; no scaled bitmap cutouts, particles, cinematic filter, blur or independently AI-generated images. Tile motifs obey existing `D/B/T/M/K/H` types. Deliberately keep the road center visually traversable; small wheel ruts, not false walls. Do **not** introduce new interactables, rank marks, formal royal/imperial crests or religious icons. Separate `npcAccent` only adds role cues on top of the original `drawNpcCommercial`, without regenerating locked protagonist sprites. This is a limited pixel pass; procedural NPC parity is still **S2 provisional**, not commercial art signoff.

### Sound
The existing `mapMusicTheme` / Web Audio player is preserved. New keys `ashroad`, `frontier`, `frontierfield` use simple contrasting four-tone synthetic loops (ash: low weary, Serad: metered low pulses, aftermath: sparse lowered intervals). The player sound toggle continues to work; no MP3 licensing or new external tracks. The original battle and boss themes still override map music.

### Before/after proof
The exact same render state should be captured once with `AshFrontierEnvironment.enabled=false` and once `true`. These toggles modify presentation **only**. Use raw Chromium captures, same viewport and player coordinate, for all three maps and for 390px mobile, and inspect four protagonist sprites and original NPC/object IDs. Check that drawn details do not cover usable interaction markers. These future screenshots **do not exist** solely because the test script references filenames.

**Rollback:** leave Draft Phase8 branch unmerged or disable `AshFrontierEnvironment.enabled` for visual comparison; revert its short additive diffs to world/audio for full rollback. Do not modify `main`, existing PNGs, event lines, story schema or planned culture.
