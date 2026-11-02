# Margaret V14A / V15 — native44 and actual-field preview gate (2026-11-02)

**ART HOLD / NOT ACCEPTED.** This branch is based on Draft #276 HEAD `0ce08d617620c85ac11bd5dd268cdb9afdb0ccd4`. It does not change `main`, frozen Draft #98 (`075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`), approved PNGs, buildings, story, balance, save v23, or the default renderer.

## Why this run differs from V8–V15

Repeated tiny head/robe trims were saved as separate PNG candidates, but none has been verified inside the real game. Producing another small cosmetic version without a live baseline would not establish player-visible improvement. This run instead **connects existing V14A/V15 assets to a reversible live renderer switch** and adds two visual review paths. It is not a claim that V15 is better.

## Actual source changes

- `js/render/world.js`: `?heroIdleArt=9` loads Margaret V14A; `?heroIdleArt=10` loads V15. Both only use the 4×4 authored idle atlas when the character is stationary, with the established 44px display size and shoe anchor. Other heroes keep their original idle sources. Moving Margaret continues to use her existing 6-frame walk atlas. Default URL, older modes 1–8, asset fallback, and approved PNG files are unchanged.
- `tools/art/margaret_v14_v15_native44_review.html`: 4-direction × 8-column native-44 comparison of Karen, Triton, Sophie, Margaret original, V14A, V15, V5 mayor and V5 messenger. Shared grass/stone/gray background, contact/nominal footline and idle-frame controls. **Static sprite review, not a live game screenshot.**
- `tests/browser_margaret_v14_v15_live_ab_e2e.py`: uses the existing real `GC.Render.World.drawScene()` capture gate, with four columns: untouched live walk frame, authored idle original, V14A, V15. Desktop 1365×900 and phone 390×844, four directions, same Ryune village state (9,8), frozen time, camera/follower-state equality, 44px, actual Margaret draw-call checks, Git blob locks and local RGB difference bounds. On a successful **future** run it writes 32 real-canvas PNGs, 8 full-scene boards, 8 enlarged detail boards and SHA manifest. V14A↔V15 is same-pose A/B; live walk↔idle is diagnostic only.
- `tests/margaret_v14_v15_live_preview.test.js`: verifies off-by-default mode, source URLs, legacy V8 compatibility and RGBA atlas dimensions.

## Visual observation and status

The actual V14A and V15 192×192 RGBA atlases and V5 featured-resident atlas were inspected. V15 slightly reorganizes the central robe and hair overlap but retains the oversized silver-hair mass and a chibi-like head-to-torso proportion compared with the adult V5 NPC language. This is **not** a verified improvement at native44 in a complete village view. Neither V14A nor V15 is approved; no V16 replacement is invented to mask the missing evidence.

## Verification

- Completed: reviewed latest PR #98 and art Drafts #99–#105 and #276; inspected real V14A/V15 and V5 atlas bytes; full `world.js` JavaScript syntax parse; isolated actual-source V8 checks for default, modes 8/9/10, unknown mode and query suffix; HTML inline JS syntax parse; GitHub commits for review tool and tests.
- **NOT RUN:** native Node regression, full `npm run check`, actual Gray Crown Chromium capture, 44px in-scene human visual review, walk/talk/battle continuity, full playthrough. A complete private GitHub checkout is unavailable from the local container: `git ls-remote` fails `Could not resolve host: github.com`. The browser script is not evidence that screenshots exist.
- No paid GitHub Actions or API used. No merges performed.

## Next required acceptance step

In a full checkout on this exact branch, run:

```bash
node --test tests/margaret_v14_v15_live_preview.test.js
python tests/browser_margaret_v14_v15_live_ab_e2e.py
npm run check
```

Open `tools/art/margaret_v14_v15_native44_review.html` through the local repo HTTP server, and inspect the generated real-scene boards at 100% next to the V5 NPCs. Reject V15 if the dark robe, large hair/head, foot contact, or field scale reads worse. Only after a genuine visual verdict should a coherent head–neck–shoulder–torso redesign be attempted. Building/tile work remains deferred until cast art is consistent.
