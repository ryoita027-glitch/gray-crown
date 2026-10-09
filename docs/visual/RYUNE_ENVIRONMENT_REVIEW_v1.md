# Gray Crown — RYUNE_ENVIRONMENT_REVIEW_v1

**日付:** 2026-10-10 JST  
**Production main HEAD:** `d689aabb5146c9f45466a4f74f397e664c08fb4f` (未変更)  
**安全な開発起点:** PR #36 HEAD `9bbea4da0878f17109e4ceaf45f033ed73f17883`  
**作業ブランチ:** `pixel-vslice-ryune-environment-v1`  
**対象:** `village`, `karenhome`, `orphanage`, `mayorhouse`, `cottage`  
**評価:** 技術候補GO、**美術はユーザーの正式評価待ち**。mainへのマージ/正式採用は未承認。

## 1. 最初に凍結したマップ

- `js/data/maps.js` Git blob SHA: `3af9d84498aa0d9f5a14963af36c2b1f94a5ffbe`。
- `js/data/npcs.js` Git blob SHA: `2d3d7e3397bbba6f1f5ca251653cc2792ee64715`。
- 上記2ファイル、`js/core/save.js`、`js/data/events.js`、承認済み4人のPNGを**編集しない**。
- 既存tileの通行不可はT/H/S/W/R/K/Z、NPCの位置、配置済みobjectとそのtriggerを維持。

### 既存ランドマークと出入口

| 用途 | 建物左上tile | 対応する元の出入口/作動座標 | 戻り先 |
| --- | --- | --- | --- |
| カレンの家 | (3,2) | home (4,5) | village (4,6) |
| 孤児院 | (18,2) | doorOrphanage (19,5) | village (19,6) |
| 村長宅 | (3,9) | doorMayor (4,12) | village (4,13) |
| 東の民家 | (18,9) | doorCottage (19,12) | village (19,13) |

村の井戸(12,9)、倉庫・物資点(16,9)、北門(11,0)と、使者・村長・孤児などのイベント/NPCは移動しない。家の室内は共通の16x11内側歩行域と扉(11/12,12)を維持する。

## 2. 現行版の課題（A/B：実ゲーム画像）

**A: PR #36の旧描画を使用したbefore**。キャラクターは旧描画・新描画どちらも同一ソースPNG。
- 地面: 巨大な透明楕円/滑らかな染み、細かな明度ノイズ、32pxタイルとオーバーレイの不一致
- 建物: 同一形状の単純な色替え、屋根・窓・玄関の形が揃い切らない
- 屋内: 全室共通の家具密度・大きな楕円光・大型の単色ラグ、部屋ごとの用途を読み取りにくい
- NPC: 4人の精密なドットとの差が残る（今回、NPC本体は未再デザイン）

**B: 新描画**。全て`tests/browser_ryune_environment_e2e_test.py`が本物のゲームCanvasをChromiumで表示した結果。旧描画と新描画の切替は**ゲームCanvas内の背景部分のみ**で、比較画像にAI描き直し・補間処理は一切入れていない。

## 3. 画面実装

新規`js/render/ryune_environment.js`を`index.html`で`world.js`の直前にロードし、`world.js`の村・4室内に対してだけ描画フックで呼ぶ。従来描画も維持し、`RyuneEnvironment.enabled=false`でbeforeをそのまま再現できる。

**地面**: 描画域を整数32px tileに固定。草は少数の落ち着いた緑ベース/短い矩形パッチ/意図した目印だけ。通行可否は変更しない。PとG/H/Tの縁を矩形階段で接続。ゆらめく透明楕円、アンチエイリアス曲線、ランダムな毎フレームの飾りは使わない。決定的hashから同じ地面を再生成する。

**建物**: 全4棟は96px幅の同一構造を共有（石の基礎、木枠、階段状の屋根、窓枠とガラス、既存入口に合う扉）。カレン宅は落ち着いた赤褐色、孤児院は緑系、村長宅は青灰系、民家は温かい茶系。絵柄の識別用であり、所得・階級・宗教・紋章の設定を追加していない。

**生活感**: 既存の畑は同じx1～2の平面として耕作の筋を見せる。既存の井戸と物資点をピクセル造形にし、既存の建物/壁ぎわに荷箱・洗濯・踏石・柵を少数配置。移動可能タイルに「実は通れない」障害物は作らない。

**屋内**: 壁と床は同じセル密度の板張りと窓。各室は既存オブジェクトへの対応を基本に寝具・収納・共有テーブルなどを使い分ける。カレン家は寝具＋生活テーブル、孤児院は複数寝具と共同テーブル、村長宅は書棚と作業机、民家は寝具・小家具。固有の来歴・家族所有物・宗教シンボルは追加しない。扉のマットは従来の退出位置(11,12)に固定。

