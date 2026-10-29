# Margaret silver-white field palette study — 2026-10-30

**Status: DRAFT / HOLD / NO-GO. Not approved artwork.**

## Source and scope

- Based on the existing four-direction Margaret idle/walk/acting PNGs in Draft PR #117 HEAD `cf5189035bc858dad0d048c972ccc08b1deb7ab3`, a descendant of frozen PR #98.
- This is a **reversible, URL opt-in visual experiment**. It does not replace any original PNG, sprite silhouette, authored animation, map, battle art, dialogue text, save schema v23, game balance or story.
- Other characters and all NPC V5 artwork are unchanged.
- The user-defined design anchors are the **mayor and kingdom messenger V5**, not generic new AI art. The intention is to reduce Margaret's saturated lavender cast so her canon **silver-white hair** reads in the same scene as those anchors and the other three heroines.

## What actually changed

- New `js/render/margaret_silver_study.js`: deterministic per-pixel palette candidate on existing 48px sprite cells. The transform selects violet-biased **head and outer-hair** colors and moves them toward a neutral silver range with a small cool-shadow offset. It retains every alpha byte, all geometry, the original animation frames and untouched non-target colors. The original PNG files remain intact.
- `?gcMargaretSilver=1` enables the candidate for Margaret in **normal field walking** and the **animation engine's acting poses**. No URL parameter = original look. Invalid image dimensions, unavailable Canvas or readback failure = original image.
- `tools/margaret_silver_study_review.html`: compare original vs candidate, Karen/Triton/Sophie and the V5 mayor/messenger on a shared background and footline. All use 44px at 1×; choose four directions and two environment colors. The page reports color-changed and alpha-changed pixels for each direction and can export an A/B image.

## How to review

1. Open `tools/margaret_silver_study_review.html` from this branch. Start at **1×**. Check all four directions on grass and stone; only then inspect 4× pixel detail.
2. Open `index.html?gcMargaretSilver=1` from this branch and compare to `index.html` in the same village/camera/zoom. Watch Margaret move and during a conversation.
3. Reject if silver turns flat grey, lavender on her outfit is accidentally erased, she still looks out of scale, or she becomes less distinctive than the other heroines. This experiment **does not** solve the separate head-compression, pose or grounding questions.

## Verification / unresolved

- Node syntax and synthetic-pixel invariants can be checked without a browser. A repository regression test guards opt-in behavior, alpha preservation, untouched skin/central garment and script order.
- **Not yet verified:** a real Chromium screenshot of the full game using the actual PNG assets; human visual A/B acceptance; full integrated Node/browser suite; all 8–12h routes. No technical check is a substitute for judging the game image.
- Candidate is not merged or adopted. Frozen PR #98, main and prior art PRs remain untouched.

## Next art action

Judge the actual 44px A/B beside the V5 mayor and messenger. If the candidate is visibly better, adjust only the problematic colors; otherwise revert/abandon the experiment. Resume hand-authored face/silhouette improvements for all four protagonists before any environment/building redesign.
