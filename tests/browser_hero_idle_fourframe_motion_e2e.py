#!/usr/bin/env python3
"""Review-only four-frame idle motion: real Ryune game-canvas, fixed world clock.

Run after full checkout: python tests/browser_hero_idle_fourframe_motion_e2e.py
Creates 32 full-scene PNGs and 8 same-state four-column boards; never changes assets.
"""
from __future__ import annotations
import base64
import hashlib
import io
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright
from browser_launch import launch_chromium
import browser_vertical_slice_e2e_test as helper

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'prototype_artifacts/hero_idle_fourframe_motion'
HEROES = ('karen', 'triton', 'sophie', 'margaret')
DIRECTIONS = ('down', 'left', 'right', 'up')
VIEWS = (('desktop', 1365, 900), ('phone', 390, 844))


def capture_cycle(page, direction):
    return page.evaluate(r"""({direction}) => {
      const s=GC.State.get(),w=GC.Render.World,v=w.VISUAL;
      const previous={map:s.map,x:s.x,y:s.y,dir:s.dir,
        trail:s.trail,worldStepsOnMap:s.worldStepsOnMap};
      const oldTrial=HERO_RUNTIME.idleTrialEnabled;
      const oldMotion=HERO_RUNTIME.idleMotionEnabled;
      const oldOverride=HERO_RUNTIME.idleFrameTimeOverride;
      const oldSize=GC.Data.Animations.artDisplaySize;
      const oldNow=Date.now,oldRaf=window.requestAnimationFrame;
      const oldCancel=window.cancelAnimationFrame;
      const oldTimeout=window.setTimeout,oldClear=window.clearTimeout;
      const oldDraw=CanvasRenderingContext2D.prototype.drawImage;
      const canvas=document.querySelector('#game'),result=[];
      cancelAnimationFrame(v.raf);clearTimeout(v.ambientTimer);
      s.map='village';s.x=9;s.y=8;s.dir=direction;
      s.trail=[];s.worldStepsOnMap=0;
      Date.now=()=>1793509200000; // freeze world, NPC and environmental animation
      window.requestAnimationFrame=()=>0;
      window.cancelAnimationFrame=()=>{};
      window.setTimeout=()=>0;window.clearTimeout=()=>{};
      HERO_RUNTIME.idleTrialEnabled=true;
      HERO_RUNTIME.idleMotionEnabled=true;
      GC.Data.Animations.artDisplaySize=44;
      try {
        for(let step=0;step<4;step++){
          HERO_RUNTIME.idleFrameTimeOverride=step*420;
          const draws=[];
          CanvasRenderingContext2D.prototype.drawImage=function(...args){
            const src=args[0]?.currentSrc||args[0]?.src||'';
            const m=String(src).match(/assets\/characters\/(karen|triton|sophie|margaret)\/\1_(walk|idle)\.png(?:[?#]|$)/);
            if(m&&args.length===9&&args[3]===48&&args[4]===48){
              const [dx,dy,dw,dh]=args.slice(5,9),t=this.getTransform();
              const pts=[[dx,dy],[dx+dw,dy],[dx,dy+dh],[dx+dw,dy+dh]]
                .map(([x,y])=>[t.a*x+t.c*y+t.e,t.b*x+t.d*y+t.f]);
              draws.push({hero:m[1],pose:m[2],frame:args[1]/48,
                direction:args[2]/48,dest:args.slice(5,9),
                bbox:[Math.floor(Math.min(...pts.map(p=>p[0]))),
                  Math.floor(Math.min(...pts.map(p=>p[1]))),
                  Math.ceil(Math.max(...pts.map(p=>p[0]))),
                  Math.ceil(Math.max(...pts.map(p=>p[1])))]});
            }
            return oldDraw.apply(this,args);
          };
          v.map=null;v.travelPhase=0;v.followerPhases=[0,0,0];
          v.followerFaces=[direction,direction,direction];
          w.drawScene();
          result.push({step,png:canvas.toDataURL('image/png').split(',')[1],
            size:[canvas.width,canvas.height],draws,
            state:{map:s.map,x:s.x,y:s.y,dir:s.dir},
            camera:[v.camX,v.camY],followers:v.followers.map(p=>[...p])});
        }
      }finally{
        CanvasRenderingContext2D.prototype.drawImage=oldDraw;
        HERO_RUNTIME.idleTrialEnabled=oldTrial;
        HERO_RUNTIME.idleMotionEnabled=oldMotion;
        HERO_RUNTIME.idleFrameTimeOverride=oldOverride;
        GC.Data.Animations.artDisplaySize=oldSize;
        Date.now=oldNow;window.requestAnimationFrame=oldRaf;
        window.cancelAnimationFrame=oldCancel;
        window.setTimeout=oldTimeout;window.clearTimeout=oldClear;
        Object.assign(s,previous);v.map=null;v.raf=0;v.ambientTimer=0;w.draw();
      }
      return result;
    }""", {'direction': direction})


