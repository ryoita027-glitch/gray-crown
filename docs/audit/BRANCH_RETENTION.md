# BRANCH_RETENTION.md

## Purpose

This file defines which branches are active, which are retained temporarily as technical reference, and which branches require deletion review.

The goal is to prevent superseded experiments from being mistaken for the current development path.

Last audited: 2026-10-07 JST

---

## KEEP - active baseline

### main
Production baseline.

- v23 production truth
- current repository hygiene / current-state documents
- no formal Pixel-native adoption yet

### pixel-karen-acting-prototype
Active Pixel Acting technical base.

- Open PR: #6
- Current role: technical prototype foundation only
- Restriction: do not merge to `main` before Pixel-native adoption and scope are explicitly approved

### pixel-karen-chibi-direction
Active Karen Chibi review branch.

- Open PR: #17
- Base: `pixel-karen-acting-prototype`
- Current role: review-only visual/runtime prototype
- CI status: PR-triggered `Karen Pixel Prototype CI` passes on head `859c981eb2af4d4953ad75e8d825e90786b73743`
- Restriction: do not treat this as visual approval, Scale Integration approval, or `main` promotion approval

---

## KEEP TEMPORARILY - technical or review reference

### pixel-karen-scale-integration

Reason:

- contains proven foot-anchor scale logic
- contains 48 / 44 / 41 comparison controls
- may be reused after an accepted Chibi Karen visual exists

Restriction:

> Do not reuse its old visual verdict.

This branch is a technical reference only.

### pixel-karen-chibi-scale-integration

Review-gated branch for scale integration work after the Chibi direction. Keep as a candidate/reference branch only until the Karen Chibi review lane is resolved.

### pixel-triton-second-character-validation
### pixel-sophie-third-character-validation
### pixel-sophie-steady-hands-validation

Character validation branches. Keep as review-gated references only. They must not be treated as final Sophie/Margaret design approval or party-wide production adoption.

### pixel-environment-prototype-prep-v1

Environment prototype prep branch. Keep as a prototype reference only unless a later approved integration branch promotes specific loader/validation work.

### pixel-character-standard-v1-provisional
### art-bible-v2-provisional
### character-visual-identity-lock

Visual documentation/reference branches. Keep as provisional references until Source of Truth reconciliation is complete. They must not override `main` by branch existence alone.

---

## TRANSIENT TECHNICAL PR BRANCHES

These branches exist to carry safe audit/CI/docs work through PRs. Delete only after their PRs are merged or closed and their useful content is represented elsewhere.

- `main-v23-ci-baseline` - PR #26
- `source-truth-asset-manifest-sync` - PR #25
- `audit-active-pr-inventory` - PR #28

---

## REPOSITORY-MAINTENANCE REFERENCES

The following branches appear to be repository-maintenance or hygiene references. Review before deletion; do not delete automatically while Source of Truth reconciliation is open.

- `repo-actions-consolidation`
- `repo-actions-finalize`
- `repo-branch-retention`
- `repo-hygiene-current-state`
- `repo-karen-integration-handoff`
- `ci-finalize-triggers`
- `visual-foundation-sync`

---

## HISTORICAL OR SUPERSEDED VISUAL REFERENCES

These branches may contain superseded or rejected visual experiments. Keep them from being mistaken for the current path. Delete only after confirming no open PR uses them and no needed technical implementation remains unique there.

- `pixel-karen-phase2-eval`
- `pixel-karen-phase2-gate-fix`
- `pixel-karen-phase2-result`
- `pixel-karen-runtime-doc-fixes`
- `pixel-karen-triton-face-differentiation-fix`
- `pixel-karen-visual-anchor-redesign`
- `pixel-karen-visual-redesign-v3`
- `pixel-karen-visual-refinement`
- `pixel-karen-visual-refinement-v2`
- `pixel-native-direction-study`
- `pixel-native-phase2-go-decision`

Restriction:

> Do not revive or merge historical visual branches as design approval. Any reusable code must be extracted through a scoped technical PR.

---

## Open PR policy

Current open PRs observed during this audit:

- #6 - Karen Pixel Acting technical prototype base - DO NOT MERGE YET
- #17 - Integrate Karen Chibi Direction v1 into Pixel Acting prototype
- #25 - Sync visual asset manifest with hygiene state
- #26 - Add main v23 baseline CI
- #28 - Add active PR inventory audit

The prototype PRs are review-gated. The docs/CI PRs are technical-safe, but still should not be merged to `main` automatically without an explicit merge decision.

---

## Branch safety rule

Before deleting any branch:

1. confirm no open PR uses it
2. confirm its unique work is merged or intentionally abandoned
3. preserve any reusable technical implementation elsewhere if needed
4. never delete `main`
5. never delete the active prototype base
6. never delete a branch to resolve uncertainty; document the uncertainty instead

