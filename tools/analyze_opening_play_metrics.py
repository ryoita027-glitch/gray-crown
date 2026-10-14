#!/usr/bin/env python3
"""Gray Crown: summarize ACTUALLY EXECUTED keyboard-Chromium test evidence.

No synthetic sample data, no inferred commercial certification and no network
telemetry. A missing/incomplete E2E result fails closed rather than pretending
that adding a test means it passed.
"""
from __future__ import annotations
import json
import sys
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
VERTICAL=ROOT/'prototype_artifacts/vertical_slice_v1/vertical_slice_e2e_metrics.json'
OUTSKIRTS=ROOT/'prototype_artifacts/ryune_outskirts_v1/results.json'
DEST=ROOT/'prototype_artifacts/opening_play_review'

def exact_head():
    try:
        sha=subprocess.check_output(['git','rev-parse','--verify','HEAD'],
            cwd=ROOT,stderr=subprocess.DEVNULL,text=True).strip()
    except (OSError,subprocess.CalledProcessError) as exc:
        raise ValueError('Cannot prove tested source commit (Git checkout required)') from exc
    if len(sha)!=40 or any(x not in '0123456789abcdef' for x in sha):
        raise ValueError('Invalid Git commit id')
    return sha

def load_pass(path):
    if not path.is_file():
        raise ValueError(f'Missing real Chromium result: {path}')
    try:
        result=json.loads(path.read_text(encoding='utf-8'))
    except (OSError,ValueError) as exc:
        raise ValueError(f'Unreadable evidence {path}: {exc}') from exc
    if result.get('status')!='PASS':
        raise ValueError(f'Browser benchmark is not PASS: {path} ({result.get("status")})')
    return result

def number(value,field,minimum=0):
    if not isinstance(value,(int,float)) or isinstance(value,bool) or value<minimum:
        raise ValueError(f'Invalid/missing measured {field}: {value!r}')
    return round(float(value),2)

