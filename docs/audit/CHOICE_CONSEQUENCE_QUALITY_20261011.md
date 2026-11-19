# Gray Crown — Choice consequence and tactical readability pass (2026-10-11)

## Implemented
- Serad graves has three mutually exclusive outcome markers in the existing world switch collection: `optionalSeradGravesCare`, `optionalSeradGravesRecord`, `optionalSeradGravesLeave`.
- Repeat inspection uses the selected action, rather than always claiming the party placed stones.
- Main Story stage remains unchanged, no rewards are invented, save schema remains 23.
- Boss phase hint suggests existing specific counters (Karen guard, Sophie healing, Margaret ice), rather than only generic danger text.
- Regression tests added for all three choices and the hint; parsing checked in connector-fetched source.

## Unverified and release hold
No end-to-end Chromium playthrough was executed for this HEAD; no actual visuals, FPS, audio listening, responsiveness or save/reload through the browser has been certified. No new composed soundtrack or background art in this pass. Run local npm test and full browser gate before merging. Do not mark the project or this PR commercially finished.
