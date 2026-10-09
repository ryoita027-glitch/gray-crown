# Gray Crown — TECHNICAL_DEBT_PRIORITY_v1

**工程6 技術負債・欠陥台帳** / 2026-10-10 JST  
**対象HEAD:** PR #43 `81cf40a007dded765d14d468d66ccc4fcbf4ad19`。**新ブランチ:** `pixel-vslice-quality-audit-v1`。**本番main、Story00–19、Save schema23は変更しない。**

## 1. 判定用語とエビデンスルール

- **S0**: 起動不能、ゲーム状態/セーブ破損、実際の進行不能。確認した時点で量産・採用・リリース停止。
- **S1**: 重大な戦闘・イベント・表示・保存/進行の不整合。工程6の受入ゲートでは、**統合試験を実行できない運用障害も「S1相当のリリースブロッカー」**として管理する。ただし「ゲーム内のS1バグが再現した」とは書かない。
- **S2**: 目立つ造形不統一、初見導線、UI、難易度、パフォーマンス、製品化に必要な機能・運用不足。重要度順に是正、持ち越す場合は書面理由。
- **S3**: 演出の微調整、任意の小物、装飾。
- **状態**: **確認済（証拠あり）**、**可能性（仮説/未再現）**、**未検証（試験なし）**、**判断待ち（ユーザー）**、**解消（同一SHA試験結果添付）**のいずれか。**CI steps がnullの run は「ゲームテストでFAIL」とは判定しない**。
- **規模単位**: WP＝レビュー可能な差分1テーマ＋自動検証＋実画像/文章結果。**絶対時間ではなく粗い相対規模**。人日/納期への変換禁止。外部ランナーの問題は幅が大きい。

**現時点でPR #43に再現が確定したS0：確認できていない。これは「S0がゼロ」と同義ではない。** 統合QAが通らないため潜在S0/S1は未排除。

## 2. Stop-ship / Stop-expansion 登録簿（優先順）

| ID | 判定と重大度 | 具体的な問題・原因候補と証拠 | 依存 / 対処案 | 受入条件 / 規模 |
|---|---|---|---|---|
| **GC-GATE-001** | **確認済：S1相当運用ブロッカー** | PR #43同一HEADでPhase5 `37972618637`（約5秒）・Triton `37972624720`（約3秒）がfailure。取得可能なjob steps=null、実ブラウザ証拠/ログ無し。原因は不明 | 最優先。GitHub Actionsの画面からRunner割当、利用枠/課金、job annotations、workflow policy、YAML validationを特定。既存PR41の成功をPR43の証拠に使わない | **Runner上でcheckout/各ステップが始まり、同一HEADで完走**。1–3 WP+外部条件 |
| **GC-RUN-002** | **未検証：S1潜在** | 異なるPRを選択統合した村→街道→旧砦→灰角獣→王都の通常操作通し試験が未完走。合成PR #43の`browser_vertical_slice_e2e_test.py`はコードだけ存在 | 001→Playwright起動→通常入力による全手順。失敗時は実状態/スクショ/ログで原因分岐し、ゲーム本体を直す | 完走/出入口/宝箱/レバー/戦闘/報酬/王都Stage05、Dev操作0、JavaScript例外0、2–5 WP |
| **GC-SAVE-003** | **未検証：S0/S1潜在** | 最新統合HEADで生のmain v23保存・バックアップ/破損復旧・進行済み実ユーザーSaveを未検査。save.jsとschemaは据置だが「互換保証」ではない | 001→元main生成の保存と別環境Continue、破損主→backup、戦闘/会話保存制限、宝箱/ボス一回性 | 完全保持（Map/位置/HP/MP/EXP/フラグ/Journal）・Schema23、実履歴saveは匿名化して同意の上検査。1–3 WP |
| **GC-ACTOR-004** | **未検証：S1潜在** | 4人の前後/室内/野外/戦闘、Portrait OFF scene復帰、極端な2マス往復時の重複・足元・人物重なり。Phase1/3に過去成功はあるがPR43では未確認 | 001→フレーム列とPNG SHAの照合、村・砦・密集NPC接触・SceneRunnerの取消も試験 | 4人原画無改変、足元整列、イベント終了時画面/操作/位置復旧。1–3 WP |
| **GC-CI-005** | **確認済：S2運用負債** | 16 workflowファイル、過去の各PR固有CIが併存。GitHub利用分は現在未照会、故障時の試行回数も増えやすい | 001後、採用候補単位に軽量→重いE2Eの2段構成を設計。古いworkflowは証拠のまま残す | 1回のChromiumセットアップ、7日間成果物、run/費用/失敗原因の記録。1–2 WP |
| **GC-PLAY-006** | **未検証：S1相当の製品採用ゲート** | 画面撮影とAIによる通常操作は、人間の楽しさ・理解・退屈・好悪を測定しない。初見者プレイ記録/体験の証拠なし | 002と並行に5例以上の初見者で定型観察。個人情報録画は同意制 | 進行喪失、戦闘長、会話、UI、物語理解の本人発言と具体時刻・場所。2–4 WP（募集待ち別） |

