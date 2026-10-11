#!/usr/bin/env python3
"""Phase9 actual Chromium presentation UI checks; no Actions minutes.

IMPORTANT: This does NOT certify Story 00-19 completion. The optional bats
battle is an explicitly labeled isolated UI encounter fixture, not a claim to
have discovered its cave symbol naturally. Story acceptance lives in the
unchanged comprehensive E2E suites.
"""
from pathlib import Path
import json,time
from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as base

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/phase9_commercial_quality'
OUT.mkdir(parents=True,exist_ok=True)
REPORT={'status':'NOT_RUN','checks':[],'screenshots':[],'error':None,
 'battle_provenance':'isolated temporary UI encounter fixture, NOT ordinary Story progression'}
def require(ok,name,detail=None):
 REPORT['checks'].append({'name':name,'pass':bool(ok),'detail':detail})
 if not ok:raise AssertionError(name+(' '+str(detail) if detail is not None else ''))
def shot(page,label):
 path=OUT/(label+'.png');page.screenshot(path=str(path),full_page=True)
 REPORT['screenshots'].append(path.name)
def main():
 errors=[]
 try:
  with base.served() as url:
   with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    try:
     context=browser.new_context(viewport={'width':1365,'height':900})
     page=context.new_page()
     page.on('pageerror',lambda e:errors.append(str(e)))
     page.goto(url,wait_until='networkidle')
     require(page.locator('#titleNewGame').is_visible(),'new game visible')
     page.locator('#titleNewGame').click()
     base.clean_dialogue(page)
     page.wait_for_function("""() => ['karen','triton','sophie','margaret'].every(id=>{
       const rec=HERO_RUNTIME.images[id],act=HERO_RUNTIME.acting[id];
       return rec?.ready&&act?.idle?.ready&&act?.talk?.ready
     })""",timeout=15000)
     r=page.evaluate("""() => Object.fromEntries(['karen','triton','sophie','margaret'].map(id=>[
       id,{walk:HERO_RUNTIME.images[id].ready,
            idle:HERO_RUNTIME.acting[id].idle.ready,
            talk:HERO_RUNTIME.acting[id].talk.ready,
            size:[HERO_RUNTIME.acting[id].idle.image.naturalWidth,
                  HERO_RUNTIME.acting[id].idle.image.naturalHeight]}
     ]))""")
     require(all(v['walk'] and v['idle'] and v['talk'] and v['size']==[192,192]
                 for v in r.values()),'approved original hero atlases loaded',r)
     REPORT['sprite_readiness']=r
     require(page.locator('#partyHud .party-row[data-hero]').count()==4,
            'all four heroes have visible individual labels')
     require(page.locator('#partyHud .commercial-hero-identity').count()==4,
            'four unique identity descriptions displayed')
     require(page.locator('#questHud [data-commercial-note]').count()==1,
            'field notes visible at native new game location')
     require(base.snapshot(page)['story']=='00_village',
            'new game began at original canonical stage')
     shot(page,'01_heroes_village_desktop')
     # UI-only combat targeting fixture — never written to save, does not
     # substitute for natural actual gray wolf / cave / Vark battles.
     page.evaluate("() => { startBattle('bats',true) }")
     page.wait_for_function("() => GC.State.get().battle?.id==='bats'&&!GC.State.get().locked",
                            timeout=10000)
     require(page.locator('#enemyCards [data-enemy-target]').count()==3,
             'original three-enemy UI rendered')
     before=page.evaluate("GC.State.get().battle.enemies.map(e=>e.hp)")
     card=page.locator('#enemyCards [data-enemy-target="1"]')
     card.click()
     require(page.evaluate("GC.Battle.selectedEnemy().name").endswith('B'),
             'explicit second enemy is focused')
     require(page.locator('#enemyCards [data-enemy-target="1"]').get_attribute('aria-pressed')=='true',
             'selected enemy visibly and accessibly highlighted')
     advice=page.locator('#commercialBattleAdvice').inner_text()
     require(bool(advice.strip()),'live contextual tactical advice visible')
     shot(page,'02_three_enemy_target_selected')
     page.locator('#battleActions [data-battle="attack"]').click()
     page.wait_for_function("""hp => {
       const b=GC.State.get().battle;
       return b&&b.enemies[1].hp<hp
     }""",before[1],timeout=8000)
     after=page.evaluate("GC.State.get().battle.enemies.map(e=>e.hp)")
     require(after[0]==before[0] and after[1]<before[1],
             'normal battle button damaged selected second enemy, not first',
             {'before':before,'after':after})
     REPORT['battle_target_before_after']={'before':before,'after':after}
     shot(page,'03_selected_enemy_damaged')
     context.close()
     mobile=browser.new_context(viewport={'width':390,'height':844})
     p=mobile.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
     p.goto(url,wait_until='networkidle')
     p.locator('#titleNewGame').click();base.clean_dialogue(p)
     p.wait_for_function("""() => ['karen','triton','sophie','margaret']
         .every(id=>HERO_RUNTIME.acting[id]?.idle?.ready)""",timeout=15000)
     vw=p.evaluate("({window:innerWidth,doc:document.documentElement.scrollWidth})")
     require(vw['doc']<=392,'390px narrow display has no horizontal overflow',vw)
     require(p.locator('#partyHud .commercial-hero-identity').count()==4,
             'hero identities readable in mobile HUD')
     shot(p,'04_heroes_village_mobile_390')
     mobile.close()
     require(not errors,'no JS runtime exceptions in two real browser contexts',errors)
     REPORT['status']='PASS'
    finally:
     browser.close()
 except Exception as exc:
  REPORT['status']='FAIL';REPORT['error']=str(exc)
  raise
 finally:
  (OUT/'phase9_ui_browser_results.json').write_text(
    json.dumps(REPORT,ensure_ascii=False,indent=2),encoding='utf-8')
if __name__=='__main__':main()
