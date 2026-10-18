"""Strict model format / independent node checks; NOT a beauty review."""
import sys
from pathlib import Path
import trimesh

NEEDED={
 'face/head_base','face/nose_editable','face/mouth/lower_lip',
 'face/eye_L/sclera','face/eye_R/sclera',
 'face/eye_L/iris_placeholder','face/eye_R/iris_placeholder',
 'face/eye_L/pupil','face/eye_R/pupil',
 'hair/crown','hair/fringe_centre_segment1','hair/low_partial_tie',
 'clothing/vest_back','body/shirt_torso',
 'equipment/right_hip_scabbard_placeholder'
}

def check(path):
 f=Path(path)
 if f.suffix!='.glb':raise AssertionError('Only GLB accepted')
 scene=trimesh.load(f,force='scene')
 nodes=set(scene.graph.nodes_geometry)
 missing=NEEDED-nodes
 if missing:raise AssertionError('Missing independent nodes: '+', '.join(sorted(missing)))
 if len(nodes)<50:raise AssertionError('Too few independently editable nodes')
 if len(scene.geometry)!=len(nodes):raise AssertionError('Several components share geometry')
 if any(not g.is_watertight for g in scene.geometry.values()):
  raise AssertionError('Open/unclosed geometry in blockout')
 verts=sum(len(g.vertices) for g in scene.geometry.values())
 tris=sum(len(g.faces) for g in scene.geometry.values())
 if tris>50000:raise AssertionError('Technical prototype triangle budget exceeded')
 if scene.bounds[1][2]-scene.bounds[0][2]<3:raise AssertionError('Unexpected model scale')
 print(f'PASS: {len(nodes)} independent nodes, {verts} vertices, {tris} triangles, {f.stat().st_size} bytes. Art quality NOT evaluated')

if __name__=='__main__':
 check(sys.argv[1] if len(sys.argv)>1 else 'assets/3d/karen_stage_a_blockout.glb')
