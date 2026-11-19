#!/usr/bin/env python3
"""Real browser verification of three early-game optional choice scenes.

Uses real HTML, input buttons, runtime state, and Save/Load. It primes the map
for isolated scenes, so it does NOT replace a complete fresh-game playthrough.
"""
import contextlib
import http.server
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_launch import launch_chromium

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts"/"early_game_human_stakes"

@contextlib.contextmanager
def serve():
 class Quiet(http.server.SimpleHTTPRequestHandler):
  def __init__(self,*args,**kwargs):
   super().__init__(*args,directory=str(ROOT),**kwargs)
  def log_message(self,*args):pass
 server=http.server.ThreadingHTTPServer(("127.0.0.1",0),Quiet)
 t=threading.Thread(target=server.serve_forever,daemon=True)
 t.start()
 try:yield f"http://127.0.0.1:{server.server_port}/index.html"
 finally:server.shutdown();server.server_close()

def finish_scene(page,limit=60):
 for _ in range(limit):
  if not page.locator("#dialogueBox").is_visible():return
  page.evaluate("""() => {
   if(GC.Dialogue.dialogueTyping())GC.Dialogue.finishDialogueTyping();
   GC.App.primaryAction();
  }""")
 raise AssertionError("dialogue did not close")

def reach_choices(page,limit=30):
 for _ in range(limit):
  ready=page.locator("#choiceBox button").count()>0 and not page.evaluate("GC.Dialogue.dialogueTyping()")
  if ready:return
  page.evaluate("""() => {
   if(GC.Dialogue.dialogueTyping())GC.Dialogue.finishDialogueTyping();
   else GC.App.primaryAction();
  }""")
 raise AssertionError("choice UI not reached")

def make_page(browser,url):
 page=browser.new_page(viewport={"width":1280,"height":900})
 errors=[]
 page.on("pageerror",lambda e:errors.append(str(e)))
 page.goto(url,wait_until="networkidle")
 page.locator("#titleNewGame").click()
 page.evaluate("GC.Dialogue.closeDialogue(false)")
 return page,errors

def visit(page,map_id,kind,id):
 page.evaluate("""mapId=>{
  const s=GC.State.get();
  s.map=mapId;s.x=11;s.y=11;s.dir='up';
  GC.Render.World.VISUAL.map=null;
  GC.Render.World.draw();
 }""",map_id)
 if kind=="npc":page.evaluate("id=>GC.Events.npcEvent(id)",id)
 else:page.evaluate("id=>GC.Events.objectEvent(id)",id)

def choice(page,phrase):
 reach_choices(page)
 page.locator("#choiceBox button").filter(has_text=phrase).click()
 finish_scene(page)

def run_case(browser,url,orphan,merchant,banner):
 page,errors=make_page(browser,url)
 label=orphan+"-"+merchant+"-"+banner
 try:
  start=page.evaluate("""() => ({
   herbs:GC.State.get().inventory['薬草'],
   food:GC.State.get().inventory['携帯食']||0,
   story:GC.State.get().story.stage
  })""")
  visit(page,"village","npc","orphan")
  choice(page,"薬草を1個" if orphan=="donate" else "薬草を残す")
  visit(page,"road","npc","merchant")
  choice(page,"荷車を直し" if merchant=="repair" else "村へ引き返す")
  visit(page,"cave","object","banner")
  choice(page,"名前を写し取る" if banner=="names" else "旗を結び直して")
  now=page.evaluate("""() => ({
   choices:GC.State.get().events.choices,
   inventory:GC.State.get().inventory,
   stage:GC.State.get().story.stage,
   village:GC.CommercialDiscovery.progress('village').found,
   road:GC.CommercialDiscovery.progress('road').found,
   cave:GC.CommercialDiscovery.progress('cave').found
  })""")
  assert now["choices"]["early.orphanMedicine"]==orphan,now
  assert now["choices"]["early.merchantCart"]==merchant,now
  assert now["choices"]["early.caveBanner"]==banner,now
  expected_herbs=start["herbs"]-(orphan=="donate")+(merchant=="return")
  assert now["inventory"]["薬草"]==expected_herbs,now
  assert now["inventory"].get("携帯食",0)==start["food"]+(merchant=="repair"),now
  assert now["stage"]==start["story"],now
  assert [now["village"],now["road"],now["cave"]]==[1,1,1],now

  visit(page,"capital","npc","rationMother")
  observed=[]
  for _ in range(12):
   if not page.locator("#dialogueBox").is_visible():break
   observed.append(page.evaluate("GC.Dialogue.DIALOGUE_TYPE.fullHTML"))
   page.evaluate("""() => {
    if(GC.Dialogue.dialogueTyping())GC.Dialogue.finishDialogueTyping();
    GC.App.primaryAction()
   }""")
  assert "孤児院" in "".join(observed),observed
  assert ("荷車" in "".join(observed) or "街道" in "".join(observed)),observed

  OUT.mkdir(parents=True,exist_ok=True)
  page.evaluate("GC.Dialogue.closeDialogue(false)")
  page.screenshot(path=str(OUT/("early_choices_"+label+".png")))
  assert page.evaluate("GC.Save.save(true)"),"Save failed"
  assert page.evaluate("GC.Save.load(true)"),"Load failed"
  recovered=page.evaluate("""()=>({
   schema:GC.State.get().schema,
   choices:GC.State.get().events.choices,
   party:GC.State.get().party.map(p=>p.id)
  })""")
  assert recovered["schema"]==23,recovered
  for key in ("early.orphanMedicine","early.merchantCart","early.caveBanner"):
   assert recovered["choices"][key]==now["choices"][key],(key,recovered)
  assert recovered["party"]==["karen","triton","sophie","margaret"]
  assert not errors,errors
  print("PASS",label,"choices, inventory, dialogue, Save/Load")
 finally:page.close()

if __name__=="__main__":
 with serve() as url,sync_playwright() as p:
  browser=launch_chromium(p)
  try:
   run_case(browser,url,"donate","repair","names")
   run_case(browser,url,"reserve","return","raise")
  finally:browser.close()
 print("EARLY GAME HUMAN STAKES CHROMIUM PASS")
