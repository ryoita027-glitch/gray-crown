# Gray Crown — 工程7：CI復旧・統合受入の実施記録 v1

**日時:** 2026-10-10 JST  
**監査する統合ゲーム:** PR #43 `pixel-vslice-integration-v1` / 固定SHA `81cf40a007dded765d14d468d66ccc4fcbf4ad19`。  
**本工程:** `pixel-vslice-phase7-ci-recovery-v1`。基点は工程6監査PR #44 `84f7303f082499c2036dcb5703c196f38e215d4a`。  
**`main`（変更禁止）:** `d689aabb5146c9f45466a4f74f397e664c08fb4f` / Save schema 23 / Story 00–19。

> **判定: PARTIAL / QA BLOCKED**。実行可能なコード上の不具合1件を修正し、同じ不具合の再発防止テストとローカル検証を追加した。GitHubランナーが割り当てられない原因自体は接続から確定できず、統合本編の通常プレイE2Eは**未完了**。成功したと偽らない。

## 1. なぜ今この工程を選んだか

工程6の`GC-GATE-001`（S1相当の検証運用ブロッカー）により、現在のPR #43には実際のNew Game→リュネ村→街道→古砦レバー→灰角獣→王都の通し受入、schema23の本番保存互換、統合スクリーンショットがない。新章を増やすより、統合版の品質が壊れていない証拠を取れる状態へ戻すことが先決。

## 2. 確認済みの失敗と原因推定を区別

| 区分 | 対象 | 事実 |
|---|---|---|
| **確認済** | Phase5 `37972618637` | job `113962817439`、`conclusion=failure`、`runner_name=""`、`steps=[]`、開始から約5秒、check-runのannotationsは**2件** |
| **確認済** | Triton `37972624720` | job `113962838917`、約3秒、`steps=[]`、annotations**2件** |
| **確認済** | Phase6文書だけのHEAD `84f7303...` | Triton `37976155209` が約4秒、`steps=null`でfailure。ゲーム改修によるJS構文エラーと断定できない |
| **旧HEAD限定** | Phase3 `37970478373`、Phase1 `37967259690` | 実際にstepを実行しSUCCESSしている。PR #43の通過証明には使わない |
| **不明** | annotationsの原文 | GitHub Check Runsで`annotations_count=2`までは確認済み。接続からannotations本文取得不可。**請求・利用枠・権限・Runner・設定のいずれが原因か断言できない** |

