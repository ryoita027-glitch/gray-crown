# Gray Crown: player release packaging (non-destructive)

## Purpose
The repository is the complete development tree. Players should receive a small, clearly named ZIP instead of `docs/`, `tests/`, `tools/`, and old audit reports mixed into the playable game.

## Current work
This document accompanies draft PR #69, based on the visual recovery branch PR #68. **It is NOT proof that all newer local/offline builds (including later hero/NPC art revisions) have been imported into GitHub.** Do not treat a release from this branch as newer than an unimported version.

## Builds
1. `npm run verify:release`: confirm that ZIP files reproduce source game bytes, referenced scripts and styles exist, and standalone HTML embeds every source script and asset without changing its bytes.
2. `npm run build:play`: create `dist/GrayCrown_Play.zip`. Extract ZIP; inside `GrayCrown/`, open `GrayCrown_起動.html`. Leave the `css/`, `js/`, and `assets/` directories next to it.
3. `npm run build:single`: create `dist/GrayCrown_起動.html` as an **experimental** portable one-file edition. Its asset path shim and local save behavior need actual browser QA before replacing the normal ZIP.
4. `npm run release:checked`: perform (1) through (3).

## Source and regression rules
- Do not rename, remove, recolor, optimize or recompress any runtime artwork as part of release packaging.
- Do not alter battle, movement, NPC animation, story, input, sound, or save/load game source as part of packaging.
- Normal ZIP is authoritative until both releases have been tested visually and functionally in a current Chromium/Edge browser at desktop and mobile viewport sizes.
- On any output ZIP, compare each entry's bytes against the corresponding source file. A build that drops a script, style or sprite is a failed build.
- No deletions of source-only files: release builders *exclude* development materials from `dist/` and leave the repository untouched.
- Keep original archives and tagged release evidence until the newer source branch is reconciled; do not force-merge or automatically move `main`.
- Protect existing browser save data by keeping a full backup of the prior release. `file://` localStorage rules may vary by path/browser; never promise automatic transfer of prior saves.

## Acceptance remaining
Run a real Chrome/Edge launch, new game, sprite/NPC/render visual check, combat, save/load, title re-entry, then compare normal ZIP and standalone 1-file. If QA cannot run (including CI runner provisioning or browser policy), keep the PR **draft**, don't call the release commercially approved.

**This PR is about organization and portability, not a game-art quality approval.**


## 2026-10-14 commercial readiness extension — player save portability

The source `js/core/save.js` now exposes **portable JSON export/import** in the normal player adventure menu. This matters because the ZIP and single-file HTML use different `file://` paths/origins; moving the game files does **not** guarantee that browser-local `localStorage` follows. Players can explicitly export a `GrayCrown_Save_v23_YYYY-MM-DD.json` file and import that file into another distribution on their own PC.

- Export performs an ordinary allowed manual save before downloading; no export while the game is input-locked, in a cutscene or in battle.
- Import asks for confirmation; accepts recognized past schema versions through the existing migration routine and maintains the existing save as a backup before writing a normalized v23 save. Malformed JSON, unrecognized characters, unknown maps, unrecognized future schemas and files over 2 MB are rejected. Existing serialized game state is not changed by a rejected import.
- The menu's preexisting Save / Load / Restart remain. The distinction between *browser-local auto saves* and *user-owned exported JSON backups* should appear in any published player guide.
- `npm run release:browser-e2e`: build and open the extracted ZIP and the experimental one-file HTML in real Chromium using `file://`, check four PNG sheet loads, normal game input, Save/Continue and actual user-UI ZIP→single-file portable save transfer. Capture genuine desktop + 390px mobile screenshots and logs.
- `npm run release:technical-candidate`: run full existing quality checks, packaging byte/asset verification, ZIP+single-file Chromium acceptance and three-route acceptance.
- These commands were added as QA definitions, **not yet executed and not accepted at the current Draft head**. Shipping the single HTML as authoritative remains blocked until same-HEAD testing is documented. Neither technical acceptance nor this portability fix proves the 8–12-hour RPG is content complete.

See `docs/audit/COMMERCIAL_READINESS_GATE_20261014.md` for the blocking S0/S1 issues and commercial content review checklist.
