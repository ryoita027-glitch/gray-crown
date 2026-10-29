# Gray Crown — 川辺の見回り人 V5-style independent pilot (2026-10-29)

**Status: DRAFT / HOLD / NO-GO. Visual acceptance is not granted.**

## Provenance and scope
- Parent: PR #114 HEAD `e383de3fba920b70fd685e0ec1bd814000ecd614`. Frozen PR #98 HEAD `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c` and `main` are untouched.
- New NPC: `brookKeeper`, display name 「川辺の見回り人」, `ryunebrook` (18,10). The original NPC has a focused expression, short dark hair and muted blue-green clothing.
- V5 visual anchors: village mayor (atlas column 3) and kingdom messenger (column 4). **No atlas pixels were copied**.
- Field worker V1/V2 remain unmodified; the rejected Karen A/B/C candidates are not promoted.

## Actual art work
- `assets/npc/brook_keeper_style_study_48x192.png`: four separate native 48×48 RGBA directional idle frames (down/left/right/up). Hand-drawn pixel clusters: practical cap, distinct short hair, focused face, teal coat with uneven hem, rolled sleeves, asymmetric leather satchel, rescue rope and compact water-level marker. The rear view has a rope coil; left/right are not identical mirror images.
- At 44px, the new NPC has a less toy-like adult silhouette and distinct water-patrol identity compared with the existing 32px procedural fallback. **This is an art hypothesis, not a commercial-quality pass.** The face and clothing remain simpler than some V5 anchors.
- Locally measured: 48×192, 8-bit RGBA, 20 distinct RGBA colors including transparency, nonempty unique frames, row-46 feet present in all directions; PNG SHA-256 `a70d3217d0990651b6f5d38fbbf400418a83047c08e43497d0c11566f7d48e15`.

## Reversible runtime and review
- Default `index.html`: original brook watcher 32px, no candidate image load.
- `index.html?gcBrookKeeperArt=1`: candidate at 44×44 with 30px tile footline, ground shadow and correct name label above the cap; malformed or missing PNG falls back to original 32px.
- `index.html?gcFieldWorkerArt=2`: existing field worker v2, unchanged.
- `tools/brook_keeper_v5_style_review.html`: old/new brook watcher, field worker v2, V5 mayor and messenger, all four heroes at same direction, background, footline, 1×/2×/4×. Local PNG preview is **not** a screenshot of actual gameplay.
- Tests: `tests/brook_keeper_style_study.test.js` checks PNG pixels, opt-in/fallback, and reviewer references.

## Unfinished acceptance gates
1. Open actual game, travel to `ryunebrook`, capture old/new brook watcher with 44px V5 anchors and all four heroes. Check name tag, footline, contrast on water, four directions, 320–600px mobile.
2. Compare face/coat/shading at 44px, reject if the candidate reads flatter or less expressive than the V5 anchors. No user visual approval yet.
3. **Idle only.** Do not claim walking, working, speaking, or 8–12-hour commercial readiness. After visual acceptance, paint independent motion frames.
4. Run full repository Node tests and Chromium E2E on this exact SHA. GitHub Actions pre-run infrastructure failures are not gameplay failures.

No story, maps, Save v23, game balance, heroes, buildings, or normal sprites were modified. No paid services or CI minutes were purchased.