**S0/S1の扱い**：GC-GATE-001で統合QA自体が停止している限り、S0/ゲーム内S1を「解消」とするのは禁止。確定バグは毎回`Map / Story / Build SHA / 手順 / Expected / Actual / Save`付きの再現票に登録。S0/S1にはテストを失敗したまま残さず、修正PR→同一SHA全回帰→目視スクショ→症状クローズの順に行う。

## 3. S2 美術・体験・バランス負債（高優先から）

| ID | 状態 | 現象/未確定事項 | 推奨対処・依存 | 受入証拠 / 相対規模 |
|---|---|---|---|---|
| **GC-ART-010** | **確認済：制作ギャップ** | 主人公4人は32枚の精細なPixel-nativeシート、村/他の環境はCanvas手続き描画、敵はCSS形状。キャラ・NPC・環境・敵の密度/輪郭/陰影規格がまだ統一されていない | G2の実画像比較→描画タイル/家具/敵のアトラス試作。PR #40のv2はPR43に含まれず、合意なく統合しない | 1シーンに4人+NPC+敵/背景、1x整数ピクセル、足元/光方向一致。4–8 WP+美術制作 |
| **GC-CHAR-011** | **判断待ち：S2** | 4人のPNGはLOCKED。一般NPC・イベント主役NPCに専用原画/動作が不足。箱型の手続きNPC案は完成美術ではない | 既存`NPC_STYLE`とPR #41役割アクセントを基礎にNPC共通atlas→主要人物の固有シルエット。主要キャラの顔/服の新規確定はユーザー承認 | 既存22行場面+通常村/王都で年齢/用途/距離が読め、主人公と違和感ない。2–5 WP |
| **GC-VIS-012** | **判断待ち：S2** | Portrait ON default / OFF代替。22行同文A/Bは技術比較済みだが話者・感情の伝わり方の優劣は未承認 | 001→同一画面/幅/時間で比較、通常読みと高速読み、ユーザー採択。先行して片方を削除しない | 4人の誰が話すか/感情/没入/遮蔽/操作を主観レビュー。1–2 WP |
| **GC-ROUTE-013** | **確認済：S2設計判断** | `road`から`northroad`へ直行可能で古砦は任意。縦切りでは灰角獣の達成感を要求するが本編の強制導線ではない | デザイン判断をユーザーへ：任意であることをゲーム内で明示/体験訴求、あるいは必須化するなら物語の承認が必要 | 初見で「旧砦は寄り道」と理解し、通り損なうことを不具合と誤認しない。1–3 WP |
| **GC-BAL-014** | **未検証：S2** | 灰角獣の`boss:true`/HP65%と30%段階により18/9→20/9→23/10。テストは閾値検査するが初見勝率/ターン数/回復バランスが未測定 | 通常乱数の複数プレイでパーティーレベル、HP/MP、薬草・魔力草、被弾分布を記録。ガード/氷槍/治癒/祈りが有用か分析 | 難易度変化の理由、勝率分布、消耗のbefore/after表。数値変更は独立PR。2–4 WP |
| **GC-UI-015** | **確認済ギャップ＋端末未検証：S2** | 390px級でコマンド/文字/UIとゲーム画面の比率、戦闘中の4人+敵サイズ、UI選択/タッチ操作が製品として未受入 | 最優先画面: 戦闘コマンド、HP/MP、台詞、メニュー/保存。1365/1024/390を同じ事件でA/B | 横はみ出し0だけでなく、必要な情報/押しやすさ/読み飛ばしがない。2–4 WP |
| **GC-AUDIO-016** | **確認済：S2** | 村/街道/洞窟/戦闘/ボスのBGMとSEはWebAudio oscillatorによる仮音。著作権不明な外部素材は使っていないが製品音響ではない | mute/AudioContext不可/タブ復帰、ピークと平均音量を検査→適正なオリジナル音源を別PRで導入。物語の宗教等を音で決めない | 音なしプレイ成立、ミックス差・耳障りな連打がない、音源ライセンス記録。3–6 WP+制作 |
| **GC-PERF-017** | **未検証：S2** | 28マップ/32主人公シート、`world.js`約80KBとCanvas描画、複数DOM/Audio interval。転送量とFPSの実測なし | Desktop+低性能PC+mobile・Chrome/Firefox/Safariの起動/60秒探索/戦闘/連続マップ移動を計測 | 初回ロード、転送bytes、decode/memory、フレームP50/P95、例外のbefore/after。2–4 WP |
| **GC-TIME-018** | **未検証：S2** | Story00–19が20段階あっても8–12時間分の遊びの厚みは証明されない | 00–19の初見人間計時・本線/寄り道分離→不足コンテンツを承認前に作らない | 動画/ログと自己申告を区分した実測分布。2–3 WP |
| **GC-ARTSRC-019** | **確認済：S2保守負債** | `assets/hero_party_walk.png`約40KBと`hero_party_walk_replacement.png`約65KB、候補参照/過去ロック画像が共存。**両方が重複・未使用とは未断定** | 使用元のimport/HTML/CSS/テスト/manifestからdependency graphを作る。active/fallback/experiment/supersededを区別 | 各候補は1 Source of Truthを持つ。不要候補だけ保留後削除、ロックPNGは保持。1–3 WP |
| **GC-MONOLITH-020** | **確認済：S2保守負債** | `js/render/world.js`約80,640B、`js/systems/events.js`約72,516B、`js/data/events.js`約55,788B。新マップごとの単純追記は結合度/差分競合が増えやすい | map-scoped renderer、event trigger registryとscene definitionの段階分離。互換API保持、小規模PRで移行 | 関数単位回帰、Source of Truth変更なし、ルート/セーブ/描画前後同等。3–6 WP |
| **GC-TEST-021** | **確認済：S2保守負債** | `tests/`41ファイル、ブラウザ各スクリプトで`walk`、`dismiss`、BFS、fight/saveの重複実装あり。イベント増量時の修正コストが高い | 現行E2Eの期待値を残し、`tests/helpers/player_flow.py`等へ共通関数を移管。テスト仕様を先に凍結 | 関係テストのアサート数/同等意味/録画証拠変化なし、1–3 WP |
| **GC-REP-022** | **確認済：S2保守負債** | 旧PRとDocsに異なる「最新」表現があり、mainと候補の混同を生む。16 CI workflowの複数世代も残る | 1ページのmanifestをPRごとに署名SHAで更新。古い資料へ歴史表記・Draft保持。削除/force pushは禁止 | `main/approved development/candidate/obsolete`が一目で区別できる。1–2 WP |

