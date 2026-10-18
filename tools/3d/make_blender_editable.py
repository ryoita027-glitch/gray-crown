"""Blender 4.x: open modular Karen GLB, attach mechanical pilot bones,
expose left/right face controls, and SAVE an editable .blend.

Example:
 blender -b --python tools/3d/make_blender_editable.py -- \
   assets/3d/karen_stage_a_blockout.glb assets/3d/karen_stage_a_editable.blend

This is rigid-bone proof-of-structure, NOT production retopology, skin weights,
final blend shapes, facial animation, or game-ready run/walk choreography.
"""
import bpy
import sys
from pathlib import Path

def args():
 values=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
 if len(values)!=2:raise SystemExit('Usage: blender -b --python make_blender_editable.py -- input.glb output.blend')
 return Path(values[0]).resolve(),Path(values[1]).resolve()

def parent_to_bone(obj,rig,bone):
 old=obj.matrix_world.copy()
 obj.parent=rig;obj.parent_type='BONE';obj.parent_bone=bone
 obj.matrix_world=old

def driver(ob,channel,axis,controller,prop,formula):
 d=ob.driver_add(channel,axis).driver
 d.type='SCRIPTED'
 v=d.variables.new();v.name='c'
 v.targets[0].id_type='OBJECT';v.targets[0].id=controller
 v.targets[0].data_path='["'+prop+'"]'
 d.expression=formula

def build():
 src,dest=args()
 if not src.is_file():raise FileNotFoundError(src)
 bpy.ops.object.select_all(action='SELECT')
 bpy.ops.object.delete(use_global=False)
 bpy.ops.import_scene.gltf(filepath=str(src))
 parts=[o for o in bpy.context.scene.objects if o.type=='MESH']
 names={o.name for o in parts}
 for key in ('face/head_base','face/nose_editable','hair/low_partial_tie','equipment/right_hip_scabbard_placeholder'):
  if key not in names:raise RuntimeError('Missing '+key)
 if len(parts)<50:raise RuntimeError('Expected >=50 modular parts')
 for prefix in ('face','hair','clothing','body','equipment'):
  coll=bpy.data.collections.new('GC_'+prefix)
  bpy.context.scene.collection.children.link(coll)
  for o in [o for o in parts if o.name.startswith(prefix+'/')]:
   for old in list(o.users_collection):old.objects.unlink(o)
   coll.objects.link(o)
 data=bpy.data.armatures.new('GC_PrototypeArmature')
 rig=bpy.data.objects.new('GC_PrototypeRig',data)
 bpy.context.scene.collection.objects.link(rig)
 bpy.context.view_layer.objects.active=rig
 rig.select_set(True)
 bpy.ops.object.mode_set(mode='EDIT')
 # Rigid segment bones; final deformation topology and shared rig pending.
 bones=[
 ('root',(0,0,.03),(0,0,.4),None),
 ('pelvis',(0,0,1.10),(0,0,1.48),'root'),
 ('spine',(0,0,1.48),(0,0,2.10),'pelvis'),
 ('neck',(0,0,2.09),(0,0,2.36),'spine'),
 ('head',(0,0,2.36),(0,0,3.13),'neck'),
 ('thigh.L',(-.19,0,1.18),(-.19,0,.77),'pelvis'),
 ('shin.L',(-.19,0,.77),(-.19,0,.20),'thigh.L'),
 ('thigh.R',(.19,0,1.18),(.19,0,.77),'pelvis'),
 ('shin.R',(.19,0,.77),(.19,0,.20),'thigh.R'),
 ('upper_arm.L',(-.4,0,2.01),(-.48,0,1.73),'spine'),
 ('hand.L',(-.48,0,1.73),(-.50,0,1.35),'upper_arm.L'),
 ('upper_arm.R',(.4,0,2.01),(.48,0,1.73),'spine'),
 ('hand.R',(.48,0,1.73),(.50,0,1.35),'upper_arm.R')]
 for name,head,tail,parent in bones:
  b=data.edit_bones.new(name);b.head=head;b.tail=tail
 for name,head,tail,parent in bones:
  if parent:data.edit_bones[name].parent=data.edit_bones[parent]
 bpy.ops.object.mode_set(mode='OBJECT')
 rig.select_set(False)
 for o in parts:
  n=o.name
  if n.startswith(('face/','hair/')):bone='head'
  elif n.startswith('body/boot_'):bone='shin.L' if n.endswith('_L') else 'shin.R'
  elif n.startswith(('body/trousers_','body/trouser_cuff_')):bone='thigh.L' if n.endswith('_L') else 'thigh.R'
  elif n.startswith(('body/hand_','clothing/sleeve_cuff_')):bone='hand.L' if n.endswith('_L') else 'hand.R'
  elif n.startswith(('body/shoulder_','body/sleeve_')):bone='upper_arm.L' if n.endswith('_L') else 'upper_arm.R'
  elif n.startswith('body/neck'):bone='neck'
  elif n.startswith(('body/hips','clothing/belt','equipment/')):bone='pelvis'
  else:bone='spine'
  parent_to_bone(o,rig,bone)
 controls=bpy.data.objects.new('GC_ExpressionControls',None)
 bpy.context.scene.collection.objects.link(controls)
 controls.empty_display_type='SPHERE';controls.empty_display_size=.12
 controls.location=(.9,0,2.85)
 for name in ('blink_L','blink_R','browRaise_L','browRaise_R','smile','mouthOpen','lookX','lookY'):
  controls[name]=0.0
  controls.id_properties_ui(name).update(min=-1.0 if name.startswith('look') else 0.0,max=1.0)
 lookup={o.name:o for o in parts}
 for side in ('L','R'):
  for part in ('sclera','iris_placeholder','pupil','shine'):
   o=lookup.get('face/eye_'+side+'/'+part)
   if o:driver(o,'scale',2,controls,'blink_'+side,'max(0.12,1.0-0.88*c)')
  b=lookup.get('face/brow_'+side+'_segment1')
  if b:driver(b,'location',2,controls,'browRaise_'+side,'0.12*c')
 lip=lookup.get('face/mouth/lower_lip')
 if lip:driver(lip,'scale',2,controls,'mouthOpen','1+3*c')
 # Control keyframe samples are NOT satisfactory facial poses or blendshapes.
 samples=[
  ('neutral',0,0,0,0,0,0),('smile',0,0,.1,.1,.7,0),
  ('joy',0,0,.2,.2,1,.8),('angry',0,0,0,0,0,.4),
  ('sad',0,0,.3,.3,0,0),('surprised',0,0,.9,.9,0,1),
  ('confused',0,0,0,.8,.1,.2),('serious',0,0,0,0,0,0),
  ('pain',.4,.4,.2,.2,0,.6),('eyes_closed',1,1,0,0,0,0)]
 for index,(name,bL,bR,brL,brR,smile,mouth) in enumerate(samples):
  frame=1+index*10
  for key,value in [('blink_L',bL),('blink_R',bR),('browRaise_L',brL),('browRaise_R',brR),('smile',smile),('mouthOpen',mouth)]:
   controls[key]=value
   controls.keyframe_insert(data_path='["'+key+'"]',frame=frame)
  bpy.context.scene.timeline_markers.new('EXP_'+name,frame=frame)
 bpy.context.scene.frame_set(1)
 dest.parent.mkdir(parents=True,exist_ok=True)
 bpy.ops.wm.save_as_mainfile(filepath=str(dest))
 print('EDITABLE BLEND SAVED:',dest,'PART COUNT',len(parts))
 print('NOT FINAL: rigid-bone / basic face-control blockout; no art acceptance')

if __name__=='__main__':build()
