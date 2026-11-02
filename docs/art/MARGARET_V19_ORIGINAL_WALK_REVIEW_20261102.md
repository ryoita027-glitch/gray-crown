# Margaret V19 — original/idle/walk/V5 NPC visual gate (2026-11-02 JST)

**ART HOLD / NOT APPROVED / DO NOT MERGE.** Exact parent PR #287 HEAD `16f8683ac5601b738ccf529fc3f26756bd3e4d6b`. This branch only adds a review tool, a preliminary comparison image, a small test and this record. No approved sprites, `main`, PR #98, buildings, story, battle, or Save v23 are modified.

## Why this is a separate review pass

V8–V19 mostly narrowed/reshaped Margaret's head or recolored her robe, but repeated static 44px boards have not demonstrated a commercial-quality gain in the **actual game**. A stronger hand-authored 48px front-only redraw was prototyped locally in this run; its silhouette and flat shading were visibly inferior to the source. **Rejected, not committed**, and not used as evidence of improvement.

The remaining discrepancy is structural: V19 still has a large, high-contrast hair/head mass relative to the V5 mayor/messenger and an unclear neck-to-robe transition. The production **walk** atlas is different from every V19 **idle** trial, so a stationary-only preview cannot establish idle→walk→talk consistency.

## Actual new project artifacts

- `tools/art/margaret_v19_idle_walk_native44_review.html`: browser review that loads **real repository PNGs**, four directions, 44px nearest-neighbor, the same frame/background/contact policy per column. Columns are original Margaret idle/walk, V19 idle, Karen, Triton, Sophie, V5 mayor and V5 messenger. Supports all 4 idle frames and all 6 walk frames, contact vs nominal footline, three backgrounds, 2× inspection, and PNG export.
- `docs/art/evidence/margaret_original_v19_v5_native44_PRELIMINARY.png`: preliminary four-direction quick reference (original / V19 / V5 mayor / V5 messenger). **Not an exact source-pixel A/B**: original column was reconstructed from the earlier 2026-11-01 already-composited 44px board `margaret_idle_npc_language_v1_native44_AB.png`; the other columns are from `margaret_v18_v19_native44_v5_npc_AB.png`. Different prior footline and precompositing may contaminate edge pixels. The browser review is the accurate common-background reference.
- `tests/margaret_v19_idle_walk_review.test.js`: static assertions that the review uses original/real walk/V19/V5 paths and clearly distinguishes same-pose A/B from cross-pose diagnostics.

Source Git blobs: V19 `db3fd3301dfbe5f60cb5195a31eb5d6c8e36bd3e`; original-composite evidence `9d770284280722ac7f94d0b483f5a3fe1a9e5a05`; prior V19 comparison `174f2078708d3d28adac80db4f86de3c30a1c418`. Production Margaret idle `910458eabfcfaef7442f885f319d0e2a09c88a66`, walk `1923f1315c377418cea0f2f94ab6431c987f2dd7`.

## Verification performed and not performed

- Local `node --check` of the extracted browser JS: **PASS**.
- Local `node --test tests/margaret_v19_idle_walk_review.test.js`: **2 PASS**.
- Local Chromium Playwright smoke with **synthetic** correctly shaped sprite atlases embedded as data URIs: **PASS**; all images loaded, idle/walk switches and sliders worked, zoom and PNG export worked, no JS page errors. This checks tool behavior, **not** game artwork.
- Real GitHub source PNGs for V19 and both prior evidence boards were fetched and visually inspected. Preliminary PNG was generated and uploaded as a real image object.
- **NOT RUN:** actual repo-loaded Chromium page (direct GitHub DNS and local browser navigation blocked), actual Ryune game Canvas screenshot, full `npm run check`, walk/talk/battle art continuity, human art acceptance. No GitHub Actions or paid API.

## Visual judgment and next step

V19 is somewhat narrower than the original in side/back views, but the V5 NPC proportion gap remains. **Do not call this an aesthetic PASS.** Next run should prioritize an actual same-state Ryune Canvas capture and reject the current V19 if its head/neck and idle→walk continuity are inferior. Do not iterate another tiny silhouette/palette tweak without that comparison. A true structural redraw should keep Margaret's silver hair, adult personality, book, and vertical robe mass while solving face/neck/shoulder anatomy across all directions/actions. Buildings remain on hold until the cast is unified.