def compile_report(vertical,outskirts,expected_head=None):
    head=expected_head or exact_head()
    for name,row in [('main opening',vertical),('optional excursions',outskirts)]:
        if row.get('tested_commit')!=head:
            raise ValueError(name+' was tested at a different or unknown Git HEAD; '+
                'run all browser scenarios again on '+head)
    if not vertical.get('battles') or vertical.get('play_seconds',0)<=0:
        raise ValueError('No real input-run vertical-slice combat evidence')
    if not {'ryunefields','ryunebrook','village'}.issubset(set(outskirts.get('maps',[]))):
        raise ValueError('Missing either genuinely explored optional location')
    if outskirts.get('screenshots',0)<7 or outskirts.get('after_report_revisits',0)<2:
        raise ValueError('Post-report revisits and actual screen captures have not run')
    if outskirts.get('errors') or vertical.get('warnings'):
        raise ValueError('Evidence contains JS errors or unresolved warnings')
    if not (0<number(outskirts.get('real_play_elapsed_seconds'), 'detour elapsed') and
            number(outskirts.get('real_keyboard_walk_steps'),'detour steps',1)>0):
        raise ValueError('Missing actual keyboard movement timing/steps')

    recommendations=[]
    battlerecords=[]
    for item in vertical['battles']:
        metric=item.get('local_balance')
        if not isinstance(metric,dict):
            raise ValueError('Battle balance metrics missing (old run or untested HEAD)')
        for key in ('rounds','elapsedMs','openingHp','remainingHp','openingMp','remainingMp','damageTaken'):
            number(metric.get(key),key)
        if not isinstance(metric.get('actions'),dict):
            raise ValueError('Battle action counts not measured')
        if not metric.get('id') or not metric.get('outcome'):
            raise ValueError('Unidentified battle in metrics')
        snap={
            'id':metric['id'],'rounds':int(metric['rounds']),
            'seconds':round(metric['elapsedMs']/1000,1),
            'outcome':metric['outcome'],
            'commands':dict(metric['actions']),
            'damage_taken':number(metric['damageTaken'],'damageTaken'),
            'hp_left_percent':round(100*metric['remainingHp']/max(1,metric['openingHp']),1),
            'mp_left_percent':round(100*metric['remainingMp']/max(1,metric['openingMp']),1)
        }
        battlerecords.append(snap)
        if snap['rounds']>=9:
            recommendations.append({'stage':'combat','subject':snap['id'],
                'signal':'9+ turn sample','action':'Watch for repetitive actions; review real target/guard/heal choices before retuning HP.'})
        if snap['hp_left_percent']<=20:
            recommendations.append({'stage':'combat','subject':snap['id'],
                'signal':'low remaining HP','action':'Check guard forecasting, rest locations and MP before making fights harder.'})
    steps=number(outskirts['real_keyboard_walk_steps'],'detour steps',1)
    duration=number(outskirts['real_play_elapsed_seconds'],'detour elapsed',.01)
    dialogue=number(vertical.get('dialogue_seconds',0),'dialogue seconds')
    main_seconds=number(vertical.get('play_seconds'), 'vertical slice seconds',.01)
    # Automated Enter/Space presses accelerate dialogue; neither this time nor
    # its share of benchmark runtime measures how long a human reads the scene.
    dialogue_keys=number(vertical.get('dialogue_advance_keys'),'dialogue fast-forward keys')
    if dialogue_keys>=35:
        recommendations.append({'stage':'opening pacing','subject':'dialogue',
            'signal':'35+ accelerated dialogue keys in scripted input',
            'action':'Review the mandatory appointment with a human reader; never cut authored dialogue based only on automated fast-forward time.'})
    frame=vertical.get('frame_samples',{})
    if isinstance(frame,dict) and number(frame.get('slowFrames',0),'slowFrames')>0:
        recommendations.append({'stage':'performance','subject':'frame pacing',
            'signal':'real browser reported slow frames','action':'Inspect screenshots/perf trace at town, combat and dialogue transitions before graphical changes.'})
    return {
        'evidence_status':'MEASURED_SCRIPTED_KEYBOARD_PLAY',
        'not_evidence_of':'human 8-12h playtime, retail-ready art, mastered OST or game-wide difficulty',
        'tested_commit':head,
        'timing_scope':'Chromium keyboard automation; accelerated text is NOT human reading time',
        'opening_path':{
            'seconds':main_seconds,
            'steps':number(vertical.get('steps'), 'vertical steps',1),
            'accelerated_dialogue_seconds':dialogue,
            'dialogue_fast_forward_keys':dialogue_keys,
            'checkpoints':[{'name':p['name'],
              'keyboard_steps_to_here':number(p.get('keyboard_steps_to_here'),'checkpoint steps'),
              'seconds_to_here':number(p.get('seconds_to_here'),'checkpoint seconds')}
              for p in vertical.get('checkpoints',[])],
            'battle_samples':len(battlerecords),
            'slow_frames':frame.get('slowFrames',None) if isinstance(frame,dict) else None
        },
        'optional_ryune':{
            'elapsed_seconds':duration,'keyboard_steps':steps,
            'screenshots':int(outskirts['screenshots']),
            'post_report_return_trips':int(outskirts['after_report_revisits']),
            'story_remained_optional':outskirts.get('story')=='00_village'
        },
        'battle_details':battlerecords,'review_signals':recommendations,
        'policy':'Treat each signal as a QA hypothesis, not permission to blindly alter enemy stats. Re-run after changes.'
    }

def main():
    try:
        report=compile_report(load_pass(VERTICAL),load_pass(OUTSKIRTS),exact_head())
    except ValueError as exc:
        print('OPENING REVIEW BLOCKED:',exc,file=sys.stderr)
        return 2
    DEST.mkdir(parents=True,exist_ok=True)
    (DEST/'measurements.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({
        'evidence_status':report['evidence_status'],
        'battle_samples':len(report['battle_details']),
        'opening_seconds':report['opening_path']['seconds'],
        'ryune_keyboard_steps':report['optional_ryune']['keyboard_steps'],
        'review_signals':len(report['review_signals'])
    },ensure_ascii=False,indent=2))
    return 0

if __name__=='__main__':
    raise SystemExit(main())
