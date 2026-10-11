# Three Route Commitment Gate v2

Status: candidate. The existing Kingdom and Empire endings remain playable skeletons, not completed final chapters.

The Karma record distinguishes explicit lethal decisions and mercy decisions using existing `events.choices`. Ordinary combat incapacitation does not count as killing. A lethal decision merely **opens discussion** of the Ash Crown route; it does not force it.

Selecting Ash Crown first plays objections from Margaret, Sophie and Triton. The player must then explicitly commit or reconsider; only confirmation sets `state.finalChoice='ashcrown'` and a commitment marker. This is a narrative safety gate for player agency, not a full two-nation conquest campaign. The current empty throne is still labeled provisional.

Unfinished: faction reputation, legitimate/non-lethal leadership path, companion departures, AI tactical consequences, the full three late-game routes, art/music, in-browser and save roundtrip tests. Do not describe these as complete.
