# Margaret V22 structural idle trial — ART HOLD (2026-11-02 JST)

**NOT APPROVED / DO NOT MERGE.** Parent: PR #295 HEAD `6a957071a69e6dc50101f5fb811cf3a9c0f00638`. This art-only child branch does not touch main, frozen PR #98, production sprites, maps, buildings, story, Save v23 or balance.

## Reference and identity
- Existing actual NPC atlas: `assets/npc/featured_residents_charm_v5.png` (mayor column 3, royal messenger column 4), Git blob `b169b58a846e1812dc42f566ca1843a6088e901f`.
- Existing official Margaret idle: `assets/characters/margaret/margaret_idle.png`, blob `910458eabfcfaef7442f885f319d0e2a09c88a66`. Do not replace it.
- Source V21: `assets/character_trials/margaret_idle_adult_mage_v21_expressive_trial.png`, blob `48e9b149c8873aaf3ceddf25328e3c6d0d3c4d46`.
- Style authority remains `docs/art/GRAY_CROWN_ART_BIBLE_v2.md` and `docs/pixel/MARGARET_CHIBI_DIRECTION_LOCK_v5.md`. Silver hair, calm adult mage, dark robe, ivory panel, restrained gold and book remain.

## Real asset work
- New `assets/character_trials/margaret_idle_adult_mage_v22_structural_trial.png`: actual indexed PNG, 192×192, 4 directions × 4 idle frames, 48px source cells, Git blob `d7d0aa4eaa7286b85c3cf0181b36c550962b688d`.
- Reworked shoulder/collar transitions, front robe overlapping panels, waist/hem folds, cuffs and book-page structure. Side/back receive consistent, restrained cloth and hair planes. Added quiet breathing/eye-blink/book highlights across idle frames, **without moving feet or changing the silhouette**.
- 1,998 changed RGBA pixels relative to V21 (measurement, not quality grade); every source alpha pixel and all 16 frame footlines are identical.
- Updated existing `tools/art/margaret_v21_source_native44_review.html` instead of proliferating another tool: source-backed V22 column, canvas expanded to 990px so the ninth column is not clipped, same 44px/direction/frame/background/foot anchor.
- Local static 44px four-direction A/B produced and inspected. **It is not a live-game Canvas capture.**

## Visual assessment
At 44px, the front robe reads as layered cloth and the book is somewhat more distinct than V21; side and rear changes are modest. The head still appears too round/large and the shoulder-to-body proportions still do not reach V5 mayor/messenger visual quality. **No production promotion.** A small improvement in a static trial is not proof of better full-screen gameplay.

## Verification and limitations
- Locally executed Pillow RGBA decode, 16-frame nonempty and y=44 footline checks, exact alpha preservation, per-direction idle-frame differences and native44 A/B inspection. 
- Re-fetched and rendered the committed GitHub V22 PNG: exact Git blob `d7d0aa4eaa7286b85c3cf0181b36c550962b688d`, valid 192×192 indexed image. Local Node 22 + Sharp independently checked SHA, 16 cells, y=44 foot contact, alpha identity, 1,998 changed pixels and idle-frame variation (PASS). This is **not** the repository test suite.
- **Not run:** repository-wide Node/npm check, actual Ryune Chromium Canvas capture, walk/turn/talk continuity, full game QA. Private GitHub clone remains blocked by local DNS. No paid Actions.
- The source V21 and V22 use the same alpha silhouette; this is a reversible incremental art experiment, **not** the required full head-neck-shoulder reconstruction. Next: review in real village, then redraw proportions and build coherent walk/turn/talk if art is accepted.
