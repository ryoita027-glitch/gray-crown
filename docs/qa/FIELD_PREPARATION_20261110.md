# Field preparation and exploration notebook — 2026-11-10

Base: c728c0180a9a4e47ff93c953464a4a0cd45015be (integrated candidate PR #106).

Players previously found medicine and were told to prepare before the fort boss, but the field menu only listed stock. Walking up to the boss also omitted the consultation available via interaction. This change makes those existing resources usable before battle and unifies the encounter prompt.

## Player changes

- A visible **道具・手帳** button and M open three tabs: targeted field recovery, exploration notebook, and status/save tools.
- Select an item and a companion; see current HP/MP and the actual capped recovery before spending it. Herb heals 22 HP, mana herb 14 MP, food 12 HP / 6 MP, matching existing battle effects. Full, downed, absent and departed targets do not consume items. This does not add revival or free supplies.
- Inventory and health changes serialize under existing Save schema 23. Archived saves, quarantined saves, export/import and restart remain in the save tab.
- Notebook exposes the existing optional discovery records on touch devices and recalls the studied fort shield tactic. It does not grant discoveries or advance story.
- Both walking up and interacting with the fort boss offer fight, consultation, field preparation and retreat. Low-MP advice respects exhausted rest supplies.
- Full parties no longer waste the fort's limited rest. A stale rest action cannot spend it twice.
- The modal blocks movement/interaction including touch buttons, traps keyboard focus, and restores canvas focus on close.
- Approved art files and Story 00–19 data were not changed. No main merge.

## Verification

- Related Node tests: **45/45 passed** (field preparation, fort feedback, stability, player-save safety).
- DOM integration: **passed**, using shipped index.html and all **42** scripts. Actual DOM button listeners tested: item/target selection, counts, caps, feedback, all three tabs, focus, touch movement lock, boss approach→menu and notebook escaping. Canvas drawing is stubbed; this is not browser visual acceptance.
- Standalone distribution DOM integration: **passed** on the actual generated HTML (42 game scripts plus the asset shim). The same button scenarios pass.
- Full `npm run check`: hygiene, authority, Python syntax and JS syntax passed; Node **355/383 passed, 28 failed**. The failed-test identities match all 28 failures on the base revision; zero new failures. Browser stage was not reached.
- `npm run release:checked`: passed, six release integrity/rights tests; distributable ZIP and standalone HTML built with 43 assets and 42 scripts.
- Local Chromium still fails at `socket() failed: Operation not permitted`; cloud browser refused file protocol. No browser screenshot, CSS/mobile visual PASS, audio PASS or New Game→capital acceptance is claimed.

DOM reproduction (optional development dependency, not used by the offline game): Node 24.15+ (tested 24.22.1), `npm install --no-save --package-lock=false jsdom@31.0.0`, then `node tests/dom_field_preparation.cjs`.

## Remaining gate

Run real desktop/mobile browser acceptance on this exact commit. Review the 28 inherited regression failures individually. Do not mark the integrated candidate production-ready until those gates pass.
