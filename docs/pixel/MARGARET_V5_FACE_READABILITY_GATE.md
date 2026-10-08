# Margaret v5 Face Readability Gate

Status: **CANDIDATE / USER VISUAL REVIEW REQUIRED**

## Why this gate exists

Margaret v4 solved the large-scale occupancy mismatch, but the 44px result compressed the facial pixels too aggressively. The user explicitly rejected the result as "顔つぶれすぎ".

The next priority is therefore not new game systems and not more animation work. It is to repair Margaret's source face while preserving the already-improved body occupancy and ponytail identity.

## v5 technical rule

v5 is generated from the previously approved v2 four-direction source, but unlike v4:

- the head and face pixels are kept at exact 1:1 scale;
- only the lower body is widened to preserve four-character occupancy balance;
- the added dark silhouette is restricted to the external boundary;
- internal transparent face/hair gaps are not outlined or filled;
- the 44px comparison is built mechanically from the exact committed Karen, Triton and Sophie runtime PNGs.

## Safety / scope

v5 is a candidate only.

Until the user approves the exact Medium44 board:

- do not replace `docs/pixel/reference/margaret_chibi_direction_lock_v4_48.png`;
- do not regenerate or commit the eight Margaret runtime animation PNGs from v5;
- do not change `animations.js`;
- do not merge PR #29 to main.

After visual approval, promote v5 to the direction lock, then regenerate all eight animations and rerun browser/full regression tests.
