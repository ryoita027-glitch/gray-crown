# Margaret V14 — hand-authored neck/shoulder/robe planes (2026-11-02 09:23 JST)
**ART HOLD / NOT APPROVED.** Stacked only on frozen Draft PR #272 HEAD `730a84f7d4821a83e522bea146dcebd6716a0b42`; no main, PR #98, approved sprites, buildings, story, or save-v23 edits.

## Deliverables
- Two real 192×192 RGBA trial atlases (four directions × four identical idle frames): `assets/character_trials/margaret_idle_neck_torso_v14A.png` and `assets/character_trials/margaret_idle_neck_torso_v14B.png`.
- Native 44px, foot-anchored A/B board `docs/art/evidence/margaret_neck_torso_v14_native44_AB.png`. Columns **V12 / V13A / V14A / V14B**, rows **down / left / right / up**. Identical background, pose and 44px nearest-neighbor reduction. **Not a real Chromium screenshot**.
- Reproducible offline generator `tools/art/build_margaret_neck_torso_v14.js` and Node test `tests/margaret_neck_torso_v14.test.js`.

## Actual changes
Unlike V13's mechanical x compression, V14 uses hand-authored directional row geometry for neck, sloped shoulders and dark-violet mage robe. Face, top hair, silver-hair identity and all pixels outside source rows 25–38 are preserved. The rear hair mass is intentionally retained; the robe emerges from below it. A keeps a subdued dark robe; B adds a slightly lighter central plane and clearer trim. No glow, extra jewelry or AI-like strands.

At source 48px per direction, changed pixels relative to V12: **A = 156 / 135 / 132 / 56; B = 156 / 136 / 134 / 57**. Four frames per direction match exactly. All pixels in rows 0–24 and 39–47 match V12; lower-body/feet are protected. Source V12 blob SHA is locked: `e3cba2a0b1f63ea47cf6599d58c01dc01dbd01bc`.

## Visual verdict and limitations
The robe's dark center is more legible as a torso in the static board, but can look rectangular, and its transition to the existing hair is still abrupt, especially from the sides. **Neither variant is accepted as an artistic improvement**. The top head/hair mass is still large relative to V5 mayor and royal messenger, and a truly unified head-to-neck-to-body redraw remains necessary. This is a deliberate reversible structural experiment, not a replacement for all four heroes or eight actions.

## Checks
Isolated JS generation verified 192×192 RGBA dimensions, four directions, all four idle frames, changed pixel counts, protected rows and variant difference. PNGs and board are produced with the same portable uncompressed RGBA codec used by the repository. **Native Node test, full npm check, real Ryune Chromium screenshot, battle/dialogue visual inspection and user art approval NOT RUN.** Local private repo checkout remains unavailable; no paid Actions requested.

## Next
Run `node tools/art/build_margaret_neck_torso_v14.js` and `node --test tests/margaret_neck_torso_v14.test.js` on full checkout; run existing live-village 44px capture with V14 art and V5 NPCs, then reject any option that looks worse. Prioritize redesigning head/hair and neck as a coherent mass rather than further x/y compression. Buildings remain untouched until character-wide visual acceptance.
