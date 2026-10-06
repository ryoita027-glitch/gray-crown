# Triton Front Idle Visual Gate — Current Candidate

Status: **REVIEW CANDIDATE / NOT APPROVED / NOT RUNTIME**

Branch: `pixel-triton-second-character-validation`
Baseline inherited from Karen scale integration HEAD `ddbf75eef6f0a169edbb5c197bbd4c9c3a4cc888`.

## Source received in current handoff

The current Work handoff provides three high-resolution pixel-art references: front, right-facing and left-facing Triton Idle views. They establish the present visual direction but are not production sprite cells.

The three 48×48 PNGs committed beside this note are **nearest-neighbour downsample probes only**. They exist to test information survival at the established source-cell size. They are not an approved redraw and must not be wired into runtime animation metadata.

## Visual read against locked GROUND ANCHOR identity

Directionally strong:

- heavy dark shoulder-length hair reads separately from Karen's tied / moving red hair;
- off-white / gray upper mass remains distinct from the broad blue waist / side mass;
- stance is planted and wider than Karen;
- shoulders, forearms and legs suggest training without requiring armor;
- overall impression is reliable and grounded rather than a generic delicate heroine.

Still requires a dedicated 48×48 redraw before expansion:

- direct reduction loses too much face structure and the sharper-eye / straight-brow identity;
- shoulder width and trained-body distinction compress more than desired;
- the broad blue horizontal waist hook becomes too thin at gameplay scale;
- current large reference contains detail that cannot simply be shrunk into the 48px source language;
- left/right views are useful design references, but directional production must wait for the front gate.

## Gate verdict

**REVISE AT 48×48, DO NOT EXPAND ANIMATIONS YET.**

This is not a rejection of the current Triton design. The large design reference is close to the locked identity. The revision target is the pixel translation: simplify and exaggerate the correct large masses so GROUND ANCHOR survives in a true 48×48 source cell.

## Next implementation action

Create one purpose-built front-facing 48×48 Triton Idle sprite using the current reference, with these priorities:

1. preserve a heavier, wider shoulder silhouette than Karen;
2. keep both feet visibly planted and the center of gravity low;
3. preserve a clear broad faded-blue waist / side block;
4. use one heavy shoulder-length dark-hair mass, not many small strands;
5. keep the face readable as sharper-eyed / straight-browed / broad-mouth without inventing eye color;
6. avoid armor, emblems, final weapon design or other unresolved canon;
7. keep the same-game Chibi language while avoiding a recolored Karen body.

Only after user acceptance of that front 48×48 redraw should four-direction Idle and the eight-animation set begin.
