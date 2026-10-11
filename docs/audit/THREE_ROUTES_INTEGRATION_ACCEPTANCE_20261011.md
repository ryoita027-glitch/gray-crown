# Gray Crown — Three Routes Integration Acceptance (2026-10-11)

## Status: **BLOCKED / DO NOT MERGE**

This branch is based on `feature/kingdom-empire-checkpoints-20261011` (PR #60) and therefore inherits the full chained Draft changes through PRs #49, #51–#60. It is a **single review/verification candidate**, **not** yet a proven integrated release, not part of `main` and not evidence that a full game playthrough has passed.

### Branch ancestry and merge risk
- #49 starts from `pixel-production-ashroad-serad-v1`, not current `main`.
- #51→#60 are sequential parent-to-child Draft PRs, not ten independent patches.
- At audit time, GitHub compare `main...feature/kingdom-empire-checkpoints-20261011` reports **diverged**, **500 commits ahead** and **1 behind**, with **273 changed paths**. Reconcile the one missing main commit and review the large diff **before** any base changes or merge.
- Do not merge the entire chain blindly or close individual draft reviews because another branch includes their code.

### Concrete defects found and fixed on this candidate
1. `tests/combat_personality_feedback.test.js` falsely read an always-empty `state.battle.log`. The real battle log is the DOM `#battleLog`; the assertion now checks that actual UI output.
2. `tests/serad_quality_regressions.test.js` asserted a superseded combo expression; it now matches the current safe, living-target expression.
3. `tests/commercial_quality_four_pillars.test.js` required the old random enemy-target expression despite the new truthful enemy telegraph and fallback. The test now checks the real current target-selection expression.
These are regression-test repairs, **not** passes of the full suite.

### CI experiment and blocker
- Added a bounded eight-minute GitHub Actions workflow using Node 22 to parse JS and run `npm test`.
- Actual GitHub Actions run [38123453094](https://github.com/ryoita027-glitch/gray-crown/actions/runs/38123453094) and later runs (for example [38123812615](https://github.com/ryoita027-glitch/gray-crown/actions/runs/38123812615)) failed **without recorded execution steps**. Jobs were `completed/failure` with `steps=null` and `logs_url=null`; log download returned a 404 (BlobNotFound). Thus **no actual test assertion failure OR test pass was observed**. A runner/billing/access limitation is possible but the cause is not established.
- Automatic push triggering was paused; workflow is manual-only until runner execution is available, to avoid repeated startup failures. This is not a green CI state.

### Real Chromium test committed, but **NOT YET EXECUTED**
`tests/browser_three_routes_integration_e2e.py` is a focused browser gate using the real `index.html`, imported JS, CSS and character images:
- 4 choice-specific Kingdom/Empire checkpoint openings and real UI target forecasts
- a four-hero command sequence with Karen guarding Sophie's predicted attack
- nonlethal persuasion and completed route flag
- real Save/Load round-trip using localStorage and schema 23
- Ash Crown 2-member/solo fights and stored companion decisions
- 6 ending-preview variants at a narrow viewport, including the required '未完成' label
- captured screenshots in `prototype_artifacts/three_routes_acceptance` *only if the browser gate actually runs*

The fixture primes the story state immediately before the selected final path; this is **not** proof of the complete 8–12-hour journey, all accessible character art, or released endings. All images/audio and playable chapters require separate approval.

### Reproducible commands on a genuine checkout
```bash
node tests/check-syntax.js
npm test
python -m pip install -r requirements-ci.txt
python -m playwright install chromium
npm run three-route-browser-test
```

`npm run three-route-acceptance` runs the syntax, Node and focused browser checks in sequence.

### Required exit criteria
- GitHub Actions runner successfully provisions and Node checks are green.
- Browser smoke passes and stores genuinely rendered screenshots.
- Existing full-browser gates (`npm run check`) pass, with no regression to Serad, saving or village/road/cave behavior.
- Explicit keyboard/mouse and narrow-screen interaction; audio and scene composition checked manually against real screenshots.
- Audit full PR ancestry/main divergence and review original character source locks.
- Only after the above: decide which branch (if any) deserves an integration PR against `main`. No merge has been performed.
