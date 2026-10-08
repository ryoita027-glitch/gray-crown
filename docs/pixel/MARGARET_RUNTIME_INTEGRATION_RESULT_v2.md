# Margaret Runtime Integration Result v2

## Status

**MARGARET v3 RUNTIME-SCALE CORRECTION INTEGRATED — PROTOTYPE BRANCH**

Branch: `pixel-margaret-fourth-character-front-gate`  
Draft PR: #29

This result supersedes `MARGARET_RUNTIME_INTEGRATION_RESULT_v1.md` for the active Margaret prototype.

It does not authorize merge to `main` and does not make whole-game Pixel-native adoption final.

## Why v3 exists

The first real Medium44 runtime comparison showed that Margaret v2 occupied too little horizontal space and read too thin beside Karen, Triton and Sophie.

The correction was made in the 48×48 source instead of giving Margaret a special renderer scale.

v3 therefore keeps the shared **44px runtime draw size** and changes the source silhouette:

- broader occupied area;
- slightly larger Chibi head read;
- slightly thicker torso / body mass;
- stronger outline separation;
- clearer high-ponytail silhouette.

## Exact Medium44 occupied-area check

Measured from the mechanically composed comparison using exact committed control PNGs:

| Character | occupied width at 44px | occupied height at 44px |
| --- | ---: | ---: |
| Karen | 24 px | 40 px |
| Triton | 26 px | 40 px |
| Sophie | 30 px | 39 px |
| Margaret v3 | 30 px | 40 px |

Margaret no longer has a unique undersized footprint. Her width now matches Sophie while height remains in the same ~40px band as all three controls.

## Active source

`docs/pixel/reference/margaret_chibi_direction_lock_v3_48.png`

- 192×48 RGBA;
- 48×48 cells;
- order: down / left / right / up;
- generated deterministically from the v2 source by `tools/generate_margaret_direction_v3.py`;
- source occupancy gate prevents regression to the narrow v2 silhouette.

## Runtime assets

The shared eight animation categories have been regenerated from v3 and synchronized to:

- `assets/characters/margaret/margaret_idle.png`
- `assets/characters/margaret/margaret_walk.png`
- `assets/characters/margaret/margaret_turn.png`
- `assets/characters/margaret/margaret_talk.png`
- `assets/characters/margaret/margaret_surprise.png`
- `assets/characters/margaret/margaret_approach.png`
- `assets/characters/margaret/margaret_laugh.png`
- `assets/characters/margaret/margaret_run.png`

The runtime registration remains in `js/data/animations.js`.

## Validation

The Margaret runtime CI now validates:

- Karen visual regression control;
- Triton direction lock;
- Sophie direction lock;
- deterministic Margaret v3 source generation;
- Margaret v3 occupied-area constraints;
- eight regenerated runtime sheets;
- exact-pixel four-character Medium44 evidence;
- Margaret Chromium browser E2E;
- full Gray Crown `npm run check` regression gate;
- locked control re-verification after Margaret testing.

The Margaret workflow's repository write permission is explicitly restricted by the repository hygiene gate to this prototype branch and to the Margaret generated source/runtime paths.

## Still unresolved

No change to these unresolved items:

- exact eye color;
- final fourth-character color;
- surname;
- final weapon;
- final hero costume;
- magic visual language;
- heraldry / religious marks / certification marks;
- formal whole-game Pixel-native adoption;
- main merge.

## Next technical phase

With all four protagonist prototype runtime sets present, the next engineering phase is four-protagonist Source-of-Truth reconciliation and in-scene integration testing against the existing environment prototypes before any main merge.