**起票:** [GitHub Issue #46](https://github.com/ryoita027-glitch/gray-crown/issues/46)（実行不可証拠、手順、閉鎖条件）。同じ失敗を生むだけのpush/再実行は行わず、Runnerの注記本文とアカウント利用上限の調査から進める。

## 3. 発見・修正した実際のワークフロー不備

**Before:** `.github/workflows/vertical-slice-e2e.yml`が`npm run check`をChromiumインストールより先に実行。しかし現行`package.json`の`check`は

```text
npm run verify-hygiene
&& npm run verify-authority
&& npm run verify-python-syntax
&& node tests/check-syntax.js
&& npm test
&& npm run browser-test
```

であり、**browser-testが含まれる**。ランナー割当の障害とは別に、クリーンなランナーでブラウザ未インストールのため失敗する潜在的な順序バグ。**これは実行前のコード監査で確認した欠陥であり、実行時再現ではない**。

**After:** 既存の6サブコマンドの順序と内容を保持して、軽い5件→4人の源泉PNG検証→`python -m playwright install --with-deps chromium`（1回）→`npm run browser-test`→従来の統合ブラウザ試験6種と本番main v23参照の保存互換に分割。テストを削除・緩和せず重複するChromiumインストールを避けた。ファイル内容はPR差分で確認可能。

## 4. 新しく実装したガードレール

| ファイル | 役割 | 合格の意味と限界 |
|---|---|---|
| `tools/phase7_preflight.py` | **標準Pythonのみ**。本体script30本とNode harnessの読み込み順、Node構文、20段階Story、schema23/backup、主要マップ、元4人×8 PNGの寸法、必要試験の存在をチェック。JSONと終了コードを返す | 実行されたチェックアウトの静的な契約を検査。FPS/プレイ体験/通常E2EをPASS扱いしない |
| `tools/phase7_local_acceptance.py` | GitHub Actions外の**実チェックアウト**で quick/fullゲート。各subprocessのreturn code、実測実行秒数、stdout/stderr末尾、最初の失敗をJSONへ保存。ブラウザが利用可能なら既存の通常入力E2Eを直接起動 | quickは`PASS_QUICK_ONLY`、fullは`PASS_TECHNICAL_ONLY`と表記。実行不能はBLOCKED。美術合格と区別 |
| `tests/phase7_workflow_contract.test.js` | npm checkと同内容・同順序のCI、Chromium単回設置、全受入テスト、main-v23ピン固定、失敗時artifactを機械検証する4単体試験 | **実際のJS試験定義を現在GitHub上のYAML/JSON/2 Pythonソースに対し孤立V8で実行して4/4成功**。Node環境でのテスト本体はRunner障害のため未実行 |

ローカル`full`のmain v23 Fixtureは、Git checkoutで`git rev-parse HEAD`が**完全一致** `d689aabb5146c9f45466a4f74f397e664c08fb4f`した場合のみ受け入れる。名前だけの代替データや別ブランチの`Save`を「本番互換PASS」と偽装できない。既存の元mainからチェックアウトする必要がある。

## 5. 現行GitHubソースに対して実施した限定検査

- **V8 JavaScript構文:** `index.html`が読み込む**30/30ファイル**を、GitHubで取得した実コンテンツで構文コンパイルし**全成功**。読み込み順も`tests/harness.js`のSCRIPT_ORDERと**30/30完全一致**。これは各moduleをDOM内で実行した証明ではない。
- **ソース定義:** Story **20ステージ（00–19、連番）**、マップ**28**、戦闘定義**14**（以前の工程6資料の「13」は誤集計だったためこのブランチで**14に修正**）、`SAVE_SCHEMA=23`、既存レバー定義を確認。
- **追加契約テスト:** `tests/phase7_workflow_contract.test.js`の実assertion関数4本を、最新GitHubテキストに対し**独立V8のNode相当アサーションスタブ**で実行し**4/4成功**。**ネイティブnode --testの結果ではない**。

以下は**未実施 / NOT VERIFIED**: 追加Pythonツール自体のローカル実行、`npm test`全文、GitHub Actionsによる当該SHAのビルド・通しE2E、main-v23実保存互換、統合スクリーンショット、外部端末での性能、人間の美術判断。ローカル手元に旧ビルドのアーカイブがあっても最新PR #43 HEADの証拠には使用しない。

## 6. 復旧後の即時コマンドと合格判定

```sh
# *exact* PR #43 game checkoutまたはこの工程7コードの統合チェックアウト
python tools/phase7_preflight.py --self-test
python tools/phase7_preflight.py --out prototype_artifacts/phase7/preflight.json
python tools/phase7_local_acceptance.py --mode quick
# 以下はPlaywright/browserと本物のmain v23 checkoutを準備して実行
python tools/phase7_local_acceptance.py --mode full \
  --main-v23-dir /path/to/git-checkout-at-d689aabb5146c9f45466a4f74f397e664c08fb4f
```

`full`後、`prototype_artifacts/vertical_slice_v1/`のPNG・JSONと`prototype_artifacts/phase7/local_acceptance.json`をバージョンSHAに結びつけて確認。ユーザー美術評価は別途。Runner復旧後のGitHub Actionsも**最新の工程7 HEADで一度だけ**走らせ、古いPRの成功を流用しない。Artifactの最終成否はRunner/ローカルに実際の実行証拠がある場合にだけ更新する。

## 7. 採用ゲートと次の自主工程

**技術判定: HOLD / NEEDS RUNNER**  
**美術判定: 従前どおり未承認**  
**Story20+の量産: NO-GO**  
**mainマージ: 未承認のため不可**

次は#46のannotation本文・原因の確定→実行機の復旧→同一HEAD全技術検証とスクリーンショット→重大バグ修正→初見者による体験/美術レビュー。その後のみStage04–08既存王都/宿エリアの製品美術と演出強化へ移行する。
