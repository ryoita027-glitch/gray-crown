# BRANCH_RETENTION.md

## Purpose

This file defines which branches are active, which are retained temporarily as technical reference, and which are safe deletion candidates.

The goal is to prevent superseded experiments from being mistaken for the current development path.

---

## KEEP — active

### main
Production baseline.

- v23 production truth
- current repository hygiene / current-state documents
- no formal Pixel-native adoption yet

### pixel-karen-acting-prototype
Single active Pixel technical base.

Keep until the accepted Chibi Karen direction is validated and a later integration decision is made.

---

## KEEP TEMPORARILY — technical reference

### pixel-karen-scale-integration

Reason:

- contains proven foot-anchor scale logic
- contains 48 / 44 / 41 comparison controls
- may be reused after an accepted Chibi Karen visual exists

Restriction:

> Do not reuse its old visual verdict.

This branch is a technical reference only.

---

## NEXT ACTIVE VISUAL BRANCH

Not created yet at the time of this document.

Planned name:

`pixel-karen-chibi-direction`

It must branch from the current cleaned `pixel-karen-acting-prototype`.

First gate:

> front-facing Chibi Karen Idle only

---

## SAFE DELETION CANDIDATES

The following branches are superseded or already merged into their intended base.

- art-bible-v2-provisional
- character-visual-identity-lock
- pixel-karen-phase2-eval
- pixel-karen-phase2-gate-fix
- pixel-karen-phase2-result
- pixel-karen-runtime-doc-fixes
- pixel-karen-visual-refinement
- pixel-karen-visual-refinement-v2
- pixel-native-direction-study
- pixel-native-phase2-go-decision
- repo-hygiene-current-state
- visual-foundation-sync

Their useful history is already represented by merged commits, closed PRs, or the active prototype branch.

---

## HISTORICAL VISUAL REFERENCES — DELETE AFTER NO LONGER NEEDED

### pixel-karen-visual-anchor-redesign

Superseded visual direction.

The user rejected this direction after direct image review.

PR #12 is closed and marked superseded.

### pixel-karen-visual-redesign-v3

Alternative superseded visual experiment.

Keep only until the new Chibi front-Idle direction is approved, then delete.

---

## TRANSIENT REPOSITORY-MAINTENANCE BRANCHES

Branches created only for repository maintenance should be deleted after their PR is merged.

Examples:

- repo-actions-consolidation
- repo-branch-retention

---

## Open PR policy

The only long-lived open PR should be the active integration/prototype PR.

Current intended open PR:

- #6 — Karen Pixel Acting technical prototype base — DO NOT MERGE YET

Superseded experiment PRs should remain closed.

---

## Branch safety rule

Before deleting any branch:

1. confirm no open PR uses it
2. confirm its unique work is merged or intentionally abandoned
3. preserve any reusable technical implementation elsewhere if needed
4. never delete `main`
5. never delete the active prototype base

