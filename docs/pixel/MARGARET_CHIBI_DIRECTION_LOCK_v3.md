# Margaret Chibi Direction Lock v3

## Status

**Character:** Margaret  
**Visual status:** **USER-APPROVED DIRECTION, RUNTIME-SCALE CORRECTION ACTIVE**  
**Branch:** `pixel-margaret-fourth-character-front-gate`

v3 supersedes v2 as the active Margaret prototype source after the first real Medium44 runtime comparison showed that v2 occupied too little horizontal space and read too thin beside Karen, Triton and Sophie.

v2 remains in the repository as design history. v3 is not a main-branch production lock.

## Correction requested from the real 44px comparison

Keep the runtime draw size at **44px**. Do not solve the problem by giving Margaret a unique larger renderer scale.

Instead v3 changes the source sprite itself:

1. increase the occupied area inside each 48×48 cell;
2. make the Chibi head slightly larger in read;
3. thicken the torso / body mass;
4. strengthen silhouette and internal outline contrast;
5. make the high ponytail immediately readable in down / left / right / up.

## Preserved identity

- woman, 23;
- 167 cm;
- Ryune village;
- village chief's daughter;
- Karen / Triton / Sophie's childhood friend;
- white to pale silver-lavender hair;
- simple high ponytail;
- soft face-framing bangs;
- cute protagonist-grade Chibi face;
- calm, intelligent and approachable;
- upright / composed rather than aggressive;
- dark navy / charcoal prototype major mass;
- cream / ivory secondary mass;
- restrained gold prototype accents;
- measured motion language.

## v3 technical source

`docs/pixel/reference/margaret_chibi_direction_lock_v3_48.png`

- dimensions: 192×48;
- cell: 48×48;
- order: down / left / right / up;
- RGBA;
- SHA-256: `a4d570ec42c0c0db427ba1312780c047cfef66a8c925b4febda94776ef1d69e2`;
- mechanically corrected from the v2 48×48 prototype to increase occupied width and reinforce the outline without changing the runtime renderer scale.

Expected occupied source bboxes are intentionally broader than v2:

- down: at least 32 px wide;
- left: at least 32 px wide;
- right: at least 32 px wide;
- up: at least 30 px wide;
- all directions: at least 43 px tall.

These checks prevent a future regeneration from silently returning to the undersized v2 look.

## Runtime rule

Margaret uses the same architecture as the other protagonists:

- source cell: 48×48;
- runtime comparison draw size: Medium44;
- anchor: [24,44];
- direction order: down / left / right / up;
- exact committed Karen / Triton / Sophie PNGs remain visual controls.

Do **not** redraw or rescale Karen / Triton / Sophie to accommodate Margaret.

## Animation propagation

The shared eight categories must be regenerated from v3:

- Idle 4
- Walk 6
- Turn 3
- Talk 4
- Surprise 4
- Approach 4
- Laugh 6
- Run 6

Margaret's motion remains restrained and measured. The ponytail may lag / sway enough to read clearly, especially during Walk and Run, but it must remain secondary to the body's action.

## Still unresolved

v3 does not finalize:

- exact eye color;
- final fourth-character color;
- surname;
- formal weapon;
- final hero costume;
- magic visual language;
- emblems / religious marks / hero certification marks;
- formal whole-game Pixel-native adoption;
- merge to main.

## Gate after regeneration

The next valid evidence is the **mechanically composed Medium44 four-character comparison from exact committed PNGs plus the real Chromium runtime screenshot**.

If v3 still reads wrong there, revise the source again before any main merge.
