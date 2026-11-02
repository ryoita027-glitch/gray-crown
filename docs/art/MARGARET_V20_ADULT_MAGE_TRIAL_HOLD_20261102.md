# Margaret V20 adult-mage redraw — art trial / HOLD (2026-11-02 JST)

**NOT APPROVED. DO NOT MERGE.** Base: PR #291 exact HEAD `02d855c9ea288447c09d31f822f83ff15a2d5ec0`. Frozen PR #98, main, canonical art, buildings, gameplay, story and Save v23 remain untouched.

## What actually changed
- New **real indexed PNG**: `assets/character_trials/margaret_idle_adult_mage_v20.png`, 192×192, 48×48 cells, 4 directions × 4 idle cells. Exact Git blob SHA `c3dcc57a772c09f098ce14aaac60541f34b7ad99`.
- New side-by-side browser reviewer: `tools/art/margaret_v20_adult_mage_native44_review.html`. Loads **original idle**, **new V20**, original production walk, the other three heroes, and V5 mayor/messenger **from their actual source PNGs**. Uses 44px nearest-neighbor, fixed background, 4 directions, optional foot anchoring and export. Production walk vs V20 idle is a **cross-pose continuity diagnostic**, not same-pose A/B.
- New source SHA / atlas geometry / nominal footline regression: `tests/margaret_v20_adult_mage_trial.test.js`.

## Art direction and visual review
Rebuilt the adult mage silhouette rather than shrinking the old sprite: face and neck drawn as a connected structure; hair organized into broad silver-gray masses with a warm dark outline; robe now has a cream central panel, sleeves and muted waist seam; the book remains identifiable. Kept silver hair, mage outfit and book as character identifiers. Four directions were drawn explicitly (right side is mirrored left), without changing production art.

**Limitations seen at nominal 44px**: V20 reads as a taller, calmer figure but its facial expression and hands are less nuanced than the V5 featured NPCs. The front face and robe remain comparatively flat, side-profile face is weak, and the 4 idle cells only vary by tiny accents rather than expressive acting. No V20 walk atlas exists. It is **not** an improvement proven in Ryune gameplay, and must not replace the original or be assigned a production selector. V19 remains NO-GO; V20 remains HOLD.

## Verification boundary
- Source PNG generated and opened as 192×192 indexed-color image. Local Pillow check: all 16 cells nonempty; 4 direction × 4 frame bounds within atlas; all feet end at local y=44; 44px nearest-neighbor preview visually inspected.
- GitHub blob round-trip: fetched exact new SHA and rendered the committed PNG successfully.
- **NOT RUN**: native Node tests against complete checkout, `npm run check`, actual Chromium Ryune Canvas, movement/dialogue/battle, sprite-to-map contact. Private GitHub clone DNS unavailable in the local container; no paid Actions used.
- Next: refine expressive eyes, face and book-hand shapes against V5 NPC, create matching walk frames and compare identical live Ryune Canvas states before art approval. Only after the entire character cast is unified should environment tiles be addressed.
