# Margaret: original design preserved — 2026-11-18

## User direction

The user likes the original Margaret and explicitly rejected the new face, body and costume redesign. "Harmonize with the party" means preserve her existing cuteness, face, hairstyle, clothing and silhouette; it does not authorize substituting a plainer or more generic design. The attempted v8 replacements are withdrawn, absent from the active repository and not published or bundled. Do not revive them as approved artwork.

## Final change

All original character PNGs, animation definitions and source paths remain unchanged. Margaret retains her high ponytail, existing face/eyes, purple costume and all original poses. A conservative display-only palette adjustment slightly reduces blue bias in light violet pixels. It never changes coordinates, alpha, red channels, frame dimensions or source data. Dark outfit colors and warm skin colors outside the selection are untouched. Other characters receive no palette adjustment.

Selection: opaque pixels with R>=100, G>=90, B>R+6, B>G+10 and B-G<90. G moves 20% of the positive R-G gap toward R, B moves 25% of B-R toward R. This selects light cool hues, not an anatomical mask; no claim that it exclusively selects hair pixels. Field and cinematic cached sources identify Margaret by her existing path; battle explicitly passes the hero identity, including standalone embedded images. This is deliberately a small color change, not a claim that all style differences are solved.

## Evidence

`tools/render_margaret_palette_evidence.cjs` decodes all eight actual Margaret atlases and runs the shipped palette function. All alpha values before/after are identical. 53,166 of 105,720 opaque pixels receive a small green/blue adjustment; this is pixel count, not a 50% color shift. Full four-character rows compare the same idle pose and scale; the third row shows four original Margaret directions. Offline Canvas rendering is not a browser screenshot.

424 Node tests pass, including explicit invariants for the light-violet color calculation, dark outfit/skin retention and non-Margaret colors. Source/standalone DOM interaction tests, JS syntax, authority, hygiene, immutable-source runtime cleanup, six Python release tests and playable builds pass. Browser layout, audio and actual-browser Save/Continue remain unverified because of the previously observed Chromium socket restriction. No bypass was attempted. No main merge or commercial-quality sign-off.
