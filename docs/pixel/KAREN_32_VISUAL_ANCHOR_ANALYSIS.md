# KAREN_32_VISUAL_ANCHOR_ANALYSIS.md

## Gray Crown — Karen 32px Visual Anchor Analysis

**Status:** PHASE 3 REDIRECTION / VISUAL REDESIGN INPUT  
**Technical architecture:** GO  
**Current Phase 2 Karen visual:** FAIL / REDESIGN REQUIRED  
**Source branch:** `pixel-karen-acting-prototype`  
**Do not merge to main.**

---

# 1. Why this analysis exists

Phase 2 proved that 48×48 source cells give Karen more room for body acting.

However, direct comparison against the current 32px Karen shows that the revised 48px design lost several qualities that matter more than raw detail:

- cuteness
- face cohesion
- visual lightness
- protagonist readability
- hair appeal
- quick, readable silhouette

Therefore the next step is **not** to justify the current Phase 2 design through scaling.

The goal is:

> **Translate the appeal logic of the old 32px Karen into a new 48px design, while keeping the 48px animation performance.**

The old sprite is a **Visual Anchor**, not a final design to copy.

---

# 2. Measured 32px anchor characteristics

The current Karen row in `assets/hero_party_walk.png` uses a 32×32 cell.

Representative frame occupancy is approximately:

- visible body width: **17px**
- visible body height: **25–26px**
- transparent margin remains around the actor
- palette per frame is very small: roughly **7–8 visible colors**

This matters.

The 32px Karen does not try to fill the cell or explain every clothing detail.

Her readability comes from **large, clean masses**.

---

# 3. What makes the 32px Karen attractive

## 3.1 Compact face mass

The face is small and visually contained.

It does not spend pixels on:

- a long nose
- a detailed mouth
- cheek anatomy
- complex eye construction

The hair frames the face, and the face reads as one warm, simple central area.

Result:

> The viewer reads “friendly heroine” before reading anatomy.

This is one major reason the sprite feels lighter and cuter.

---

## 3.2 Hair is a shape, not a texture field

The old Karen hair works as one large red-brown silhouette.

It has:

- a clear top mass
- readable side framing
- simple back mass
- no internal noise
- no attempt to render strands

Even when the exact locked low partial tie is not fully represented, the hair is **coherent**.

The new 48px design must add the partial tie without breaking that coherence.

---

## 3.3 Strong face-to-hair contrast

The face is warm/light.

The hair is darker red-brown.

The boundary is simple and immediate.

The current Phase 2 48px version adds more contour and facial structure, but the extra information weakens the single readable face unit.

New rule:

> **At gameplay distance, face cohesion is more important than facial detail.**

---

# 4. Body proportion anchor

The 32px Karen is stylized, but her body is visually light.

Important traits:

- head is prominent without becoming a square block
- torso is short
- lower body is simple
- arms do not form heavy dark masses
- legs are clearly separated
- equipment does not dominate the body

The current Phase 2 version feels heavier because:

- torso is more rectangular
- outline density is higher
- pants / boots / equipment collect into a dark lower mass
- the side profile has too much anatomical explanation

New 48px target:

> **Adult proportions through silhouette and posture, not through adding more anatomical pixels.**

---

# 5. Color-mass lesson

The old 32px sprite succeeds with a few obvious masses:

1. red-brown hair
2. warm light face / sleeves
3. muted red torso
4. dark separated legs
5. small bright equipment accent

No region is overloaded.

For the new 48px Karen:

- hair must stay a red-brown protagonist mass, not a muddy brown volume
- off-white shirt must remain visible around the vest
- muted red vest should be the main torso accent
- pants and boots must separate instead of becoming one dark column
- sword / pouch must be secondary accents

---

# 6. Silhouette lesson

The 32px Karen has a simple “top mass + light torso + red core + two legs” read.

The current Phase 2 48px design became too vertically dense and rectangular.

New silhouette principles:

- crown of hair should be rounded / stepped, not square
- cheek / jaw should taper inward
- shoulders should be slightly narrower than the widest hair point
- vest should taper slightly toward the waist
- hips and legs should separate cleanly
- boots should not merge into one dark base
- loose hair should frame, not engulf, the torso

