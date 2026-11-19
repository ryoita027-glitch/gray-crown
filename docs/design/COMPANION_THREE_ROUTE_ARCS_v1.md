# Three Route Companion Arcs — candidate 2026-10-11

These are **new branch-specific epilogue setup scenes**, not a completed campaign.

Kingdom: Karen decides whether to prioritize civilian evacuation or follow the royal operational plan. Triton volunteers to cover retreat, Sophie argues for civilian safety, Margaret asks what victory means. The outcome is stored as `state.events.choices['route.companions.kingdom']`.

Empire: The party faces its own nation's soldiers. The decision is to demand protection of surrendered prisoners or first halt troop advances, with different companion commentary. Saved as `route.companions.empire`.

Ash Crown: Sophie and Margaret reject blind obedience and Triton challenges Karen. The player may allow them to leave or demand allegiance. Companion disagreement is explicit; demanding allegiance does **not** grant actual control of them. Saved as `route.companions.ashcrown`.

All three choices add a specific journal entry. Existing `events.choices` supports save/load without a schema increment. These events trigger from already-existing final-path decision dialogue; no quest state gates are changed.

**Not complete:** three fully playable ending chapters, actual party roster departure/combat AI effects, staged conquest, unique art/music, Chromium walkthrough, real save/reload verification. Tests were authored; automated test execution must be performed in a checkout before merge.
