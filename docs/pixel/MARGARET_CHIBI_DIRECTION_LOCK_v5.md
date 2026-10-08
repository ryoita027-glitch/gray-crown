# Margaret Chibi Direction Lock v5

## Status

**Character:** Margaret  
**Visual status:** FACE READABILITY CORRECTION PROMOTED ON PROTOTYPE BRANCH  
**Runtime status:** EIGHT CATEGORY RUNTIME UPDATED  
**Main:** NOT MERGED

## Why v5 exists

Margaret v4 solved apparent-size and body-occupancy problems but compressed the face too aggressively at Medium44.

The user rejected that result as:

> 顔つぶれすぎ

v5 corrects that specific defect without reopening Margaret's overall design.

## v5 rules

Preserve:
- white / pale silver-lavender hair;
- simple high ponytail;
- cute protagonist-grade calm face;
- dark navy/charcoal major clothing mass;
- cream/ivory secondary mass;
- restrained gold detail;
- upright measured posture;
- readable 44px protagonist occupancy.

Technical correction:
- approved earlier head/face pixels are preserved at 1:1;
- body occupancy is handled below the face instead of horizontally resampling the head;
- external silhouette reinforcement does not fill internal facial gaps.

## Technical source

`docs/pixel/reference/margaret_chibi_direction_lock_v5_48.png`

- 192×48 RGBA;
- 48×48 cells;
- down / left / right / up;
- file SHA-256: `88ee3bf7073f06d2717bab34d14a675033f4777b0bb18e2868dfe890695010b5`;
- pixel SHA-256: `0aacc491fde7b30b7b9dc524e59881570afa49f277e6a8718b51c1a92c0786bd`.

## Runtime

Idle / Walk / Turn / Talk / Surprise / Approach / Laugh / Run are regenerated from v5 and pinned by `tools/verify_margaret_direction_lock.py`.

## Still unresolved

This lock does not canonize:
- exact eye color;
- final fourth-character palette;
- surname;
- formal weapon;
- final hero costume;
- magic visual language;
- heraldry / religious / certification marks.

## Merge authority

v5 is prototype branch authority only. It does not authorize main merge or formal Pixel-native adoption.