**重なり方**: 主人公・NPCのレンダリング経路と奥行き順をそのまま維持。建物の上部が既存blocked H領域を描く構成で、屋根下への侵入が発生しない。家具は既存インタラクト点のまわりに低い平面物として配置。遠近表現を新たに加えていない。

## 4. CIと実スクリーンショット

### コマンド

```sh
npm run check
python tools/verify_sophie_direction_lock.py
python tools/verify_margaret_direction_lock.py
python tools/verify_clean_runtime_sprite_assets.py
python tools/verify_four_protagonist_appeal_runtime.py
python -m playwright install --with-deps chromium
python tests/browser_ryune_environment_e2e_test.py
```

**最初のCI失敗** run 37964318331: Nodeテストの`tests/harness.js`が環境モジュールを読み込まず、`RyuneEnvironment is not defined`で7件失敗。**テストの削除・基準緩和なし**、Nodeテスト側のスクリプト順序を本番`index.html`に合わせて追加修正。

**修正後CI成功** run [37964442648](https://github.com/ryoita027-glitch/gray-crown/actions/runs/37964442648):
- Existing game and save regression: SUCCESS
- Four-character source/runtimes: SUCCESS
- 実Chromiumでの新環境E2E: SUCCESS（147 asserts）
- ブラウザスクリーンショットと負荷測定: SUCCESS

Actions artifact **11632694111**（`gray-crown-ryune-environment-v1-evidence`）。
スクリーンショット一覧:
- `before_village.png`, `after_village.png`, `after_village_whole_map.png`, `after_village_party_walk.png`
- `after_karenhome_exterior.png`, `before_karenhome.png`, `after_karenhome.png`
- `after_orphanage_exterior.png`, `before_orphanage.png`, `after_orphanage.png`
- `after_mayorhouse_exterior.png`, `before_mayorhouse.png`, `after_mayorhouse.png`
- `after_cottage_exterior.png`, `before_cottage.png`, `after_cottage.png`
- `after_npc_near_building.png`, `after_save_load.png`, `after_smallpc_village.png`, `after_mobile_village.png`
- `environment_results.json`にはテスト条件・個別assert・描画負荷を機械可読で格納。

`before_*.png`と`after_*.png`は**同一Canvas、同一4人の素材、同一マップ配置**を新旧描画toggleで撮影したものであり、画像生成の作例ではない。`after_village_whole_map.png`だけ表示用にカメラスケール1として24x15マップをフレーム内へ収める。実際のゲーム内レイアウトUIは標準画像に残す。

### 技術的確認

- 4人のwalk PNG 288x192と世界表示44pxを保持。
- 通常キーボードで使者イベント、4棟の入口への到達・入室・退出/村の戻り位置を検証。
- NPC/object/tile配置をシリアライズして開始前後で完全一致。
- 通常プレイから`GC.Save.save(true)`と`GC.Save.load(true)`を通過。Schema 23を確認。
- S1で対処した折返し4人座標の分離テストを維持。
- 1365x900、1024x768、390x844のCSS pixelatedと横はみ出しなしを確認。Chrome console/page error 0。

**描画性能 (GitHub Actions Chromium, 12回のうち初2回を除く計測、1sceneあたり):**
- 旧village: median **1.0ms**, max **1.2ms**
- 新village: median **0.7ms**, max **1.2ms**

これは同一CIマシン内の参考値であり、低速実機のFPSや一般環境の保証ではない。

### 追加NPC到達テスト
使者に加え、トリトンの父/孤児院の子/村長へ通常キー操作で近づき、対話が開くことを確認するE2Eを追記。最新HEADでのワークフロー結果はGitHub Actionsのブランチ実行を確認すること。

## 5. 既知の制約と改善前後の判断

- 建物の美術的な魅力は旧版よりピクセル統一したが、**本物の商用RPGとしての美術評価は未認定**。背景に比べて主人公44pxの密度が高く、NPCの小ささ・表情の差は残る。
- 室内は用途差を増やしたが、描画自体は主に低い四角形による形状表現。家具の陰影・接地・壁掛けと歩ける床の区別は後続改良対象。
- 低性能端末の長時間描画は未検証。画面のビジュアル比較でユーザーが確認した後、美術決定を確定する。
- 元の通行判定を変えず畑等は歩けるため、作物と移動の読ませ方は次の美術判断。
- 旧v23実セーブの実プレイ互換は工程0の未完事項。今回Save schemaは完全に不変。

## 6. 採用判断

**技術: GO（CIに成功した検証範囲）**。既存の地形・出入口・イベント・セーブを保持する局所的な改善で、環境描画のbefore/after切替も残る。

**美術: REVIEW / ユーザー判断待ち**。村の4建物と4部屋が同じピクセル言語になったか、さらに個性を強めるか、実画面を見たユーザーが評価する。

**本番: 未採用**。`main`は一切変更しない。Pixel-native全体採用、主人公の原画変更、Portrait方針、物語/世界観の変更も本資料から承認しない。
