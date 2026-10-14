#!/usr/bin/env python3
"""Real UI play, no state edits. Contrast first-wolf protect vs direct attack.

Two real New Game runs are *samples*, not proof of optimal difficulty. The
boss and late-game balance require longer human and keyboard-play evidence.
"""
import json
import time
from pathlib import Path

from playwright.sync_api import sync_playwright
import browser_vertical_slice_e2e_test as first

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'prototype_artifacts/first_wolf_tactics_v1'

def fight_wolf(page,strategy):
    page.wait_for_function("() => !GC.State.get().locked && GC.State.get().battle?.id==='wolves'",timeout=6000)
    assert page.locator('#battleActions button:not([disabled])').count()>0,'battle UI not ready'
    page.wait_for_timeout(270)
    page.screenshot(path=str(OUT/(strategy+'_actionable.png')),full_page=True)
    commands=[]
    start=time.perf_counter()
    for _ in range(150):
        state=first.snapshot(page)
        if not state['battle']:
            break
        if page.locator('#levelUpContinue').is_visible():
            page.locator('#levelUpContinue').click()
        if page.locator('#battleResult').is_visible() or page.evaluate('GC.State.get().locked'):
            page.wait_for_timeout(190)
            continue
        actor=page.evaluate("() => {const s=GC.State.get();return s.party[s.battle.actor]}")
        if not actor:
            page.wait_for_timeout(90)
            continue
        options={'karen':'guard' if strategy=='guard' and
                  not any(x['hero']=='karen' for x in commands) else 'attack',
                 'triton':'heavy','sophie':'staffSophie','margaret':'fire'}
        chosen=options[actor['id']]
        button=page.locator('#battleActions button[data-battle="'+chosen+'"]')
        if not button.count() or button.is_disabled():
            chosen='attack' if actor['id'] in ('karen','triton') else 'staffSophie' if actor['id']=='sophie' else 'staffMargaret'
            button=page.locator('#battleActions button[data-battle="'+chosen+'"]')
        assert button.count() and not button.is_disabled(),(strategy,actor['id'],chosen)
        commands.append({'hero':actor['id'],'button':chosen})
        button.click(timeout=3500)
        page.wait_for_timeout(170)
    else:
        raise AssertionError('The first scripted wolf battle could not finish in time')
    for _ in range(65):
        if page.locator('#levelUpContinue').is_visible():
            page.locator('#levelUpContinue').click()
        if not page.locator('#battlePanel').is_visible():
            break
        page.wait_for_timeout(175)
    assert not page.locator('#battlePanel').is_visible(),'wolf result panel did not close'
    first.clean_dialogue(page)
    row=page.evaluate("""() => {
      const e=GC.Log.get().filter(x=>x.message==='Local Battle Balance'&&x.data?.id==='wolves').at(-1);
      return e?.data||null
    }""")
    assert row is not None,'real battle did not report actual local balance'
    assert row['rounds']>=1 and row['enemyAttacks']>=0
    return {'mode':strategy,'wall_seconds':round(time.perf_counter()-start,2),
      'recorded_battle':row,'normal_ui_commands':commands,
      'end_party_hp':first.snapshot(page)['hp']}

def play(browser,url,mode):
    page=browser.new_page(viewport={'width':1365,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto(url,wait_until='networkidle')
        page.locator('#titleNewGame').click()
        first.clean_dialogue(page)
        assert first.snapshot(page)['story']=='00_village'
        first.walk_to(page,[(12,7)],'royal envoy')
        page.keyboard.press('ArrowUp')
        page.wait_for_timeout(first.WAIT_MS)
        page.keyboard.press('Enter')
        page.wait_for_function('() => GC.RyuneActing.isRunning()',timeout=8000)
        first.clean_dialogue(page)
        assert first.snapshot(page)['story']=='01_appointed'
        first.walk_to(page,[(11,1),(12,1)],'village north')
        first.cross_north_boundary(page,'road','normal north gate')
        first.walk_to(page,[(11,7)],'first wolf encounter')
        for _ in range(3):
            if first.snapshot(page)['battle']:break
            page.keyboard.press('ArrowUp')
            page.wait_for_timeout(first.WAIT_MS)
        assert first.snapshot(page)['battle']=='wolves'
        report=fight_wolf(page,mode)
        assert 'wolf' in first.snapshot(page)['defeated']
        assert not errors,'JS errors '+repr(errors[:4])
        return report
    finally:
        page.close()

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    rows=[]
    with first.served() as url,sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        try:
            for mode in ('attack','guard'):
                rows.append(play(browser,url,mode))
        finally:
            browser.close()
    result={'status':'PASS','tested_commit':first.source_head(),
       'methods':'two separate randomized New Game/UI playthroughs; not seeded results',
       'sample_size_per_strategy':1,'caution':'DO NOT retune damage from one random sample',
       'first_wolf_results':rows}
    (OUT/'results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'sha':result['tested_commit'],
      'outcomes':[(x['mode'],x['recorded_battle']['rounds'],
                   x['recorded_battle']['damageTaken']) for x in rows]},ensure_ascii=False))

if __name__=='__main__':
    main()
