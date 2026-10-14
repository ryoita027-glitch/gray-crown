"""Unit tests for scorecard honesty; fixtures are NOT real play evidence."""
import importlib.util
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('opening_metrics',ROOT/'tools/analyze_opening_play_metrics.py')
metrics=importlib.util.module_from_spec(spec)
spec.loader.exec_module(metrics)
REV='a'*40


def sample():
    vertical={
      'tested_commit':REV,'status':'PASS','play_seconds':62.5,'steps':84,
      'dialogue_seconds':7.6,'dialogue_advance_keys':44,
      'checkpoints':[{'name':'road arrival','keyboard_steps_to_here':28,
                      'dialogue_keys_to_here':44,'seconds_to_here':22.3}],
      'frame_samples':{'slowFrames':0},
      'battles':[{'local_balance':{
        'id':'wolves','rounds':2,'elapsedMs':3800,
        'openingHp':240,'remainingHp':238,'openingMp':110,
        'remainingMp':104,'damageTaken':2,'actions':{'attack':4,'heavy':1,'guard':1},
        'outcome':'defeat'
      }}]
    }
    outskirts={
      'tested_commit':REV,'status':'PASS','maps':['village','ryunefields','ryunebrook'],
      'screenshots':7,'after_report_revisits':2,'errors':[],
      'real_keyboard_walk_steps':120,'real_play_elapsed_seconds':78.2,
      'story':'00_village'
    }
    return vertical,outskirts


class TestEvidenceIsNotFabricated(unittest.TestCase):
    def test_same_head_measured_scripted_report(self):
        v,o=sample()
        out=metrics.compile_report(v,o,REV)
        self.assertEqual(out['tested_commit'],REV)
        self.assertEqual(out['opening_path']['dialogue_fast_forward_keys'],44)
        self.assertEqual(out['opening_path']['checkpoints'][0]['keyboard_steps_to_here'],28)
        self.assertEqual(out['battle_details'][0]['rounds'],2)
        self.assertIn('NOT human reading time',out['timing_scope'])
        self.assertTrue(out['review_signals'])
    def test_old_head_is_always_rejected(self):
        v,o=sample()
        o['tested_commit']='b'*40
        with self.assertRaisesRegex(ValueError,'different or unknown Git HEAD'):
            metrics.compile_report(v,o,REV)
    def test_unversioned_browser_results_are_not_a_release_pass(self):
        v,o=sample()
        del v['tested_commit']
        with self.assertRaisesRegex(ValueError,'different or unknown Git HEAD'):
            metrics.compile_report(v,o,REV)
    def test_missing_or_fake_battle_sample_is_rejected(self):
        v,o=sample()
        v['battles'][0]['local_balance']=None
        with self.assertRaisesRegex(ValueError,'Battle balance metrics missing'):
            metrics.compile_report(v,o,REV)
    def test_screenshots_and_revisits_have_to_be_from_finished_test(self):
        v,o=sample()
        o['screenshots']=3
        with self.assertRaisesRegex(ValueError,'Post-report revisits'):
            metrics.compile_report(v,o,REV)
    def test_automated_time_is_not_a_human_pacing_estimate(self):
        v,o=sample()
        v['dialogue_seconds']=25
        out=metrics.compile_report(v,o,REV)
        self.assertFalse(any('dialogue/script ratio' in x['signal']
           for x in out['review_signals']))
        self.assertIn('human reader',out['review_signals'][0]['action'])


if __name__=='__main__':
    unittest.main()
