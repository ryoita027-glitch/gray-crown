# Margaret V12 — upper hair-height structural trial (2026-11-02 07:26 JST)
**ART HOLD; not a visual approval.** Parent: PR #268 commit `562f781db892cf6a80a089855bbd7b81ada0390d`. Frozen #98 and main untouched.

## Actual art / comparison
Locked original: `assets/characters/margaret/margaret_idle.png` blob `910458eabfcfaef7442f885f319d0e2a09c88a66`.
V5 mayor/messenger: `assets/npc/featured_residents_charm_v5.png` blob `b169b58a846e1812dc42f566ca1843a6088e901f`.
V11 is an earlier, unapproved width/palette trial. No canonical source was overwritten.

Instead of yet another one-pixel recolor, V12 compresses only the **upper hair cap** (original y=4..17) into y=6..17, without modifying any pixels at y>=18. This keeps Margaret's face, hair framing at eye level, neckline, clothing, feet and character identity unchanged. Four directions x four stationary frames (identical to avoid whole-body bob) are included. An alternative top=8 was visually too flattened and is **not integrated**.

A/B evidence `docs/art/evidence/margaret_headheight_v12_native44_npc.png`: columns original, V11, V12(top6), rejected(top8), V5 mayor, V5 messenger; rows down/left/right/up; all nearest-neighbor 48-to-44px with the last opaque pixel on a shared ground line. This is a source-image composition, **not** a live Chromium screenshot. It isolates head height, not shoulder connection. V12 is only a possible proportion improvement; the silhouette remains bulky beside V5 NPC, and neck/shoulder cohesion is still unresolved. No artistic GO.

## Reproduction / gates
- `node tools/art/build_margaret_headheight_v12.js` regenerates trial and board from locked source blobs.
- `node --test tests/margaret_headheight_v12.test.js` checks pixel reproduction, face/body/foot identity and opt-in integration.
- `python tests/browser_margaret_headheight_v12_live_ab.py` captures real village canvases (desktop/phone x 4 directions x current walk/approved idle/V12) **not run in this execution** because the private repository cannot be cloned to the isolated local container (DNS failure).
- `?heroIdleArt=8` is stationary-only. Default walking, prior trial modes, NPCs, battle, story, save v23 and building art unchanged.
- Native PNG binary was generated and decoded again in the isolated execution environment; no Node suite, browser or full regression has been claimed PASS. No paid Actions triggered.

Next: obtain actual live Ryune village screenshot with V5 mayor/messenger and all four heroes visible; compare native44 face, head-to-shoulder mass, foot anchor and motion. If V12 still lacks a clear perceptual advantage, discard it and move to an authored structural head/neck/torso redraw, rather than more compression variants. Do not promote to main or #98.
