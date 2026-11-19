# Gray Crown — Commercial presentation reconciliation (2026-10-10)

## Scope / authority
This is an **experimental integration candidate**, not a change to `main`, story canon,
save schema, or approved Karen/Triton assets. Merge parents are PR #33 and PR #34.

## Verified antecedents
- PR #33 head: `e678d5daf7fb23c6779320640d47bf5132510648`. Green: commercial polish browser, protagonist appeal,
  playable package, Triton completion.
- PR #34 head: `b7b4063d815243c17d9c84d75d4e779f0fc41b69`. Alternate visual pass; initial legacy CI ran v2/v5
  runtime SHA rules against v3/v7 appeal assets.
- Sophie/Margaret verification scripts now keep historical lock hashes and
  compare current appeal runtime frame pixels against deterministic regeneration.

## Conflict resolution
PRs #33 and #34 touch the same UI, world, NPC, battle and CSS paths.
Choose **PR #33** as integration base because its advanced scene treatment,
role-aware NPCs, menu/stock accessibility, responsive battle focus and dedicated
commercial browser E2E are already jointly verified.

Explicitly preserve from #33:
- UI layout and CSS (no duplicate appends);
- game menu/save/load behavior and audio controls;
- road/grass/tree detail, role-aware NPC presentation;
- game/battle protagonist parity and enemy families;
- Medium44 actor scale, until a visual review authorizes another scale;
- Portrait A/B remains a test choice, not a default behavior decision.

Cherry-pick the PR #34 ground-ring **leader indicator** into `js/render/world.js`.
This removes the floating overhead diamond while keeping PR #33's own
character renderer, party trailing, trees, NPC and scene changes.

Resolve PR #34 alternatives *without simultaneously activating both*:
- PR #34 procedural NPC rendering / 42px scale: superseded by PR #33's
  validated NPC renderer / Medium44 world-scale;
- PR #34 standalone SVG enemy variants: not copied into runtime because
  PR #33's battle enemy implementation uses CSS pixel-block figures
  and its browser E2E checks those figures;
- PR #34 default Portrait-off choice: not adopted, as Portrait ON/OFF is still A/B;
- PR #34's alternative CSS/HUD/battle world code: replaced by PR #33's
  tested end-to-end implementation;
- PR #34 variant browser test enforces a different scale and renderer: do not
  import conflicting assertions as-is; retain both historical tests in parents.

## Gate
- Both parent PRs retain their history; this is a two-parent merge candidate.
- Verify historical source locks (v2 Sophie, v5 Margaret), but validate active
  v3/v7 runtime through exact deterministic regeneration.
- Re-run `npm run check`, real browser scene test,
  `tools/verify_four_protagonist_appeal_runtime.py`, and runtime build.
- Do **not** merge into `main` until user explicitly approves the integrated
  presentation and all relevant checks pass.
