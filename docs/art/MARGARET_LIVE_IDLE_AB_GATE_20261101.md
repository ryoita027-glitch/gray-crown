# Margaret — real Ryune village idle A/B capture gate (2026-11-01 22:25 JST)

**ART HOLD / do not merge / no production asset replacement.**

## Baseline and reason

- Stacked from PR #248 exact HEAD `f2136f5926bfa59873292afa497c94558a51197d`; PR #98 remains frozen at `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`.
- The original approved Margaret idle atlas is `assets/characters/margaret/margaret_idle.png` (Git blob `910458eabfcfaef7442f885f319d0e2a09c88a66`).
- Compare the *same idle pose* against `margaret_identity_safe_hair_HOLD.png` (blob `081aa3e9c8e1bc06693dac081c7182c990942d0f`) and the already rejected front redraw `margaret_front_structural_redraw_HOLD.png` (blob `1823d20a7438f6a578da8fffd9cb207f1efff65d`).
- Existing `docs/art/GRAY_CROWN_ART_BIBLE_v2.md` remains **PROVISIONAL** and prioritizes face, individual silhouette, large color masses and adult neck/shoulder anatomy. This review updates evidence, not the style rules or character canon.
- The previous A/B evidence was static atlas composition, **not the game scene**. Comparing an original *walk* frame with a modified *idle* frame would also be invalid; this script explicitly swaps the approved original idle atlas for the original column too.

## Implemented in the isolated Draft

`tests/browser_margaret_live_idle_ab_e2e.py` seeds the real Ryune village at (9,8), keeps the 44px approved scale, and captures 4 directions at 1365×900 desktop and 390×844 phone viewport. It uses `GC.Render.World.drawScene()`, temporarily intercepts the real Margaret walk-sheet `CanvasRenderingContext2D.drawImage` calls and replaces their **stationary frame 0** source with each 192×192 idle atlas, without modifying runtime files or saved data. The interceptor counts actual Margaret draw calls and rejects unexpected non-idle frames. The script freezes time and resets the camera/follower state between variants; it checks that the same state was drawn.

If run successfully in a full checkout, it writes **24 actual game canvas PNGs, 8 three-way comparison boards, and a manifest** under `prototype_artifacts/margaret_live_idle_ab/`. It checks all three source Git blobs, image sizes, scene equality and whether the variants actually change visible pixels. The two NPCs, mayor and royal messenger, remain in the original village scene; they are not substituted or copied.

Run locally, with the repository's existing Python/Pillow/Playwright/Chromium dependencies:

```bash
python tests/browser_margaret_live_idle_ab_e2e.py
```

This is a *seeded idle field* art fixture, not a full story playthrough. It does **not** establish walk, talk, battle, or 8-action continuity. A script being present or syntax-valid is not a browser PASS.

## Visual work actually attempted in this run

The actual approved 192×192 Margaret PNG was decoded and visually compared at 6× enlargement after a **295-pixel** front-idle shoulder-plane experiment (four frames). The new dark-purple shoulder wedges obscured too much of the long pale hair, particularly on the right, and flattened the clothing/hair transition. **NO-GO: do not use.** This failed trial was deliberately not added to the branch or production sprites. Its isolated, unreferenced Git blob is `331f363b69c02ab5ef1d4536f1419b63823ad00d`; it is not an accepted asset or a PR change.

## Executed vs not executed

- Completed: GitHub baseline/PR review; actual source-PNG decode; enlarged original-vs-shoulder trial visual inspection and rejection; implementation of the real-scene A/B script; equivalent local Python syntax compilation.
- **Not completed:** running this script against the full GitHub checkout, real Chromium village screenshots, full Node/browser suite, human art acceptance. Direct `git clone` from the execution container fails DNS resolution of github.com; no paid Actions or API were triggered.
- **No change:** main, PR #98, original Margaret/V5 NPC sprites, story, balance, buildings, save schema v23 or other scheduled work.

## Next

Execute this same-source live game capture when a full checkout and Chromium are available. Inspect at 100% and 44px for face identity, long-hair silhouette, neck/shoulder continuity, NPC proportions, shadows and grounding. Only then develop a **new original-identity-preserving structural edit**; reject it if the game scene is not visibly better. Do not start building/tile restyling before the cast passes review.
