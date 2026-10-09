# Gray Crown — ROAD_CAVE_COMBAT_QUALITY_REVIEW_v1

**監査日:** 2026-10-10 JST  
**安全な作業ブランチ:** `pixel-vslice-road-cave-combat-v1`  
**起点SHA:** `43afc29087ba59df8c557f2d8cea83aa2bac66da`（PR #40、リュネ美術v2候補。技術CI成功済・正式美術採用は未承認）  
**本番main:** `d689aabb5146c9f45466a4f74f397e664c08fb4f`（変更禁止、未変更）  
**Save schema:** `23`。Story 00–19 / マップ定義 / 人物原画 / セーブ構造に変更なし。

> **総合判定: REVISE（実行証拠不足）。** 実装・単体テスト・ブラウザE2E・比較画像取得処理は新ブランチに追加した。現在の新しいGitHub Actions実行はジョブ実行ステップが存在せず、テストの成否を証明できていない。**CIが実際に成功するまで技術GOにも美術GOにも格上げしない。**

## 1. 既存コンテンツ監査

監査ファイル: `js/data/maps.js`, `js/data/battles.js`, `js/systems/exploration.js`, `js/systems/battle.js`, `js/render/world.js`, `js/render/battle.js`, `js/systems/audio.js`, 追加照合として`js/systems/events.js`, `js/systems/movement.js`, `js/data/items.js`, `js/core/save.js`。

**road**: 村の北出口から接続済み。灰牙狼(11,5)、ならず者(14,3)、洞窟入口(13,1)、既存道標、行商人、旅人の小箱が設置済み。道の曲がりは`makeRoadTilesV15`に定義済み。未完成要素は広範な楕円路肩/木の描画、森と道の画質差、敵が見えにくい輪郭など。

**cave**: 既存15行24列、石床C・壁S・北と南の通路P。コウモリ、石殻ムカデ、西/東のレバー、開閉機構、宝箱2つ、回復地点、灰角獣、出口が存在。イベントではコウモリ撃破→西レバー、ムカデ撃破→東レバーという既存条件を維持。未完成要素は石床と壁の階層差、開閉機構の視認性、岩壁の材質、ボス直前の目線の誘導。

**戦闘**: 4人の個別idle PNGを使用済。狼・ならず者・コウモリ・ムカデ・角獣の区別は既存CSSマークアップで存在するが、HP/MPは文字が中心。攻撃・魔法・回復は既存の短い演出がある。戦闘描画のたびに4人のHTMLを再生成しており、攻撃アニメーションが途中で切断される懸念あり。ボス`boss`は`phase:1`データを持つが、`boss:true`がなく、既存のPHASE II/III処理と専用シネマティックが動作しない。

**音響**: 元からWeb Audio oscillatorによる短い単音シーケンスのみ存在。街道はroad、その他のマップはtravel、戦闘はbattleに統一され、洞窟や初回ボス固有のテーマはなかった。すべて**著作権フリー音源でなく、ゲームコードが合成する仮音**。正式BGM/環境音/足音の最終マスタリングは未制作。

## 2. 実装内容

### A. 既存地形を維持した描画
新規`js/render/road_cave_quality.js`を既存`world.js`の前に読み込み、**road と cave のみ**背景描画を整数座標矩形のピクセル処理に切り替えた。草と道の段差、木の葉/幹、路肩、石床、石造壁、古砦の開閉機構の誘導を追加。遠景も遠近法や新規マップオブジェクトとしてではなく、既存のタイル内レイヤーとして提示する。いずれも衝突判定ではない。

`RoadCaveQuality.enabled=false`で以前の描画へ戻せる。**map tiles, objects, NPC, X/Y、Story、Save schema、人物の原画は変更なし。** 地形描画のうち既存の丸い装飾をこの2マップで省く。ほかの世界地域、村と屋内は現行の処理を維持する。

### B. 戦闘視認性
`js/render/battle.js`で同じ4人のバトルDOM要素を戦闘中は保持し、被弾/攻撃時の短いアニメーションが再描画によって中断される問題を抑える。主人公4人の元の`assets/characters/<id>/<id>_idle.png`をそのまま表示。行動中の枠、HP/MPゲージ、方向の異なる街道/古砦戦闘背景を追加。携帯画面幅では敵/味方の配置間隔を圧縮。敵固有の**新しい正式スプライトは未導入**。

### C. 戦闘難易度・既存ルール

変更前と後で**HP・EXP・G・ドロップ確率・プレイヤースキル・基本与ダメージ式は変更していない**。

| エンカウント | HP / 攻 / 防（既存） | ゴールド | EXP |
| --- | --- | --- | --- |
| 灰牙狼 | 72 / 10 / 4 | 22 | 22 |
| 街道のならず者 | 82 / 11 / 6 | 28 | 24 |
| 洞窟コウモリ | 28、28、24（3体） | 18 | 16 |
| 石殻ムカデ | 105 / 14 / 7 | 42 | 30 |
| 灰角獣 | 185 / 18 / 9 | 125 | 65 |

修正点1: 最初の灰角獣について既存の`boss`フラグを有効にする。敵HP65%未満で既存のPHASE II、30%未満でFINAL PHASEへ移る。攻/防は既存`enemyTurn()`によって18/9 → 20/9 → 23/10となる。**実装されていたものの動いていなかった段階的緊張を有効化した**。バランスの変更として明示するため、購入前の難易度試遊/再評価は未了と記載。

