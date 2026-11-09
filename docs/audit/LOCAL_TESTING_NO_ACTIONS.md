# Gray Crown — Local quality gates (Actions-free)

While GitHub Actions hosted minutes are depleted, **do not interpret skipped
cloud workflows as game failures or test passes**. This branch's
`capital-first-arc-acceptance.yml` and inherited
`karen-prototype-check.yml` have been switched to **manual-dispatch only**
so branch edits / PR updates no longer intentionally run the two costly
workflows.

## Windows (PowerShell) — from the current local repo checkout

Install Git, Node.js LTS and Python 3.12. These commands need an up-to-date
**clone of this exact development branch**, not an older downloaded ZIP:

```powershell
git fetch origin pixel-production-capital-first-arc-v1
git switch pixel-production-capital-first-arc-v1
py -3 tools/run_local_quality.py --mode quick --install
py -3 tools/run_local_quality.py --mode full --install --with-v23
```

If dependencies and Chromium are already installed, omit `--install`.
Do **not** run `npm install` by guess; the browser tests use pinned
`requirements-ci.txt` and local `python -m playwright install chromium`.

- `quick`: repo hygiene, Source of Truth, Python/JS syntax, **all Node tests**,
  and locked visual hashes. No browser E2E. Typically the first useful pass.
- `capital`: quick + unmodified `npm run check` (includes the established
  existing browser tests) + new `browser_capital_first_arc_e2e_test.py`.
  This new test itself traverses the genuine new-game village/road/fort route.
- `full`: quick + `npm run check` + village world/battle checks, Ryune
  Portrait A/B, Ryune buildings, Road/Fort checks, full Phase-5 player
  journey and capital E2E.
- `--with-v23` (combine with `capital` or `full`) requires the original
  production commit in local git history; creates a **temporary detached
  read-only worktree** and tests a genuinely produced main-v23 save,
  then cleans up the worktree. Never sets saved Story flags or simulates
  historical saved data. Do not claim migration PASS without this option.

Every step stops at the **first failing assertion**, saving its console trace
to `prototype_artifacts/local_quality_runs/<timestamp>/` along with a
machine-readable `results.json`. Chromium screenshots / comparison
JSON are stored in the test's existing
`prototype_artifacts/capital_first_arc_v1/` folder. Keep screenshots
unaltered and record the exact HEAD in the report.

The tests do not push branches, run Actions, merge to `main` or regenerate
approved Karen/Triton/Sophie/Margaret PNGs. They cannot certify aesthetic
appeal, emotional impact or fun. Those remain a separate review.

**GitHub Actions** `workflow_dispatch` stays available when the account
budget resets or external runners are connected. Historical unrelated
workflows remain at their original scope; the old Triton PR-triggered
workflow is made manual-only **in this development branch**, not in
production `main` or every historical PR. Check the account's Actions
settings separately if other workflows continue to trigger on different
branches.
