# 2026-10-31 — North-road landmark and readable approach (09:46 JST)

## Repository evidence (verified)
- main HEAD: `d689aabb5146c9f45466a4f74f397e664c08fb4f`. This change branches from exact PR [#157](https://github.com/ryoita027-glitch/gray-crown/pull/157) HEAD `15fe32fc9e1fa7a1b248ce7a3dc9a09afce46d70`, which stacks on #155 → #153 → #146. Do not merge this branch alone to main.
- Existing `northroad` was a straight 2-tile-wide, 15-row corridor. The milestone at (9,6) stood on unmarked grass, away from the road, and its drawn board falsely said **「王都 近道」** despite no shortcut; interacting instead said 「アルディナ王都まで三里」. The scout is at (12,3). Both direct forest and fort arrivals reach this same map and set `northRoadFromRoad` to control south return.
- Existing route-specific scout acknowledgement and one-time herb reward in #157 remain unchanged. Save v23, NPC coordinates, exit objects, story order and all original passable road tiles remain unchanged.

## External player signal (checked 2026-10-31 JST)
- [Chained Echoes Steam reviews](https://steamcommunity.com/app/1229240/reviews/): Oct 29 negative review says an unobvious doorway led to repeated searching; Oct 28 positive review appreciates small environmental details. **Observed individual opinions**, not a sample representative of players.
- [Octopath Traveler II Steam reviews](https://steamcommunity.com/app/1971650/reviews/): Oct 26 and 29 negative reviews criticize tedious story/dialogue repetition. **Observed individual opinions**; not direct evidence about map layout.
- **Hypothesis (unverified):** A worn path leading to a truthful physical stone marker will make the optional landmark discoverable without an explicit tutorial, and make the route feel less like an empty straight corridor. Physical route traces may help differentiate forest-road and fort arrival. No Steam content or level geometry was copied.

## Implemented player-facing slice
1. Keep the existing 2-tile-wide north/south route. Add a short **walkable dirt spur** to the already-existing milestone at (9,6) and a small layby beside the scout, not an extra quest or larger map.
2. Replace the erroneous wooden **「王都 近道」** sign with a distinct stone mile marker engraved **「王都」** with a north-pointing arrow. Its interaction still provides the exact route-specific south-return explanation from #157.
3. Paint restrained worn edges on the spur. Forest-road arrival shows wheel ruts on the southern approach; old-fort arrival shows stone grit. These are decorative marks on existing passable tiles, never false pickups or obstacles.
4. Add `tests/northroad_milestone_wayfinding.test.js` for reachability, geometry, the visible marker label, route-specific text and draw-side-effect checks.

## Verification and release gate
- **Passed (source-only):** V8 syntax parsing of edited `js/data/maps.js` and `js/render/world.js`; 15×24 north-road generator geometry, the original exit tile and added milestone spur. Source edits were saved to a separate GitHub branch.
- **Not run:** full Node harness test, `npm test`, `npm run check`, real browser walk, actual rendered-pixel visual comparison, Save/Continue integration and human first-play testing. Private GitHub clone is unavailable from local container due DNS resolution failure. Tests are committed but not yet executed against the complete runtime.
- **HOLD:** Do not call this a commercially accepted improvement or merge to main until exact-SHA gameplay validation.
- **Next:** run two real paths (forest → milestone → scout → capital and old fort → milestone → scout → capital); observe whether the milestone is found without prompts and whether the stone / ruts remain readable at native scale. Fix false pickups and visual occlusion before adding any more detours.
