# Four heroes × V5 featured NPCs — native 44px visual anchor board (2026-10-31)

**ART HOLD — visual baseline, not a new sprite or approval.** Based on Draft PR #154 fixed commit `07123c50d3915035ebe357c29e46ae4b59f62c38`. The frozen PR #98 and `main` are untouched. The rejected V12/V13 experiments are **not** a base for this work.

## Actual image artifact

[Open the source-embedded 44px contact board](evidence/four_heroes_v11_v5_native44_anchor_20261031.svg).

The SVG contains the **actual GitHub PNG bytes**, not a mock sprite, for Karen, Triton, Sophie, production Margaret, V11 Margaret HOLD, and the V5 featured-resident atlas. The seven columns show the same four directions at walking frame 0 and frame 3. Each cell crops one 48×48 atlas frame into a 44×44 display box with nearest-neighbor pixel rendering, identical matte field color and no effects. V5 Mayor and Envoy are held on their same-character atlas columns rather than incorrectly animated into other NPC identities. This is a **static source-asset board, not a Chromium game screenshot**. The flat backdrop is deliberately neutral; the board does not prove in-map grounding, camera composition, conversation or battle consistency.

### Exact input identities

| Source | Git blob SHA |
| --- | --- |
| Karen production walk | `2d1085e3e07aaa2550dccf2d33fe961ea6f2d3de` |
| Triton production walk | `a151bff9e4a54668b99923450658d85c7ec2b9bb` |
| Sophie production walk | `47065a719b16b3da0c3f0f2457d69ccfcf8a8a04` |
| Margaret production walk | `1923f1315c377418cea0f2dd7` |
| Margaret V11 HOLD | `b039e2bcbf7ba2175d7f9c1952cd2041e0b381c3` |
| Featured V5 NPCs (Mayor/Envoy) | `b169b58a846e1812dc42f566ca1843a6088e901f` |

**Correction for audit:** Margaret production SHA above must be read as its complete 40-character Git blob SHA `1923f1315c377418cea0f2f94ab6431c987f2dd7`; do not use a truncated identifier.

## Art judgment, not technical PASS

The V5 featured NPCs are the style anchors: compact readable head-to-shoulder construction, warm restrained shadow grouping, discernible face/garment separation and identifiable clothing masses. These are *shared principles*, not an instruction to duplicate their faces, poses, body types or brown palette. The four protagonists retain distinct personalities and established individual color masses.

Margaret's source/V11 still carries a bright, intricately subdivided hair halo over a visually compressed shoulder/neck transition. The broad pale upper shape competes with the face and body at 44px. V11 is a minor shoulder-edge intervention, not a credible full proportional fix. **Do not promote V11, V12, V13 or any recolor-only experiment on the strength of PNG integrity.** A trial 44px preview of a more aggressively recolored and narrowed V11 was inspected during this run and rejected before upload: it darkened and flattened the hair without resolving the underlying anatomy. A second broad dark-shoulder overpaint was likewise rejected before upload because it obscured costume detail and produced an unnatural dark block. These exploratory previews were **not** saved as approved art assets.

## Next genuine art gate

1. Draw a new *coherent* head, adult jaw, neck, shoulder and long-hair mass in all four directions, using the detailed original and V5 NPC references. Preserve Margaret's narrow thoughtful expression, silver-white hair, book and vertical garment identity. Do not perform mechanical row deletion, blanket color quantization or isolated 1px patches.
2. Compare source and candidate with this board at actual 44px, same pose and backdrop, **plus** real in-game same-camera A/B beside Mayor/Envoy. Only a visibly better result proceeds to all six walk frames and the remaining actions; no inferred approval.
3. Then validate character scale, foot contact, field tiles, crowd variety, dialogue/battle consistency, and all eight actions before considering production integration. Buildings remain out of scope until characters pass visual review.

## Scope and verification

Created one new **source-embedded SVG image asset** and this audit record on an isolated art branch. The source PNGs, runtime, save schema v23, story, maps, battle, buildings, approved V5 NPCs, PR #98 and `main` were not changed. All seven PNG blobs were retrieved from the connected private GitHub repository and their SHA identifiers recorded. The SVG markup is constructed with seven embedded PNG data URIs and 56 fixed source-frame crops; a minimal SVG image/crop implementation was checked locally with CairoSVG, **not the full new contact board**. No actual game Chromium screenshots, all-game tests, or full animation acceptance were run. No paid services or GitHub Actions jobs were used.

**Current player-facing improvement: none.** This work creates a shared real-image review baseline to prevent another cycle of ungrounded aesthetic claims.