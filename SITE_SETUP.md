# Gray Crown — Player Outcome Observatory

This static site is deployed from the dedicated `gh-pages` branch; it is **not** the production game `main` branch.

## Activate GitHub Pages (owner action)

Repository → Settings → Pages → Build and deployment: Deploy from a branch → Branch `gh-pages`, folder `/(root)` → Save.

Expected URL after a successful deployment: `https://ryoita027-glitch.github.io/gray-crown/` (verify it opens before treating it as published).

## Data & review policy

- The site records integrated `main` achievements, first-play evidence, actual screen comparisons, and unresolved work. Draft PR #106 is **not** counted as production.
- The base reference is `main` commit `d689aabb5146c9f45466a4f74f397e664c08fb4f`, Gray Crown v23, schema 23, story states 00–19.
- The active hero sprite is provisional 32×32. 48×48 source → 44px display remains experimental, not production.
- Changes in `main` do not automatically count as verified player-quality achievements.
- Records and attached images are stored in each browser's local storage. **Export JSON regularly.** There is no cross-device synchronization or backend.
- To update the site source, edit `gh-pages/index.html` on this branch only. Never replace `main/index.html` with this dashboard.

Created 2026-11-17.
