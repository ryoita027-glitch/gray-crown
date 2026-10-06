# Triton Chibi Direction Lock v1

## Status

**USER-APPROVED VISUAL DIRECTION LOCK**

This replaces the earlier active Triton v2/v3/v4 face-repair candidates as the visual source of truth.

Authoritative normalized source:

`docs/pixel/reference/triton_chibi_direction_lock_v1.png`

Compatibility alias:

`docs/pixel/reference/triton_idle_4dir_v1.png`

Both currently point to the same 192×48 / 48px-cell source.

## Identity

Triton remains **A — GROUND ANCHOR**.

Locked read:

- protagonist-grade cute Chibi balance;
- readable face at small scale;
- calmer/narrower eyes than Karen without line-eye collapse;
- straight stable brows;
- restrained friendly Idle mouth; broad hearty expression belongs primarily to Laugh;
- dark unbound heavy hair;
- broader shoulders and lower center of gravity than Karen;
- planted stance and horizontal stability;
- off-white / gray main clothing mass;
- faded-blue low horizontal waist/side mass;
- reliable / strong / grounded / unexpectedly approachable.

Karen is not modified by this lock.

## Technical normalization

- source: 48×48 RGBA cells
- order: down / left / right / up
- atlas: 192×48
- logical world: 32px
- prototype default screen occupancy: approximately 44px Medium
- anchor: [24,44]
- filtering: nearest-neighbor

Normalized source SHA-256:

`e8ec4ffd3061ad2b3bad1d465b6199a32bf5ab9ea18027ac26426acda0920060`

## Animation contract

Idle / Walk / Turn / Talk / Surprise / Approach / Laugh / Run.

Triton motion must remain different from Karen:

- low-amplitude Idle;
- reduced vertical Walk bounce;
- stable body axis;
- heavy hair with tip-only lag;
- restrained Talk;
- compact Surprise;
- weight-committed Approach;
- broad but planted Laugh;
- Run retains visible weight.

## Change rule

After this lock, only micro-corrections needed for directional consistency, animation readability or source-cell cleanup are allowed without reopening the visual direction.

Do not redesign Triton into a different character direction.

## Completion gate

This lock authorizes:

four-direction source
→ eight animation sheets
→ Karen/Triton gameplay comparison
→ Full48 / Medium44 / Compact41 check
→ full CI
→ Karen visual hash verification.

After those pass:

**Triton Second Character Validation PASS**


## Runtime sheet synchronization

The locked source now deterministically generates and tracks all eight Triton runtime sheets:

- `triton_idle.png`
- `triton_walk.png`
- `triton_turn.png`
- `triton_talk.png`
- `triton_surprise.png`
- `triton_approach.png`
- `triton_laugh.png`
- `triton_run.png`

Generated-asset sync commit:

`31af429637991183e7d106204e2bcd8b6366d8f2`

Karen visual assets were not part of that generated commit and remain pinned by the Karen regression-control gate.

This records asset synchronization only. The final Triton PASS still requires the gameplay/scale/regression completion gate below.
