# Gray Crown — Next Work Order

## Completed

- Karen locked.
- Triton Second Character Validation PASS.
- Sophie visual direction approved.
- **Sophie Chibi Direction Lock v1** established.
- **Sophie Acting Reference v1** established.

## Active task

# **Sophie 4-direction + 8Animation implementation**

Do not redesign Sophie again.

### Step 1 — 4-direction technical translation

Translate the approved four-view reference into:

- 48×48 source cells;
- down / left / right / up;
- grounded foot anchor;
- Medium44 readability.

Verify:

- face remains attractive;
- honey-hair silhouette survives;
- small adult body remains distinct;
- cream / green hierarchy survives;
- hands remain readable.

### Step 2 — eight animation categories

Implement:

1. Idle
2. Walk
3. Turn
4. Talk
5. Surprise
6. Approach
7. Laugh
8. Run

Use Sophie-specific acting from `SOPHIE_ACTING_REFERENCE_v1.md`.

### Step 3 — gameplay / scale

Compare locked Karen + Triton + Sophie in actual game.

Check:

- separate identities;
- Medium44;
- Full48;
- Compact41;
- village/background readability;
- Walk / Talk / Laugh especially;
- control restoration;
- Save schema 23.

### Step 4 — CI

Run:

- asset existence / frame dimensions;
- deterministic generation where applicable;
- Karen hash;
- Triton lock hash;
- Sophie source/runtime consistency;
- Node regression;
- browser E2E;
- scale validation.

## Next human gate

After technical evidence is complete:

> **Sophie Character Validation — PASS / REVISE**

## Paused

- Margaret;
- Environment Prototype;
- main merge;
- formal Pixel-native adoption;
- Portrait deletion;
- NPC scale migration;
- v24.
