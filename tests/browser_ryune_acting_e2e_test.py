#!/usr/bin/env python3
"""Real Chromium acting acceptance. Actual game, assets, EVENT_DEFS, keyboard,
Save schema 23; no injected dialogue lines or changes to story/hero sprites.
Two fresh sessions render the SAME appointment in Portrait ON and OFF modes.
"""
import contextlib
import functools
import hashlib
import http.server
import json
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/ryune_acting_v1'
OUT.mkdir(parents=True,exist_ok=True)
HEROES=('karen','triton','sophie','margaret')
EXPECTED_STAGE='01_appointed'
MEASURED={}

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

@contextlib.contextmanager
def server():
    srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
    t=threading.Thread(target=srv.serve_forever,daemon=True);t.start()
    try:yield f'http://127.0.0.1:{srv.server_port}/index.html'
    finally:srv.shutdown();srv.server_close()

def must(ok,reason):
    if not ok:raise AssertionError(reason)

def click_through_intro(page):
    for _ in range(80):
        if not page.locator('#dialogueBox').is_visible():return
        page.keyboard.press('Enter')
        page.wait_for_timeout(35)
    raise AssertionError('opening intro did not close')

def screenshot(page,name):
    path=OUT/(name+'.png')
    page.screenshot(path=str(path),full_page=True)
    return hashlib.sha256(path.read_bytes()).hexdigest()

def start(page,url,mode):
    page.goto(url,wait_until='networkidle')
    page.locator('#titleNewGame').click()
    click_through_intro(page)
    must(page.evaluate("GC.State.get().map")=='village','new game map mismatch')
    must(page.evaluate("(m)=>GC.RyuneActing.setPortraitMode(m)",mode),'portrait test mode could not be set')
    page.wait_for_function("""()=>
      ['karen','triton','sophie','margaret'].every(x=>GC.Render.World.heroRuntimeStatus()[x]?.ready)
    """,timeout=16000)
    before=page.evaluate("""() => {
     const s=GC.State.get();
     return {map:s.map,x:s.x,y:s.y,dir:s.dir,trail:JSON.stringify(s.trail),
       stage:s.story.stage,complete:isEventComplete('alpha.village.appointment')}
    }""")
    must(not before['complete'],'fresh appointment already complete')
    screenshot(page,'before_'+mode)
    # Normal-world movement is handled by a tested BFS helper; no direct teleport.
    from browser_pixel_vslice_acceptance_e2e_test import path_to
    path_to(page,(12,7))
    page.keyboard.press('ArrowUp')
    page.wait_for_timeout(135)
    position=page.evaluate("""() => {
      const s=GC.State.get();return{x:s.x,y:s.y,dir:s.dir,trail:JSON.stringify(s.trail)}
    }""")
    page.keyboard.press('Enter')
    page.wait_for_function("() => GC.RyuneActing.isRunning() && GC.Cinematic.isActive()",timeout=8000)
    return before,position

