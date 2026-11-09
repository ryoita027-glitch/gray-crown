# Gray Crown — 同一HEAD統合受入ゲート (2026-10-19)

## Source of truth
- Candidate branch: `qa/gray-crown-integrated-20261019`.
- Baseline: PR #96 HEAD `b5e8aa308add27772d368382d994a2437dd1c053`.
- Added from PR #97 HEAD `494fe8b227906604534357b1fcd0e91969d6a2f2`: `enterNorthRoad` story-stage advancement + five code regressions. Preserve the two later #96 save changes missing in #97.
- The **exact current commit SHA**, not branch label, is the build identifier. Record `git rev-parse HEAD`, GitHub Actions `github.sha`, and SHA256 for every packaged ZIP/HTML. **Do not mix evidence between heads.**
- `main` stays unchanged; prior Draft PRs are *not* marked accepted or automatically merged.

## Mandatory acceptance evidence
1. One Actions run from exact SHA: full runner allocation and complete logs; do **not** weaken `npm run check`/assertions. If it fails before a runner is allocated, this is CI infrastructure UNKNOWN, **not** a game test result.
2. Run `npm run check` (full Node tests, syntax, source authority, existing browser gates). After that: vertical-slice browser E2E, release ZIP/single-file builder/HTML E2E, 3-route browser tests, and opening/city visual captures. Collect Playwright artifacts, exit codes, console errors, screenshots, and actual package hashes.
3. Real normal-input journey: **New Game → Ryune → first wolf → road → old fort levers → gray-horned beast → north exit → capital**. Verify stage `04_capital_approach` immediately after north exit and after save/load, not only after load migration. Verify first boss gate cannot be bypassed.
4. Test primary, backup, previous-adventure archive, corrupted slots, quota-write rollback, Continue and imported HTML escaping **without clearing browser storage**. Do not change schema-23 or old v23 fixture for a green result.
5. Side-by-side at 100% player zoom: Karen, Triton, Sophie, Margaret and V5 named residents on village/capital/fort and in battle; preserve 48px authored source proportions. Judge face clarity, hair, silhouette, gait/grounding, portraits, name overlays, mobile 320–600px and overlapping HUD.
6. Full 8–12-hour no-debug route playthrough ×3, distinct route endings, blind-player feedback, legal rights for image/music/font/SFX, offline ZIP and single HTML in current Chrome/Edge. **None of these are marked complete merely because CI passes.**

## Blockers and anti-false-positive rules
- Issue #46: historical Actions jobs fail in ~2–5 seconds, `runner_id=0`, `steps=[]`, `annotations_count=2`. Annotations currently inaccessible via connected GitHub API; old job log endpoints 404 BlobNotFound. Root cause still UNKNOWN.
- Source-level mocks and local v35 tests are **not** evidence that this full integrated HEAD passed Chromium.
- Old ZIPs and Draft PR-specific checks are not admissible for the frozen build.
- Unexpected failures are documented with test, log, exact SHA, suspected cause and reproduction; never delete or loosen the test to force green.
- Release state: **DRAFT / NO-GO** until the complete gates and independent human visual acceptance pass.

## Art production parallel lane
Character part-production will be in a **separate Draft PR** on top of the frozen candidate. It must not alter the accepted gameplay baseline. Begin with Karen; create native-resolution, separately editable 48px transparent head, hair front/back, torso, arms, hands, legs, clothing and weapon, with shared origins/anchors for 4 directions. Export assembled 4-direction/idle/walk PNG only after 100% screenshot comparisons and explicit visual approval. Decompose/author designs, **never automatically crop a full-body PNG into guessed limbs**.
