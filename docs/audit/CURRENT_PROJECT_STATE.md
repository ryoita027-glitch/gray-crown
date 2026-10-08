# Gray Crown — Current Project State

Status: 2026-10-08 JST.

## Production

Production remains **main / v23 / Save schema 23 / Story 00–19**.

Pixel-native protagonist work remains isolated on prototype branches and is not merged to main.

## Four protagonists

### Karen — VILLAGE RUNNER
- approved and frozen Visual Regression Control;
- eight runtime animation categories remain byte-locked;
- no quality-harmonization rewrite was required.

### Triton — GROUND ANCHOR
- **Triton Second Character Validation PASS**;
- locked control;
- no quality-harmonization rewrite was required.

### Sophie — STEADY HANDS
- user-approved identity preserved;
- active technical source: **Sophie Chibi Direction Lock v2**;
- v2 removes repeated detached micro-pixel debris found by the unified cast audit;
- eight runtime categories are cleaned and hash-pinned;
- no face/body/acting redesign was introduced.

Authority:
- `docs/pixel/SOPHIE_CHIBI_DIRECTION_LOCK_v2.md`
- `docs/pixel/SOPHIE_ACTING_REFERENCE_v1.md`
- `docs/pixel/reference/sophie_chibi_direction_lock_v2_48.png`

### Margaret
- v4 runtime reached full technical integration but the user rejected its face as too crushed;
- active prototype source: **Margaret Chibi Direction Lock v5**;
- v5 preserves face/head pixels at 1:1 and avoids the destructive v4 head resampling;
- all eight runtime categories have been regenerated from v5;
- exact eye color, surname, final weapon/costume, magic language and emblems remain unresolved.

Authority:
- `docs/pixel/MARGARET_CHIBI_DIRECTION_LOCK_v5.md`
- `docs/pixel/reference/margaret_chibi_direction_lock_v5_48.png`

## Unified four-protagonist quality gate

Active cast standard:

`docs/pixel/FOUR_PROTAGONIST_QUALITY_STANDARD_v1.md`

Exact Medium44 evidence before promotion measured:

- Karen: 24×40 visible px;
- Triton: 26×40;
- Sophie: 28×36;
- Margaret v5: 28×40.

All normalized front-silhouette pairwise IoU values remain below the 0.90 collision threshold. Sophie / Margaret is 0.8262 and therefore remains a soft-review watch item for the environment gate.

The quality audit identified two real corrections:
1. Sophie repeated detached top-of-head debris;
2. Margaret v4 face compression.

Karen and Triton remained controls.

## Current gate

# **FOUR PROTAGONIST RUNTIME HARMONIZATION — FINAL GREEN**

The source/runtime promotion and final validation are complete on the prototype branch.

Validated head: `12c6deaf1849985c946c6e291be41828e2f4d77b`.

Confirmed green:
- Sophie browser E2E;
- Margaret browser E2E;
- exact four-character Medium44 quality gate;
- full Gray Crown regression;
- Karen/Triton lock re-verification;
- Triton completion gate.

The prior frontier story-test flake was traced to synthetic keypress timing versus the production movement cooldown and stabilized in the E2E harness only. Production movement behavior remains unchanged.

## Next after green

Proceed to **four-protagonist environment integration** using the existing environment prototype evidence:

- Ryune village;
- grass field / road;
- house exterior;
- house interior.

The objective will be to prove that all four actors read correctly together in actual world scenes before any formal Pixel-native adoption decision.

## Still not authorized

- merge to main;
- formal game-wide Pixel-native adoption;
- Portrait deletion;
- NPC mass migration;
- battle-sprite migration;
- v24 production scope.
