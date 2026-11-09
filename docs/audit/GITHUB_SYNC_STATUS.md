# GitHub Sync Status

Inspected 2026-10-06 JST. This is an audit snapshot.
See `CURRENT_PROJECT_STATE.md` for current authority and `NEXT_WORK_ORDER.md` for the handoff.

- Production remains main / v23 at `d689aabb5146c9f45466a4f74f397e664c08fb4f`.
- PR #6 is the technical foundation; PR #17 adds approved Karen Chibi animation; PR #18 adds the Chibi scale experiment.
- Latest implemented experimental HEAD: `5fcbcf2703acf7c228941ac386e7c5c958caa035`.
- The reserved Triton branch initially points at exactly that commit; it is not evidence of completed Triton work.
- Successful animation and scale runs: 37384493234 / 37386602760. Each integration HEAD adds only its result document after the tested commit.
- `repo-karen-integration-handoff` repairs current-state documents and consolidates CI on the experimental stack. It does not alter main.

No branch was deleted during this pass. Refer to `BRANCH_RETENTION.md`; preserve open-PR bases and historical evidence. Automatic asset commits are removed in the maintenance branch; generate locally, commit deliberately, and verify through the read-only PR gate.

Before subsequent writes, fetch fresh branch heads and affected blob SHAs. Use an expected-SHA ref update and never force over concurrent work.
