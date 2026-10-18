#!/usr/bin/env python3
"""Reproducible NON-FINAL Karen Stage-A stylized 3D blockout.

Original sprites and locked design are reference-only, never overwritten.
Usage: python tools/3d/create_karen_prototype.py [output.glb]
Requires Python with numpy and trimesh>=4. This creates a real GLB, NOT .blend.
"""
from __future__ import annotations
import math
import sys
from pathlib import Path
import numpy as np
import trimesh
from trimesh.transformations import rotation_matrix

PALETTE={
 'skin':[205,151,119,255],'skin_light':[227,181,149,255],'skin_shadow':[183,119,101,255],
 'hair':[151,57,52,255],'hair_dark':[94,38,39,255],'hair_light':[200,93,72,255],
 'vest':[132,50,48,255],'vest_light':[170,68,60,255],
 'shirt':[224,213,186,255],'shirt_shadow':[183,173,151,255],
 'trousers':[89,83,75,255],'trousers_light':[117,108,95,255],
 'leather':[79,55,44,255],'leather_light':[132,91,60,255],
 'metal':[165,163,157,255],'eye_white':[247,223,203,255],
 'iris_unapproved':[75,57,52,255],'pupil':[38,32,33,255],
 'mouth':[122,52,50,255],'lip':[182,104,94,255]
}
scene=trimesh.Scene()
registry=[]

def put(name,mesh,material):
 if name in registry:raise ValueError('duplicate part '+name)
 mesh.visual=trimesh.visual.ColorVisuals(mesh,face_colors=np.asarray(PALETTE[material],dtype=np.uint8))
 scene.add_geometry(mesh,node_name=name,geom_name=name)
 registry.append(name)
 return mesh

def ellipsoid(name,loc,rad,mat,subdiv=2):
 m=trimesh.creation.icosphere(subdivisions=subdiv,radius=1)
 m.apply_scale(rad)
 m.apply_translation(loc)
 return put(name,m,mat)

def segment(name,a,b,r0,r1,mat,sides=10):
 a,b=np.asarray(a,float),np.asarray(b,float)
 axis=b-a;h=np.linalg.norm(axis)
 if h==0:raise ValueError(name)
 theta=np.linspace(0,2*np.pi,sides,endpoint=False)
 lo=np.array([[r0*np.cos(t),r0*np.sin(t),-h/2] for t in theta])
 hi=np.array([[r1*np.cos(t),r1*np.sin(t),h/2] for t in theta])
 verts=np.vstack([lo,hi,[[0,0,-h/2]],[[0,0,h/2]]])
 faces=[]
 for j in range(sides):
  k=(j+1)%sides
  faces.extend([[j,k,sides+k],[j,sides+k,sides+j],[2*sides,k,j],[2*sides+1,sides+j,sides+k]])
 m=trimesh.Trimesh(vertices=verts,faces=faces,process=False)
 m.apply_transform(trimesh.geometry.align_vectors([0,0,1],axis/h))
 m.apply_translation((a+b)/2)
 return put(name,m,mat)

def panel(name,outline,mat,thickness=.04):
 """Watertight planar workwear panel; individually editable."""
 points=np.asarray(outline,dtype=float);n=len(points)
 verts=np.vstack([points,points+np.array([0,thickness,0])])
 faces=[]
 for i in range(1,n-1):
  faces.extend([[0,i,i+1],[n,n+i+1,n+i]])
 for i in range(n):
  j=(i+1)%n
  faces.extend([[i,j,n+j],[i,n+j,n+i]])
 return put(name,trimesh.Trimesh(vertices=verts,faces=faces,process=False),mat)

def tube(name,points,radii,mat):
 for i,(a,b) in enumerate(zip(points[:-1],points[1:])):
  segment(f'{name}_segment{i+1}',a,b,radii[i],radii[i+1],mat,8)

