#!/usr/bin/env python3
"""Same-state actual Ryune game-canvas V17/V18 four-way A/B. Requires local checkout + Chromium."""
import base64,hashlib,io,json
from pathlib import Path
from PIL import Image,ImageChops,ImageDraw
from playwright.sync_api import sync_playwright
from browser_launch import launch_chromium
import browser_vertical_slice_e2e_test as helper
import browser_margaret_live_idle_ab_e2e as baseline

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/margaret_v18_real_canvas'
SOURCES={
 'v17a':'assets/character_trials/margaret_idle_face_planes_v17A.png',
 'v17b':'assets/character_trials/margaret_idle_face_planes_v17B.png',
 'v18a':'assets/character_trials/margaret_idle_robe_plane_v18A.png',
 'v18b':'assets/character_trials/margaret_idle_robe_plane_v18B.png'
}
LOCKS={
 SOURCES['v17a']:'cba3c319f54fd88cd8f3975e5c4459f237dd8e8e',
 SOURCES['v18a']:'b69006bcef6671a91c1e621ca1c2f2b326a8a71e',
 SOURCES['v18b']:'d16d42eab4574aabe37557fec59cd352f3dc68b6'
}
VIEWS=(('desktop',1365,900),('phone',390,844))
DIRECTIONS=('down','left','right','up')

def diff(a,b):
 delta=ImageChops.difference(a,b)
 channels=delta.split()
 mask=ImageChops.lighter(ImageChops.lighter(channels[0],channels[1]),channels[2])
 return sum(bool(p) for p in mask.getdata()),mask.getbbox()

def review(view,direction,shots):
 assert [s['key'] for s in shots]==list(SOURCES)
 assert all(s['canvas']==[768,480] for s in shots)
 assert all(s['state']==shots[0]['state'] and s['visual']==shots[0]['visual'] for s in shots)
 assert all(s['calls']>0 and s['nonIdleCalls']==0 for s in shots)
 pictures=[];records=[]
 for shot in shots:
  data=base64.b64decode(shot['png']);im=Image.open(io.BytesIO(data)).convert('RGB')
  name=f'{view}_{direction}_{shot["key"]}.png'
  (OUT/name).write_bytes(data)
  pictures.append(im);records.append({'file':name,'sha256':hashlib.sha256(data).hexdigest()})
 metrics={}
 for i in (2,3):
  count,bbox=diff(pictures[0],pictures[i])
  assert 0<count<2500 and bbox is not None,(view,direction,i,count)
  assert bbox[2]-bbox[0]<=48 and bbox[3]-bbox[1]<=48,(view,direction,bbox)
  metrics[shots[i]['key']]={'changed_rgb_pixels':count,'bbox':bbox}
 board=Image.new('RGB',(768*4,510),'#242424')
 pen=ImageDraw.Draw(board)
 for i,pic in enumerate(pictures):
  board.paste(pic,(768*i,30));pen.text((768*i+10,9),shots[i]['key'],fill='white')
 board_name=f'{view}_{direction}_full_scene.png';board.save(OUT/board_name)
 bbox=metrics['v18a']['bbox'];cx=(bbox[0]+bbox[2])//2;cy=(bbox[1]+bbox[3])//2
 x0=max(0,min(640,cx-64));y0=max(0,min(352,cy-64))
 detail=Image.new('RGB',(1024,284),'#242424');pen=ImageDraw.Draw(detail)
 for i,pic in enumerate(pictures):
  crop=pic.crop((x0,y0,x0+128,y0+128))
  detail.paste(crop.resize((256,256),Image.Resampling.NEAREST),(256*i,28))
  pen.text((256*i+8,8),shots[i]['key'],fill='white')
 detail_name=f'{view}_{direction}_detail_2x.png';detail.save(OUT/detail_name)
 return {'view':view,'direction':direction,'shots':records,'full_scene':board_name,
         'detail':detail_name,'metrics':metrics,'same_state':True,'art_verdict':'HOLD'}

def main():
 OUT.mkdir(parents=True,exist_ok=True)
 for name,sha in LOCKS.items():
  data=(ROOT/name).read_bytes()
  actual=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
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
 manifest={'kind':'real game canvas, seeded Ryune state, not story playthrough',
           'head':helper.source_head(),'shots':32,'boards':8,'detail_boards':8,
           'art_verdict':'HOLD; human visual review required','records':records}
 (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({'shots':32,'boards':8,'head':manifest['head'],'art_verdict':'HOLD'}))
if __name__=='__main__':main()
