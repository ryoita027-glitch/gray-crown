# Branch Retention — 2026-10-06 audit

## Keep active

| Branch | Reason |
|---|---|
| main | Production v23 |
| pixel-karen-acting-prototype | PR #6 head, PR #17 base |
| pixel-karen-chibi-direction | PR #17 head, PR #18 base |
| pixel-karen-chibi-scale-integration | PR #18 head, latest implemented experiment |
| pixel-triton-second-character-validation | Reserved next-character branch; initially identical to scale HEAD |
| repo-karen-integration-handoff | Current CI and handoff maintenance |

Several draft PRs are intentional: they form a dependency stack. Do not close them merely to enforce an obsolete single-open-PR rule.

## Retain as references until checked

`pixel-karen-scale-integration` contains earlier reusable scale techniques, but its old visual verdict is not authoritative.
`pixel-karen-visual-anchor-redesign` and `pixel-karen-visual-redesign-v3` are superseded visual comparisons.

## Cleanup candidates, not deletion authorization

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
- repo-actions-consolidation
- repo-actions-finalize
- ci-finalize-triggers
- repo-branch-retention

Before deletion, recheck open PR head/base use, commits unique to the branch, and whether useful work is merged or explicitly abandoned. Preserve recoverable references. This pass deletes no branches and does not claim repository-wide cleanup is complete.
