#!/usr/bin/env python3
"""Focused real-Chromium smoke for the three ending branches.

Primes only pre-final story choices. The production browser runtime executes
dialogue, combat, surrender, Save/Load and ending previews. Not a full playthrough.
"""
from __future__ import annotations

import contextlib
import http.server
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_launch import launch_chromium

ROOT=Path(__file__).resolve().parents[1]
EVIDENCE=ROOT/"prototype_artifacts"/"three_routes_acceptance"
VARIANTS=(
 ("kingdom","evacuate","kingdomEvacuation","ソフィ"),
 ("kingdom","orders","kingdomOrders","カレン"),
 ("empire","protect","empireProtect","ソフィ"),
 ("empire","advance","empireAdvance","トリトン"),
)
ASH_VARIANTS=(("release",2),("demand",1))
ENDINGS=(
 ("kingdom","evacuate","避難路を渡る家族"),
 ("kingdom","orders","報告書には前衛突破"),
 ("empire","protect","降伏した兵士たちの名簿"),
 ("empire","advance","追撃の伝令が途絶え"),
 ("ashcrown","release","トリトンが立ち止まった"),
 ("ashcrown","demand","カレン一人の足音"),
)

@contextlib.contextmanager
def serve():
 class Quiet(http.server.SimpleHTTPRequestHandler):
  def __init__(self,*a,**kw):
   super().__init__(*a,directory=str(ROOT),**kw)
  def log_message(self,*a):pass
 server=http.server.ThreadingHTTPServer(("127.0.0.1",0),Quiet)
 thread=threading.Thread(target=server.serve_forever,daemon=True)
 thread.start()
 try:yield f"http://127.0.0.1:{server.server_port}/index.html"
 finally:server.shutdown();server.server_close()

def new_game(browser,url,width=1280):
 page=browser.new_page(viewport={"width":width,"height":900})
 errors=[]
 page.on("pageerror",lambda e:errors.append(str(e)))
 page.goto(url,wait_until="networkidle")
 page.locator("#titleNewGame").click()
 page.evaluate("GC.Dialogue.closeDialogue(false)")
 assert page.evaluate("GC.State.get().party.length")==4
 return page,errors

def progress_to_battle(page):
 for _ in range(24):
  if page.locator("#battlePanel").is_visible():return
  if page.locator("#dialogueBox").is_visible():
   page.evaluate("""() => {
     if(GC.Dialogue.dialogueTyping())GC.Dialogue.finishDialogueTyping();
     GC.App.primaryAction();
   }""")
  page.wait_for_timeout(35)
 raise AssertionError("Route introduction did not enter the battle")

def clear_by_mercy(page):
 page.wait_for_function("GC.State.get().battle && !GC.State.get().locked")
 page.evaluate("""() => {GC.State.get().battle.enemies[0].morale=1;renderBattle()}""")
 page.locator('#battleActions button[data-battle="persuade"]').click()
 page.wait_for_function("GC.State.get().battle===null",timeout=9000)
 page.wait_for_function("document.getElementById('battlePanel').classList.contains('hidden')",timeout=9000)
 if page.locator("#levelUpPanel").is_visible():page.locator("#levelUpContinue").click()

def check_save_reload(page,route,choice,flag):
 page.evaluate("GC.Dialogue.closeDialogue(false)")
 assert page.evaluate("GC.Save.save(true)") is True,"Save rejected completed checkpoint"
 assert page.evaluate("GC.Save.load(true)") is True,"Load failed"
 state=page.evaluate("""([route,choice,flag])=>{
   const s=GC.State.get();
   return {schema:s.schema,choice:s.events.choices['route.companions.'+route],
     complete:!!s.events.completed[flag],party:s.party.map(p=>p.id)}
 }""",[route,choice,flag])
 assert state["schema"]==23,state
 assert state["choice"]==choice and state["complete"],state
 assert len(state["party"])==4,"Saved roster lost a character"

def faction_case(browser,url,route,choice,battle_id,expected_target):
 page,errors=new_game(browser,url)
 try:
  page.evaluate("""([route,choice])=>{
    const s=GC.State.get();
    s.finalChoice=route;
    s.events.choices['route.companions.'+route]=choice;
    s.map=route==='kingdom'?'imperialcamp':'royalcamp';
    s.x=11;s.y=9;s.dir='up';
    GC.Render.World.VISUAL.map=null;GC.Render.World.draw();
    runFinalRouteConfrontation(route);
  }""",[route,choice])
  progress_to_battle(page)
  assert page.evaluate("GC.State.get().battle.id")==battle_id
  forecast=page.locator("#battleForecast")
  assert forecast.is_visible(),"Target forecast missing"
  assert expected_target in forecast.inner_text(),forecast.inner_text()
  EVIDENCE.mkdir(parents=True,exist_ok=True)
  page.screenshot(path=str(EVIDENCE/f"combat_{route}_{choice}.png"))
  clear_by_mercy(page)
  assert page.evaluate("grayCrownMorality().lethal")==0
  check_save_reload(page,route,choice,f"final.route.{route}.checkpoint")
  assert not errors,errors
  print(f"PASS faction branch {route}/{choice}: forewarn, mercy and save")
 finally:page.close()

def ash_case(browser,url,choice,count):
 page,errors=new_game(browser,url)
 try:
  page.evaluate("""choice=>{
    const s=GC.State.get();
    s.finalChoice='ashcrown';
    s.events.choices['route.companions.ashcrown']=choice;
    s.events.choices['moral.ashcrownCommitment']='confirmed';
    s.map='finalfield';s.x=11;s.y=9;s.dir='up';
    GC.Render.World.VISUAL.map=null;GC.Render.World.draw();
    enterFinalBranch();
  }""",choice)
  progress_to_battle(page)
  assert page.evaluate("GC.State.get().battle.id")=="ashcrownCheckpoint"
  assert page.evaluate("activeRouteParty().length")==count
  EVIDENCE.mkdir(parents=True,exist_ok=True)
  page.screenshot(path=str(EVIDENCE/f"ashcrown_{choice}.png"))
  clear_by_mercy(page)
  check_save_reload(page,"ashcrown",choice,"ashcrownCheckpointCleared")
  assert page.evaluate("activeRouteParty().length")==count
  assert not errors,errors
  print(f"PASS Ash Crown {choice}: {count} fighting")
 finally:page.close()

def preview_case(browser,url):
 page,errors=new_game(browser,url,width=390)
 try:
  for route,choice,fragment in ENDINGS:
   html=page.evaluate("""([route,choice])=>{
     const s=GC.State.get();s.finalChoice=route;
     s.events.choices['route.companions.'+route]=choice;
     showWorldSkeletonEnding(route);
     return GC.Dialogue.DIALOGUE_TYPE.fullHTML;
   }""",[route,choice])
   assert fragment in html,f"Missing {route}/{choice} consequence"
   assert "未完成" in html,f"False completion: {route}/{choice}"
   page.evaluate("GC.Dialogue.closeDialogue(false)")
  assert not errors,errors
  print("PASS six ending previews on 390px viewport")
 finally:page.close()

def main():
 with serve() as url,sync_playwright() as pw:
  browser=launch_chromium(pw)
  try:
   for item in VARIANTS:faction_case(browser,url,*item)
   for item in ASH_VARIANTS:ash_case(browser,url,*item)
   preview_case(browser,url)
  finally:browser.close()
 print("THREE ROUTES INTEGRATION CHROMIUM SMOKE PASS")

if __name__=="__main__":main()