# Separate clothing + anatomical parts for revision; chibi proportions,
# adult workwear, no unapproved ornament or canon eye colour.
for side,sgn in [('L',-1),('R',1)]:
 x=sgn*.18
 ellipsoid(f'body/boot_{side}',(x,-.068,.24),(.175,.255,.25),'leather',1)
 ellipsoid(f'body/boot_toe_{side}',(x,-.21,.135),(.17,.17,.12),'leather_light',1)
 segment(f'body/trousers_{side}',(x,0,.51),(x,0,1.19),.145,.18,'trousers',12)
 segment(f'body/trouser_cuff_{side}',(x,0,.48),(x,0,.61),.158,.158,'trousers_light',12)
ellipsoid('body/hips',(0,.025,1.20),(.39,.265,.30),'trousers')
ellipsoid('body/shirt_torso',(0,0,1.67),(.39,.27,.54),'shirt')
panel('clothing/vest_back',[(-.34,.225,1.48),(-.33,.245,2.02),(-.19,.247,2.11),(.19,.247,2.11),(.33,.245,2.02),(.34,.225,1.48)],'vest',.035)
panel('clothing/vest_front_L',[(-.345,-.19,1.49),(-.34,-.16,2.02),(-.20,-.28,2.08),(-.075,-.285,1.90),(-.082,-.315,1.49)],'vest',.025)
panel('clothing/vest_front_R',[(.082,-.315,1.49),(.075,-.285,1.90),(.20,-.28,2.08),(.34,-.16,2.02),(.345,-.19,1.49)],'vest',.025)
panel('clothing/vest_left_fold',[(-.090,-.316,1.49),(-.095,-.318,1.85),(-.066,-.30,1.92),(-.063,-.31,1.49)],'vest_light',.018)
panel('clothing/vest_right_fold',[(.063,-.31,1.49),(.066,-.30,1.92),(.095,-.318,1.85),(.090,-.316,1.49)],'vest_light',.018)
segment('clothing/belt',(-.39,-.05,1.37),(.39,-.05,1.37),.055,.055,'leather',12)
ellipsoid('clothing/belt_buckle',(0,-.315,1.37),(.08,.029,.063),'metal',1)
# A neutral scabbard stand-in only: sword design is NOT locked.
segment('equipment/right_hip_scabbard_placeholder',(.40,.00,1.36),(.48,-.065,.71),.085,.051,'leather',10)
segment('equipment/right_hip_scabbard_binding',(.415,-.012,1.25),(.435,-.02,1.15),.099,.09,'leather_light',10)
ellipsoid('equipment/left_hip_small_pouch',(-.39,-.008,1.20),(.15,.13,.18),'leather_light',1)
for side,sgn in [('L',-1),('R',1)]:
 x=sgn*.42
 ellipsoid(f'body/shoulder_{side}',(x,0,1.98),(.166,.18,.19),'shirt',1)
 segment(f'body/sleeve_{side}',(x,0,1.89),(sgn*.49,-.045,1.48),.135,.112,'shirt',12)
 ellipsoid(f'body/hand_{side}',(sgn*.505,-.08,1.38),(.11,.11,.155),'skin')
 segment(f'clothing/sleeve_cuff_{side}',(sgn*.48,-.04,1.49),(sgn*.50,-.06,1.54),.143,.151,'shirt_shadow',10)
