# QA source navigation and frozen-candidate gate (2026-11-04)

This is a navigation and verification note, **not** a replacement for live source or an approval to merge.

## Verified locations (read from GitHub tree at frozen PR #98 SHA)

The three project-state documents are **not** at the root of `docs/`. Their actual paths are:

- [Current project state](../audit/CURRENT_PROJECT_STATE.md)
- [Next work order](../audit/NEXT_WORK_ORDER.md)
- [Visual source-of-truth status](../visual/SOURCE_OF_TRUTH_STATUS.md)

These documents describe the **2026-10-10 Phase 1 baseline** and are historical context for later QA. Do not interpret their original development target as a newer integration candidate without checking current GitHub commits and PRs.

## Exact integrated QA candidate

- PR: https://github.com/ryoita027-glitch/gray-crown/pull/98
- Frozen SHA: `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`
- Acceptance checklist: [INTEGRATED_HEAD_ACCEPTANCE_20261019.md](../qa/INTEGRATED_HEAD_ACCEPTANCE_20261019.md)
- CI blocker: https://github.com/ryoita027-glitch/gray-crown/issues/46
- Failed run: https://github.com/ryoita027-glitch/gray-crown/actions/runs/39153456330

At inspection on 2026-11-04, GitHub Actions' latest listed run in this repository was still the 2026-10-18 failed exact-SHA run. Both checks had two annotations and failed before test steps; **this does not constitute a failed gameplay assertion**. November runner availability and annotation text are not verified. Do not consume minutes by rerunning blindly.

## Required next evidence (same exact SHA)

1. Obtain the two check-run annotation messages and confirm account-side Actions budget/runner availability.
2. Run the frozen SHA's full `npm run check` and browser acceptance, retaining actual logs and screenshots.
3. Compare real field/battle captures at 100% zoom; do not substitute reconstructed sprite boards.
4. Keep Save schema 23, Story 00–19, and all art decisions unchanged unless separately reviewed.

**Status: HOLD / NO-GO.** This note changes no gameplay, art, tests, CI triggers, or release authority.

## 2026-11-04 follow-up: runner failure independently rechecked

Read-only GitHub API evidence for run `39153456330`:

| Job | Job ID | Runner ID | Steps | Result |
| --- | --- | --- | --- | --- |
| `integrated-acceptance` | `117751680775` | `0` | `[]` | failure |
| `runner-diagnostic` | `117751680993` | `0` | `[]` | failure |

Both jobs were created at `2026-10-18T18:17:08Z` and completed at `18:17:10Z`; both requested `ubuntu-latest`. The exact frozen SHA has two check runs, each reporting `annotations_count=2`. The generic repository fetch interface rejects `/check-runs/{id}/annotations` as an unsupported URL, so **annotation text remains unknown**. These observations establish a pre-runner failure, **not** its precise billing, policy, or account-level cause. Do not attribute it conclusively to exhausted minutes without the account-side billing or annotation message.

Reproduction links: [jobs API](https://api.github.com/repos/ryoita027-glitch/gray-crown/actions/runs/39153456330/jobs), [check-runs API](https://api.github.com/repos/ryoita027-glitch/gray-crown/commits/075f9cb7dc0321361ad1a8674adbc0938ce3ed8c/check-runs). No rerun was initiated. Resume with an authorized check-annotations read and Actions billing status, then exact-SHA local tests. Do not change the frozen SHA or relax acceptance gates.
