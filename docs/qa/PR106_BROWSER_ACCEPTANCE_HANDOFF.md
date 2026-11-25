# PR #106 browser acceptance handoff

Status: **BLOCKED in the ChatGPT execution container; not an acceptance pass.**

## Why this handoff exists

The repository is reachable through the GitHub connector, but the standalone HTML at
`dist/Graygrow_PR106_20261108_Offline.html` cannot be transferred into the current
execution container: the GitHub file endpoint returns an empty content body for that
large file, and direct raw-GitHub retrieval fails with DNS resolution
(`Temporary failure in name resolution`). A local Chromium smoke probe also did not
complete: it timed out after 8 seconds while emitting missing D-Bus socket errors.
No game browser session, screenshot, battle, or Save/Continue test was produced here.

**Do not treat the 2026-11-08 artifact as current PR #106 without checking its source.**
The PR #106 description currently references source commit
`a25d466e470e2f9067701227f44ea224a70b10f9`, while the 2026-11-08 standalone was
reported as built from `034fa16de883f8567cb060b459800e499abbd34b`. Resolve the
current PR head SHA from GitHub before testing or rebuilding. Do not test an old
artifact and label it as current.

## Execute in Google Antigravity (Windows, repository checkout)

Run in the Gray Crown repository terminal. This sequence does not install packages,
change main, merge a PR, or alter canonical art.

1. Resolve and record the live PR head from GitHub, then fetch that exact head:

```powershell
$pr = Invoke-RestMethod 'https://api.github.com/repos/ryoita027-glitch/gray-crown/pulls/106'
$expected = $pr.head.sha
$base = $pr.base.sha
"PR106_HEAD=$expected"
"PR106_BASE=$base"
git fetch origin "refs/pull/106/head:refs/remotes/origin/pr-106"
git checkout --detach $expected
if ((git rev-parse HEAD).Trim() -ne $expected) { throw 'Checkout SHA mismatch' }
git status --short
```

If GitHub API access is unavailable, stop and record that separately; do not substitute
the historical SHA.

2. Run the candidate's own non-skipped checks:

```powershell
node --version
npm --version
npm run check
if ($LASTEXITCODE -ne 0) { throw 'npm run check failed' }
node --test tests/cave_gate_chokepoint.test.js
if ($LASTEXITCODE -ne 0) { throw 'Gate test failed' }
```

Record the complete output and skipped-test count. Any required skip means the gate
is not passed. Do not spend paid Actions minutes.

3. Build the single-file release from this exact checkout:

```powershell
npm run release:checked
if ($LASTEXITCODE -ne 0) { throw 'Release build failed' }
Get-ChildItem dist -Filter '*.html' | Select-Object Name,Length
Get-FileHash dist\Graygrow_PR106_20261108_Offline.html -Algorithm SHA256
```

If the build output filename differs, use the generated standalone HTML actually
produced by the build and record its exact path and SHA-256. Never overwrite or
replace canonical PNGs. Preserve the generated file and logs.

4. Open the generated standalone HTML in the real Chromium/Edge browser through
Antigravity's browser UI. Capture screenshots at native game scale (not a mocked
Canvas or generated preview) for:
- initial title/start screen;
- Ryune village with the four party members;
- field movement and a real interaction/dialogue;
- road encounter and battle with visible player input and enemy response;
- old fort gate closed, both mechanisms operated, gate open, boss defeated and
  north exit accessible;
- save, reload/Continue, and restored map/position/story/party state.

5. Use the same browser session and same build SHA for the complete route:
New Game → Ryune village → road → old fort → boss → capital. Test both lever orders.
At the fort, verify both levers, herb chest and ration chest remain reachable while
the gate is closed; the boss/north exit remain blocked until the gate and boss
conditions are satisfied. Save before and after a meaningful state change, reload,
and verify the state survives. Record any softlock, invisible actor, bad collision,
dialogue repeat, input loss, or console exception.

## Evidence bundle required for acceptance

Create an evidence folder named with the exact 40-character PR head SHA, containing:
- `environment.txt`: OS, browser name/version, Node/npm versions;
- `source.txt`: PR number, exact head SHA, base SHA, checkout status;
- `npm-check.log` and explicit skipped-test count;
- `release-build.log`, generated HTML SHA-256 and byte size;
- unedited browser screenshots for every checkpoint above;
- `save-continue.txt`: save location, reload procedure, before/after state and result;
- `defects.txt`: reproduction steps for every failure, or explicitly `none observed`.

Acceptance remains **NOT PASSED** until the evidence is tied to one exact SHA and the
actual browser route plus Save/Continue are completed. A Node/DOM/Canvas mock pass,
an offline file inventory, or the existence of screenshots from another SHA is not
a substitute.