ellipsoid('body/neck',(0,0,2.22),(.14,.14,.21),'skin')
ellipsoid('face/head_base',(0,-.02,2.74),(.50,.415,.565),'skin',3)
ellipsoid('face/jaw_soft',(0,-.205,2.42),(.30,.19,.145),'skin')
for side,sgn in [('L',-1),('R',1)]:
 ellipsoid(f'face/ear_{side}',(sgn*.49,.02,2.73),(.13,.09,.19),'skin_light')
 ellipsoid(f'face/cheek_{side}',(sgn*.275,-.361,2.63),(.136,.017,.064),'skin')
 ellipsoid(f'face/eye_{side}/sclera',(sgn*.219,-.414,2.858),(.148,.036,.154),'eye_white')
 ellipsoid(f'face/eye_{side}/iris_placeholder',(sgn*.219,-.466,2.852),(.094,.018,.124),'iris_unapproved')
 ellipsoid(f'face/eye_{side}/pupil',(sgn*.218,-.489,2.85),(.055,.012,.099),'pupil')
 ellipsoid(f'face/eye_{side}/shine',(sgn*.183,-.505,2.905),(.027,.010,.039),'eye_white',1)
 tube(f'face/eye_{side}/upper_lid',[(sgn*.375,-.43,2.948),(sgn*.22,-.476,3.050),(sgn*.078,-.419,2.955)],[.030,.036,.021],'hair_dark')
 tube(f'face/eye_{side}/lower_lid',[(sgn*.35,-.431,2.762),(sgn*.205,-.435,2.725),(sgn*.102,-.412,2.788)],[.016,.018,.010],'skin_shadow')
 tube(f'face/brow_{side}',[(sgn*.36,-.402,3.119),(sgn*.20,-.448,3.157),(sgn*.09,-.411,3.136)],[.028,.033,.018],'hair_dark')
 tube(f'face/lashes_{side}',[(sgn*.359,-.441,2.976),(sgn*.41,-.42,3.020),(sgn*.432,-.401,3.035)],[.021,.014,.003],'hair_dark')
ellipsoid('face/nose_editable',(0,-.422,2.68),(.034,.028,.048),'skin_light')
ellipsoid('face/mouth/lower_lip',(0,-.409,2.508),(.103,.012,.022),'lip')
tube('face/mouth/upper_lip_curve',[(-.125,-.434,2.54),(0,-.450,2.517),(.125,-.434,2.54)],[.009,.012,.009],'mouth')
# Front fringe, back hair, side locks, partial low tie are separable.
ellipsoid('hair/crown',(0,.102,3.123),(.527,.435,.328),'hair')
ellipsoid('hair/back_upper',(0,.288,2.905),(.50,.257,.45),'hair_dark')
for side,sgn in [('L',-1),('R',1)]:
 ellipsoid(f'hair/side_{side}',(sgn*.449,.102,2.802),(.176,.315,.43),'hair')
 ellipsoid(f'hair/back_loose_{side}',(sgn*.28,.37,2.536),(.225,.20,.44),'hair')
 ellipsoid(f'hair/side_tip_{side}',(sgn*.467,-.16,2.595),(.110,.145,.22),'hair_light',1)
tube('hair/fringe_centre',[(.03,-.31,3.36),(-.07,-.415,3.20),(-.09,-.43,3.08)],[.16,.115,.014],'hair')
tube('hair/fringe_short_left',[(-.25,-.27,3.37),(-.36,-.37,3.21),(-.345,-.39,3.10)],[.14,.11,.012],'hair_light')
tube('hair/fringe_long_right',[(.31,-.27,3.37),(.315,-.40,3.15),(.405,-.43,2.935)],[.16,.095,.013],'hair')
ellipsoid('hair/low_partial_tie',(0,.480,2.617),(.13,.105,.105),'hair_dark')
segment('hair/low_tie_fabric',(-.205,.505,2.62),(.205,.505,2.62),.045,.045,'leather_light',10)
ellipsoid('hair/low_tied_lock',(0,.54,2.36),(.165,.14,.255),'hair')

if __name__=='__main__':
 dest=Path(sys.argv[1]) if len(sys.argv)>1 else Path('assets/3d/karen_stage_a_blockout.glb')
 dest.parent.mkdir(parents=True,exist_ok=True)
 scene.export(dest,file_type='glb')
 print(f'Created {dest} with {len(registry)} independent nodes')
 print('NON-FINAL geometric blockout, NOT approved game art or full facial rig')
