# Margaret V27 — adult tailored key-pose trial (2026-11-03 JST)
**ART HOLD / NOT PRODUCTION / DO NOT MERGE.** Based on PR #307 HEAD `678526e8d56c6001b9e073bc4921961120d3518b`. V25 walk was NO-GO. This returns to a 4-direction × 4-idle-frame structural study, not another walk tweak.

## Actual change
- `assets/character_trials/margaret_idle_v27_tailored_keypose_indexed.png`: 192×192 indexed/transparent PNG. Reuses V22's head/hair, face, sleeves and book, but reconstructs front torso as layered tunic, belt, opening and two boots; side/back feet are separated. V27 is a key-pose trial, **not** an accepted redesign.
- `tools/art/make_margaret_v27.py`: offline Pillow generator from the existing V22 PNG; no production asset modification.
- `tools/art/margaret_v27_native44_review.html`: actual four-hero cast, V22/V27 and V5 mayor/messenger on a shared 44px sampled-foot comparison canvas. This is a static review board, not live Ryune gameplay.

## Evidence and limits
V22→V27: 1,260 changed RGBA pixels across 16 frames, 160 alpha differences; 48px source cell dimensions and last visible y=44 in each direction/frame remain fixed. Local RGBA→indexed pixel equality and four-direction visual board were checked. At 44px, the front tunic and boot split are clearer than the featureless V22 center, but side/back geometry, head–neck–shoulder anatomy, animation and cast style are still inconsistent with V5. **No commercial-quality improvement claim.**

**Not run:** real Ryune Canvas screenshot, complete game Node suite, all eight action sprite consistency, battle/field continuity. No paid Actions. No change to `main`, PR #98, production art, buildings, story, balance or Save v23.

**Next:** first capture actual Ryune village at 44px and inspect four heroes plus mayor/messenger, then redesign head–neck–shoulder and adult silhouette as a coherent whole. Do not animate or adopt V27 before the key pose passes a real visual review.
