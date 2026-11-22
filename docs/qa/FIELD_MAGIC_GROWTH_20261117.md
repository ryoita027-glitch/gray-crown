# Field recovery and post-battle growth — 2026-11-17

Base: fc8e966c97e9cd41ea34999f0739688d4520111f, existing draft PR #106.

## Player changes
- 道具・準備 now switches between items and ソフィの魔法. 治癒 chooses a recipient; 祈り previews each living companion and the total. Costs and powers come from existing battle skill definitions. No spend for full/downed/absent targets, missing/downed Sophie, insufficient MP, dialogue/cutscene/title or active combat. A stale detached cast button cannot cast twice.
- Notebook shows the latest win's actual gold, EXP per member, drop, rounds, guarded interceptions and interrupted enemy actions, plus each member's level progress at victory. This detailed snapshot is session-only and explicitly labelled; loading/new game invalidates it. Scripted victory summaries persist as ordinary escaped journal strings in schema 23. Random encounter reports do not flood the journal.
- Status menu shows next-level EXP and progress within the current level, correctly using cumulative thresholds; maximum level has a capped meter.
- Victory overlay includes the actual drop and points to the notebook. Scripted-result dwell increases from 860 to 1500ms; random encounters keep 340ms.
- Guard and rally are temporary encounter effects: cleared on victory/new battle and when loading old field saves. HP/MP are not refilled and downed allies are not revived. Duplicate battleWin calls after victory cannot award rewards twice.

## Verification
- 405/405 Node tests passed, no skipped tests. Eight new cases cover healing cost/caps, prayer, blocked casts, save migration, growth boundaries, actual drops, journal/session report separation and combat-effect cleanup.
- Source HTML (42 scripts) and standalone (43 including asset shim) DOM integration passed: real field spell buttons, target preview, stale click, focus fallback, prayer cost, disabled MP shortage, recovery-mode switching, growth and notebook report. Also retains previous field/battle recovery and defensive-display checks. Canvas mocked; no screenshot or browser-visual acceptance claim.
- Hygiene, project authority, Python and JavaScript syntax passed.
- Six Python release integrity/rights tests and ZIP/standalone builds passed: 43 embedded assets and 42 game scripts.
- Normal browser suite launch retried after workspace refresh. Chromium still aborts at socket() Operation not permitted. Full browser acceptance is blocked, not passed.

Character sprites, narrative canon, EXP/reward values and save schema 23 are unchanged. Field magic is a new resource-management option and needs human difficulty/play-feel review. Desktop/mobile layout, sound, New Game-to-capital playthrough and real-browser Save/Continue remain unverified. This is a development candidate, not commercial release acceptance.
