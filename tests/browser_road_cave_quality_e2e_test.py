#!/usr/bin/env python3
"""Gray Crown vertical-slice real Chromium player E2E.
Movement, interactions, fights and boss buttons: standard player input.
State changes are only allowed for toggling the visual A/B renderer and pure
combat-targeting assertions. No Developer Mode or story progress injection.
"""
import contextlib, functools, http.server, json, threading, hashlib
from pathlib import Path
from collections import deque
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"prototype_artifacts/road_cave_combat_v1"
OUT.mkdir(parents=True,exist_ok=True)
checks=[]
perf={}
def check(k,condition,detail=None):
 checks.append({"name":k,"pass":bool(condition),"detail":detail})
 if not condition:
  (OUT/"results.json").write_text(json.dumps({"checks":checks,"performance":perf},ensure_ascii=False,indent=2))
  raise AssertionError(k+": "+str(detail))

class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
@contextlib.contextmanager
def server():
 h=functools.partial(Quiet,directory=str(ROOT))
 app=http.server.ThreadingHTTPServer(("127.0.0.1",0),h)
 t=threading.Thread(target=app.serve_forever,daemon=True);t.start()
 try:yield "http://127.0.0.1:%d/index.html"%app.server_port
 finally:app.shutdown();app.server_close()
def state(page):
 return page.evaluate("""()=>{const s=GC.State.get();return {
 map:s.map,x:s.x,y:s.y,stage:s.story.stage,
 gold:s.gold,exp:s.party.map(p=>p.exp),inventory:s.inventory,
 world:s.world,battle:s.battle&&{id:s.battle.id,turn:s.battle.turn,actor:s.battle.actor},
 locked:s.locked}}""")
def shot(page,k):
 page.wait_for_timeout(160)
 path=OUT/(k+".png");page.screenshot(path=str(path),full_page=True)
 return hashlib.sha256(path.read_bytes()).hexdigest()
def toggle_art(page,enable):
 page.evaluate("""on=>{RoadCaveQuality.enabled=on;GC.Render.World.VISUAL.map=null;GC.Render.World.drawScene()}""",enable)
 page.wait_for_timeout(170)
def dismiss(page):
 for _ in range(180):
  if not page.locator("#dialogueBox").is_visible():return
  if page.locator("#choiceBox button").count():return
  page.keyboard.press("Enter");page.wait_for_timeout(25)
 raise AssertionError("dialogue cannot finish")
