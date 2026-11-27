# PR #106 Offline HTML — Browser Acceptance Handoff (2026-11-27)

## Scope and truth boundary

- Delivery commit: `47ae2f670e22b2a68882850e48805749d6c383a2`
- Artifact: `dist/Graygrow_PR106_20261108_Offline.html`
- Source PR #106 current head observed on 2026-11-27: `a25d466e470e2f9067701227f44ea224a70b10f9` (draft, base `main`).
- PR #106's current head is newer than the source SHA named in the November 8 artifact. Therefore this artifact is a historical, fixed build, not proof of the current PR head.
- Connector retrieval returned the Git blob (1,587,745 characters) but its file-fetch endpoint returned empty content; this runtime has no connected graphical browser/Playwright/desktop execution tool. No browser launch, input, battle, save/load, or screenshot is claimed in this handoff.

## Run the exact artifact on Windows / Google Antigravity

1. Open the delivery commit URL and download the file itself (use **Raw**):  
   https://github.com/ryoita027-glitch/gray-crown/blob/47ae2f670e22b2a68882850e48805749d6c383a2/dist/Graygrow_PR106_20261108_Offline.html
2. Save as `Graygrow_PR106_20261108_Offline.html` in a new empty folder. Do not edit or re-save it.
3. In PowerShell, run:
   ```powershell
   Get-FileHash .\Graygrow_PR106_20261108_Offline.html -Algorithm SHA256
   Start-Process (Resolve-Path .\Graygrow_PR106_20261108_Offline.html).Path
   ```
   Open with current Chrome or Edge. This is a local-file test; do not serve a different checkout or silently substitute another build.
4. In Antigravity, open the downloaded HTML in its browser-capable environment. Keep the downloaded file unchanged. If its browser sandbox cannot access local files, use Chrome/Edge on the same Windows machine; do not upload the HTML to a public hosting service.
5. Open DevTools Console before playing. Preserve the console log. Record browser name/version and OS. Any uncaught exception, failed embedded image, blank canvas, or blocked local storage is a failure to investigate, not a pass.

## Required acceptance route

Capture a screenshot at each checkpoint, with the browser address bar or DevTools showing the local artifact context where practical:

1. Initial title/start screen and first playable field.
2. Move using keyboard and/or controller; verify player responds, animation is grounded, collision prevents walking through walls, and camera follows.
3. Follow the intended route from Ryune village through the road to the old fort. Verify the iron gate cannot be bypassed and its approach is reachable.
4. Interact with both levers separately. Before both are activated, verify the north side remains blocked; after both, verify the gate opens.
5. Trigger and complete a battle. Verify turn input, enemy/player actions, victory, rewards and return to field. Record any softlock or duplicate reward.
6. Reach the post-boss north exit and verify transition toward the next area/royal city.
7. Save at a safe field location. Reload the page, choose Continue/load, and verify location, party, inventory, flags, gate/boss state and progress are preserved. Repeat once after a second save if the first succeeds.
8. Revisit the gate and relevant NPCs to check that event state does not replay incorrectly.

Do not skip directly to the boss or manipulate localStorage unless recording a separate diagnostic run. A manually edited save is not a valid acceptance test.

## Evidence package

Save these together in a folder named `PR106-browser-evidence`:
- `01-title.png` through `08-save-reload.png` (actual screenshots, not mockups)
- `console.log` (all warnings/errors, with timestamps)
- `environment.txt` (browser/version, Windows version, controller/keyboard)
- `route-notes.txt` (exact inputs, checkpoints, expected vs actual)
- `save-before.json` and `save-after.json` only if the game exposes an exportable save; redact no gameplay fields, but do not include account/personal data.

Acceptance is **not passed** until the same unchanged HTML file has completed the route, battle, save and reload, and the evidence files exist. A successful page load alone is only a launch check.

## Source-side checks (separate from offline browser acceptance)

The current PR #106 head observed during this run is `a25d466e470e2f9067701227f44ea224a70b10f9`. On a clean checkout of that exact SHA, run:

```powershell
npm ci
node --test tests/cave_gate_chokepoint.test.js
npm run check
```

Record the exact SHA and complete output. Do not treat the historical offline HTML as the current PR head. Do not merge PR #106 or change `main` based only on these checks.

## Result template

- Artifact SHA/commit:
- Browser + version:
- Launch: PASS / FAIL
- Movement + collision: PASS / FAIL
- Gate bypass blocked: PASS / FAIL
- Both levers / gate state: PASS / FAIL
- Battle + reward: PASS / FAIL
- North exit / transition: PASS / FAIL
- Save + reload state: PASS / FAIL
- Console errors:
- Screenshot folder:
- Repro steps for every failure:
- Overall: PASS only if every required checkpoint above passes; otherwise FAIL / INCOMPLETE.
