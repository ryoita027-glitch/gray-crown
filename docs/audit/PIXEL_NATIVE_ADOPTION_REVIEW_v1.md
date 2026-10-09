# Gray Crown — PIXEL_NATIVE_ADOPTION_REVIEW_v1

**監査日:** 2026-10-10 JST
**対象:** PR #35（integration/commercial-reconcile-20261010）
**検査したPR #35 HEAD:** c8ac59a1a16ce3ac8b6450687b7e86d51d65e6f1
**main HEAD:** d689aabb5146c9f45466a4f74f397e664c08fb4f
**専用作業ブランチ:** pixel-vslice-acceptance-gate-v1
**Save schema:** 23（変更なし）

## 0. 判定

**総合：REVISE。技術的GOは既存進行/セーブの検査済み範囲に限定。美術的GOは未判定。** 本資料・CIの成功だけで、mainへのマージ、Pixel-native正式採用、Portrait方式の変更を許可しない。

## 1. Source of TruthとPR依存

mainのdocs/audit/CURRENT_PROJECT_STATE.md、docs/audit/NEXT_WORK_ORDER.md、docs/visual/SOURCE_OF_TRUTH_STATUS.mdは正式本番v23と未採用状態を記録する。試作側docs/pixel/PIXEL_CHARACTER_STANDARD_v2_FOUR_PROTAGONIST.mdは**PROTOTYPE AUTHORITY**であり、本番採用権限はない。

| PR | HEAD SHA | 基点 |
| --- | --- | --- |
| #30 | 44ee034d8e11654b14572ab6ce91ad9c76933197 | 四人目試作 |
| #31 | 384cb513c81cd54f0755b969ee51d4e235489f76 | #30 |
| #32 | 7bb3c8b5ee12b10c0c00fa2b195a814973f2505b | #31 |
| #33 | e678d5daf7fb23c6779320640d47bf5132510648 | #32 |
| #34 | a23fa1c53a2d1e251bb9e8b7cebc6aeb0555abd7 | #32 |
| #35 | c8ac59a1a16ce3ac8b6450687b7e86d51d65e6f1 | #33/#34を競合解消（base #32） |

PR #35は#33のMedium44・UI・背景・戦闘・NPCを選び、#34の足元リングのみ追加した案。4人の参照画像とWalk PNGのGit blob SHAは#32〜#35で一致。mainとPR #35のSave/State/Story/Maps/Events/Battle systemの6ファイルもGit blob SHAが一致した。これはロジック差異がない証拠であり、あらゆる端末での互換を保証するものではない。

## 2. 初期のPR #35 CI結果

以下4件は対象PR HEADでいずれもSUCCESS。

- Commercial Polish CI: 37958965333
- Four Protagonist Appeal CI: 37958965421
- Triton Completion CI: 37958997189
- Current Playable Build: 37958965717

## 3. 追加Chromium検証

PR #35の現在の配布版HTML、JS、CSS、実PNGを使用。隔離実行環境では通常のブラウザナビゲーションが禁止されるため、ローカル検証のみ、Chromiumへ元ファイルのバイト列をリソースとして供給してlocalStorageをブラウザ内で模擬。**スクリーンショットの描き直し・AI再生成はしていない。**

**43項目 PASS・0 FAIL（PR #35オリジナルビルド）**
- 通常操作：タイトル→新規ゲーム→使者の任命イベント完了
- 村→カレンの家→村への出入り、村北門→街道
- 狼との通常戦闘開始、通常のコマンド操作で勝利、狼の撃破フラグ保持
- 街道→古砦跡の実移動
- ゲーム内メニューから保存、Continueによる復元、壊れた主セーブからバックアップ回復
- カレン・トリトン・ソフィ・マーガレットの直接48pxシート読込
- ブラウザJS例外なし、元のゲーム画像リソース欠損なし
- 1365x900、1024x768、390x844の実画面・ピクセル表示・横方向はみ出しなし

