# Gray Crown — Four Protagonist Quality Review Result v1

**Status:** QUALITY HARMONIZATION IMPLEMENTED ON PROTOTYPE BRANCH  
**Main:** unchanged / not authorized for merge

## Exact evidence

The review uses mechanically composed PNG evidence only.

Pre-promotion Medium44 visible front bounds:

| Character | Visible width | Visible height | Face contrast p90-p10 | Normalized palette bins |
| --- | ---: | ---: | ---: | ---: |
| Karen | 24 | 40 | 201.1 | 47 |
| Triton | 26 | 40 | 180.6 | 45 |
| Sophie | 30 | 39 | 114.5 | 41 |
| Margaret v5 | 28 | 40 | 189.0 | 18 |

Pairwise normalized front-silhouette IoU:

- Karen / Triton: 0.7879
- Karen / Sophie: 0.6282
- Karen / Margaret: 0.6794
- Triton / Sophie: 0.6744
- Triton / Margaret: 0.7242
- Sophie / Margaret: 0.7149

No pair crossed the 0.90 collision threshold. The cast remains visually distinct before color.

## Character verdicts

### Karen — PASS / KEEP LOCKED

Karen remains the permanent Visual Regression Control.

The conservative uplift pass removed **0 pixels** from Karen's runtime sheets. No defect justified reopening the source.

Result: **no art change**.

### Triton — PASS / KEEP LOCKED

Triton's planted mass and dark-hair silhouette remain distinct.

The conservative uplift pass removed **0 pixels** from Triton's runtime sheets.

Result: **no art change**.

### Sophie — PASS WITH TECHNICAL CLEANUP

The audit found repeated detached micro-pixel debris above Sophie's head across runtime frames.

This was not an identity feature. It was isolated rendering debris.

The conservative cleanup removed **701 pixels total across 148 directional animation cells**, averaging under five pixels per cell, while preserving:
- face;
- hair mass;
- body;
- hands;
- palette;
- stance;
- animation timing.

The cleaned source is promoted as **Sophie Chibi Direction Lock v2** and the eight cleaned runtime sheets are hash-pinned.

Result: **quality increased without redesign**.

### Margaret — PASS FOR v5 SOURCE / v4 RETIRED

Margaret v4 solved occupancy but failed the visual gate because its face was crushed by head resampling.

v5 preserves the approved earlier face/head pixels at 1:1 and handles occupancy below the face.

The exact Medium44 evidence shows:
- 28×40 visible front bounds;
- strong face-region contrast;
- distinct silhouette from all three controls;
- readable ponytail and pale-hair separation.

All eight runtime categories have been regenerated from the v5 source and hash-pinned.

Result: **v5 becomes active prototype authority; v4 is historical only**.

## Cast-level verdict

# **FOUR PROTAGONIST QUALITY HARMONIZATION — VISUAL/ASSET PASS**

The important outcome is not that all four sprites became identical.

The outcome is:
- the same 48×48 / Medium44 technical grammar;
- comparable gameplay presence;
- four distinct silhouettes;
- no accidental detached debris;
- no face-crushing occupancy correction;
- exact locks for every promoted source/runtime set.

Karen and Triton did not need changes. Sophie and Margaret received localized evidence-driven corrections.

## Regression note

A previous full `npm run check` attempt reached all 59 Node tests and the first two major browser gates, then hit the known intermittent `walk failed` condition in `browser_alpha2_frontier_second_e2e_test.py`.

That failure occurred outside the protagonist asset code path and has previously passed on retry. The harmonization CI therefore permits **one complete retry only**. A deterministic second failure remains a real gate failure.

## Next gate

After the latest harmonization workflow is green:

> **Four Protagonist Environment Integration**

Use exact runtime assets in Ryune village / grass-road / house exterior / house interior before any formal Pixel-native adoption or main merge.
