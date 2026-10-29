# Margaret V4C: valid independent PNG and actual-source 44px review — 2026-10-30

**ART NO-GO / Draft only.** Fixed parent: PR #125 HEAD `766ffd7847450cea5bf849a98bb0e532e7d641d1`. This branch intentionally does not descend from PR #126 because its V4B PNG needs independent integrity repair.

## Asset actually produced
- `assets/characters/margaret/studies/margaret_walk_v4c_study.png`: independently authored indexed PNG, 288×192, four directions × six 48×48 walking frames; hair/face/neck/robe pixels modified from V4, top of silhouette at y=4 and feet at y=43. The three walk poses per direction remain distinct.
- `tools/margaret_v4c_real_source_ab.html`: eight actual repository sources (four heroes, original Margaret, V4, V4C, V5 mayor/messenger) with matching 44px cell, background and ground shadow.
- `tests/test_margaret_v4c_study.py`: strict PNG CRC and full decompression gate, frame variation and ground geometry.

## Important integrity finding about earlier V4B (PR #126)
Connector-read exact V4B blob `ecb339853af86edd9341f264f02e3db9063e9a2d` has 1618 bytes. PNG chunk traversal gives IHDR/PLTE/tRNS valid CRCs, but IDAT stored CRC `2b6c9c80` differs from computed `b8cae2a1`; the file also ends with 11 bytes after IDAT where a complete IEND chunk requires 12. A strict decoder rejected the image. Therefore previous 'structural PASS' is **not a valid PNG integrity guarantee**. V4B is left untouched and must not be adopted. The current V4C is generated independently from the valid V4 candidate.

## Evidence and judgment
Local Pillow V4C full-load and PNG verification passed; 2 standalone tests passed. 44px V4 versus V4C preview was generated and inspected: the hair/face silhouette is taller and has clearer mass division. **V4C still has too little facial and clothing nuance compared with the existing original and V5 references, so this is NOT an art improvement acceptance.** Real Chromium in-game view, full `npm run check`, dialogue/battle appearance and all eight animations remain untested. Static comparison HTML is not a game screenshot.

No default assets, `main`, PR #98, story, save schema v23, balance, other protagonists or buildings changed. No paid API or Actions minutes used.

Next: restore V5-level facial/garment sophistication in a new four-direction candidate using the existing original as detail anchor, run full 44px source gallery and actual field screenshots, then complete all eight motions only after visual approval.
