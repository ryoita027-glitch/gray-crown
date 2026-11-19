# Gray Crown — Vertical Slice Production Plan v1
**Project:** browser-based Gray Crown, HTML/CSS/JS. **Development authority:** accepted Pixel-native integrated candidate. Production `main` still v23; Save schema 23; Story 00–19 preserved.

## Slice boundary
Reference slice to polish end-to-end: **Ryune Village → Kingdom Road → first dungeon (old fort ruins) → first boss → save/Continue/recovery.** This is an acceptance-quality section, **not** a claim that the eventual 8–12-hour game is complete.

## Delivery stages and release gates
| Stage | Implementation scope | Objective acceptance |
|---|---|---|
| V0 Integrated foundation | PR #35/#36/#37/#38 resolution, source hashes, CI | All full regression, original browser E2E, 2-cell reversal, main-v23 save and Ryune E2E green **at same merge HEAD** |
| V1 Ryune playable onboarding | all four actors and dialogue, appointment, house entrances, NPC/object readability | Keyboard + mobile touch paths; no stuck events; no missing assets; screenshots |
| V2 Road traversal | field visuals, hazards, wolf encounter, party occupancy | correct walkability, combat victory/loss, enemy flags, road-save reload |
| V3 First dungeon | interiors, scenery/objects, treasure, encounters, return path | normal chest interaction & save/reload, no spoilers from silent state injection |
| V4 Boss and recovery | boss phase readability, party commands, win/loss, follow-on event | honest non-dev-mode battle E2E, HP/MP restore, predictable level/reward flags |
| V5 Visual quality | NPC/hero texture parity, building/furniture scale, world/combat composition, mobile hierarchy | user screenshot review; no halo, UI cut-off, ambiguous orientation |
| V6 Release readiness | packaging, rollback, branch protection, scope freeze | security/privacy/performance review, no accidental `main` push, formal user merge decision |

## Acceptance rules
- Full original game regression and story 00–19 must keep working; preserve schema 23, 32px collision, existing maps and 4 protagonists' byte-locked PNGs.
- Browser checks must clearly distinguish normal gameplay from setup-assisted repro (defeat low-HP fixture, visual map teleport for screenshot). Main-v23 freshly generated save compatibility is proven; **progressed real historical saves remain a separate sample test**.
- Any new NPC art/scene changes must be assessed in actual same-camera world scenes against the four heroes. Keep Portrait ON/OFF as `UNDECIDED` until explicit user choice.
- PRs stay Draft pending technical and aesthetic review. Roll back by leaving PR unmerged or new non-force revert commits; do not rewrite source branch history.
- CI cost policy: share one Chromium installation in integrated gate, immutable source tests read-only, bounded artifact retention. Actions remaining minutes / billing setting are **UNVERIFIED**; inspect GitHub Settings → Billing and licensing → Usage and budgets (available page label may vary).

## Priorities
S1: crashes, combat/save softlocks, script progression, party hiding, incorrect map collision. S2: NPC design parity, roof/furniture depth, combat unused space, mobile button density, portrait A/B decision. S3: optional polish after the vertical slice is functional.