def fight(page,battle_id=None,allow_loss=False):
 check("battle panel opens",page.locator("#battlePanel").is_visible())
 if battle_id:check("expected encounter "+battle_id,state(page)["battle"]["id"]==battle_id)
 if battle_id in ("wolves","roadBandit","boss"):
  check("four actual battle sprites",page.locator("#partyBattleLine .battle-hero[data-hero]").count()==4)
  # Combat art is displayed by an <img> atlas, not a background-image.
  # The old assertion read backgroundImage=="" and failed even when the real
  # original sprites were correctly present. Check both URL and decoded PNG.
  page.wait_for_function("""()=>[...document.querySelectorAll("#partyBattleLine .battle-hero .battle-frame-image")].length===4 &&
    [...document.querySelectorAll("#partyBattleLine .battle-hero .battle-frame-image")].every(x=>x.complete)""",timeout=8000)
  sources=page.locator("#partyBattleLine .battle-hero").evaluate_all("""els=>els.map(e=>{
   const img=e.querySelector(".battle-frame-image");return{id:e.dataset.hero,src:img?.getAttribute("src")||"",
   walk:img?.dataset.walk||"",width:img?.naturalWidth||0,height:img?.naturalHeight||0}
  })""")
  check("battle heroes preserve locked character assets",
        all(x["id"] in ("karen","triton","sophie","margaret") and
            x["src"]==f'assets/characters/{x["id"]}/{x["id"]}_idle.png' and
            x["walk"]==f'assets/characters/{x["id"]}/{x["id"]}_walk.png' and
            x["width"]==192 and x["height"]==192 for x in sources),sources)
 if battle_id in ("wolves","boss"):shot(page,"battle_"+battle_id)
 check("combat save blocked",page.evaluate("GC.Save.save(true)===false"))
 check("combat load blocked",page.evaluate("GC.Save.load(true)===false"))
 start=state(page);actions=0
 for _ in range(165):
  if not page.locator("#battlePanel").is_visible():break
  if page.locator("#levelUpPanel").is_visible():
   page.locator("#levelUpContinue").click();page.wait_for_timeout(110);continue
  if page.evaluate("GC.State.get().locked"):
   page.wait_for_timeout(120);continue
  buttons=page.locator("#battleActions button:not([disabled])")
  if buttons.count():
   options=buttons.all_text_contents()
   # Deliberate skill use: rally, heavy, heal when needed, fire when possible.
   actor=page.evaluate("GC.State.get().party[GC.State.get().battle.actor].id")
   selected=None
   for desired in ({
     "karen":["号令","剣撃"],"triton":["強撃"],"sophie":["治癒","杖撃"],
     "margaret":["火球","杖撃"]}.get(actor,[])):
    if desired=="治癒" and page.evaluate("GC.State.get().party.every(p=>p.hp/p.maxHp>.65)"):continue
    for i,opt in enumerate(options):
     if desired in opt:selected=i;break
    if selected is not None:break
   buttons.nth(selected if selected is not None else 0).click()
   actions+=1
   page.wait_for_timeout(455)
  else:page.wait_for_timeout(100)
 else:raise AssertionError("battle exceeded safety turn/action bound "+str(battle_id))
 check("battle closed after actions "+str(battle_id),not page.locator("#battlePanel").is_visible(),actions)
 dismiss(page)
 end=state(page)
 check("battle grants nonnegative gold "+str(battle_id),end["gold"]>=start["gold"],
       {"before":start["gold"],"after":end["gold"]})
 return start,end,actions

def walk(page,tx,ty):
 goal=(tx,ty)
 for retry in range(16):
  cur=state(page)
  if (cur["x"],cur["y"])==goal:return
  m=page.evaluate("""()=>{const g=maps[GC.State.get().map];return g.tiles.map((row,y)=>[...row].map((ch,x)=>isBlocked(x,y)))}""")
  start=(cur["x"],cur["y"]);q=deque([start]);parent={start:None}
  for_step=((0,-1,"ArrowUp"),(1,0,"ArrowRight"),(0,1,"ArrowDown"),(-1,0,"ArrowLeft"))
  while q:
   xy=q.popleft()
   if xy==goal:break
   for dx,dy,key in for_step:
    nx,ny=xy[0]+dx,xy[1]+dy
    if 0<=ny<len(m) and 0<=nx<len(m[0]) and not m[ny][nx] and (nx,ny) not in parent:
     parent[(nx,ny)]=(xy,key);q.append((nx,ny))
  check("reachable "+str(goal)+" on "+cur["map"],goal in parent)
  seq=[];step=goal
  while step!=start:
   step,cmd=parent[step];seq.append(cmd)
  for cmd in reversed(seq):
   previous=state(page)
   page.keyboard.press(cmd);page.wait_for_timeout(120)
   if page.locator("#battlePanel").is_visible():
    fight(page);dismiss(page)
    break
   if page.locator("#dialogueBox").is_visible():dismiss(page)
   next=state(page)
   if next["map"]!=previous["map"]:return
   if (next["x"],next["y"])==(previous["x"],previous["y"]):break
  else:continue
 raise AssertionError("unreachable under live input: "+str(goal)+" "+str(state(page)))