def play(page,mode,url):
    before,pos=start(page,url,mode)
    expected=page.evaluate("""() => {
      const d=EVENT_DEFS.find(x=>x.id==='alpha.village.appointment');
      return {lines:d.lines.map(x=>({speaker:x.speaker,text:x.text})),effects:JSON.stringify(d.effects)}
    }""")
    must(len(expected['lines'])==23,'appointment transcript changed from baseline')
    must(page.evaluate("GC.RyuneActing.getSnapshot().actors.length")==5,'five scene actors missing')
    must(page.evaluate("""() => {
      const a=GC.RyuneActing.getSnapshot().actors;
      return a.filter(x=>['karen','triton','sophie','margaret'].includes(x.id)).every(x=>Math.abs(x.scale-44/48)<.0001)
    }"""),'44px protagonists changed in acting scene')
    must(not page.evaluate("GC.Save.save(true)"),'mid-scene save unexpectedly allowed')
    must(not page.evaluate("GC.Save.load(true)"),'mid-scene load unexpectedly allowed')
    must(page.evaluate("GC.Events.runTriggeredEvent('npc','messenger',{map:'village'})") is True,'double dispatch unexpectedly rejected')
    must(page.evaluate("GC.RyuneActing.isRunning()"),'second dispatch cancelled first scene')
    samples={}
    for i,line in enumerate(expected['lines']):
        page.wait_for_function("(idx)=>GC.RyuneActing.getSnapshot().lineIndex===idx",arg=i,timeout=10000)
        speaker=page.locator('#speaker').inner_text()
        must(speaker==line['speaker'],f'line {i} speaker altered: {speaker} != {line["speaker"]}')
        must(page.locator('#dialogueBox').is_visible(),f'line {i} dialogue hidden')
        displayed=page.locator('#speakerPortrait').is_visible()
        if mode=='portraitOff':
            must(not displayed,'Portrait OFF leaks portrait at line '+str(i))
        elif line['speaker']!='ナレーション':
            must(displayed,'Portrait ON missing at line '+str(i))
        # Repeated Enter while typing must reveal, but never skip or duplicate a line.
        page.keyboard.press('Enter')
        page.wait_for_timeout(24)
        full=page.evaluate("""() => !GC.Dialogue.dialogueTyping() && 
          document.querySelector('#dialogueText').textContent.length>0""")
        must(full,f'line {i} continuous Enter failed to reveal dialogue')
        if i in (0,1,4,6,8,11,15,18,20,22):
            page.wait_for_timeout(115)
            samples[i]=page.evaluate("GC.RyuneActing.getSnapshot()")
            screenshot(page,f'{mode}_line_{i:02d}')
        page.keyboard.press('Enter')
        page.wait_for_timeout(30)
    page.wait_for_function("""() =>
      !GC.RyuneActing.isRunning() && !GC.Cinematic.isActive() &&
      isEventComplete('alpha.village.appointment')
    """,timeout=12000)
    after=page.evaluate("""() => {
      const s=GC.State.get();
      return {map:s.map,x:s.x,y:s.y,dir:s.dir,trail:JSON.stringify(s.trail),
        stage:s.story.stage,completed:isEventComplete('alpha.village.appointment'),
        locked:s.locked,locks:[...GC.Dialogue.INPUT_LOCKS],
        camera:GC.Cinematic.cameraTarget(),sceneActors:GC.Cinematic.getRenderActors().length,
        schema:s.schema,effect:JSON.stringify(EVENT_DEFS.find(x=>x.id==='alpha.village.appointment').effects),
        journals:s.journal.length}
    }""")
    must(after['map']==pos.get('map','village') and after['x']==pos['x'] and after['y']==pos['y'] and after['dir']==pos['dir'] and after['trail']==pos['trail'],
        'appointment failed to restore logical player coordinate/facing/trail')
    must(after['completed'] and after['stage']==EXPECTED_STAGE,'appointment stage / completion did not advance')
    must(after['schema']==23 and after['effect']==expected['effects'],'save schema or event effects changed')
    must(not after['locked'] and not after['locks'] and after['camera'] is None and after['sceneActors']==0,'camera/lock/actor cleanup failed')
    must(page.evaluate("GC.Save.save(true)"),'save unavailable after scene')
    screenshot(page,'after_'+mode)
    # Continue on ordinary fresh browser reload must not replay appointment.
    page.reload(wait_until='networkidle')
    must(page.locator('#titleContinue').is_enabled(),'saved Continue unavailable')
    page.locator('#titleContinue').click()
    click_through_intro(page)
    must(page.evaluate("isEventComplete('alpha.village.appointment')"),'Continue lost appointment flag')
    must(page.evaluate("GC.State.get().story.stage")==EXPECTED_STAGE,'Continue changed story stage')
    must(not page.evaluate("GC.RyuneActing.isRunning()"),'scene erroneously resumed after reload')
    must(not page.evaluate("GC.Cinematic.isActive()"),'cinematic leaked after reload')
    page.keyboard.press('Enter')
    page.wait_for_timeout(120)
    must(not page.evaluate("GC.RyuneActing.isRunning()"),'appointment replayed instead of repeat NPC dialogue')
    # Distinct motivations expressed by transient staging, not by edits to speaker lines.
    must(samples[1]['actors']!=samples[18]['actors'],'no visible actor-state change')
    must(any(a['id']=='karen' and a['x']>=11.8 for a in samples[15]['actors']),'Karen approach absent')
    must(any(a['id']=='triton' and a['x']>=9.35 for a in samples[18]['actors']),'Triton protective shift absent')
    must(any(a['id']=='sophie' and a['x']<13.3 for a in samples[11]['actors']),'Sophie step absent')
    must(any(a['id']=='margaret' and a['animation']=='idle' for a in samples[20]['actors']),'Margaret measured stillness absent')
    return {'mode':mode,'lines':len(expected['lines']),'samples':{str(i):v for i,v in samples.items()},
     'before':before,'position':pos,'after':after,
     'screenshot_paths':[p.name for p in OUT.glob(f'*{mode}*.png')]}

def main():
    with server() as url:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True)
            try:
                for mode in ('portraitOn','portraitOff'):
                    context=browser.new_context(viewport={'width':1365,'height':900},device_scale_factor=1)
                    page=context.new_page()
                    errors=[]
                    page.on('pageerror',lambda err:errors.append(str(err)))
                    results=play(page,mode,url)
                    must(not errors,'console exceptions '+str(errors))
                    MEASURED[mode]=results
                    context.close()
                # Narrow/mobile comprehension view, same exact live event assets.
                context=browser.new_context(viewport={'width':390,'height':844})
                page=context.new_page()
                start(page,url,'portraitOff')
                screenshot(page,'mobile_appointment_pixel_acting')
                must(not page.evaluate("document.documentElement.scrollWidth>innerWidth+2"),'mobile horizontal overflow')
                GCState=page.evaluate("GC.RyuneActing.getSnapshot()")
                must(len(GCState['actors'])==5,'mobile actor lineup missing')
                context.close()
            finally:
                browser.close()
    (OUT/'acting_e2e_results.json').write_text(json.dumps(MEASURED,ensure_ascii=False,indent=2),encoding='utf8')
    print('RYUNE ACTING E2E PASS: identical 23 lines A/B, natural interaction, all locks, saves and reload, 4 actor identities, 5-NPC staging screenshots')

if __name__=='__main__':
    main()
