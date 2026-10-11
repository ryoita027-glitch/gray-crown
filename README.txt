『灰冠の勇者たち』Serad Frontier Second Slice v23

v22を基準に、Alpha 2.0「セラド前線・第2区間」だけを追加した版です。Architecture全面改修や次章の先行実装は行っていません。

起動
index.html をブラウザで開きます。

今回の本番区間
15_frontier_complete
→ ヴァルク戦後のセラドで戦後処理を確認
→ 前線将校から北側戦闘跡の偵察任務
→ 野戦病院で王国兵・帝国捕虜双方の治療状況を見る
→ 17_frontier_investigation
→ 新規小マップ「セラド北側・戦闘跡」
→ 王国斥候、担架跡、帝国兵の雑嚢、撤退命令を調査
→ 取り残された負傷帝国兵を発見
→ 血の匂いに寄った戦場狼との小規模戦
→ セラドへ戻って報告
→ 19_frontier_second_complete

物語上の狙い
- 王国=絶対善、帝国=絶対悪と断定せず、まず情報の食い違いをプレイヤー自身に見せる。
- 帝国兵の家族宛て手紙と負傷者回収命令で「敵兵も帰る場所のある人間」であることを痕跡として示す。
- 「以前、退路を守って戦死した指揮官」という一文だけを置き、ユウキの名前・正体・死の真相はまだ説明しない。
- 帝国軍が北の旧関所へ集結し、王国偵察隊も同方向で未帰還となったため、次に北へ進む理由を成立させる。

Story State
15_frontier_complete
16_frontier_aftermath
17_frontier_investigation
18_frontier_discovery
19_frontier_second_complete

Save
Save schemaは23。v22の15_frontier_complete Saveは、v23進捗を勝手に生成せずschema 23へ移行します。第2区間途中のfrontierfieldでもSave→Reload→ContinueをE2Eで確認します。

Developer Mode / Story Inspector
F2の既存Developer Modeを維持。新Story State、frontierfield、v23 Event、battlefieldWolvesを既存Inspector/Launcherから確認できます。新しいDeveloper機能は追加していません。

テスト
npm test
  Node回帰テスト。v22の36本を維持し、v23分を追加。

npm run browser-test
  v21 Regression Gate + v22セラド第1区間E2E + v23セラド第2区間E2E。

npm run frontier2-e2e
  v23区間だけのChromium E2E。

npm run check
  JavaScript構文 + Node回帰 + 全Browser Gate。

詳細は docs/history/FRONTIER_SECTION2_DESIGN_v23.txt / docs/history/CHANGELOG_v23.txt / docs/history/TEST_REPORT_v23.txt / docs/history/BUG_REPORT_v23.txt / docs/history/KNOWN_ISSUES_v23.txt / docs/history/NEXT_TASKS_v23.txt を参照してください。
Visual Foundation note:
- Game baseline: v23
- Character Visual Patch: rev 23.1
- Current hero sprite is ACTIVE runtime / PROVISIONAL design.
- Visual workflow and audit status are under docs/visual/ and docs/audit/.
- Karen Visual Identity is locked to B — VILLAGE RUNNER in docs/characters/.

Current project status:
- Authoritative current-state summary: docs/audit/CURRENT_PROJECT_STATE.md
- Production remains main / v23; Pixel-native work remains experimental until explicitly adopted.

File organization note: Legacy root TXT reports moved to docs/history/ on the documentation-cleanup branch. Game runtime files unchanged.
