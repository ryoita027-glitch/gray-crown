# Gray Crown — Field Worker v2 visual refinement (2026-10-29)

## Source and safety
- Parent: Draft PR #112, HEAD `f5c00dfec2874c581202e4e3ea83250ea82ab190`. PR #98's frozen `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`, main, and PR #99–#105 are unchanged.
- V5 anchors are **mayor** (atlas column 3) and **kingdom messenger** (column 4) from `featured_residents_charm_v5.png`. They are visual references, not pixel donors.
- This is a **reversible, unapproved second candidate** for the field worker. Normal play and v1 study remain unchanged.

## Actual visual work
- Added `assets/npc/field_worker_style_study_v2_48x192.png` (48×48 native, four directions, RGBA).
- Repainted face planes (brow, nose, mouth, cheek shadow), hat crown/band, distinct brown hair masses, folded linen sleeves, vest lapels, leather pouch and belt, tool steel/wood and worn boots with a restrained material hierarchy. These are directional pixel decisions, not a global recolor or resize.
- Native changed pixels against v1: **front 201, left 101, right 99, back 187**; alpha coverage and footline remain pixel-identical. New color clusters are intentionally bounded to avoid fine-line noise at 44px.
- The v2 artwork is not copied from mayor/messenger, does not change any hero, and contains **idle only**; no walk/work frame is claimed.

## Player A/B
- Normal `index.html`: original procedural 32px field worker.
- `index.html?gcFieldWorkerArt=1`: original 44px v1 candidate, unchanged.
- `index.html?gcFieldWorkerArt=2`: 44px v2 candidate, with malformed/missing-image fallback to procedural 32px.
- `tools/field_worker_v5_style_review.html`: old, v1, v2, V5 mayor, V5 messenger and four heroes at the same footline/direction; 1×/2×/4× with PNG export adjusted to a 3×3 grid.

## Evidence and limits
- Locally opened native sprites and inspected side-by-side 44px nearest-neighbor and 8× pixel views. V2 has more deliberate face/fabric/hat planes; this is a **candidate improvement**, not a commercial-quality approval. The small display can still look busy, especially on the face.
- Local isolated PNG decoder test: first test PASS (4 directions, changed-pixel counts, no silhouette or footline shift).
- GitHub JS and review inline JavaScript syntax were compiled independently in V8 before upload. Repository-wide `npm test`, Chromium actual gameplay screenshots, mobile HUD, Save/Continue and full-route playthrough **not run**; GitHub Actions runner problems remain separate. Do not report these as PASS.
- No paid API, CI upgrade or paid workflow was used.

## Next gate
Open the actual game at `?gcFieldWorkerArt=2` in the fields and compare v1/v2 against V5 at native display size. If face or fabric becomes noisy, simplify or reject. Only after a visually accepted A/B, draw hand-authored work and walk frames. Then proceed through other NPC roles and the four protagonists; building/environment unification comes **after** character acceptance.

**DRAFT / HOLD / NO-GO. Do not merge to main.**
