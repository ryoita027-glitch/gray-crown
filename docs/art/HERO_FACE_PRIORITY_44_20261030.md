# Graygrow: 44px face-priority remap — ART HOLD (2026-10-30)

## Source / safety
- Parent: PR #133 `06bcdd79deb7b0c7501ea6a309194cfbd8c96b9c` (not main).
- Frozen PR #98 HEAD `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c` remains untouched.
- Reviewed real GitHub source: `assets/characters/margaret/margaret_walk.png` (288×192) and `assets/npc/featured_residents_charm_v5.png` (432×192). V5 residents show readable warm midtones, varied headwear, stronger shoulder/neck silhouettes. Margaret's original has richer facial/hair detail than rejected V4F, so **do not replace its original PNG**.
- Existing 48px original sprite sheets and all other actions remain unchanged. No save/story/balance/building edits. No paid Actions or APIs.

## Actual visual experiment
The four protagonists share a reversible **pixel-placement candidate** at native 44×44 display, 6 frames × 4 directions:
- Source 48px head rows 0–23 are sampled **without vertical row loss**.
- Source face columns 14–33 are sampled **without horizontal column loss**.
- Four removed source columns come from side margins; four removed rows come from the lower body/hem. Alpha, original RGBA samples, eyes and silhouette colors are not repainted.
- Candidate atlas is generated from the actual loaded source PNG at runtime as 264×176 RGBA Canvas; draw uses 44×44 source cells at 44px screen size.
- Opt in with `?gcHeroFace44=1`, toggle original/candidate in-game, capture same-scene original/candidate as a 1536×504 PNG, or export four candidate 264×176 PNG sheets. The default experience remains identical. `gcMargaretSilver` and this study cannot run together.
- Existing 40/42/44px scale study remains independent; this new pixel-remap candidate is only active at **44px**.

## Art acceptance (NOT passed)
**HOLD / NOT APPROVED.** The design is motivated by source-to-screen 48→44px pixel loss, not by any claim that it looks better. It may compress the garment/boots or create stepped side-hair edges. All 4 heroes must be reviewed against the original, V5 village elder and royal envoy at exactly 44px in the real village scene, walking and idle, and at dialogue/party scales. Do not ship on mathematical preservation alone.

## Verification / follow-up
- Added deterministic `node --test tests/hero_face_priority_44.test.js` for every frame/direction, head/face mapping, alpha and invalid dimensions.
- The GitHub source code is updated; **a complete local browser playtest and original-vs-candidate game screenshot have not been run in this execution environment**. Do not mark art PASS.
- Next: run Chromium against this Draft branch, inspect the exported PNG at 1× and 4×, reject if neck, feet, hair or costume look worse. If accepted as an experiment, assess other eight animations before any production use.
- Do not move on to buildings before all characters are unified.
