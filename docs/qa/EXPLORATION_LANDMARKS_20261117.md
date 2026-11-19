# Optional exploration landmarks — 2026-11-17

Base: 0c2faece2d9adf23f2b0cf635653e834b1f47903, PR #106.

## Player changes
23 optional clues across village, fields, brook, road, fort, ash road and frontier now have authored geographic hints tied to actual map objects or NPCs. The notebook can pin one unfinished clue, show its direction relative to the current tile in the field HUD, reopen the notebook from that marker and clear it. Adjacent targets tell the player to face and inspect. Direction is a bearing, not a computed safe path; the menu explains this. The village orphanage marker points to its entrance; the hint explicitly tells players to talk to Marta inside.

Pins are transient and clear on map changes, completion or loaded-party replacement. They do not alter save schema, world/event flags, rewards or movement. Unknown, completed or unavailable clues cannot be pinned. Boru's follow-up appears only after an authentic observation. Missed wolf scouting is removed after the wolf battle; completed scouting stays recorded. The field HUD EXP bar now uses current-level cumulative-threshold progress, matching the status menu.

## Evidence
- 411 Node tests passed; zero failures/skips. Six new tests verify all 23 landmark targets exist, directions/proximity, unchanged serialization, eligibility, lifecycle, scouting availability and HUD EXP consistency.
- Real DOM listener tests passed on source HTML (42 scripts) and standalone HTML (43 including asset shim): pin, focus, field bearing, reopen, clear, and unchanged save. Prior combat, magic, notebook and recovery checks also pass. Canvas is mocked: not browser visual acceptance.
- Hygiene, project authority, JS syntax and six Python release integrity/rights tests passed. ZIP and standalone generated with 43 assets and 42 game scripts.
- Browser launch remains blocked by the previously verified socket permission restriction. No actual pixels, audio, mobile layout or full browser playthrough/Save-Continue acceptance is claimed.

Art, story canon, reward values, combat rules and schema 23 unchanged. This is the existing draft candidate, not production release acceptance.
