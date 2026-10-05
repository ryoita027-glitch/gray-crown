# FILE_HYGIENE.md

## Completed cleanup

Repository hygiene completed on the current v23 baseline:

- added `.gitignore`
- removed tracked Python `__pycache__` / `*.pyc`
- removed `assets/hero_party_walk_whitehair.png`
  - it was byte-identical to `assets/hero_party_walk.png`
  - no repository references were found
- added `docs/audit/CURRENT_PROJECT_STATE.md`
- synchronized current-state pointers in README / audit / visual status documents

## Keep for rollback / archive

Keep these until a later explicit cleanup decision:

- `assets/hero_party_walk_v23_original.png`
- `assets/hero_party_walk_replacement.png`

They are not byte-identical to the active runtime asset and may still be useful for rollback/comparison.

## Historical root reports

The versioned root `.txt` reports are legacy release/history records.

Do not mass-delete or reorganize them during the Pixel prototype phase unless a dedicated documentation migration is approved.

## Generated files policy

Do not commit:

- `__pycache__/`
- `*.pyc`
- Playwright report directories
- local test output
- OS/editor junk

See repository `.gitignore`.

## Branch hygiene

See:

`docs/audit/BRANCH_RETENTION.md`

for the current branch keep/delete policy.

## Version terminology

Use:

> **Game Baseline v23 / Character Visual Patch rev 23.1**

Do not change release/package version only to match the visual patch unless explicitly decided.
