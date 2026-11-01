#!/usr/bin/env python3
"""HOLD-only live Ryune canvas evidence: current walk vs approved idle vs V11.
Run locally: python tests/browser_margaret_silhouette_v11_live_ab.py
No CI or paid Actions required. Does not approve or change production assets.
"""
import base64
import io
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright
from browser_launch import launch_chromium
import browser_vertical_slice_e2e_test as helper

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/margaret_silhouette_v11_live'
VIEWS=(('desktop',1365,900),('phone',390,844))
DIRECTIONS=('down','left','right','up')
SOURCES={
    'live_walk':None,
    'approved_idle':'assets/characters/margaret/margaret_idle.png',
    'v11_trial':'assets/character_trials/margaret_idle_silhouette_v11.png',
}

def capture(page,direction):
    return page.evaluate("""async ({direction,sources}) => {
      const world=GC.Render.World,s=GC.State.get(),v=world.VISUAL;
      const size=GC.Data.Animations.artDisplaySize;
      const old={map:s.map,x:s.x,y:s.y,dir:s.dir,trail:s.trail,
        worldStepsOnMap:s.worldStepsOnMap};
      const pictures={};
      for(const [key,url] of Object.entries(sources)){
        if(!url)continue;
        const img=new Image();img.src=url;await img.decode();
        if(img.naturalWidth!==192||img.naturalHeight!==192)throw Error('bad atlas '+key);
        pictures[key]=img;
      }
      const now=Date.now,raf=window.requestAnimationFrame,cancel=window.cancelAnimationFrame;
      const timeout=window.setTimeout,clear=window.clearTimeout;
      const draw=CanvasRenderingContext2D.prototype.drawImage;
      const acting=GC.CommercialActing,actingDraws=acting?.draws;
      cancel(v.raf);clear(v.ambientTimer);
      Date.now=()=>1793509200000;
      window.requestAnimationFrame=()=>0;window.cancelAnimationFrame=()=>{};
      window.setTimeout=()=>0;window.clearTimeout=()=>{};
      GC.Data.Animations.artDisplaySize=44;
      if(actingDraws)acting.draws=function(id,...args){
        if(id==='margaret')return false;
        return actingDraws.call(this,id,...args);
      };
      s.map='village';s.x=9;s.y=8;s.dir=direction;s.trail=[];s.worldStepsOnMap=0;
      const shots=[];
      try{
        for(const key of Object.keys(sources)){
          let calls=0,nonIdle=0;
          CanvasRenderingContext2D.prototype.drawImage=function(...args){
            const src=args[0]?.currentSrc||args[0]?.src||'';
            if(typeof src==='string'&&
               /assets\/characters\/margaret\/margaret_walk\.png(?:[?#]|$)/.test(src)&&
               args.length===9&&args[3]===48&&args[4]===48){
              calls++;if(args[1]!==0)nonIdle++;
              if(pictures[key])args[0]=pictures[key];
            }
            return draw.apply(this,args);
          };
          v.map=null;v.lastActingFrame=0;v.travelPhase=0;
          v.followerPhases=[0,0,0];v.followerFaces=[direction,direction,direction];
          world.drawScene();
          const canvas=document.querySelector('#game');
          shots.push({key,png:canvas.toDataURL('image/png').split(',')[1],
            calls,nonIdle,canvas:[canvas.width,canvas.height],
            state:{map:s.map,x:s.x,y:s.y,dir:s.dir},
            camera:[v.camX,v.camY]});
        }
      }finally{
        CanvasRenderingContext2D.prototype.drawImage=draw;
        if(actingDraws)acting.draws=actingDraws;
        GC.Data.Animations.artDisplaySize=size;Date.now=now;
        window.requestAnimationFrame=raf;window.cancelAnimationFrame=cancel;
        window.setTimeout=timeout;window.clearTimeout=clear;
        Object.assign(s,old);v.map=null;v.raf=0;v.ambientTimer=0;world.draw();
      }
      return shots;
    }""", {'direction':direction,'sources':SOURCES})

def compare(view,direction,shots):
    assert [s['key'] for s in shots]==list(SOURCES)
    assert all(s['calls']>0 and s['nonIdle']==0 for s in shots)
    assert all(s['canvas']==[768,480] for s in shots)
    assert all(s['state']==shots[0]['state'] and s['camera']==shots[0]['camera']
               for s in shots), 'scene drift'
    pics=[]
    for s in shots:
        data=base64.b64decode(s['png'])
        picture=Image.open(io.BytesIO(data)).convert('RGB')
        (OUT/f"{view}_{direction}_{s['key']}.png").write_bytes(data)
        pics.append(picture)
    diff=ImageChops.difference(pics[1],pics[2])
    mask=ImageChops.lighter(ImageChops.lighter(*diff.split()[:2]),diff.split()[2])
    bbox=mask.getbbox()
    assert bbox is not None, 'V11 not visible in live canvas'
    assert (bbox[2]-bbox[0])<=60 and (bbox[3]-bbox[1])<=60, 'unrelated scene changed'
    board=Image.new('RGB',(768*3,510),'#242424')
    pen=ImageDraw.Draw(board)
    for i,p in enumerate(pics):
        board.paste(p,(768*i,30))
        pen.text((768*i+10,8),list(SOURCES)[i],fill='white')
    board.save(OUT/f'{view}_{direction}_full_AB.png')
    cx=(bbox[0]+bbox[2])//2;cy=(bbox[1]+bbox[3])//2
    x0=max(0,min(640,cx-64));y0=max(0,min(352,cy-64))
    detail=Image.new('RGB',(256*3,282),'#242424')
    pen=ImageDraw.Draw(detail)
    for i,p in enumerate(pics):
        crop=p.crop((x0,y0,x0+128,y0+128))
        detail.paste(crop.resize((256,256),Image.Resampling.NEAREST),(256*i,26))
        pen.text((256*i+8,7),list(SOURCES)[i],fill='white')
    detail.save(OUT/f'{view}_{direction}_detail_AB.png')
    return {'view':view,'direction':direction,'diff_bbox':bbox,
            'full':f'{view}_{direction}_full_AB.png',
            'detail':f'{view}_{direction}_detail_AB.png'}

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    records=[]
    with helper.served() as url,sync_playwright() as pw:
        browser=launch_chromium(pw)
        try:
            for view,width,height in VIEWS:
                page=browser.new_page(viewport={'width':width,'height':height},
                                      device_scale_factor=1)
                errors=[]
                page.on('pageerror',lambda error:errors.append(str(error)))
                try:
                    page.goto(url,wait_until='networkidle')
                    page.locator('#titleNewGame').click()
                    helper.clean_dialogue(page)
                    page.wait_for_function("""() => ['karen','triton','sophie','margaret'].every(
                      id=>GC.Render.World.heroRuntimeStatus()[id]?.ready)""",timeout=20000)
                    for direction in DIRECTIONS:
                        records.append(compare(view,direction,capture(page,direction)))
                    assert not errors,errors
                finally:
                    page.close()
        finally:
            browser.close()
    manifest={'type':'real game canvas; live walk / approved idle / V11 trial',
              'art_verdict':'HOLD; manual visual approval required',
              'shots':24,'boards':8,'details':8,
              'source_head':helper.source_head(),'pairs':records}
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),
                                     encoding='utf-8')
    print(json.dumps({'shots':24,'boards':8,'details':8,'art_verdict':'HOLD'}))

if __name__=='__main__':
    main()
