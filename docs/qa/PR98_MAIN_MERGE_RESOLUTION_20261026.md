# Gray Crown — PR #98 / main merge-compatibility audit (2026-10-26)

Status: **DRAFT, HOLD, NO MERGE TO MAIN**. This records a mechanically resolved Git merge conflict. It is **not** gameplay validation, visual acceptance, or release approval.

## Inputs (immutable commits)

- Candidate PR #98: `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`
- Existing `main`: `d689aabb5146c9f45466a4f74f397e664c08fb4f`
- Merge base: `af23e901755f20fa26bec61fe73bb83b00b38098`

PR #98 and `main` diverged: PR #98 had 932 commits ahead and was one commit behind. GitHub reported `mergeable_state=dirty`. The one main-only commit added `docs/audit/BRANCH_RETENTION.md` and changed `docs/audit/FILE_HYGIENE.md`.

## Deliberate and minimal three-way resolution

- `docs/audit/BRANCH_RETENTION.md`: both sides added different versions after the merge base (add/add conflict). Keep PR #98's newer 2026-10-06 preservation policy as the merge-tree content. The historical 2026-10-05 main document remains accessible through the main parent commit. **This does not authorize deletion or adoption of any old branch policy.**
- `docs/audit/FILE_HYGIENE.md`: take the main 2026-10-05 cleanup documentation; PR #98's version is byte-identical to the merge base, so this is an ordinary non-conflicting main change.
- Every other game/code/PNG/test file: keep exact PR #98 tree contents. Do not cherry-pick any art experiment, weaken checks, or change Story 00–19 or Save schema 23.
- Make a **two-parent merge commit** with PR #98 and current main as parents on a separate QA branch. The original PR #98 HEAD and the pinned snapshot must not move.

## Required evidence before calling this accepted

1. Verify PR #98, `main`, and merge candidate commit SHA; compare the actual tree change against PR #98. Apart from this audit, the only intentional file content difference is `docs/audit/FILE_HYGIENE.md`.
2. Verify compare `main...merge-candidate` is ahead, **behind=0**, and that the new Draft PR to main is GitHub mergeable. Never infer test success from that.
3. Reproduce and identify Actions runner-allocation failure using check-run annotations: Issue #46, run 39153456330 had `runner_id=0`, `steps=[]`, `failure`. The text of the two annotations is not exposed through the connected GitHub API. Inspect GitHub Actions budget/payment/permissions and runner allocation in GitHub UI before retrying runs; do not guess the reason.
4. Once runtime is available, run the **new merge-candidate exact HEAD** through `npm run check`, vertical slice, actual Chromium, Save/Load, 3-route tests, mobile visuals and packaged-build checks. Historical passes do not cover this SHA.
5. Require explicit review of art and full game before any main merge.

This branch solves one Git DAG merge conflict only and remains **QA / NO-GO** until independent acceptance evidence exists.
