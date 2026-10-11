# Gray Crown — 2026-10-11 recovery baseline

## Recovery decision

Use this branch for the next playable build; DO NOT substitute the old `main` baseline or the previously supplied cleanup ZIP.

This branch starts from `chore/clean-player-distribution-20261011`, which includes the cumulative `fix/battle-visible-world-motion-authored-art-20261011` improvements beyond `feature/opening-environment-worldlife-20261011`.

### Improvements retained (as present in source)

- World movement: sequential path-following, turn interpolation, updated animation.
- Battle: actual per-hero visible image elements with image-load fallback instead of opaque CSS URL-only frames.
- Villagers: named, distinct run-time 32px atlases for early-area NPCs (prototype art, not approved premium PNG).
- Buildings: four distinct run-time house tiles.
- Opening ambient world-life and animation.
- Clean distribution generator: `python tools/build_player_release.py`.

### Additional recovery updates

- Node harness can handle indefinitely recurring ambient animation without falsely expecting the RAF queue to empty.
- Two stale assertions updated to match already implemented dialogue and companion-route behavior.

### Verification / limitations

The user's uploaded old ZIP, which corresponds to the earlier `feature/opening-environment-worldlife-20261011` branch for sampled runtime files, was inspected and unit tested locally. It failed 13/180 originally and passed 180/180 after three test-harness/assertion updates.

**These 180 passing tests are NOT a test result for this newer GitHub recovery branch.** It contains later code changes and must be checked separately. The full Playwright browser check has not been performed in this session. No claim of commercial-quality art approval is made.

Before promotion: run `npm test`, `npm run visual-playability-acceptance`, visually inspect walking and four battle heroes in Chrome, confirm NPC/house appearance at normal game scale, and confirm save/load.

Keep `main` and the original ZIP unchanged until the recovered build is visibly approved.
