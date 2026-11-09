# Sophie Chibi Direction Lock v2

## Status

**Character:** Sophie — STEADY HANDS  
**Visual identity:** USER APPROVED / PRESERVED  
**Technical cleanup:** PROMOTED ON PROTOTYPE BRANCH  
**Supersedes runtime/source authority:** Sophie Chibi Direction Lock v1

## What changed

v2 is not a redesign.

The unified four-protagonist quality audit found repeated detached gray/brown micro-pixel debris above Sophie's head in the direction source and across the eight runtime animation sheets.

The cleanup pass:
- preserves the approved face;
- preserves honey/light golden-brown hair;
- preserves cream + brown leather + muted-green color masses;
- preserves body proportions, hands, stance and acting;
- does not rescale or redraw the visible character;
- removes only detached micro-components identified by the quality gate.

Karen and Triton remain byte-locked controls.

## Technical source

`docs/pixel/reference/sophie_chibi_direction_lock_v2_48.png`

- 192×48 RGBA;
- 48×48 cells;
- order down / left / right / up;
- file SHA-256: `f82c63f6705ffedb253a0d5b783d88b91ad0dd0b6a33c5788cd22aae86835206`.

## Runtime

All eight runtime categories have been regenerated/cleaned and pinned by `tools/verify_sophie_direction_lock.py`:

Idle / Walk / Turn / Talk / Surprise / Approach / Laugh / Run.

## Relationship to v1

v1 remains historical evidence of the user-approved design direction.

v2 is the active technical source because it removes non-design debris without changing the approved identity.
