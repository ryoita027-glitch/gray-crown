# Margaret V12 — head/body proportion diagnostic (2026-10-31)

**ART NO-GO.** Source branch: `art/margaret-shoulder-mass-v11-hold-20261031-0722`, fixed parent commit `07123c50d3915035ebe357c29e46ae4b59f62c38`. No production asset, main, frozen PR #98, gameplay, save schema, or building changes.

## Real work and comparison
- Created an actual 288×192 RGBA atlas: `assets/characters/margaret/studies/margaret_proportion_v12_diagnostic_walk.png` (4 directions × 6 walking frames).
- Instead of another RGB-only hair edit, this tests the structural hypothesis: remove three crown/hair rows (11, 14, 17), retain every original face pixel row 18–26 in order, then repeat three torso rows (28, 33, 37) to keep the footline at the same 48px coordinates.
- Actual RGBA changes: **11,081** across 24/24 walk frames; **0 changes** in local rows 42–47. Reproducible with `python tools/art/build_margaret_v12.py` (or `--write`).
- [Native 44px same-background A/B](evidence/margaret_v11_v12_proportion_native44_20261031.png) (V11 top, V12 bottom, front/left/right/back, frame 0). [Animated V11/V12 and fixed Mayor/Envoy V5 reviewer](../../tools/art/review_margaret_v12.html).

## Art verdict — reject
The head is marginally shorter and more torso is visible, but skipped hair rows flatten the crown/ponytail transition, duplicated torso rows create repeated texture bands, and side-view anatomy remains unconvincing. This is not a hand-drawn, commercial-quality correction. **Do not promote V12 or use its remap as a general-purpose production solution.** Retain V11 as an unapproved study only; the official game remains unchanged.

## Verification boundaries
- Executed: GitHub source PNG decode, 24-frame row remap, all-frame difference check, face-row byte-preservation check by mapping, unchanged feet (rows 42–47), PNG re-decode/roundtrip, 44px comparison image construction.
- Not executed: full checkout Python/Node tests, real Chromium game-canvas capture, 8-action consistency, animation visual acceptance, whole-game QA. The animated HTML reviewer was saved but not browser-executed.
- Next: stop algorithmic crown row deletion; redraw hair/neck/shoulder/coat contours per direction against Mayor and Envoy V5 at 44px, preserving Margaret's distinct long hair, face, costume and personality. Obtain actual game-canvas evidence before considering adoption.