---

# 7. Side-view lesson

Current Phase 2 side profile problem:

- nose / mouth projection is too explicit
- face length becomes noticeable
- head reads more as a block profile than a compact heroine face

New side-view rule:

- nose = at most a **1px controlled projection**
- mouth = implied by 1px or omitted at normal scale
- forehead-to-nose line stays compact
- jaw returns quickly toward neck
- hair silhouette carries more of the identity than facial anatomy

---

# 8. Cute vs childish

The redesign must recover cuteness **without turning Karen into a child**.

Adult readability should come from:

- longer leg proportion than a child sprite
- narrower torso than head/hair width
- stable shoulder-to-hip relationship
- confident forward posture
- less oversized eye treatment
- practical equipment placement
- animation timing

Do **not** solve “cute” by:

- making the head huge
- shortening the legs excessively
- giving baby proportions
- using giant eyes

---

# 9. Hair redesign target

Must retain:

- red-brown / brighter red family
- low partial tie
- loose hair below it
- two-layer structure
- movement response

But the shape should be simplified into:

### Main hair mass
A rounded, readable cap and side framing.

### Loose lower mass
One controlled back/side shape.

### Partial tie
A small, unmistakable knot / gathered section near the lower back-side of the head.

The tie should be a **silhouette hook**, not a cluster of detail pixels.

---

# 10. Torso redesign target

The Phase 2 box torso is rejected.

New torso:

- off-white shirt visible at shoulders / sleeves
- short muted-red vest as a compact central color mass
- slight waist taper
- belt sits clearly below vest
- arms remain visually separate from torso

The vest should feel like a short work garment, not armor.

---

# 11. Lower-body redesign target

Avoid one dark block.

Use:

- medium neutral pants
- darker boots
- one-pixel separation / negative-space cues between legs
- small pouch
- right-hip sword as a narrow secondary shape

The lower half should support motion rather than visually anchor Karen to the ground.

---

# 12. Animation translation

Keep exactly the same eight categories:

- Idle
- Walk
- Turn
- Talk
- Surprise
- Approach
- Laugh
- Run

Do not add animations.

Redesign goal by animation:

### Idle
Compact, forward-ready, light.

### Walk
Quick rhythm without exaggerated bouncing.

### Turn
Hair shape turns clearly; face stays compact.

### Talk
One readable arm gesture, not repeated waving.

### Surprise
Whole body reacts, but head does not balloon.

### Approach
Torso leads forward slightly.

### Laugh
Open shoulders / body lift; not generic vertical bounce.

### Run
Hair and partial tie trail; legs remain readable and adult.

---

# 13. 48px design strategy

The 48×48 source cell remains.

But the new design should **not use added pixels merely because they exist**.

Use the extra resolution for:

- cleaner stepped curves
- one more meaningful silhouette break
- readable hand / sleeve direction
- partial tie
- leg separation
- animation arcs

Do not use it for:

- face micro-detail
- heavy outlining
- extra equipment texture
- extra shadow noise

---

# 14. New design acceptance gate

Before any scale integration test, the new 48px Karen must beat Phase 2 on:

1. face cohesion
2. hair appeal
3. lightness
4. protagonist readability
5. adult-but-cute balance
6. torso silhouette
7. lower-body separation

And must preserve:

- Karen B — VILLAGE RUNNER
- 23-year-old adult impression
- red hair
- low partial tie
- off-white + muted red color mass
- left-handed identity
- anatomical right-hip sword
- eight-animation structure

Only after this visual gate passes may World Scale Integration resume.

---

# 15. Decision state

Current state:

- Technical Architecture: **GO**
- Pixel-native direction: **CONTINUE**
- Current Phase 2 Karen Visual: **FAIL**
- Current Phase 2 Scale-only fix: **NOT ACCEPTED AS FINAL PATH**
- 32px Karen: **VISUAL ANCHOR**
- Next action: **REDESIGN NEW 48px KAREN**
- Scale Integration: **DEFERRED UNTIL REDESIGN PASSES**

