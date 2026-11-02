#!/usr/bin/env python3
"""Real Ryune same-state V18A vs V19: full game Canvas, NOT a sprite-only mock.

Requires full local checkout, Pillow, Playwright and Chromium; no paid runner.
"""
import base64,hashlib,io,json
from pathlib import Path
from PIL import Image,ImageChops,ImageDraw
from playwright.sync_api import sync_playwright
from browser_launch import launch_chromium
import browser_vertical_slice_e2e_test as helper
import browser_margaret_live_idle_ab_e2e as baseline

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/margaret_v19_real_canvas'
SOURCES={
 'live_walk':None,
 'original_idle':'assets/characters/margaret/margaret_idle.png',
 'v18a':'assets/character_trials/margaret_idle_robe_plane_v18A.png',
 'v19':'assets/character_trials/margaret_idle_silhouette_sculpt_v19.png'
}
LOCKS={
 SOURCES['original_idle']:'910458eabfcfaef7442f885f319d0e2a09c88a66',
 SOURCES['v18a']:'b69006bcef6671a91c1e621ca1c2f2b326a8a71e',
 SOURCES['v19']:'db3fd3301dfbe5f60cb5195a31eb5d6c8e36bd3e'
}
VIEWS=(('desktop',1365,900),('phone',390,844))
DIRECTIONS=('down','left','right','up')

def diff(a,b):
 delta=ImageChops.difference(a,b)
 r,g,bl=delta.split()
 mask=ImageChops.lighter(ImageChops.lighter(r,g),bl)
 return sum(bool(v) for v in mask.getdata()),mask.getbbox()

def review(view,direction,shots):
 assert [s['key'] for s in shots]==list(SOURCES)
 assert all(s['canvas']==[768,480] for s in shots)
 assert all(s['state']==shots[0]['state'] and s['visual']==shots[0]['visual'] for s in shots),'scene drift'
 assert all(s['calls']>0 and s['nonIdleCalls']==0 for s in shots),'Margaret not idle-frame drawn'
 pictures=[];records=[]
 for s in shots:
  data=base64.b64decode(s['png'])
  im=Image.open(io.BytesIO(data)).convert('RGB')
  assert im.size==(768,480)
  name=f'{view}_{direction}_{s["key"]}.png'
  (OUT/name).write_bytes(data)
  pictures.append(im)
  records.append({'key':s['key'],'file':name,'sha256':hashlib.sha256(data).hexdigest()})
 n,bbox=diff(pictures[2],pictures[3])
 assert 0<n<2500 and bbox is not None,(view,direction,n,bbox)
 assert bbox[2]-bbox[0]<=48 and bbox[3]-bbox[1]<=48,(view,direction,bbox)
 baseline_count,baseline_bbox=diff(pictures[0],pictures[1])
 board=Image.new('RGB',(3072,510),'#242424');pen=ImageDraw.Draw(board)
 for i,pic in enumerate(pictures):
  board.paste(pic,(i*768,30));pen.text((i*768+12,8),shots[i]['key'],fill='white')
 full=f'{view}_{direction}_full_scene.png';board.save(OUT/full)
 cx=(bbox[0]+bbox[2])//2;cy=(bbox[1]+bbox[3])//2
 x0=max(0,min(640,cx-64));y0=max(0,min(352,cy-64))
 detail=Image.new('RGB',(1024,284),'#242424');pen=ImageDraw.Draw(detail)
 for i,pic in enumerate(pictures):
  crop=pic.crop((x0,y0,x0+128,y0+128))
  detail.paste(crop.resize((256,256),Image.Resampling.NEAREST),(i*256,28))
  pen.text((i*256+8,8),shots[i]['key'],fill='white')
 detail_name=f'{view}_{direction}_detail_2x.png';detail.save(OUT/detail_name)
 return {'view':view,'direction':direction,'shots':records,'full':full,'detail':detail_name,
         'v18a_vs_v19':{'changed_rgb_pixels':n,'bbox':bbox,'same_pose':True},
         'live_walk_vs_original_idle':{'changed_rgb_pixels':baseline_count,'bbox':baseline_bbox,'same_pose':False},
         'same_scene_state':True,'art_verdict':'HOLD'}

def main():
 OUT.mkdir(parents=True,exist_ok=True)
 for name,sha in LOCKS.items():
  data=(ROOT/name).read_bytes()
  actual=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\\0'+data).hexdigest()
  assert actual==sha,(name,actual)
 baseline.SOURCES=SOURCES
 records=[]
 with helper.served() as url,sync_playwright() as pw:
  browser=launch_chromium(pw)
  try:
   for view,width,height in VIEWS:
    page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    try:
     page.goto(url,wait_until='networkidle')
     page.locator('#titleNewGame').click()
     helper.clean_dialogue(page)
     page.wait_for_function("""() => ['karen','triton','sophie','margaret'].every(id=>GC.Render.World.heroRuntimeStatus()[id]?.ready)""",timeout=20000)
     page.wait_for_function("""() => typeof OpeningPixelAssets!=='undefined' && OpeningPixelAssets.featuredStatus().ready && !OpeningPixelAssets.featuredStatus().failed""",timeout=20000)
     for direction in DIRECTIONS:
      records.append(review(view,direction,baseline.capture_four(page,direction)))
     assert not errors,errors
    finally:page.close()
  finally:browser.close()
 manifest={'kind':'actual Ryune game Canvas, seeded same-state scene, not full story playthrough',
           'head':helper.source_head(),'shots':32,'boards':8,'detail_boards':8,
           'art_verdict':'HOLD; visual review required','records':records}
 (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({'shots':32,'boards':8,'head':manifest['head'],'art_verdict':'HOLD'}))
if __name__=='__main__':main()