追加の隔離された状態検査は、宝箱・狼撃破情報の保存/復元、schema23の構造化復元、敗北分岐後のHP/MP復帰がPASS。ただしこの3件は状態/APIによる検査であり、**通常操作での宝箱獲得・敗北E2Eとは数えない**。

## 4. 新規受け入れCI

Workflow: .github/workflows/pixel-vslice-acceptance-gate.yml

実行コマンド:
- npm run check
- python tools/verify_sophie_direction_lock.py
- python tools/verify_margaret_direction_lock.py
- python tools/verify_clean_runtime_sprite_assets.py
- python tools/verify_four_protagonist_appeal_runtime.py
- python -m playwright install --with-deps chromium
- python tests/browser_pixel_vslice_acceptance_e2e_test.py

このCIはlocalhostの実HTTPサーバとChromiumを使う。スクリーンショットはgray-crown-pixel-vslice-acceptance-evidenceというActions artifactへ保存する。内訳はdesktop_village / desktop_reversal / desktop_event_dialogue / desktop_karenhome / desktop_road / desktop_battle / desktop_post_battle / desktop_cave / desktop_continue と smallpc/mobile のvillage / road / interior。小型PC・モバイルのroad/interiorは**表示証拠用の状態位置設定**であり通常のストーリー進行の証拠ではない。

初回の追加CI run 37961304833では、テストセレクターが#35実装に存在しない旧クラス名を使い、戦闘描画assertが失敗。DOMに実在する #partyBattleLine .battle-hero を選ぶよう修正した。4人分の実スプライトを要求するassertは一切削除・緩和していない。

## 5. S1の発見と局所修正

**S1: 小さな周回でフォロワーが重なる。** プレイヤーの通常入力 Up, Up, Right, Right, Down, Left, Up, Down 後、従来のtrail[0]/[2]/[4]抽出ではリーダー含め4人の位置が3種類になり、重なって見えなくなるおそれがあった。

専用ブランチのjs/render/world.jsに限り、従来の[0,2,4]を優先しつつ重複時だけ実際の移動履歴[1,3]から異なるタイルを選ぶ修正を追加した。Source PNG・Save schema・設定・物語・戦闘値は不変。新規の実ブラウザ再現テストは4座標が異なることを必須とする。隔離Chromiumでは修正後4座標すべて分離できた。極端に2タイル間を往復している場合など、移動履歴に独立した位置が足りないケースは**残余リスク**として引き続き確認する。

## 6. 未完了・判定理由

| 軸 | 現状 |
| --- | --- |
| 起動、会話、村→街道→古砦、通常戦闘、保存/再開 | 検査済み範囲で技術的GO |
| 狭い周回の重なり | 局所S1パッチ・再現テストあり。最新CIを照合して再判定 |
| スプライトの個性と識別性 | 4人の表示・素材整合は成立。美術の最終判断はユーザー |
| 背景・NPC・家具との造形差 | S2、ドット密度・絵柄の差が残る |
| スマホ | S2、縦方向の情報密度と「決定」文字折返しが視認性リスク |
| Portrait ON/OFF | A/B未決。既定OFF化・Portrait削除は認めない |
| 本物のmain v23セーブファイル | 実ファイルからのブラウザ読込がまだ未検証（保存コードは同一） |
| 通常プレイでの敗北 | 未検証（敗北処理の隔離テストのみ） |
| 宝箱を通常操作で取得したセーブ | 未検証（隔離の復元テストのみ） |
| 極端な短距離反転 | 残余リスク、要追加試験 |
| 商用品質 | **美術的REVISE**。CI成功のみでGOとしない |

## 7. 採用境界

**総合REVISE。** PR #35は技術統合の第一候補として保持し、受け入れCIの全緑・実画像の目視・上記リスクの追加検証後に再評価する。ユーザーが美術・Portrait・正式採用を明示的に決定するまでmainを変更しない。

禁止事項順守：main未変更、承認された4人の素材を再描画せず、Save schema・世界観・物語を変更せず、既存テストを削除/緩和せず、PR #35本体を上書きせず専用ブランチ内でのみ修正。
