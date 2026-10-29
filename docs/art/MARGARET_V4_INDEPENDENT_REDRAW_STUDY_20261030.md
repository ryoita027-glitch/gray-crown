# Margaret V4: independent 48px redraw study (2026-10-30)

**Status: ART REVIEW REQUIRED / NO-GO for production.** Base: PR #123 at exact SHA `9aebdd5cd6a764ebe8e1ef47500dbcf9065ba6d5`. This is an isolated art experiment; it does not change `main`, PR #98, original Margaret PNGs, runtime drawing, Save v23, maps, story, other protagonists or buildings.

## Actual authored asset

`assets/characters/margaret/studies/margaret_walk_v4_study.png` is a **new 288×192 indexed PNG** containing six 48×48 walking cells per direction (front, left, right, back). Unlike the V1–V3 palette/silhouette modifiers, it is an independently drawn full head, adult face, neck, shoulder, torso, robe, legs and book silhouette. It retains Margaret's silver-white long hair, calm narrow eyes, vertical pale center panel, dark clothing, and book identity. There are three distinct walking frames per direction, not six unique poses.

Native-scale art direction: a narrower three-mass hair crown rather than a broad white helmet; visible adult jaw and neck; readable shoulder line; a central ivory robe strip against deep muted plum; a restrained green book at the hip. Matte three-plane hair shading, no glow, glitter, extra jewelry or purple ambience. These are design choices for **comparison**, not canon changes.

## Verification and limitations

- Locally generated and visually inspected the **actual** candidate PNG at nearest-neighbor 44px scale in all four directions; an offline preview was created. This is **not a game screenshot**.
- The isolated asset test `python -m unittest discover -s tests -p test_margaret_v4_walk_study.py -v` passed **3/3** locally against the byte-identical indexed PNG, checking 288×192 dimensions, all directions, 3 distinct walk poses, a consistent y=43 footline, alpha and horizontal bounds.
- The candidate's current body spans roughly x=14–35, y=8–43 (48px source). This is not automatically the correct scale for the existing map.
- **NOT DONE:** direct 44px side-by-side with original Margaret and actual V5 mayor/messenger using the same source image decoder; live Chromium capture; 8 animation sheets integrated and verified; game-wide `npm run check`; player acceptance.
- Do not call this an aesthetic PASS. The private original source PNGs were readable through GitHub metadata but could not be materialized into this execution sandbox for an honest matched A/B. The candidate is intentionally NOT wired to the game.
- Pillow is required for the standalone structural test; do not imply the repository's full QA passed.

## Next

1. Obtain real original and V5 atlas images in the same runnable checkout and produce 44px A/B with this candidate, all four heroines, and the NPC anchors on identical backgrounds.
2. Evaluate adult face, proportions, hair silhouette, role identity, and ground contact at 1×. Reject or revise if inferior.
3. If promising, author all eight directional animation sheets and ensure motion quality, then implement opt-in same-scene game A/B. Keep original/default unchanged until actual approval.
4. Continue character coherence before any house/map redesign. No paid service or Actions run was used.
