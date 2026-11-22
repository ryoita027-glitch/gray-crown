# Triton Second Character Validation — preparation

Status: technical handoff only; no Triton design approval or runtime assets claimed.
Source: locked Triton A / GROUND ANCHOR in `docs/characters/CHARACTER_VISUAL_IDENTITY.md`, sections 8–9 and 12. This plan does not amend canon.

## What Karen has established

PR #17 demonstrates eight-animation integration. PR #18 records 48×48 source cells rendered at 44/48 around foot anchor `[24,44]` as its selected prototype condition. Logical world remains 32px. Karen's implementation is the control for this experiment; 44px is not yet a standard for every hero.

## Existing identity to translate

Triton is a 23-year-old woman, 171cm, the most trained of the four. Preserve broader shoulders than Karen, a grounded stance, stable low center of gravity, straighter eyebrows, sharper eyes, a slightly longer face and wider expressive mouth. She is direct and dependable, not a generic brute.

Hair: dark brown to black, heavy shoulder-length loose mass, open face, limited tip lag rather than Karen's tied bouncing hair.
Stage A: durable daily training clothes, off-white / gray upper layer, a broad faded-blue area at waist / sides, simple forearm reinforcement and close-fitting practical equipment. Right-handed. Do not invent a final weapon, eye color, emblem or new costume identity.

## Reviewable visual gate

Produce one front Idle candidate beside the existing Karen control for review. Test normal gameplay framing, silhouette and color-mass readability. Do not call a merely larger or recolored Karen a second-character success.

User decision required: final front-Idle design acceptance before directional and animation expansion. A test pass cannot approve the design.

## Technical integration after acceptance

1. Four directional source poses with transparent 48×48 cells and consistent ground anchor.
2. Character-specific Idle / Walk / Turn / Talk / Surprise / Approach / Laugh / Run; preserve category count and metadata validation.
3. Same village context, camera, baseline and Portrait comparison controls as Karen; no new story canon is needed for a technical staging scene.
4. Compare Full / Medium / Compact with Karen and Mika under matched framing. Do not change map geometry to hide proportion problems.
5. Verify scene completion and cancellation restore player position, facing, camera, locks, dialogue and save behavior.
6. Run the complete prototype gate and inspect actual runtime evidence. Keep actor PNG generation deterministic and separate from CI writes.

## Evidence required for a verdict

| Question | Evidence |
|---|---|
| Different person, same game? | Matching-framing Karen / Triton Idle, silhouette and color comparison |
| Grounded acting preserved? | Walk, turn, talk, laugh and run in motion |
| Scale works beyond Karen? | Full / Medium / Compact village comparison |
| Portrait-free readability? | Matched ON / OFF dialogue evidence |
| Technically safe? | Fresh CI SHA, all gates, control restoration |

Only then propose a provisional Pixel Character Standard. Sophie / Margaret, NPC migration, final Portrait policy and main adoption remain later decisions.
