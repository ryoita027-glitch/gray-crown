# Four heroes / V5 NPC native-44px contact audit — 2026-11-01 17:24 JST

**ART HOLD / NO RUNTIME ADOPTION / DO NOT MERGE.** Isolated evidence branch stacked on PR #239 at exact parent `7e66210550117f32792e239a6c13838004896acd`. No change to main, frozen PR #98, any live sprite, map, building, story, battle, Save v23, or balance.

## Why this matters

Earlier Margaret-only native44 static comparisons used **nominal** source-foot values (heroes 46/48, NPC 44/48). The current actual sprites do **not** all have the same visible bottom row. That can create an apparent vertical gap in a static art board, misleading the visual assessment of floating and scale. This does **not** establish a runtime positioning bug.

The comparison now includes the **entire party** in one 44px native-scale sheet, next to the actual V5 mayor and messenger atlas cells, all four directions. A second sheet preserves the previous nominal-anchor method so the difference is directly auditable. Source pixels and individual character identities are unchanged.

## Artifacts

- `docs/art/evidence/cast_npc_native44_contact_normalized_20261101.png` — 264×240 RGBA, six columns (Karen, Triton, Sophie, Margaret, mayor V5, messenger V5) × four directions (down, left, right, up). Each 48px source cell is downsampled with nearest-neighbor to 44px. The **last visible alpha pixel after 44px sampling** is placed at row 48 in each 60px cell. Same grass/check background and ground line.
- `docs/art/evidence/cast_npc_native44_legacy_anchor_20261101.png` — identical source sprites/background/size but retains the older fixed 46/44 source-foot assumptions.
- `tools/art/cast_npc_contact_review.js` — exact-Git-blob-locked offline deterministic generator.
- `tools/art/cast_npc_contact_review.html` — browser board with all four idle frames, four directions, background and anchor toggles.
- `tests/cast_npc_contact_review.test.js` — reproducibility and source/alpha-foot assertions.

## Exact source identities

| Source | Git blob |
|---|---|
| Karen idle | `782785fd504a4baba92be4ff099a827dd1ecac81` |
| Triton idle | `e6ca25a935e773cf17dd35e2355c28d647ffd7ef` |
| Sophie idle | `b9e037e40298bc0153bf1b081ff589b1822b70f8` |
| Margaret idle | `910458eabfcfaef7442f885f319d0e2a09c88a66` |
| V5 featured residents | `b169b58a846e1812dc42f566ca1843a6088e901f` |

## Actual measurements (front idle frame 0)

After nearest-neighbor 48→44, the last visible pixel **within the 44px cell** is:

| Character | Last pixel y | Legacy board global y | Contact board global y |
|---|---:|---:|---:|
| Karen | 40 | 46 | 48 |
| Triton | 41 | 47 | 48 |
| Sophie | 41 | 47 | 48 |
| Margaret | 43 | 49 | 48 |
| Mayor V5 | 43 | 51 | 48 |
| Messenger V5 | 43 | 51 | 48 |

This is a **5px relative Karen–NPC difference** in the old static comparison (46 vs 51) that disappears when the sampled contact is normalized. The source sprites and actual game renderer have not changed. All four directions had the same visible last-row values for frame 0.

## Visual assessment

The 44px side-view comparison shows a genuine **silhouette-language mismatch**: V5 mayor/messenger are much narrower in side profile than the four protagonists, especially Sophie and Margaret. Front-view mass and hairstyle identity vary considerably; copying the NPC faces, proportions, or outfits would be wrong. Margaret's silver hair still hides the neck/shoulder transition; her original geometry remains unresolved. No art-quality improvement is claimed merely because contact alignment is corrected.

**Do not accept any prior "floating fixed" conclusion based only on the old static footline.** Compare actual Ryune game screenshots at identical camera state, frame, viewport, and NPC placement before changing live anchor values. Keep 44px as the approved default pending human aesthetic review.

## Execution / limits

The source PNGs were fetched through the connected GitHub repository; their blob identities were checked, RGBA decoded, all four directional contact rows measured, and both board variants visually inspected. The new PNGs are created from those same pixels and roundtrip-checked. This is an **offline real-source art board, not an actual game screenshot**. Full repository checkout, Node test command, real Chromium game capture, full npm check, and full 8-action/field/battle visual acceptance were **not performed**. Local direct GitHub checkout is DNS-blocked; no paid services or Actions runs were used.

**Next:** run the browser board and actual Ryune village capture when full checkout is accessible. Reassess side-view width/head–neck–shoulder mass, then draw a geometry-level Margaret proposal in the exact original pose, with all four directions and frames before any production adoption. Do not move to buildings until the character cast is visually accepted.
