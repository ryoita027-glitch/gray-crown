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
