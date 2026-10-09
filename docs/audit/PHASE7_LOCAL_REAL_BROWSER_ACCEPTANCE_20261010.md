# Gray Crown — 工程7 現行統合版の実Chromium通し試験結果 (2026-10-10)

**対象**: Draft PR #47 `pixel-vslice-phase7-ci-recovery-v1`。実行時のゲーム資産は、PR #47初期HEAD `9cce335692ce3bb742358c75856baf71bebd91e8` とGit blobが一致するHTML、CSS、JavaScript30ファイル、承認済み主人公PNG32ファイル、計**64/64一致**。後続コミットはE2E・資料・CIのみでゲーム実行用ファイルを変更していない。

**重要な区別**: これは**ローカルChromium上で通常操作した実行証拠**。GitHub ActionsのJob PASSでも、GitHub上で全回帰`npm run check`がPASSした証明でも、同一オリジンでの配信試験でもない。ローカル環境ではHTTP/fileページへの通常ナビゲーションが管理者側で遮断されるため、`page.set_content` + Playwright asset routingで、実ファイルのHTML、CSS、30 JS、32 PNGをロードして試験した。画面を創作・画像生成したのではなくゲームのCanvasとDOMをChromiumで描画し撮影している。

## 1. 完走（ゲーム本体の修正なし）

**連続1セッションの独立Playwright通常入力テスト: 30/30チェックPASS**。

`New Game` → リュネ村→使者任命→村北門→`road`→灰牙狼→`cave`→薬草宝箱→コウモリ→西レバー→石殻ムカデ→東レバー→砦の回復所→灰角獣ボス→ゲーム本来のSave→**新しいページのContinueで撃破状態を復元**→古砦北出口→`northroad`→王都`capital`（Stage `05_capital`）。

すべてキーボード移動、通常の会話進行、戦闘コマンド、ゲームのセーブ/ロードのみ。**Dev Mode移動や敵HP・Story flagの捏造はなし**。戦闘実績は灰牙狼5コマンド、灰角獣13コマンドで勝利。洞窟のランダム戦闘も発生し正常に処理した。完走スクリーンショット6枚および実際のチェック結果・ドライバソース・コンソールログを会話添付の`gray-crown-phase7-single-session-acceptance.zip`に収録。

追加の本物のボス前Saveからの別セッション再試験では、さらに**18/18チェックPASS**。この結果も王都到達の再現性を補助するが、正式CIではない。

## 2. テスト自体の不具合を確認・修正

| ID | 原因（再現済） | 対処 | 判定 |
|---|---|---|---|
| `GC-E2E-CHOICE-01` | ボスへの接近時、すでに正規の`startBattle('boss')`が実行される場合がある。旧`#choiceBox button`は会話非表示後もDOMに残るため、E2Eが**非表示の古い「戦う」**をクリックしてタイムアウトする。ゲームは進行不能ではない | `tests/browser_vertical_slice_e2e_test.py`と`tests/browser_road_cave_quality_e2e_test.py`の選択肢は`:visible`、さらに`state.battle`または可視battlePanelがすでにある場合は通常の戦闘処理へ進む。会話を進める`dismiss()`も非表示ボタンを無視 | **テスト修正済み。公式E2E上の再実行はRunner障害で未実施** |
| `GC-E2E-NORTH-02` | `northroad`から王都へは**地図の最北`y=0`からさらに上キーを押す必要がある**。旧E2Eは`y=1`で上キーを1回押し、`y=0`へ移動して止まる | `browser_vertical_slice_e2e_test.py`の目的座標を`[(11,0),(12,0)]`へ修正。**実Chromiumでは正規上キーで王都への移動を実証** | **ゲーム本体の移動ロジックは正しい** |
| `GC-E2E-CHOICE-03` | `dismiss()`も`#choiceBox button`数だけ見て、非表示の古い選択肢を有効と誤認する | `#choiceBox button:visible`で判断 | **テスト修正済み** |

新しいNodeの`tests/phase7_workflow_contract.test.js`にも選択肢可視判定・王都境界の静的な再発防止チェックを追加。

## 3. 重要な留保

- **セーブ**: 本物のゲームで勝利後に作成されたSaveを**新規ブラウザページに持ち込み、Continue後の撃破フラグを確認済み**。ただし、`main`旧版の本物のv23保存からの移行・バックアップ破損復旧・Story00–19全編の保存はこの試験では未証明。
- **Canvas**: ローカルの`page.set_content`は非標準の文書オリジンを使うため、`gcassets.invalid`経由の画像をCanvasの`getImageData`で読む際に**CORS taint例外が10件記録**された。ルートと表示、戦闘は完走し、画像漏れはないが、**例外ゼロとは主張しない**。通常の同一オリジン配信でこれらが消えるかは、公式Actionsまたは許可された通常ブラウザ配信で要確認。
- **アート**: 実画像は撮影した。商用の美術統一・楽しさ・人間の迷いやすさ等は未承認。
- **GitHub Actions**: [Issue #46](https://github.com/ryoita027-glitch/gray-crown/issues/46)のまま。最新のワークフローもランナー割当前に**0 job steps、UBUNTU billable total_ms=0**で失敗。請求・利用枠・アカウントの制約または運用障害を否定できないが、annotation本文を取得できていないので原因は不明。CIの内部実行順序バグ（Chromiumより先に`npm run browser-test`）は別途修正した。

## 4. S0/S1判定と次のゲート

- **今回の序盤ルートで確認したゲーム起動・通行・ボス・保存・王都への到達について再現されたS0/S1: 0件**。ただし「全ゲームにS0/S1ゼロ」とは意味しない。
- **再現されたE2Eドライバ欠陥: 3件（修正コミット済、公式Runnerの回帰未実行）**。
- **運用S1相当ブロッカー: CI起動不可が未解消**。
- **製品化はHOLD**：Actionsのチェック注記本文確認→GitHub Actions請求/利用枠/権限/Runner状況を復旧→正規同一オリジンで元の`tests/browser_vertical_slice_e2e_test.py`・Story00–19全回帰・main v23保存互換・Firefox/Safari/mobile・初見人間プレイを同一HEADで検証。新章量産/正式美術承認/mainマージはユーザー承認待ち。
