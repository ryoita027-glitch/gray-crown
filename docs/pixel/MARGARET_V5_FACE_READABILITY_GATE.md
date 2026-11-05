# Margaret v5 Face Readability Gate

Status: **PROMOTED ON PROTOTYPE BRANCH / ACTIVE MARGARET SOURCE**

## Why v5 exists

Margaret v4 solved the large-scale occupancy mismatch, but the Medium44 face became too compressed. The user explicitly rejected that result as "顔つぶれすぎ".

v5 fixes that specific failure without reopening unresolved canon.

## v5 technical rule

v5 is generated from the earlier approved face-readable direction source with these constraints:

- head and face pixels are kept at exact 1:1 scale;
- occupancy correction happens below the face instead of horizontally resampling the head;
- added dark silhouette is restricted to the external boundary;
- internal transparent face/hair gaps are not filled by outline expansion;
- four-character evidence is composed mechanically from exact evaluated PNG pixels;
- AI-generated comparison boards are not accepted as scale or quality evidence.

## Current prototype authority

Active direction lock:

`docs/pixel/reference/margaret_chibi_direction_lock_v5_48.png`

Active runtime:

- `assets/characters/margaret/margaret_idle.png`
- `assets/characters/margaret/margaret_walk.png`
- `assets/characters/margaret/margaret_turn.png`
- `assets/characters/margaret/margaret_talk.png`
- `assets/characters/margaret/margaret_surprise.png`
- `assets/characters/margaret/margaret_approach.png`
- `assets/characters/margaret/margaret_laugh.png`
- `assets/characters/margaret/margaret_run.png`

The source and all eight runtime sheets are hash-pinned by `tools/verify_margaret_direction_lock.py`.

## Visual intent retained

- white / pale silver-lavender hair;
- simple high ponytail;
- cute protagonist-grade readable face;
- calm / intelligent / approachable expression;
- dark navy / charcoal major clothing mass;
- cream / ivory secondary mass;
- upright, measured identity;
- restrained acting amplitude.

## Still unresolved

Do not infer final canon for:

- exact eye color;
- fourth-character final palette;
- surname;
- final weapon design/name;
- final hero costume;
- magic visual language;
- Kingdom / hero-certification / religious emblems.

## Safety boundary

Promotion to v5 is prototype-only.

It does not authorize:

- merge to `main`;
- formal game-wide Pixel-native adoption;
- Portrait removal;
- NPC migration;
- battle sprite migration;
- Save schema change;
- v24 production scope.

## Next gate

Margaret is no longer the isolated bottleneck.

The active next gate is the shared **Four Protagonist Runtime Harmonization / Quality Gate**, followed by **Four Protagonist Environment Integration** after final green.