def save_cycle(view, direction, shots):
    assert [s['step'] for s in shots] == list(range(4))
    assert all(s['size'] == [768,480] for s in shots)
    assert all(s['state'] == shots[0]['state'] for s in shots)
    assert all(s['camera'] == shots[0]['camera'] for s in shots)
    assert all(s['followers'] == shots[0]['followers'] for s in shots)
    pictures,records=[],[]
    for shot in shots:
        found={d['hero']:d for d in shot['draws']}
        assert set(found)==set(HEROES), (view,direction,shot['step'],found)
        assert len(shot['draws'])==4, 'hero drawn twice or missing'
        for d in found.values():
            assert d['pose']=='idle'
            assert d['frame']==shot['step']
            assert d['direction']==DIRECTIONS.index(direction)
            assert d['dest'][2:]==[44,44]
        data=base64.b64decode(shot['png'])
        im=Image.open(io.BytesIO(data)).convert('RGB')
        assert im.size==(768,480)
        name=f'{view}_{direction}_idle_frame{shot["step"]}.png'
        (OUT/name).write_bytes(data)
        pictures.append(im)
        records.append({'name':name,'sha256':hashlib.sha256(data).hexdigest(),
                        'draws':shot['draws']})
    base={d['hero']:d for d in shots[0]['draws']}
    boxes=[d['bbox'] for d in base.values()]
    changes=[]
    for i in range(1,4):
        assert {d['hero']:d['bbox'] for d in shots[i]['draws']}=={
            h:d['bbox'] for h,d in base.items()}
        delta=ImageChops.difference(pictures[0],pictures[i])
        channels=delta.split()
        mask=ImageChops.lighter(ImageChops.lighter(channels[0],channels[1]),channels[2])
        changed=0
        for y in range(480):
            for x in range(768):
                if not mask.getpixel((x,y)):
                    continue
                changed+=1
                assert any(b[0]-2<=x<b[2]+2 and b[1]-2<=y<b[3]+2
                           for b in boxes), 'non-hero pixel changed'
        changes.append(changed)
    board=Image.new('RGB',(3072,510),'#242424')
    pen=ImageDraw.Draw(board)
    for i,im in enumerate(pictures):
        board.paste(im,(i*768,30))
        pen.text((i*768+12,9),f'{view} {direction} / idle frame {i} / ART HOLD',
                 fill='white')
    board_name=f'{view}_{direction}_cycle.png'
    board.save(OUT/board_name)
    return {'view':view,'direction':direction,'frames':records,
            'board':board_name,'changed_rgb_pixels_from_frame0':changes,
            'art_verdict':'HOLD: requires human visual comparison'}


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    records=[]
    with helper.served() as url,sync_playwright() as playwright:
        browser=launch_chromium(playwright)
        try:
            for view,width,height in VIEWS:
                page=browser.new_page(viewport={'width':width,'height':height},
                                      device_scale_factor=1)
                errors=[]
                page.on('pageerror',lambda err:errors.append(str(err)))
                try:
                    page.goto(url+'?heroIdleArt=2',wait_until='networkidle')
                    page.locator('#titleNewGame').click()
                    helper.clean_dialogue(page)
                    page.wait_for_function("""() =>
                      ['karen','triton','sophie','margaret'].every(id=>{
                        const r=GC.Render.World.heroRuntimeStatus()[id];
                        return r?.ready&&r?.idleReady&&r?.idleTrialEnabled;
                      })""",timeout=20000)
                    for direction in DIRECTIONS:
                        records.append(save_cycle(view,direction,capture_cycle(page,direction)))
                    assert not errors,errors
                finally:
                    page.close()
        finally:
            browser.close()
    manifest={'source_head':helper.source_head(),
              'status':'ART HOLD — NOT ADOPTED',
              'scope':'real 44px field scene, four idle frames, fixed NPC/world time',
              'screenshots':32,'boards':8,'cycles':records}
    (OUT/'manifest.json').write_text(
        json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'screenshots':32,'boards':8,'status':manifest['status']}))


if __name__=='__main__':
    main()
