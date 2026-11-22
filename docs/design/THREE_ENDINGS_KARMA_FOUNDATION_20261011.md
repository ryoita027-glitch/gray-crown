# Gray Crown — Gray Crown / 灰冠 three-route prototype

This is a narrative/system **candidate**, not a completed third ending or canon lock.

## Routes
- **Kingdom**: the four protagonists protect their home and people while opposing imperial escalation; the crown denotes responsibility.
- **Empire**: the party rejects kingdom invasion and sides with the emperor to end the hero exploitation; the crown denotes rejection of inherited allegiance.
- **Ash Crown (灰冠 / empty throne)**: a dark divergence after knowingly killing a disarmed human. Karen claims the right to rule beyond both flags and eventually sits alone in an emptied palace. The crown promises unity but yields no citizens, love, or legitimacy. This is a tragic critique of ruling by force, not a rewarded true ending.

## Karma implementation so far
- `recordGrayCrownMoralChoice(id,'kill'|'spare')` uses the already saved `events.choices` map. Repeating cannot farm karma.
- `grayCrownMorality()` counts deliberate lethal event decisions, never normal battle defeats. Wild creatures, human enemy HP=0, random encounters, and combat victories do not automatically count as murders.
- After defeating `roadBandit` (not surrender), an **explicit** mercy-or-kill choice occurs. The protagonists voice moral consequences.
- Ash Crown is an **optional** final-path choice shown only when at least one deliberate lethal choice exists; an unlocked route is not an automatic moral judgment or forced game-over.
- A provisional on-screen Ash Crown ending displays the empty throne and prominently identifies itself as incomplete.

## Incomplete/quality gaps
The Ash Crown arc does **not** yet show overthrowing both institutions, prolonged party disintegration, conquest gameplay, or consequence sequences; the existing global skeleton itself already says the late chapters are unfinished. One irreversible lethal choice opening the branch is a testing threshold only: a release version should require coherent accumulated story acts and explicit informed commitment, not a simplistic score threshold. No new copyrighted music or painted art in this commit.

Acceptance requires Node tests, Save / Load persistence, Chromium route playthrough, keyboard/mouse choice verification, all ending guards, player feedback, and full narrator/portrait visual QA. This document does not assert any of those checks have passed.
