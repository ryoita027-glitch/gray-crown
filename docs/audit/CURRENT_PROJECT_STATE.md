# Gray Crown — Current Project State

**Repository:** ryoita027-glitch/gray-crown  
**Canonical production branch:** `main`  
**Game baseline:** v23  
**Save schema:** 23  
**Status date:** 2026-10-06

---

## 1. Production truth

`main` remains the production baseline.

Current production rules:

- Story 00–19 remains the completed range.
- Existing 32×32 hero walking sprite remains **ACTIVE runtime / PROVISIONAL design**.
- Four protagonist Visual Identities remain locked.
- Art Bible v2 remains provisional.
- No Pixel-native experiment is formally adopted into production.
- Do not start v24 as part of the current visual work.

---

## 2. Pixel-native technical status

Primary technical prototype branch:

`pixel-karen-acting-prototype`

This branch proves the experimental technical foundation:

- 48×48 source-cell actor support
- eight Karen animation categories
- SceneRunner / transient cinematic control
- camera focus and return
- Portrait ON / OFF comparison
- Motion Only comparison
- legacy 32px comparison
- Developer Mode launch path
- regression and browser evidence workflow

**Technical architecture verdict: GO for continued prototyping.**

This is not the same as formal Pixel-native adoption.

---

## 3. Karen visual decision

The previously tested realistic / adult-proportion 48px Karen directions are **not accepted as final visual direction**.

The selected next visual direction is:

> **Cute Chibi Pixel RPG heroine**

Target principles:

- large head / compact body
- readable, attractive face
- large expressive eyes
- nose minimized
- short torso and shorter legs
- strong red-hair silhouette
- low partial tie retained
- warm off-white + muted-red Stage A identity retained
- 23-year-old adult identity expressed through clothing, posture, behavior and presence rather than realistic head-to-body proportion

Do not copy a specific commercial sprite or character. Use the chibi pixel-RPG design language as reference only.

---

## 4. Experimental branches

### Keep as technical base

`pixel-karen-acting-prototype`

### Keep temporarily as technical reference

`pixel-karen-scale-integration`

Its foot-anchor scaling / 48-vs-44-vs-41 comparison implementation may be reused later.

Its old visual verdict must **not** be reused.

### Superseded visual experiments

- `pixel-karen-visual-anchor-redesign`
- `pixel-karen-visual-redesign-v3`
- older Karen refinement / Phase 2 helper branches

These are historical comparison material, not active visual direction.

---

## 5. Active next step

Do not continue mass animation production yet.

The next visual implementation should start from the proven technical prototype and create a new dedicated branch, for example:

`pixel-karen-chibi-direction`

First gate:

> Create only one front-facing Karen Idle candidate and obtain user visual approval.

Do not proceed to:

- side/back views
- eight-animation expansion
- Scale Integration
- Triton
- Portrait removal
- Pixel-native formal adoption
- main merge

until the front Idle visual direction is approved.

---

## 6. Later order

After the Chibi Karen front Idle is approved:

1. four-direction Idle
2. eight animation categories
3. Karen + Mika scene
4. old 32px baseline comparison
5. Portrait ON / OFF comparison
6. scale integration rerun using the accepted visual
7. Karen final prototype verdict
8. Triton second-character validation
9. Pixel Character Standard v1
10. Sophie / Margaret validation
11. only then consider formal Pixel-native adoption

---

## 7. Locked unresolved items

Do not invent or canonize:

- exact hero eye colors
- hero surnames
- final weapon designs / names
- final Stage B hero costumes
- Kingdom / Empire emblems
- hero certification insignia
- religious emblem / official religious color
- Shion crown
- military rank insignia
- new keepsakes / scars / backstory additions

---

## 8. GitHub hygiene rule

Before any write:

1. fetch the target branch HEAD
2. fetch the current file blob SHA
3. compare concurrent work
4. never overwrite a newer branch from a stale SHA

Experimental work should use a dedicated branch and PR.

`main` should receive only explicitly approved production or repository-hygiene changes.
