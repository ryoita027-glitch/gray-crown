# Gray Crown — Four Hero Runtime Appeal and Legibility Standard v1

**PROVISIONAL; not a redesign or replacement of approved portrait/sprite identity.**
**Source:** original `assets/characters/{karen,triton,sophie,margaret}/{hero}_{idle,walk,turn,talk,surprise,approach,laugh,run}.png` remain the only approved in-game protagonist art. Never use generated replacement PNGs, cropping, copied faces, game-battle CSS pseudo-figures or resized blurry image smoothing.

## Correct sprite atlas dimensions
A single approved animation sheet is RGBA `192×192`: four frames across, four directions down, each logical source frame `48×48`. Original logical world character display is approximately **44px**, `imageSmoothingEnabled=false`. In battle the correct idle sheet is **44×44** with CSS background `176×176`, horizontal offsets `0,−44,−88,−132` and no stacked `::before/::after` faux body.

## Expressiveness without replacing canonical personality

| Hero | Seen before the first battle | Recommended visual timing | Prohibited |
|---|---|---|---|
| カレン | Early forward attention and immediate speaking reaction | 0ms initial talk, brief surprise only where dialogue already uses ?/! | identical neutral AI-face silhouette with Triton, invented hair/costume |
| トリトン | Grounded presence and one beat before responding | 70ms measured start, approved shoulder-length dark hair sheet | taller/male redesign, cosmetic-only endless sword swing, misleading horizontal slide |
| ソフィ | Deliberate delicate hand-led conversation | 90ms gentle start, controlled existing `talk` and `surprise` | flashy healing glyph, unexplained religious symbol, passive generic idle-only response |
| マーガレット | Observes, then comments; white/silver-lavender hair legible | 220ms thought beat, controlled existing `talk` sheet | re-rendered face, uncontrolled hair silhouette, unnecessary high-intensity reaction |

The new `GC.CommercialActing` must never alter actor real world positions, the follower trail, NPC occupancy, save/transient scene locks or the original text in `EVENT_DEFS`. While original Ryune/Capital SceneRunner is active, its existing choreography owns every actor. In ordinary dialogue only the speaking party member gets the new pose, and it is cleared on close. Reduced-motion mode retains stable existing art.

## Handheld visual inspection checklist (not yet completed)

Use identical current-HEAD real Chromium viewport and game-authored saves at 1365×900 and 390×844. At source-nearest view inspect silhouette/facial readability at 44px, four-character visual distinction, 48px cell alpha edges, no cutout strips, no left/right vestiges, no faux CSS silhouette overlapping PNG, no missing idle frame, no tracking/camera twitch during dialogue, 12fps redraw fidelity and all original approved scene camera shots.

**No screenshots of the latest four-pillar candidate have been produced or falsely claimed.** A new concept-illustration file would be a separate **candidate** requiring user artistic approval, not an automatic upgrade to these 32 locked sprite sheets.
