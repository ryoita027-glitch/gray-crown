# Sophie V3 — profile eye / cloth fold readability study (2026-10-31 JST)

**ART HOLD / NOT APPROVED.** Parent is #169 exact HEAD `220982b31859a9d8409d61be501e564c0281ffa3`, preserving all prior drafts. The production Sophie remains the original PNG; default game URLs do not load V1/V2/V3. No change to main, frozen #98, V5 NPC reference sprites, story, save v23, game balance, buildings or environment.

## Actual work

- Painted a new **288×192 RGBA PNG** at `assets/characters/sophie/studies/sophie_v3_profile_eyes_hold_walk.png` from the V2 anatomy underdrawing. Four directions × six walking frames, 48×48 cells, with direction-specific eyebrow/cheek, profile eye pixels, hair lock, sleeve and robe fold accents. This is **not** a claim of a full anatomy repaint.
- V2 → V3 changed **126 opaque RGBA pixels**, without altering any alpha mask or footline; 24 nonempty frames, five unique frame states per direction. Source last painted row y44, consistent with V2. Local SHA256 `de8c54912a01b34dd691189c3650536ac45787d10da6c8c1327b81115434c664`; Git blob SHA `25aaca96739637a11c558ab858f2e827704cc218`.
- Opt-in only: `?gcSophieContour=3` now selects the V3 PNG in the real field renderer. `?gcSophieContour=1` and `=2` remain available. No parameter preserves original. The stable A-B-A comparison panel labels V3 and rejects moving/background drift.
- [V2/V3 native 44px, four-direction A/B](evidence/sophie_v2_v3_profile_native44_20261031.svg): embedded actual source PNGs on identical field-green panels; this is **not** a Chromium village screenshot. A local PNG board `sophie_v2_v3b_native44_AB.png` was also rendered and inspected.

## Art assessment

At native 44px, the left/right profiles gain a discernible eye/cheek plane that V2 lacked. The face, robe and boots still look simplified beside the V5 Mayor/Envoy, and the differences are subtle at actual play size. This is **not a commercially convincing improvement**. Hold for an independent structural redraw using original character identity and V5 shape/cloth density; do not promote V3 to production. A denser intermediate V3 attempt was rejected locally because hair/robe micro-lines produced visual noise; it was not committed.

## Verification and limits

Local Pillow validated 288×192 RGBA, 24 occupied cells, five unique states per direction, unchanged alpha and bottom y44; actual V3 PNG hash was independently checked against Git blob SHA. Committed `world.js`, A/B UI and test were re-fetched and **V8 syntax compiled 3/3 PASS**. The actual committed A/B test source was executed in a **V8 mock of Node fs/path/assert and Canvas: PASS** (V1/V2/V3 labels, A-B-A three frames, drift/no-difference/large-diff/follower guards, restore). **This is not the real Node test harness**. **No full repository Node test or real Chromium village screenshot was run** because the private checkout is not available in this container. Browser loading and real V5 in-map comparison remain unverified. No GitHub Actions or paid services used. **Do not merge.**

## Next

Capture the original/V2/V3 beside V5 Mayor and Envoy in the actual village at 44px. Then redesign the face-to-shoulder/robe shape at a higher, deliberately grouped detail density; if V3 fails to improve visual hierarchy, discard it rather than adding more isolated pixels. Finish all eight actions and real-map QA before adoption.
