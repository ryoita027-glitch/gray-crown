# Margaret V11 — silhouette/value language study (2026-11-02 06:26 JST)

**ART HOLD / not approved / no main merge.** Parent: PR #266 HEAD 7d92ec99c28c0eede55000d97b90a07b5da6c028. Frozen PR #98 untouched.

## Actual-source design comparison

Sources locked by Git blob: Margaret approved idle 910458eabfcfaef7442f885f319d0e2a09c88a66; featured NPC V5 b169b58a846e1812dc42f566ca1843a6088e901f. The source remains unchanged. Existing V1 color-only and V8–V10 tiny-detail studies did not establish a clear improvement. This study instead tests **head/hair silhouette width plus broad silver/plum value groups**, preserving the original center face (x18–29, y18–25), feet (y40–47), and character identity.

docs/art/evidence/margaret_silhouette_v11_native44_ABCD_npc.png has six columns: approved original, A (value groups only), B (value groups + 0.78 outer-head width), C (value groups + 0.65 outer-head width), V5 mayor, V5 messenger. Rows: down/left/right/up. Source 48px is displayed at actual 44px nearest-neighbor, all columns on the same checker/grass background with last visible pixel at the same contact line. This is a **real-source PNG board, NOT a Chromium game screenshot**.

Candidate B was saved as assets/character_trials/margaret_idle_silhouette_v11.png (192×192 RGBA, 4 directions × 4 stationary identical frames). Changed pixels per direction against approved first idle frame: down 444, left 459, right 458, up 417. Count includes color and geometry; it is not an artistic score. The stronger C trial is *not* integrated because the side/back hair becomes pinched and may lose Margaret's distinct long-hair mass.

**Visual judgment:** B narrows the outer head/hair silhouette and neutralizes overly violet highlights without replacing the central face, outfit concept or hair identity. At 44px the difference remains subtle; side-view flow, neck/shoulder separation and stylistic match with the taller/narrower V5 NPC remain unresolved. Therefore **HOLD, not GO**.

## Reproducibility and in-game gate

Rebuild: node tools/art/build_margaret_silhouette_v11.js. Verify: node --test tests/margaret_silhouette_v11.test.js. The trial is selected *only while stationary* with ?heroIdleArt=7; moving Margaret and the default approved walk renderer are unchanged. Earlier experimental modes are untouched. Run python tests/browser_margaret_silhouette_v11_live_ab.py in a full local checkout to obtain 24 real game-canvas screenshots (desktop/phone × four directions × live walk/approved idle/B), eight full-scene boards, eight detail boards, and a manifest. **This run did not execute Chromium, the Node suite, or the full regression because the private repository cannot be cloned in the local execution container (DNS blocked).** Do not label a test source file as a passing test or claim visual acceptance.

No changes to other heroes, NPCs, buildings, battle, story, save schema v23, balance or approved art. No paid APIs or Actions runs.

## Next

Review actual village canvases with the mayor/messenger visible and assess B's face legibility, side hair flow, neck/shoulder mass and contact at desktop/mobile. If B remains too close to the source, stop automatic narrow/tonal variants and hand-redraw the head/neck/torso silhouette using the art bible; then cover walk and other actions before adoption. Do not switch to buildings until the character cast passes visual review.
