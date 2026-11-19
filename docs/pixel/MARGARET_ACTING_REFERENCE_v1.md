# Margaret Acting Reference v1

## Status

**Character:** Margaret  
**Purpose:** 48×48 prototype animation behavior  
**Visual authority:** `MARGARET_CHIBI_DIRECTION_LOCK_v2.md`

The user approved an eight-animation visual reference during the Margaret design pass.

Reference image:

- `マーガレットのちびキャラ動作スプライトシート.png`
- SHA-256: `5a2afaa88004f49e3806d6a29c7186db9721b2faa001909397a15a5a46bdf103`

The reference communicates character acting, not exact runtime pixels.

## Acting core

Margaret is **measured, intelligent, composed, and warm**.

Do not translate "calm" into a dead face.

Do not translate "intelligent" into severe / frightening acting.

Her movement should be smaller than Karen's and more vertical than Triton's.

### Idle

Minimal movement. Upright posture. She should look attentive rather than frozen.

### Walk

Small measured steps. No large bounce.

### Turn

Controlled pivot. A compact silhouette change is preferred over a dramatic spin.

### Talk

Restrained movement. She does not wave broadly.

### Surprise

Clearly readable, but no large jump or exaggerated flailing.

### Approach

Deliberate and soft. Closing distance should feel intentional.

### Laugh

Warm and readable, but lower whole-body amplitude than Karen.

### Run

Efficient and light. Faster than Walk without turning into a comedic sprint.

## Ponytail rule

The high ponytail is an identity hook but must not dominate every frame.

- normal movement: restrained sway;
- run: increased lag is allowed;
- surprise/laugh: hair reaction remains secondary to the face/body read;
- do not create chaotic ribbon-like loops.

## Prototype implementation rule

The first 48×48 animation pass may use restrained whole-sprite transforms to preserve the approved source cleanly.

This is a technical validation pass, not final commercial sprite polish.

If stronger limb/face acting is needed later, revise Margaret specifically after gameplay evidence rather than forcing detail into the first generator.
