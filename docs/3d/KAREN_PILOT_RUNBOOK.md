# Karen 3D Pilot — Execution and acceptance runbook

## Prerequisites

- This is an unmerged **experiment** branch, not the commercial build.
- Python 3.10+ recommended; install isolated dependencies:
  `python -m pip install -r tools/3d/requirements-3d.txt`
- Blender 4.x for editable .blend generation. It is not available in the assistant's container, so no executed Blender proof is claimed.
- Browser with WebGL2 for interactive viewer; file picker works without network/CDN.
- DO NOT overwrite existing source art or merge unrelated Draft PRs.

## Build the real GLB

From repository root:

```bash
python tools/3d/create_karen_prototype.py assets/3d/karen_stage_a_blockout.glb
python tools/3d/check_karen_glb.py assets/3d/karen_stage_a_blockout.glb
```

Expected modular stage-A prototype: 80 independent geometry nodes, around 12k triangles. It is a **non-final geometric blockout** only.

## View the actual GLB

- Open `tools/3d/karen_viewer.html` in a WebGL2 browser.
- Select `assets/3d/karen_stage_a_blockout.glb` in the file picker.
- Switch front, 3/4, side and back. Drag to rotate. The viewer is a limited inspection implementation, not a full glTF runtime.
- If the browser prohibits local scripts, start an HTTP server in repository root: `python -m http.server 8000`, then open `http://localhost:8000/tools/3d/karen_viewer.html`.

## Use the opt-in REAL game visual overlay

- Generate the GLB first.
- Open `index.html?gc3d=1` from this experiment branch, or `http://localhost:8000/index.html?gc3d=1`.
- In the top bar, choose the generated GLB. Then select New Game.
- Check the 3D Karen overlay during field movement. All other characters remain 2D.
- Remove `?gc3d=1` or reload the ordinary URL to return to original 2D.
- The experiment does not modify save schema, narrative, input bindings or battle logic. The pilot deliberately does **not** replace battle art.
- If WebGL2 / GLB parsing fails, the 2D sprite remains the fallback. No model path is stored in save data.

## Generate an editable Blender project (unverified until executed)

```bash
blender -b --python tools/3d/make_blender_editable.py -- \
  assets/3d/karen_stage_a_blockout.glb assets/3d/karen_stage_a_editable.blend
```

Reopen the .blend and verify each part's independent edit, no seam after nose edits, controller values and four viewports. The script creates rigid pilot bones and expression-control test frames, **not** final skinning or ten natural expressions. Export from Blender only after inspections. Keep the .blend and generated GLB separately.

## Quality and verification gates

1. Identity: redraw/retopologize using visual lock B / VILLAGE RUNNER, check against the latest candidate Karen reference while marking unaccepted assumptions.
2. Art: side/front/back views at normal game zoom must beat the original and have no seams, buggy eyes, doll-like accessories, clay hair or segmented clothing.
3. Interoperability: verify source GLB, editable .blend, re-export GLB, 2D fallback, no changed save/event IDs.
4. Browser: obtain Chromium and mobile screenshot A/B at SAME HEAD; this was impossible in the present environment because Chromium was blocked by administrator.
5. Performance: measure actual laptop/phone 60/30fps; don't extrapolate from triangle count.
6. Narrative/system: Node test suite + browser vertical slice on same commit; new prototype unit tests alone are not integration acceptance.
7. Signoff: only after genuine player-view improvement can this work be merged/expanded to other protagonists.

## Run status as of 2026-10-19

- Python GLB generated, imported again, and independently checked.
- JS GLB parser unit cases run in local Node runtime.
- Browser WebGL2 rendering **not** confirmed: local Chromium pages were administratively blocked; on about:blank WebGL2 was unavailable.
- Blender save, production-ready controls, rig performance and game screenshots **not** confirmed.
- No game branch merged. No final art approved.
