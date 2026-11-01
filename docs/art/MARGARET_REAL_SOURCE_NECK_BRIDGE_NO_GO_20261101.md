# Margaret actual-source neck/collar A/B — 2026-11-01 15:28 JST
**ART NO-GO / DO NOT MERGE / NOT A RUNTIME ASSET.**

## Verified source, not an invented costume
- Base: PR #233 exact HEAD `4b2a5345f6df8357bac35d2098af4325b8bdb249`, stacked from #230; main and frozen #98 untouched.
- Actual decoded 192×192 RGBA `assets/characters/margaret/margaret_idle.png`, Git blob `910458eabfcfaef7442f885f319d0e2a09c88a66`. Front idle is source cell (x=0,y=0), 48×48.
- Actual decoded V5 reference `assets/npc/featured_residents_charm_v5.png`, blob `b169b58a846e1812dc42f566ca1843a6088e901f`. `js/data/npcs.js` maps mayor=3 and royal messenger=4.
- Candidate `docs/art/evidence/margaret_original_front_neck_bridge_A_NO_GO.png` is **same-pose, same costume**, unlike #233's separate construction. Five source pixel RGB changes only: (22,26) e5cdce, (23,26) fae4d5, (22,27) e5cdce, (23,27) fae4d5, (24,27) 927586. Alpha and every other pixel unchanged. Git blob `d6aeaa8f6b843710d9b609d35a12f8eaebce8e5f`.
- `tools/art/margaret_source_neck_bridge_native44_review.html` compares original / candidate / V5 mayor / V5 messenger at common native 44px, same ground line/background, and provides pixel diff and PNG export.

## Art verdict — reject
An enlarged actual-source A/B was inspected. A brighter 2px neck bridge reads as detached pale dots beneath the chin; the five-pixel patch does **not** solve the hair mass, adult proportions, or shoulder silhouette. An alternative nine-pixel outline was also visually tried and rejected. **Neither variant is adopted.** The PNG remains isolated as rejected evidence, not a runtime override.

## Verification and limitations
Actual PNG decoded and first-frame pixels compared in an isolated JS codec. The generated candidate was inspected at 7×; native 44px browser comparison tool is committed but **not run in Chromium** in this run. Full game capture, 4 directions, all 8 action sets, npm check, full game QA: **not performed**. This is not a player-visible improvement. No paid services, Actions or API.

## Next
Stop neck recoloring in isolation. Reconstruct Margaret's **head/neck/shoulder geometry as one unit** on the same original pose, protecting her established face/costume/hair identity, then compare with V5 NPCs at actual native 44px in Ryune. Keep buildings untouched until character cohesion is verified.
