# Active PR Inventory Audit

Date: 2026-10-07 JST
Base observed: `main` at `d689aabb5146c9f45466a4f74f397e664c08fb4f`

This document tracks open PR intent and merge safety without making visual, story, canon, or Pixel-native adoption decisions.

## Rules

- Do not merge subjective visual/design work to `main` without human approval.
- Keep `main` Source of Truth conservative until an explicit promotion decision is made.
- Technical validation, CI, docs consistency, and audit hygiene may proceed independently.
- Karen/Triton existing design references must not be redrawn or replaced by generated comparison art.
- Sophie/Margaret final design remains review-gated.

## Open PR Classification

| PR | Title | Base -> Head | Classification | Current Action |
| --- | --- | --- | --- | --- |
| #26 | Add main v23 baseline CI | `main` -> `main-v23-ci-baseline` | technical-safe | Ready for review; CI passes. This should be the first infrastructure PR considered for `main` once approved. |
| #25 | Sync visual asset manifest with hygiene state | `main` -> `source-truth-asset-manifest-sync` | technical-safe docs | Safe docs consistency fix. No runtime/design impact. |
| #17 | Integrate Karen Chibi Direction v1 into Pixel Acting prototype | `pixel-karen-acting-prototype` -> `pixel-karen-chibi-direction` | review-only visual/runtime prototype | Do not promote to `main` automatically. Requires visual approval and Scale Integration decision. |
| #6 | Karen Pixel Acting technical prototype base - DO NOT MERGE YET | `main` -> `pixel-karen-acting-prototype` | prototype foundation | Keep as prototype reference. Do not merge before Pixel-native adoption and scope are approved. |

## Dependency Order

1. Baseline CI and docs hygiene: PR #26, PR #25.
2. Prototype review lane: PR #6, then PR #17.
3. Scale Integration gate for Karen Chibi before broader party/environment adoption.
4. Sophie/Margaret prep remains non-final until explicit human design approval.
5. Environment/village work should stay prototype-scoped unless it only adds validation or loader infrastructure.

## Known Source of Truth Tension

`main` still records a conservative v23 production baseline, while active branches contain later Pixel Acting and character prototype work. This is intentional for now: active branches may show progress, but they are not the canonical production truth until reviewed and approved.

Tracked separately in Issue #27.

## Safe Next Work

- Keep CI green for technical branches.
- Add missing validation only when it does not imply visual/design approval.
- Prefer draft PRs for audit/docs/CI improvements.
- Avoid creating new character art or final design documents without explicit approval.
