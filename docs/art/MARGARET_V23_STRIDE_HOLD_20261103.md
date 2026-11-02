# Margaret V23 walk — isolated stride experiment (2026-11-03 JST)
**ART HOLD / DO NOT MERGE.** Parent: PR #299 at `bef72f8e5ed549a51e125e60a80cb4c990ec3d4e`. Production idle/walk, main, PR #98, save v23, buildings and gameplay unchanged.

## Work
- Rebuilt 4 directions × 6 walk frames at 48×48 cells, 288×192 PNG from V22 idle, keeping face, hair, book, shoulder and upper body exactly intact above y=36.
- Alternating boot positions and contact height (planted y=44 / lifted y=42), hem split and modest cloth swing instead of V22's whole-upper-body sliding. Source: `tools/art/margaret_v23_stride_trial.py`. PNG uses an exact RGBA palette (30 colors; no quantization loss), with Git blob `d79ad9ecd9c4b3f6b5ede4e1c4272a8f69891ea3`.
- `tools/art/margaret_v22_v23_walk_native44_review.html` compares both actual PNGs at 44px nearest-neighbor, same poses and ground line; optional 145ms frame stepping. Static A/B, **not** live Ryune capture.

## Art review
At 44px the boots are more separated than V22, but animation is still modest and the robe, face, neck and shoulders remain too rigid/toy-like compared with V5 mayor and royal messenger. This is an experiment, **not** an improvement accepted for gameplay. Do not promote the sprite. A local contact sheet was inspected. Need same-state Ryune game Canvas and proper adult anatomy/cloth redesign.

## Verification
Local Pillow regenerated 24 frames, verified original V22 source SHA, unaltered top 36 pixels in every cell and y=44 footline. Browser execution, repo-wide Node tests and full-game capture not performed. No paid CI.
