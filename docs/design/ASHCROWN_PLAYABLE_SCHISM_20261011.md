# Gray Crown — Playable Ash Crown party schism (Draft)

## Implemented
- **Narrative choice → active gameplay roster:** The previously authored Ash Crown companion outcome controls participation. 'release' retains Karen + Triton; 'demand' leaves Karen alone. Kingdom and Empire remain four-person squads.
- **No destructive party mutation:** All four original `state.party` characters, levels, equipment and stats remain in the schema-23 save. `activeRouteParty()` filters display/action membership. Older saved `route.companions.ashcrown` choices work without any new flag.
- **Overworld:** Departed heroes no longer follow Karen. The party HUD marks their status as '別行動'.
- **Combat:** Active members alone take turns, intercept, receive healing/buffs and rewards, appear in battle sprites/cards, are targeted by enemies and determine the defeat condition. Other heroes keep their statistics unchanged.
- **Playable checkpoint encounter:** After the Ash Crown decision, a kingdom frontier guard bars the route. A small route-only human encounter (`ashcrownCheckpoint`) must be resolved before reaching the already-marked provisional epilogue. The guard can surrender via morale; HP=0 is not counted as an intentional murder.
- **Safe retries:** Defeat uses the existing retry path; the checkpoint-clear flag is set only by actual victory/surrender. Historic companion decisions remain intact. Return south to an older four-person scene is blocked after the break, preserving continuity.

## Scope, exclusions, risks
This is *not* the full destruction of both countries or a complete empty-throne ending. No new illustrated assets or recorded BGM are included. An enemy incapacitation remains morally distinct from an explicit lethal action. Only the Ash Crown branch gets this combat composition change; Kingdom and Empire retain the approved four-player rules.

For acceptance, verify with `npm test`, `npm run check` or the local quality runner; play both Ash Crown choices (2-member / solo) in Chromium; verify surrender and loss retries, dialogue timing, HUD and follower sprites, save/reload with a pre-existing PR#58 save, accessibility (keyboard choices), performance, and no regressions in normal four-hero battles. No end-to-end browser gameplay is certified in this chat.
