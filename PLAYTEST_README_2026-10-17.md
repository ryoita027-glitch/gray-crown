# Gray Crown · PLAYTEST 10.17 (integration candidate)

**This is the first integrated, downloadable player test of the current game branch, NOT a production release.** It is intentionally separate from the older `main` (more than 800 unreviewed intervening commits). The existing Draft PR stack is preserved.

## How to play on Windows (no programming or paid service required)

1. Open the GitHub branch: https://github.com/ryoita027-glitch/gray-crown/tree/playtest/gray-crown-first-integration-20261017
2. Click **Code → Download ZIP** while viewing that branch. You must be signed into the account that can access this private repository.
3. **Extract the ZIP completely** (do not run while still in the compressed folder).
4. Open the extracted folder and **double-click `index.html`** in Edge or Chrome. Internet connectivity is not required for game logic; do not expect a public GitHub Pages URL.
5. Confirm the game header displays **PLAYTEST 10.17**, then select **はじめから**.
6. Move with arrow keys/WASD; choose/interact with Enter/Space. Press M for the menu. On mobile, use the on-screen movement and interact controls (actual device behavior still needs testing).

If previous saves matter, back them up from the in-game M menu with **「セーブを書き出す（PC移行用）」** before choosing a fresh test. The normal save key/schema (23) is retained; new/old `file://` origins may behave differently between browser and file paths. Do not overwrite your only important save.

## Shortest useful player test (start here)

- In **リュネ村**, try talking to the kingdom messenger and interacting with **レンの稽古台** before or after that conversation. Either the defensive or attacking lesson can be chosen, or skipped.
- Leave the village through the real story gate after making the existing party decisions. Notice whether Ren’s optional practice feels natural within the farewell scenes.
- On the road, the first **灰牙狼** should live long enough to attack. Try **カレンの「庇う」**, **トリトンの「強撃」**, and the wizard's magic. Make sure the encounter feels fair, not difficult for its own sake.
- Interact with the optional cart/wolf-track landmarks. Reaching the **古砦跡** is more important than completing all optional text.
- In the fort's **east corridor**, inspect the **傷だらけの盾**. You should be able to skip the interaction; if investigated, the shield turns over, and each companion gives a distinctive reaction. A prior flag/banner decision affects Sophie's line.
- Reach the fort boss via the existing two switch/lever puzzles. Read the clue again in combat; use **崩し** or **氷槍** and see whether the actual action prompts the party to remember the shield. This scene does NOT award extra attack power/XP/gold and does NOT make the optional detour compulsory.
- Return to the shield after the boss. Its dialogue should change appropriately. Check saving and reloading with and without the optional shield flag.
- If a companion falls to **0 HP**, the next command MUST proceed to a living hero, not get stuck on an unusable command slot.

## What is included

The release branch includes all ancestors through **Draft PR #91**: RPG world/story/visual branches as inherited, NPC V5 visuals, first wolf opening-tactics fix, optional Ren practice, limited later-boss tuning, KO/turn-order correction, and a physical fortress shield investigation with a real battle callback. It also fixes a continuity issue where the shield's hidden writing was narrated before it was flipped over, and removes a post-boss line that incorrectly assumed every companion remained standing. The UI displays a unique build label.

The separate **Draft PR #86 QA workflow changes are not part of this branch**. The main branch remains unchanged. This is a playtest branch you can switch back from safely.

## Verification performed before this branch was offered

- Actual GitHub `index.html`: 41 script paths, all present and ordered exactly as the repository's Node test harness; CSS and hardcoded images were present.
- Repository Git tree: **477 entries, no truncated listing**. Sampled rendered asset references in active world/battle art: no missing literal files.
- Parsed game map definitions: **30 maps**, 125 world objects, 75 NPC records, no duplicate NPC/object coordinates and no invalid 24x15 map sizes.
- Fort shield object reachable by approach from all four adjacent cells; old cave save position at the shield's new tile is relocated to an adjacent walkable tile on schema-23 load while preserving health, inventory and existing story flags. The investigated flag round-trips through save migration.
- Targeted real JavaScript event logic: optional skip, one-time flag, four-character scene, changed drawn shield and actual combat reactions when a real Break staggers or Ice debuffs the boss. No extra damage/rewards/stat boost.
- Targeted combat logic from parent PRs: KO slot fix, 15 sequential simulated encounters, and resource-depleted tactics checks; see `docs/balance/`.
- All newly edited JS sources parsed independently.

**Not verified**: opening the ZIP in an actual human-controlled Chromium/Edge window, touch input, complete playable full 8–12-hour route, running `npm test` / `npm run check` on the exact checkout, or human appraisal of fun. GitHub Actions is failing before runner allocation, so there is no generated `gray-crown-current-playable.zip` artifact for this exact commit. **QA status: HOLD**. The branch is provided for an honest player test, not as a certification that bugs are absent.

## What feedback matters

Report **where** the experience became boring, confusing, repetitive, visually unattractive or too easy, and (when possible) the scene and action used. Source or test pass counts are not player quality ratings. The first objective is a coherent, engaging village → road → cave arc that makes each party member feel necessary and makes a discovered clue feel earned.
