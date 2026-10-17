# Gray Crown — player-first combat curve audit (2026-10-17)

Status: **candidate only / HOLD**. This is not evidence of browser gameplay, human fun, or a full save-to-ending playthrough.

## Why the midgame needed a small adjustment

The first scripted wolf, corrected in parent PR #87, now survives the level-1 party's opening attacks so that its announced attack toward Sophie actually happens. That must **not** create a flat curve in which every future encounter is a single-turn auto-win, nor a spike that forces grinding.

The pre-change four-person, healthy-party combat-engine trials found:
- Lv5 Vanguard: about **2.0 rounds**, about **4.5 damage** from direct attacking.
- Lv5 Zenith: about **3.0 rounds**, about **14.6 damage** from direct attacking.
- Lv1 cave boss: about **3.0 rounds** already, so do **not** inflate the cave boss.
- Old road bandit at Lv5 becomes easy; this is **intentional return-to-old-area power growth**, not a reason to scale every enemy to party level.

## Scoped changes

| Enemy | HP original → candidate | Attack original → candidate | Unchanged |
| --- | --- | --- | --- |
| Mandatory wolf (from PR #87) | 72 → 96 | 10 → 16 | 22 EXP / 22G, DEF 4 |
| Ancient fort boss | 185 → **185** | 18 → **18** | 65 EXP / 125G, phases |
| Vanguard Captain | 150 → **185** | 16 → **19** | 50 EXP / 35G, DEF 9, phases |
| Zenith | 210 → **255** | 19 → **24** | 80 EXP / 0G, DEF 11, phases |

Only Vanguard and Zenith change in **this PR**. They now forecast a **single truthful first-turn target**, Margaret and Sophie respectively, with suggested counterplay (Karen Guard, Margaret Ice, Triton Break). Their later targeting and existing enemy phase AI remain unchanged. All other enemies, skills, leveling thresholds, available items, drop rates and save schema remain unchanged.

## Engine-level paired comparison (40 seeded trials per line)

**Party level 5**, starting fully healthy, no prior exploration attrition. "Attack" is Karen Attack / Triton Heavy / Sophie Staff / Margaret Fire. "Guard" substitutes only Karen's **first** action with Guard. "Break + Ice" substitutes only Triton's and Margaret's **first** attacks with Break and Ice. All policies use their normal attacks in later rounds. The tests used real JavaScript battle logic and tactical targeting with synchronous animation/timer shims.

| Boss after changes | Strategy | Mean rounds | Mean party damage taken | Trials won |
| --- | --- | ---: | ---: | ---: |
| Vanguard | Attack | 2.95 | 22.1 | 40/40 |
| Vanguard | First-round Guard | 3.00 | 12.3 | 40/40 |
| Vanguard | Break + Ice | 2.98 | 18.4 | 40/40 |
| Zenith | Attack | 3.95 | 36.0 | 40/40 |
| Zenith | First-round Guard | 4.00 | 30.9 | 40/40 |
| Zenith | Break + Ice | 3.88 | 28.9 | 40/40 |

With level 3 (underleveled) the same 40-trial engine-only checks had **40/40 victories** for both bosses under all three strategies, but greater average damage (Vanguard Attack 28.1, Zenith Attack 47.7). With level 7 (some overlevel), Zenith's attack-only mean was 3.0 rounds and damage 18.2, which is appropriate increased power, not a forced world-wide scale-up.

**Interpretation:** no abrupt difficulty spike is evident in these synthetic fresh-party cases; defensive or weakening options create a genuine and visible benefit without doubling battle length. This does **not** establish real players' actual level at these chapters or robustness after multiple encounters.

## Long-form balancing rules / regression

1. A small enemy or return trip to an old area may become easy. Do not raise all HP in proportion to party level; earning strength should feel rewarding.
2. Each chapter boss should have an identifiable tactical choice, a brief readable tell, and a later AI turn that isn't fully predetermined.
3. A first-time, healthy party at plausible chapter level should not be forced to grind or use external walkthroughs. An overleveled party is allowed an easier victory.
4. Protect MP and healing economy: EXP threshold and drops are intentionally unchanged. Future adjustments should test **several encounters in one continuous trip**, not just reset to full HP/MP between every fight.
5. Record victories, defeats, median and outlier damage, healing use, turns, and whether the battle was understood and enjoyable. Never mark GO from simulation success alone.
6. Run `node --test tests/combat_progression_guardrails.test.js` and full `npm run check` for a regression floor. New tests are a tripwire, not proof of fun.
7. Review genuine browser gameplay at desktop/mobile, including low-level and resource-depleted cases, before merging into main.

Known gaps: native Node tests cannot be run on the exact GitHub binary checkout from this chat environment; GitHub Actions has failed before runner allocation. These numbers are **not** fabricated observations of actual browser play.

