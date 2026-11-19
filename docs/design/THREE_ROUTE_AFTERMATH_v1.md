# Three-route companion aftermath — v1 candidate

PR branch: `feature/three-route-aftermath-20261011`. Builds on PR #57.

- After the Kingdom or Empire confrontation, or at Ash Crown's provisional endpoint, play `companionAftermath(route)` before the previous scaffold ending.
- All six decisions have distinct three-hero follow-up dialogue: Kingdom evacuation / orders, Empire protect prisoners / halt advance, Ash Crown release companions / demand allegiance.
- The event `route.aftermath.<route>` is marked seen in existing `events.choices` after dialogue completion. A journal note is recorded. Repeated triggers bypass the scene.
- An unresolved route choice produces an explicit neutral message rather than pretending any choice was made.
- No character is silently removed from `state.party`; actual party schisms, combat roster changes and companion departures require a separately designed and playtested gameplay gate.
- Ending screens remain **placeholder story skeletons**. This change does not imply two nations have been conquered in playable content.

Validation pending: run npm test, JS module parsing, real browser end-to-end finalfield/imperialcamp/royalcamp and Ash Crown path, keyboard choices, Save/Load, actual dialogue timing and visual screenshots. Do not merge this Draft before acceptance.
