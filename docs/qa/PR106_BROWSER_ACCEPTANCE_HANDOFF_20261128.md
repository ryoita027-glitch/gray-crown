# PR #106 browser acceptance handoff (2026-11-28)

## Scope and truth boundary

This is a QA handoff only. It does not change game code, assets, save data, story canon, PR #106, or main.

- Current PR #106 head observed on 2026-11-28: `a25d466e470e2f9067701227f44ea224a70b10f9`
- Current PR #106 base/main observed: `d689aabb5146c9f45466a4f74f397e664c08fb4f`
- Existing standalone artifact commit: `47ae2f670e22b2a68882850e48805749d6c383a2`
- Existing artifact: `dist/Graygrow_PR106_20261108_Offline.html`
- The artifact was reported as built from source test SHA `034fa16de883f8567cb060b459800e499abbd34b`, not the current PR head above. It is a historical build and must not be presented as browser acceptance of current PR #106. Test it as a diagnostic first; then rebuild a standalone from exact current head `a25d466...` before final acceptance.
- PR #106 is still open and draft. Do not merge it or alter main.

## A. Retrieve and verify the historical artifact

Run in PowerShell on the Windows machine that has Chrome/Edge installed:

```powershell
$ErrorActionPreference = 'Stop'
$url = 'https://raw.githubusercontent.com/ryoita027-glitch/gray-crown/47ae2f670e22b2a68882850e48805749d6c383a2/dist/Graygrow_PR106_20261108_Offline.html'
$out = Join-Path $PWD 'Graygrow_PR106_20261108_Offline.html'
Invoke-WebRequest -Uri $url -OutFile $out
$bytes = [System.IO.File]::ReadAllBytes($out)
$prefix = [System.Text.Encoding]::ASCII.GetBytes(('blob {0}' -f $bytes.Length) + [char]0)
$sha1 = [System.Security.Cryptography.SHA1]::Create()
$blobHash = ([Convert]::ToHexString($sha1.ComputeHash($prefix + $bytes))).ToLowerInvariant()
"Bytes: $($bytes.Length)"
"Git blob SHA-1: $blobHash"
if ($blobHash -ne 'b4e9b3d6ec4bbe95308ba5708c5abdb35638f51f') { throw 'Artifact blob SHA mismatch; do not test this file.' }
Start-Process msedge.exe -ArgumentList @('--new-window', ('file:///' + ($out -replace '\\','/')))
```

If Edge is unavailable, replace msedge.exe with the installed chrome.exe. Do not disable browser security globally.

## B. Required real-browser checks

Use the browser UI (not a DOM mock, Node-only test, offline Canvas mock, or static screenshot generator). Record pass/fail and a screenshot for each checkpoint.

1. Launch: page renders without blank screen, uncaught error overlay, broken image, or missing stylesheet.
2. New Game: start a fresh game; confirm opening UI and party appear.
3. Field input: move Karen in all four directions; confirm movement is responsive, grid/collision is sensible, sprites remain grounded and do not float or squash.
4. Village: walk from the starting point to the road exit; interact with at least one NPC/object and confirm dialogue opens/closes and does not repeat incorrectly after leaving/re-entering.
5. Road/fort: reach the old fort by ordinary movement. At the iron gate, prove it cannot be bypassed before the required levers; activate both levers, pass the opened gate, fight the boss, and verify the north exit is only traversable after boss defeat.
6. Battle: trigger a real encounter; select an action, observe enemy/party response, finish or safely escape the encounter. Confirm no stuck input, duplicate reward, or broken battle UI.
7. Save/Continue: save at a stable field location; record the visible save confirmation. Reload the page, use Continue, and verify map, position, party, inventory/resources, flags and completed events restore correctly. Repeat once after a map transition if possible.
8. Screenshot evidence: save raw browser screenshots (not recreated render frames) for title/start, village field, dialogue, fort gate before/after, battle, and post-Continue. Include the address bar or a visible evidence note with the tested artifact filename and SHA.
9. Console: capture console errors and failed network/file requests. An offline single-file build should make no external asset requests.

A run is not accepted if any checkpoint is skipped. A test failure is not fixed by editing the artifact in place; report the defect against the tested SHA and make a separate source change only after reproducing it.

## C. Current-head acceptance (mandatory after historical diagnostic)

The current PR head is `a25d466e470e2f9067701227f44ea224a70b10f9`. Obtain that exact commit in a clean worktree, verify HEAD equals the SHA, run:

```powershell
npm ci
npm run check
```

Do not treat skipped browser tests as PASS. The current package script defines check as syntax + all Node tests + three browser suites. Capture the full output and confirm no skipped browser suite is being counted as a pass.

Rebuild the single-file offline artifact from this exact source SHA using the repository's existing packaging/build procedure. Preserve all original PNGs and verify the embedded asset count/hash manifest. Do not substitute generated or lower-quality artwork. Repeat section B against the rebuilt current-head artifact.

## D. Evidence bundle to return

Return:
- exact source SHA and standalone artifact Git blob SHA / byte count;
- complete npm run check result, including skipped count;
- screenshots listed in section B;
- browser/version/OS;
- console errors and failed requests;
- explicit results for movement, gate states, combat, Save/Continue;
- any reproduction steps and remaining defects.

Verdict must be one of:
- `PASS — current PR head` only if all checks above pass on the standalone rebuilt from `a25d466...`;
- `FAIL` with reproducible defect;
- `BLOCKED` with the exact environment error and evidence.

A successful launch of the 2026-11-08 artifact alone is diagnostic only, not acceptance of current PR #106.