# 2026-10-31 — Aldina fountain: two public truths, one personal conversation

## Base and safety
- Exact parent: Draft PR #168 HEAD `fc3b0aa246bbab6ab9628c57cf233f5092472673`; this PR stacks on #168 and its earlier map/story chain. Production `main` at review: `d689aabb5146c9f45466a4f74f397e664c08fb4f`. Frozen PR #98 unchanged.
- Checked current `js/data/maps.js`, `js/systems/events.js`, `js/render/world.js`, the existing ration/wagon/waystone tests and the PR #168 note. Art PRs #164/#167/#169 and save PR #166 are separate; this change touches **only** `js/systems/events.js`, a dedicated test and this note. Do not merge the stacked PR independently or overwrite other branches.
- No new map tiles, blockers, sprites, rewards, karma, mandatory fetch quest, Save v23 schema fields or future-war revelations.

## Actual optional player experience
1. At the existing fountain (12,8), the inscription remains readable. After seeing only one local detail, a brief direction points to the *other*: the victory poster (15,6) or the ration mother (16,8). Nothing forces a detour.
2. After actually reading the poster and completing the mother's first conversation, the fountain offers a **two-choice, optional** reflection: ask a nearby citizen how both realities coexist, or let the four friends compare what they saw. Each path is short, character-specific, and saved once in the existing event-choice dictionary.
3. If the player asked, the already-existing citizen (9,8) remembers the conversation. If the player observed quietly, the citizen does **not** pretend to have heard private thoughts. Revisiting the fountain does not repeat the choice or journal entry. Late-war dialogue has priority.
4. The choice is not presented as a moral score or solution to wartime shortages. The scene gives the city an ordinary civilian voice without preemptively explaining the war's later truth.

**Differentiation hypothesis:** Graygrow's four childhood friends confront conflicting public and private accounts through an optional city landmark, and a real resident responds if they engage, rather than another mandatory exposition cutscene.

## Player research checked 2026-10-31
- **Observed individual opinion, not consensus:** [Sea of Stars Steam reviews](https://steamcommunity.com/app/1244090/reviews/) currently display October 5/7 negative reviews describing weak character writing despite appealing art/exploration. The visible review excerpts omit the year; do not infer one.
- **Observed older individual discussion, not consensus:** [Sea of Stars story/character-depth discussion, April 2024](https://steamcommunity.com/app/1244090/discussions/0/4295943916784919376/) contains both criticism of dialogue and disagreement about whether the story needs more time. The split cautions against treating more dialogue as inherently better.
- **Observed older individual opinion, not consensus:** [Chained Echoes review updated January 2025](https://steamcommunity.com/id/elcidolfas/recommended/1229240/) praises emotionally resonant characters and exploration while criticizing uneven progression.
- **Inference:** a short optional exchange based on places the player already chose to inspect may feel more earned than compulsory exposition. This specific implementation has **no external human test** and no proven retention effect.
- Do not copy any source game's story, dialogue, puzzles or layouts.

## Verification / acceptance status
- Actual edited `js/systems/events.js` compiled in V8: **PASS**.
- Actual committed `capitalFountainVisit` executed in an isolated V8 mock: **9/9 checks pass** (no clues, either clue alone, both clues, two branches, revisit, late-war priority, NPC-link source check).
- Dedicated Node harness regression `tests/capital_fountain_perspective.test.js` added; syntax compiled in V8, **not run** in repository.
- **NOT RUN:** `node --test tests/capital_fountain_perspective.test.js`, `npm run check`, real Chromium 44px field traversal, Save/Continue integration, human 5–10-minute play. The private repository could not be cloned into the local container due to DNS failure. No paid APIs or GitHub Actions minutes used.
- **DRAFT / HOLD.** Do not claim a proven improvement or merge into production.

## Next exact player-first gate
Walk south gate → fountain → victory poster → ration mother → fountain → citizen → ceremony/inn in Chromium; verify the two prerequisites are naturally discoverable, the fountain isn't overlooked, the 2-choice exchange does not interrupt ceremony pacing, and Save/Continue restores each branch. If the exchange feels redundant with the existing inn conversation, shorten it rather than adding more NPCs.