def interact(page,obj,auto_battle=None):
 target=page.evaluate("""id=>{
 const o=maps[GC.State.get().map].objects.find(q=>q.id===id);
 return o?{x:o.x,y:o.y}:null
}""",obj)
 check("object present "+obj,target is not None)
 options=[(target["x"],target["y"]+1,"ArrowUp"),
          (target["x"]+1,target["y"],"ArrowLeft"),
          (target["x"]-1,target["y"],"ArrowRight"),
          (target["x"],target["y"]-1,"ArrowDown")]
 for x,y,face in options:
  if not page.evaluate("([x,y])=>!isBlocked(x,y)",[x,y]):continue
  try:walk(page,x,y)
  except AssertionError:continue
  if state(page)["map"] not in ("road","cave"):break
  page.keyboard.press(face);page.wait_for_timeout(125)
  if page.locator("#battlePanel").is_visible():
   return fight(page,auto_battle)
  page.keyboard.press("Enter");page.wait_for_timeout(160)
  if page.locator("#battlePanel").is_visible():return fight(page,auto_battle)
  if obj=="boss":
   # Typewriter dialogue must finish before the choice buttons materialize.
   for attempt in range(50):
    if page.locator("#choiceBox button").count():break
    if not page.locator("#dialogueBox").is_visible():break
    page.keyboard.press("Enter");page.wait_for_timeout(35)
   labels=page.locator("#choiceBox button").all_text_contents()
   check("boss has player choice",any("戦う" in x for x in labels),labels)
   page.locator("#choiceBox button").filter(has_text="戦う").click();page.wait_for_timeout(190)
   check("boss started from normal dialogue",page.locator("#battlePanel").is_visible())
   return fight(page,"boss")
  if page.locator("#dialogueBox").is_visible():dismiss(page)
  return None
 raise AssertionError("no interactable adjacent path for "+obj)

def pure_assertions(page):
 check("road music routed",page.evaluate("mapMusicTheme('road')==='road'"))
 check("cave music routed",page.evaluate("mapMusicTheme('cave')==='cave'"))
 check("boss music has own theme",page.evaluate("(()=>{let previous=AUDIO.theme;setMusic('boss');let ok=AUDIO.theme==='boss';setMusic(previous);return ok})()"))
 check("boss flag enables phase transitions",page.evaluate("battles.boss.boss===true&&!!battles.boss.phase2&&!!battles.boss.phase3"))
 check("original boss HP/rewards preserved",page.evaluate("battles.boss.enemies[0].hp===185&&battles.boss.reward.gold===125&&battles.boss.reward.exp===65"))
 check("wolf and bandit rewards preserved",page.evaluate("battles.wolves.reward.exp===22&&battles.roadBandit.reward.exp===24"))
 check("repeat target protection",page.evaluate("""()=>{
 const b={lastTarget:'karen',targetStreak:2};
 const t=selectEnemyTarget([{id:'karen'},{id:'triton'},{id:'sophie'}],b,()=>0);
 return t.id!=='karen'&&b.lastTarget===t.id&&b.targetStreak===1;
}"""))
 check("v23 schema",page.evaluate("GC.Save.SAVE_SCHEMA===23"))