## 4. S3への延期が許される範囲

候補：井戸・小石・屋根のアクセント密度、ランダム過剰演出の抑制、任意アニメの短さ、テキスト細字の微調整。ただし**通れるか誤認する飾り、人物遮蔽、ボス危険状態の見えにくさ、操作不可はS3ではなくS1/S2**。延期する項目ごとに「なぜプレイを妨げないか・目視画像・再評価時期」を残す。

## 5. 工程ごとの受入テストテンプレート

```text
ID: GC-[domain]-NNN
Priority: S0/S1/S2/S3     Status: confirmed/suspected/untested/waiting/closed
Source: build HEAD SHA + screenshot/log/save (not another branch)
Map/Story/Event/Battle: ...
Trigger: real keyboard/touch action sequence from known state
Expected / Observed: ...
Proof: CI run ID, job step log lines, exact artifact path or local screenshot
Root cause: verified fact OR "unknown" (not a guess)
Proposed smallest change: ...
Regression: adjacent storyline, UI widths, Save schema23, all source-locked PNG
Risk/Owner: engineering/art/user-approved narrative, effort WP range
Closing evidence: same-HEAD PASS + normal-game frame + user review if artistic
```

**CI向けテンプレート**：
```text
STEP 0: Runner allocated? yes/no (if no, investigate billing/usage/policy/annotation)
STEP 1: SHA and immutable asset manifest
STEP 2: JS syntax + Node unit + validation + 00-19 canonical story
STEP 3: Single Chromium install
STEP 4: Original main v23 real save + backup/corrupt primary + defeat
STEP 5: Ryune Acting Portrait ON/OFF & 4 original PNG / three viewport sizes
STEP 6: Road / cave puzzle / boss full normal input & correct rewards
STEP 7: Selected downstream chapter integration tests
STEP 8: Screenshot, FPS/load, event, battle, save & CI cost summary uploaded even if fail
NO CLAIM "PASS" until every step actually runs on exact head SHA.
```

## 6. Release gate / dependency order

`GC-GATE-001` → `GC-RUN-002` + `GC-SAVE-003` + `GC-ACTOR-004` → **all confirmed S0/S1 fixed** → `GC-PLAY-006` + G2 art/Portrait/route decisions → S2 prioritization → Story04–19 progressive polish. `GC-TEST-021`等のリファクタは同時に勝手に大型変更せず、緑の基準線確保後に実施する。

- **S0/S1残存**: 本編の新章量産不可、main採用不可。
- **S2残存**: 重症度/ユーザーの許容判断/合理的な持越理由が揃う場合のみ次の既存区間の制作候補に着手可能。
- **クリエイティブ権限**: プロット追加・国の制度・宗教・階級章・主要人物デザイン・Portrait最終・mainマージはユーザー。技術的なS1修正は各レビュー可能なPR内で自律実施してよい。
- **監査修了判定**: 文書は完成しても**Vertical SliceはREVISE**。GitHub Actions/同一HEADの全緑・ボス通過とユーザーの美術判断が揃うまで正式採用しない。
