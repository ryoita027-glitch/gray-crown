# Margaret Runtime Integration Result v1

## Status

**RUNTIME PROTOTYPE INTEGRATION COMPLETE — REVIEW / PROTOTYPE ONLY**

Branch: `pixel-margaret-fourth-character-front-gate`  
Draft PR: #29  
Successful validation run: `37632449031`  
Validated head: `73cd7aad1f5d3075f5e376562e761eea2ddb9fa4`

This result does not authorize merge to `main` and does not constitute final Pixel-native adoption.

## Integrated runtime scope

Margaret now has committed runtime PNGs for the shared eight animation categories:

- `assets/characters/margaret/margaret_idle.png` — blob `b1ade699738eeed8ddeae4a4f0c47b773d422630`
- `assets/characters/margaret/margaret_walk.png` — blob `5f6ef87152150f33486e48bd548c43e7fd6e3a56`
- `assets/characters/margaret/margaret_turn.png` — blob `1c0080fe1939cfb04df566ac62bf0f49ccb05801`
- `assets/characters/margaret/margaret_talk.png` — blob `c91b0aa76741b4b731d3ec3f9e6772b4fc8463f3`
- `assets/characters/margaret/margaret_surprise.png` — blob `c4131113f970a10b19dd30e3fe4eea76d14f2a51`
- `assets/characters/margaret/margaret_approach.png` — blob `9684b235360974300f5e4b4aa1c7953c3baadab6`
- `assets/characters/margaret/margaret_laugh.png` — blob `7f198f9c0b6a1dc421d0e6595ee8f7ac8da36b7e`
- `assets/characters/margaret/margaret_run.png` — blob `b8ee1efa603d80fd25add8d60119c7a56e03b802`

Runtime metadata is registered in `js/data/animations.js` with the same 48×48 source-cell / 32px logical-world / [24,44] anchor architecture used by the existing prototype protagonists.

Prototype screen occupancy remains **Medium44** for the four-character comparison.

## Runtime validation view

Standalone validation route:

`prototypes/margaret-runtime/index.html`

It loads the exact committed Karen / Triton / Sophie idle sheets and Margaret's committed eight animation sheets, renders all four at 44px, and allows switching Margaret among:

- Idle
- Walk
- Turn
- Talk
- Surprise
- Approach
- Laugh
- Run

This preview is isolated from story/maps/save data.

## Automated validation

The successful Margaret Runtime Validation CI run verifies:

- project authority check;
- Karen visual regression control;
- Triton direction lock;
- Sophie direction lock;
- Margaret Direction Lock v2;
- deterministic Margaret runtime sheet generation;
- committed Margaret runtime asset presence / PNG integrity;
- `animations.js` Margaret metadata;
- exact-pixel direction / scale evidence;
- Margaret Chromium browser E2E;
- full `npm run check` Gray Crown regression gate;
- locked Karen / Triton / Sophie controls again after the runtime tests.

## Design scope preserved

Prototype-approved:

- white / pale silver-lavender hair;
- simple high ponytail;
- soft protagonist-grade face;
- upright / slender / composed silhouette;
- measured motion language.

Still unresolved / not canonized:

- exact eye color;
- final fourth-character color;
- surname;
- formal weapon;
- final hero costume;
- magic visual language;
- heraldry / religious marks / certification marks;
- formal Pixel-native production adoption.

## Next gate

Next review should use the runtime evidence, not regenerated comparison art.

If the four-character 44px runtime balance is accepted, the technical next step is four-protagonist integration planning and Source-of-Truth reconciliation before any main merge.