with server() as URL:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  page=browser.new_page(viewport={"width":1365,"height":900},device_scale_factor=1)
  errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
  page.on("console",lambda e:errors.append(e.text) if e.type=="error" else None)
  page.goto(URL,wait_until="networkidle")
  page.locator("#titleNewGame").click();dismiss(page)
  pure_assertions(page)
  # Audio must not block play even when user chooses mute.
  page.locator("#btnSound").click()
  check("mute switch respected",page.evaluate("AUDIO.enabled===false&&document.querySelector('#btnSound').getAttribute('aria-pressed')==='false'"))
  page.locator("#btnSound").click()
  check("unmute switch restored",page.evaluate("AUDIO.enabled===true"))
  walk(page,12,7);page.keyboard.press("ArrowUp");page.wait_for_timeout(140);page.keyboard.press("Enter");dismiss(page)
  check("appointment complete",page.evaluate("GC.State.get().events.completed['alpha.village.appointment']===true"))
  walk(page,11,1);page.keyboard.press("ArrowUp");page.wait_for_timeout(200);dismiss(page)
  check("normal village-to-road transition",state(page)["map"]=="road")
  toggle_art(page,False);before_road=shot(page,"road_before")
  toggle_art(page,True);after_road=shot(page,"road_after")
  check("road old/new screenshot is different",before_road!=after_road)
  shot(page,"road_party")
  interact(page,"wolf","wolves")
  check("wolf defeat state",page.evaluate("isDefeated('wolf')"))
  check("wolf reward exp awarded",all(e>=22 for e in state(page)["exp"]))
  interact(page,"bandit","roadBandit")
  check("bandit handled",page.evaluate("isDefeated('bandit')"))
  # Safe-zone save from actual player state, plus persistence on reload.
  check("save after road encounters",page.evaluate("GC.Save.save(true)"))
  saved=state(page);check("saved schema remains 23",page.evaluate("JSON.parse(localStorage.getItem(GC.Save.SAVE_KEY)).schema===23"))
  walk(page,13,2);page.keyboard.press("ArrowUp");page.wait_for_timeout(150);dismiss(page)
  check("normal road-to-cave transition",state(page)["map"]=="cave")
  toggle_art(page,False);before_cave=shot(page,"cave_before")
  toggle_art(page,True);after_cave=shot(page,"cave_after")
  check("cave old/new screenshot differs",before_cave!=after_cave)
  shot(page,"cave_party")
  # Existing treasure, two enemy-gated levers and boss. No state injection.
  interact(page,"chest1")
  check("chest 1 persistent after pickup",page.evaluate("structuredCondition('chest1')"))
  interact(page,"bats","bats")
  check("cave bats defeat flag",page.evaluate("structuredCondition('caveBats')"))
  interact(page,"leverWest")
  check("west lever toggled only after bats",page.evaluate("structuredCondition('leverWest')"))
  interact(page,"crawler","crawler")
  check("crawler defeat flag",page.evaluate("structuredCondition('caveCrawler')"))
  interact(page,"leverEast")
  check("east lever toggled only after crawler",page.evaluate("structuredCondition('leverEast')"))
  shot(page,"cave_both_levers")
  interact(page,"boss","boss")
  check("boss world defeated flag",page.evaluate("isDefeated('boss')"))
  check("boss reward present",all(x>=65 for x in state(page)["exp"]))
  shot(page,"cave_boss_clear")
  check("save after boss clear",page.evaluate("GC.Save.save(true)"))
  before_save=state(page)
  check("load after boss clear",page.evaluate("GC.Save.load(true)"))
  check("levers and boss stay cleared after load",page.evaluate("structuredCondition('leverWest')&&structuredCondition('leverEast')&&isDefeated('boss')"))
  check("save restoration preserves location",state(page)["map"]==before_save["map"])
  shot(page,"cave_save_reload")
  check("no JavaScript errors",not errors,errors[:10])
  for width,height,label in [(1024,768,"smallpc"),(390,844,"mobile")]:
   vp=browser.new_page(viewport={"width":width,"height":height})
   vp.goto(URL,wait_until="networkidle")
   vp.locator("#titleNewGame").click();dismiss(vp)
   check(label+" no horizontal overflow",vp.evaluate("document.documentElement.scrollWidth<=innerWidth+2"))
   shot(vp,label+"_village_ui")
   vp.close()
  (OUT/"results.json").write_text(json.dumps({"checks":checks,"performance":perf,"errors":errors,
      "mode":"normal keyboard & buttons; art toggle and pure deterministic assertions isolated",
      "screenshot_count":len(list(OUT.glob('*.png')))},ensure_ascii=False,indent=2))
  browser.close()
print("ROAD/CAVE/BOSS real browser PASS",len(checks),"assertions")