修正点2: 敵が同一人物を3回以上連続標的にするのを、他の生存者がいる場合に限り禁止（`selectEnemyTarget`）。敵の攻撃力、攻撃回数、1回の被ダメージは変わらない。味方が1人だけの場合は制限なし。これは「敵が同じ人を3回連続で狙い撃ち」を防ぐ最小限の公平性修正。元のランダムターゲット4人/3攻撃で同じ1人に3連続命中する確率は`4×(1/4)^3 = 6.25%`（4人全員が生存、独立一様と仮定）、新処理ならその条件で0%。**実際のゲームでの勝率測定は未完了**。

### D. 音響
- `mapMusicTheme('cave')`→新設`cave`シーケンス。
- 灰角獣戦のみ`boss`シーケンス。勝利後はマップのテーマに戻す既存処理を利用。
- 既存のセーブ/アイテム取得に対応し`pickup`、レバー操作に`lever`の合成音を追加。
- `AudioContext`生成が失敗した場合は例外をゲームに伝播させず無音で続行。ミュート時はマスターゲインを0にし、周期処理を止める。音声再開時は元の音量を復帰。
- **正規音源ファイルはなし**。商用使用可能な録音BGM、音量正規化、効果音のタイミングデザイン、環境音の専用ループは後続工程。

## 3. 変更ファイルと禁止事項

追加: `js/render/road_cave_quality.js`, `tests/browser_road_cave_quality_e2e_test.py`, `tests/road_cave_combat_quality.test.js`, `.github/workflows/road-cave-combat-quality.yml`。

更新: `index.html`, `tests/harness.js`, `js/render/world.js`, `js/render/battle.js`, `js/data/battles.js`, `js/systems/battle.js`, `js/systems/audio.js`, `js/systems/events.js`, `js/systems/exploration.js`, `css/game.css`。

不変: `js/data/maps.js`、`js/data/items.js`、`js/core/save.js`、主人公4人の正式PNG、国家/宗教/物語の設定。新規ダンジョン/武器/敵は追加なし。**`main`へはマージしない**。

## 4. 検証と結果

### 追加した単体テスト（未実行）
`tests/road_cave_combat_quality.test.js`: ボスしきい値の2段階変化、ターゲット保護、敵HP/報酬固定、4人のidle画像パス、音響無出力時の安全性、マップスコープ。

### 追加した通常操作E2E（未実行）
`tests/browser_road_cave_quality_e2e_test.py`: 新規ゲーム→使者→村北門→街道→灰牙狼→ならず者→古砦入口→宝箱→コウモリ→西レバー→ムカデ→東レバー→灰角獣戦→報酬→セーブ/ロード。戦闘中のSave/Load禁止、4主人公の画像パス、音声トグル、小型PC/スマホの横はみ出しを検査。場面キャプチャはbefore/after road、before/after cave、通常/ボス戦、レバー、ボス後とする。

**実行コマンド（CIに設定済）**
```sh
python -m playwright install --with-deps chromium
python tests/browser_road_cave_quality_e2e_test.py
npm run check
python tools/verify_sophie_direction_lock.py
python tools/verify_margaret_direction_lock.py
python tools/verify_clean_runtime_sprite_assets.py
python tools/verify_four_protagonist_appeal_runtime.py
```

**現状のCI状態:** 新設ワークフロー `Gray Crown Road Cave Combat Quality E2E` は実行番号 `37970769609`、`37971139120`、`37971182098` で `failure`。いずれも数秒で終了し、GitHubコネクタで取得できるジョブの`steps`が`null`、テストログも取得できず、スクリーンショットartifactsも0件。**失敗をテストの不具合と断定できない一方、テスト成功とも断定できない**。残りActions分・課金設定・実行機の割当はコネクタから確定できない。最新実行とジョブ割り当て状態をGitHub Actions画面で確認する必要がある。

**追加の静的検証:** 変更した8本のJSモジュールをGitHubの最新ソースから読み込み、V8 JavaScriptコンパイルに成功。**実ゲーム進行テスト、スクリーンショット、性能測定の代替にはしない**。

## 5. バグ優先順位と残余リスク

- **S0/S1 未排除**: 新しいゲーム進行E2E未実行。既存Story 00～19とSave schema 23の差分は未変更だが、全回帰成功の証拠が必要。
- **S1 検査待ち**: ボスシネマティック時間とE2E待機、敵集中抑制後の通常/敗北時動作、ボス戦演出中の入力ロック、元idle PNGの全端末表示。
- **S2 未確定**: 街道の路肩/樹木と背景の明度差、古砦の床と壁、レバーの読みやすさ、スマートフォンの戦闘UI、描画負荷。
- **S2 美術的限界**: 敵のCSS造形・ボス専用スプライト未完成。環境の描画はCanvasの整数矩形中心であり、発売品質の専用アトラス美術とは異なる。
- **S3 音響的限界**: 全音源はWeb Audio合成の仮素材。長時間聞いて疲れない音楽・空間音・ゲーム内音量調整の製品検証が必要。

## 6. 採用判定

**技術: REVISE** — 対象HEADの`npm run check`・新規E2Eが実際にSUCCESSとなるまで不合格項目を閉じない。  
**美術: REVISE** — 実ゲーム画像のbefore/afterが同一ビルドで揃い、ゲームとしての視認性をユーザーが確認するまで保留。  
**音響: PROVISIONAL** — 合成の仮音としてのみ採用候補。  
**総合: REVISE / main未マージ。**

重要: この資料は試験未実施の箇所をPASS扱いしない。GitHub Actionsの起動問題が解消後、新規E2Eから既存全回帰へ進め、画像と性能を取得し、不具合があればS0→S1→S2→S3で修正する。
