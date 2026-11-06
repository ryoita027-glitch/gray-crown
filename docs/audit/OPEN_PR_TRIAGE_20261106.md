# Graygrow: 開いているPRの取捨選択（2026-11-06）

> **判定の限界**：全372件のGitHub PRメタデータとブランチ依存関係を確認し、重要な30件前後について実際の差分を抽出した一次仕分け。全372件の変更行・画像・実ブラウザ動作を個別レビューしたという意味ではない。個別PRの「保留」は不合格確定ではない。

## 結論・数量

- GitHub PR一覧: **372件がopen、全件Draft**。main SHA: d689aabb5146c9f45466a4f74f397e664c08fb4f。
- main直下: 39件、他のブランチを基にしたstacked PR: 333件。
- 他PRから親として参照されるopen PR: 304件、子PRを持たない末端候補: 68件。ただし末端候補の採用が決まった意味ではない。
- **統合の本命は#106のみ。#98は凍結参照**。両者に対する実ブラウザ受入PASSは未確認で、mainマージ禁止。
- PRの件数は独立した機能の件数ではない。特に別ブランチを土台にした連鎖は親子の重複差分を含み得る。

## 採否の最優先ルール

1. **#106** を実行可能な検証環境でNew Game→リュネ村→街道→古砦ボス→王都、Save/Load、UI、戦闘まで同一SHAで確認する。#98を直接マージしない。
2. **#391** はQA補助だが、npm未導入環境では5件をスキップするため、skipをPASS扱いしない。
3. **#107、#109–#111、#115、#119** のセーブ・追従・復元関連は#106の後継スタックとして、同じSHAで検証してから選ぶ。
4. **#309（門の実通行）・#362（無限再帰修正）・#278（タッチ操作）** はユーザーの遊べなさに直結する可能性が高く、再現する場合だけ優先。
5. 直近の会話・雑学イベントPRを片端から追加しない。路線・話者・段階・フラグ・再訪の重複を先に整理。
6. 美術は実画像A/B（既存4人の正規原画と同条件）および実ゲーム画面で採用判断。不合格試作を量産しない。

## 実差分を見て確認できた競合

- **#380 vs #398**: 両方とも js/systems/events.js の road/merchant を置換。#380は「古砦は東」、#398は「街道の北寄りに入口」と説明する。元の道標では「旧砦 東」。道順の矛盾を解消し、片方だけに統一するまで保留。
- **#384 vs #396**: roadSignの同じ元行を別々に置換。#384はボス撃破・洞窟訪問後を条件判定、#396は調査選択肢と日誌追加。両PRのそのまま同時採用は不可。
- **#349 vs #362**: capitalRecruitReturnGuidance が自分を再帰呼び出しするバグを、双方が別の固定案内台詞で修正。両方採用せず同一スタックを1本に統合する。
- **#392 vs #372–#376**: 井戸・孤児院周辺の別ルート。井戸オブジェクトのイベント統合、セーブ、再訪、移動に対する整合性チェックが必要。
- **#395/#397/#399**: 村から旅立つ場面が別々に増えている。情報の重複、人物間の呼吸、選択済みフラグを実体験で評価。
- **#391**: tests/test_local_quality_cli_preflight.py に5ケースを追加。skipUnless(npm)のため環境によって全件スキップする。受入QAは別途必要。
- **#309**: js/data/maps.js, js/systems/movement.js, tests/cave_gate_chokepoint.test.js 等で門迂回の問題に手を入れている。実プレイの再現・改善証拠待ち。

## 祖先関係の確認

- PR #6, #33, #35, #37, #38, #61, #66, #85, #90, #93, #94, #95, #96 の個別HEADはGitHub compareで#98 HEADに包含される祖先であることを確認。**改めて単体マージしない。**
- #17, #25, #42, #97 は直接祖先ではなかった。内容が#98内で再実装されているかは別途検証。
- #99以降の多くは#98や後継ブランチを親にする。親子を無視したCherry-pickは禁止。

## 明確な不採用として記録する美術PR

- #121, #126, #127, #128, #129, #141, #144, #156, #158, #169, #173, #178, #181, #187, #198, #206, #209, #236（18件）。タイトルにART NO-GOが明記された視覚実験・採用しない素材。
- #105, #136, #291 は名称にNO-GOがあっても、判定方法や不合格の根拠を記録する資料なので自動閉鎖対象外。
- ART HOLDは不採用確定ではなく未承認・未検証の意味。現在のゲーム美術のベースにしない。

## ラベルの意味

| ラベル | 意味 |
|---|---|
| A | 今回唯一の統合QA本命（未マージ） |
| B | 凍結参照／QA原本の祖先（再マージ不要） |
| C | プレイ障害・QA上の優先検証候補（未採用） |
| D | 不合格という判断の証拠を保持 |
| E | 同じ分岐の別案競合：1つに絞るまで保留 |
| F | 同じ体験を扱う関連PR：順序・統合が必要 |
| X | タイトルで明示された美術不合格：採用見送り |
| H | 美術：未承認／実画像比較不合格または未検証 |
| S | 積層PR：親と同じSHAでのみ採用判断可 |
| Z | 未検証バックログ：新規搭載を止める |

## 全372件の記録

| PR | 仕分け | 理由（暫定・明示） | ベース | タイトル |
|---:|---|---|---|---|
| [#399](https://github.com/ryoita027-glitch/gray-crown/pull/399) | F 関連競合 | 村の別れ関連の相互整合を検証 | main | Map/story: first village departure responds to discoveries |
| [#398](https://github.com/ryoita027-glitch/gray-crown/pull/398) | E 比較競合 | road/merchantの同一分岐を置換 | main | Map/story: 街道の行商人に任意の進路相談と再訪案内 |
| [#397](https://github.com/ryoita027-glitch/gray-crown/pull/397) | F 関連競合 | 村の別れ関連の相互整合を検証 | main | Village child acknowledges the party's departure after appointment |
| [#396](https://github.com/ryoita027-glitch/gray-crown/pull/396) | E 比較競合 | roadSignの同一分岐を置換 | main | 街道の道標に任意の発見と仲間の反応を追加 |
| [#395](https://github.com/ryoita027-glitch/gray-crown/pull/395) | F 関連競合 | 村の別れ関連の相互整合を検証 | main | Map/story: リオとの出発前の約束を選択と再訪に反映 |
| [#394](https://github.com/ryoita027-glitch/gray-crown/pull/394) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Map/story: 北街道の道標を任意の進路発見に改善 |
| [#393](https://github.com/ryoita027-glitch/gray-crown/pull/393) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Map/story: 砦の狼煙観察と兵士の再訪反応 |
| [#392](https://github.com/ryoita027-glitch/gray-crown/pull/392) | F 関連競合 | 井戸・孤児院の複数改修。連鎖と独立版を比較 | main | Village: optional well-to-orphanage delivery and lasting NPC response |
| [#391](https://github.com/ryoita027-glitch/gray-crown/pull/391) | C QA補助 | npmがないとテストskip。受入証明ではない | #106 | QA: local quality CLI preflight rejection regression tests |
| [#390](https://github.com/ryoita027-glitch/gray-crown/pull/390) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Story: ハルム国境の無名墓に任意の追悼と再訪変化を追加 |
| [#389](https://github.com/ryoita027-glitch/gray-crown/pull/389) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Story: ハルム宿場の掲示板に荷車修理の結果を反映 |
| [#388](https://github.com/ryoita027-glitch/gray-crown/pull/388) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Story: ハルムの荷車修理を宿場の子どもの反応につなぐ |
| [#387](https://github.com/ryoita027-glitch/gray-crown/pull/387) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Map/story: 古砦の鉄格子で残る機構を示す |
| [#386](https://github.com/ryoita027-glitch/gray-crown/pull/386) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Map/story: 孤児院の人形箱を選択と再訪反応のある発見に |
| [#385](https://github.com/ryoita027-glitch/gray-crown/pull/385) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Map/story: 王都の式典の余り花を配給列へ届ける |
| [#384](https://github.com/ryoita027-glitch/gray-crown/pull/384) | E 比較競合 | roadSignの同一分岐を置換 | main | Map/story: 街道の道標を任意の探索発見にする |
| [#383](https://github.com/ryoita027-glitch/gray-crown/pull/383) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Story: ナナの出発前の支度会話を一度だけ発生させる |
| [#382](https://github.com/ryoita027-glitch/gray-crown/pull/382) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | リュネ村：ユナと母親の心配をつなぐ任意の会話 |
| [#381](https://github.com/ryoita027-glitch/gray-crown/pull/381) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | 北街道の斥候：王都への案内を一度だけ日誌に記録 |
| [#380](https://github.com/ryoita027-glitch/gray-crown/pull/380) | E 比較競合 | road/merchantの同一分岐を置換 | main | Draft: 街道行商人の古砦案内を初回だけ記録し再訪を短縮 |
| [#379](https://github.com/ryoita027-glitch/gray-crown/pull/379) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | リュネ村：孤児院の食料問題をマルタと相談できる選択肢 |
| [#378](https://github.com/ryoita027-glitch/gray-crown/pull/378) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | 村の輸送問題をボルとガルドの会話で解決へ導く |
| [#377](https://github.com/ryoita027-glitch/gray-crown/pull/377) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | リュネ村：食料不足を知った後のテオとの約束 |
| [#376](https://github.com/ryoita027-glitch/gray-crown/pull/376) | F 関連競合 | 井戸・孤児院の複数改修。連鎖と独立版を比較 | #375 | リュネ村：孤児院の食糧不足をパン屋への相談と再訪反応につなぐ |
| [#375](https://github.com/ryoita027-glitch/gray-crown/pull/375) | F 関連競合 | 井戸・孤児院の複数改修。連鎖と独立版を比較 | #374 | story: 井戸での帰郷の約束を日誌に残す |
| [#374](https://github.com/ryoita027-glitch/gray-crown/pull/374) | F 関連競合 | 井戸・孤児院の複数改修。連鎖と独立版を比較 | #373 | リュネ村：井戸の赤い布を見た後、ルルが発見に反応 |
| [#373](https://github.com/ryoita027-glitch/gray-crown/pull/373) | F 関連競合 | 井戸・孤児院の複数改修。連鎖と独立版を比較 | #372 | リュネ村の井戸：出発の約束は初回だけ、再訪時は短い反応に |
| [#372](https://github.com/ryoita027-glitch/gray-crown/pull/372) | F 関連競合 | 井戸・孤児院の複数改修。連鎖と独立版を比較 | main | Ryune well: optional departure promise and changing village atmosphere |
| [#371](https://github.com/ryoita027-glitch/gray-crown/pull/371) | S 積層保留 | 親#370と一体でQA。単独マージ不可 | #370 | Record ration queue return route after recruit message |
| [#370](https://github.com/ryoita027-glitch/gray-crown/pull/370) | S 積層保留 | 親#367と一体でQA。単独マージ不可 | #367 | 王都の新兵が教える配給列の道順を日誌に残す |
| [#369](https://github.com/ryoita027-glitch/gray-crown/pull/369) | S 積層保留 | 親#368と一体でQA。単独マージ不可 | #368 | fix(mapstory): 台帳共有済みの新兵に初回選択肢を再表示しない |
| [#368](https://github.com/ryoita027-glitch/gray-crown/pull/368) | S 積層保留 | 親#367と一体でQA。単独マージ不可 | #367 | Persist recruit's ration-queue directions in journal |
| [#367](https://github.com/ryoita027-glitch/gray-crown/pull/367) | S 積層保留 | 親#366と一体でQA。単独マージ不可 | #366 | Map/story: preserve both aid memories on mother's later visits |
| [#366](https://github.com/ryoita027-glitch/gray-crown/pull/366) | S 積層保留 | 親#365と一体でQA。単独マージ不可 | #365 | Map/story: landmark-based ration queue directions from recruit |
| [#365](https://github.com/ryoita027-glitch/gray-crown/pull/365) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Map/story: keep recruit ledger decision independent of ration errand |
| [#364](https://github.com/ryoita027-glitch/gray-crown/pull/364) | S 積層保留 | 親#357と一体でQA。単独マージ不可 | #357 | Map/story: guide players to ration queue before the errand |
| [#363](https://github.com/ryoita027-glitch/gray-crown/pull/363) | S 積層保留 | 親#362と一体でQA。単独マージ不可 | #362 | Show recruit ledger defer only when ledger can actually be shared |
| [#362](https://github.com/ryoita027-glitch/gray-crown/pull/362) | E 比較競合 | 自己再帰エラーの修正案競合 | #348 | Fix infinite recursion when asking recruit for return directions |
| [#361](https://github.com/ryoita027-glitch/gray-crown/pull/361) | S 積層保留 | 親#360と一体でQA。単独マージ不可 | #360 | 王都：伝言依頼前でも新兵から配給列への道を聞ける |
| [#360](https://github.com/ryoita027-glitch/gray-crown/pull/360) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | 王都：帰還兵の暮らしに荷車支援の記憶を反映 |
| [#359](https://github.com/ryoita027-glitch/gray-crown/pull/359) | S 積層保留 | 親#358と一体でQA。単独マージ不可 | #358 | fix(story): 新兵に台帳を見せた後は完了済み選択肢を消す |
| [#358](https://github.com/ryoita027-glitch/gray-crown/pull/358) | S 積層保留 | 親#357と一体でQA。単独マージ不可 | #357 | 王都：伝言完了後も食料・荷車の支援を個別に覚える |
| [#357](https://github.com/ryoita027-glitch/gray-crown/pull/357) | S 積層保留 | 親#356と一体でQA。単独マージ不可 | #356 | fix(story): hide unavailable ledger choice in recruit conversation |
| [#356](https://github.com/ryoita027-glitch/gray-crown/pull/356) | S 積層保留 | 親#355と一体でQA。単独マージ不可 | #355 | fix(story): prevent delivering an unrequested ration thank-you |
| [#355](https://github.com/ryoita027-glitch/gray-crown/pull/355) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | fix(story): 第三の道でも新兵への感謝を届けられるようにする |
| [#354](https://github.com/ryoita027-glitch/gray-crown/pull/354) | S 積層保留 | 親#353と一体でQA。単独マージ不可 | #353 | Draft: 王都伝言完了後の母親の台詞で新兵と息子の混同を防止 |
| [#353](https://github.com/ryoita027-glitch/gray-crown/pull/353) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Draft: 王都伝言後に帰還兵の暮らしを任意で聞ける会話 |
| [#352](https://github.com/ryoita027-glitch/gray-crown/pull/352) | S 積層保留 | 親#351と一体でQA。単独マージ不可 | #351 | 王都：伝言完了後の母親再訪に継続した反応を追加 |
| [#351](https://github.com/ryoita027-glitch/gray-crown/pull/351) | S 積層保留 | 親#350と一体でQA。単独マージ不可 | #350 | 王都伝言後の日誌に帰路と未完了の報告を明示 |
| [#350](https://github.com/ryoita027-glitch/gray-crown/pull/350) | S 積層保留 | 親#349と一体でQA。単独マージ不可 | #349 | 王都：母親への報告後は新兵の近況会話へ切り替える |
| [#349](https://github.com/ryoita027-glitch/gray-crown/pull/349) | E 比較競合 | 自己再帰エラーの修正案競合 | #348 | fix(story): 伝言後の帰路案内で再帰停止する不具合を修正 |
| [#348](https://github.com/ryoita027-glitch/gray-crown/pull/348) | S 積層保留 | 親#347と一体でQA。単独マージ不可 | #347 | Map/story: stop suggesting completed ration-mother report |
| [#347](https://github.com/ryoita027-glitch/gray-crown/pull/347) | S 積層保留 | 親#346と一体でQA。単独マージ不可 | #346 | feat(mapstory): 伝言後も配給列への帰路を確認可能にする |
| [#346](https://github.com/ryoita027-glitch/gray-crown/pull/346) | S 積層保留 | 親#345と一体でQA。単独マージ不可 | #345 | Map/story: guide return to ration mother after recruit message |
| [#345](https://github.com/ryoita027-glitch/gray-crown/pull/345) | S 積層保留 | 親#344と一体でQA。単独マージ不可 | #344 | 王都の伝言報告で食料と荷車の両方の支援を反映 |
| [#344](https://github.com/ryoita027-glitch/gray-crown/pull/344) | S 積層保留 | 親#342と一体でQA。単独マージ不可 | #342 | fix(story): 母親への伝言報告で未伝達の安否を断定しない |
| [#343](https://github.com/ryoita027-glitch/gray-crown/pull/343) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | docs(qa): locate authoritative state files and preserve frozen-HEAD verification |
| [#342](https://github.com/ryoita027-glitch/gray-crown/pull/342) | S 積層保留 | 親#341と一体でQA。単独マージ不可 | #341 | Draft: 新兵への伝言報告で実際の支援を振り返る |
| [#341](https://github.com/ryoita027-glitch/gray-crown/pull/341) | S 積層保留 | 親#340と一体でQA。単独マージ不可 | #340 | Draft: preserve ration reconsideration wording during recruit report |
| [#340](https://github.com/ryoita027-glitch/gray-crown/pull/340) | S 積層保留 | 親#339と一体でQA。単独マージ不可 | #339 | Draft: keep food choice available while recruit report is pending |
| [#339](https://github.com/ryoita027-glitch/gray-crown/pull/339) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | 外部/既に閉じたブランチ | feat(story): 新兵への伝言を母親への報告で締めくくる |
| [#338](https://github.com/ryoita027-glitch/gray-crown/pull/338) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | 王都の母親の再訪時、食料寄付を任意の会話にする |
| [#337](https://github.com/ryoita027-glitch/gray-crown/pull/337) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | 王都の伝言依頼で初回から兵舎の目印を伝える |
| [#336](https://github.com/ryoita027-glitch/gray-crown/pull/336) | S 積層保留 | 親#335と一体でQA。単独マージ不可 | #335 | Draft: retain optional Aldina recruit directions in the journal |
| [#335](https://github.com/ryoita027-glitch/gray-crown/pull/335) | S 積層保留 | 親#334と一体でQA。単独マージ不可 | #334 | Draft: guide Aldina recruit errand using the barracks landmark |
| [#334](https://github.com/ryoita027-glitch/gray-crown/pull/334) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Prevent unreachable recruit errand on unsupported endings |
| [#333](https://github.com/ryoita027-glitch/gray-crown/pull/333) | S 積層保留 | 親#332と一体でQA。単独マージ不可 | #332 | Draft: stop repeating the recruit's optional thank-you request on Aldina revisits |
| [#332](https://github.com/ryoita027-glitch/gray-crown/pull/332) | S 積層保留 | 親#331と一体でQA。単独マージ不可 | #331 | Draft: remember the family's food decision while recruit thanks remain pending |
| [#331](https://github.com/ryoita027-glitch/gray-crown/pull/331) | S 積層保留 | 親#330と一体でQA。単独マージ不可 | #330 | Draft: remember a postwar ration keep decision without repeated prompts |
| [#330](https://github.com/ryoita027-glitch/gray-crown/pull/330) | S 積層保留 | 親#329と一体でQA。単独マージ不可 | #329 | Draft: let a recovered ration help Aldina's family after the war |
| [#329](https://github.com/ryoita027-glitch/gray-crown/pull/329) | S 積層保留 | 親#328と一体でQA。単独マージ不可 | #328 | Draft: keep cleared-fort ration discoveries relevant after Aldina |
| [#328](https://github.com/ryoita027-glitch/gray-crown/pull/328) | S 積層保留 | 親#327と一体でQA。単独マージ不可 | #327 | Draft: continue recovered-ration handoff after the scout hears the fort flag |
| [#327](https://github.com/ryoita027-glitch/gray-crown/pull/327) | S 積層保留 | 親#326と一体でQA。単独マージ不可 | #326 | Draft: keep old-fort scout reports in one voluntary conversation |
| [#326](https://github.com/ryoita027-glitch/gray-crown/pull/326) | S 積層保留 | 親#325と一体でQA。単独マージ不可 | #325 | Draft: let the north-road scout remember a recovered old-fort ration cache |
| [#325](https://github.com/ryoita027-glitch/gray-crown/pull/325) | S 積層保留 | 親#324と一体でQA。単独マージ不可 | #324 | Draft: make the north-road scout and waystone match unlocked return paths |
| [#324](https://github.com/ryoita027-glitch/gray-crown/pull/324) | S 積層保留 | 親#323と一体でQA。単独マージ不可 | #323 | Draft: let cleared-fort ration explorers retrace the known north-gate route |
| [#323](https://github.com/ryoita027-glitch/gray-crown/pull/323) | S 積層保留 | 親#322と一体でQA。単独マージ不可 | #322 | Draft: give the cleared-fort supply return a clear objective and payoff |
| [#322](https://github.com/ryoita027-glitch/gray-crown/pull/322) | S 積層保留 | 親#321と一体でQA。単独マージ不可 | #321 | Draft: show forest and cleared-fort choices in the old road's walking lanes |
| [#321](https://github.com/ryoita027-glitch/gray-crown/pull/321) | S 積層保留 | 親#320と一体でQA。単独マージ不可 | #320 | Draft: let players choose the forest or cleared fort from Aldina's south road |
| [#320](https://github.com/ryoita027-glitch/gray-crown/pull/320) | S 積層保留 | 親#319と一体でQA。単独マージ不可 | #319 | Draft: keep north-road scout revisits brief without losing player choices |
| [#319](https://github.com/ryoita027-glitch/gray-crown/pull/319) | S 積層保留 | 親#318と一体でQA。単独マージ不可 | #318 | Draft: keep Aldina fort reports voluntary after returning south |
| [#318](https://github.com/ryoita027-glitch/gray-crown/pull/318) | S 積層保留 | 親#317と一体でQA。単独マージ不可 | #317 | Draft: let the scout hear a cleared fort report after the forest detour |
| [#317](https://github.com/ryoita027-glitch/gray-crown/pull/317) | S 積層保留 | 親#316と一体でQA。単独マージ不可 | #316 | Draft: make the north-road scout recognize Aldina return visits |
| [#316](https://github.com/ryoita027-glitch/gray-crown/pull/316) | S 積層保留 | 親#315と一体でQA。単独マージ不可 | #315 | Draft: keep Aldina south-road revisits from replaying the first welcome |
| [#315](https://github.com/ryoita027-glitch/gray-crown/pull/315) | S 積層保留 | 親#314と一体でQA。単独マージ不可 | #314 | Draft: keep deferred fort witness available after taking the forest road |
| [#314](https://github.com/ryoita027-glitch/gray-crown/pull/314) | S 積層保留 | 親#313と一体でQA。単独マージ不可 | #313 | Draft: let the north-road scout remember the old fort's voluntary flag decision |
| [#313](https://github.com/ryoita027-glitch/gray-crown/pull/313) | S 積層保留 | 親#312と一体でQA。単独マージ不可 | #312 | Draft: reward activated fort mechanisms with quieter return corridors |
| [#312](https://github.com/ryoita027-glitch/gray-crown/pull/312) | S 積層保留 | 親#311と一体でQA。単独マージ不可 | #311 | Draft: let fort explorers follow lever-reactive maintenance conduits |
| [#311](https://github.com/ryoita027-glitch/gray-crown/pull/311) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #309 | Draft: make the old-fort gate readable with lever-reactive stone plaques |
| [#309](https://github.com/ryoita027-glitch/gray-crown/pull/309) | C 検証候補 | プレイ阻害・セーブ・操作のQAで採否判断 | #308 | Draft: close old-fort gate bypass while preserving both exploration wings |
| [#308](https://github.com/ryoita027-glitch/gray-crown/pull/308) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #306 | Draft: show old-fort gate catches releasing as each mechanism is activated |
| [#306](https://github.com/ryoita027-glitch/gray-crown/pull/306) | S 積層保留 | 親#304と一体でQA。単独マージ不可 | #304 | Draft: make old-fort gate mechanisms give order-aware feedback and truthful directions |
| [#304](https://github.com/ryoita027-glitch/gray-crown/pull/304) | S 積層保留 | 親#302と一体でQA。単独マージ不可 | #302 | Draft: make old-fort supply cache reveal the two gate mechanisms |
| [#302](https://github.com/ryoita027-glitch/gray-crown/pull/302) | S 積層保留 | 親#301と一体でQA。単独マージ不可 | #301 | Draft: make the paved old-fort ration detour low-risk |
| [#301](https://github.com/ryoita027-glitch/gray-crown/pull/301) | S 積層保留 | 親#300と一体でQA。単独マージ不可 | #300 | Draft: make the old-fort supply clue visible and the crate remember pickup |
| [#300](https://github.com/ryoita027-glitch/gray-crown/pull/300) | S 積層保留 | 親#297と一体でQA。単独マージ不可 | #297 | Draft: connect the optional old-fort spur to an existing supply reward |
| [#297](https://github.com/ryoita027-glitch/gray-crown/pull/297) | S 積層保留 | 親#296と一体でQA。単独マージ不可 | #296 | Draft: let players choose the old-fort detour at a readable road fork |
| [#296](https://github.com/ryoita027-glitch/gray-crown/pull/296) | S 積層保留 | 親#294と一体でQA。単独マージ不可 | #294 | Draft: keep road revisit objectives aligned with player progress |
| [#294](https://github.com/ryoita027-glitch/gray-crown/pull/294) | S 積層保留 | 親#292と一体でQA。単独マージ不可 | #292 | Draft: show the first wolf scouting benefit when it matters |
| [#292](https://github.com/ryoita027-glitch/gray-crown/pull/292) | S 積層保留 | 親#290と一体でQA。単独マージ不可 | #290 | Draft: let players scout the first wolf before its encounter |
| [#291](https://github.com/ryoita027-glitch/gray-crown/pull/291) | D 判定資料 | 不採用素材の判定記録は保持 | #289 | Draft: exact-source native44 Margaret V19 rejection gate (ART NO-GO) |
| [#290](https://github.com/ryoita027-glitch/gray-crown/pull/290) | S 積層保留 | 親#288と一体でQA。単独マージ不可 | #288 | Draft: Ryune food ledger informs the roadside merchant's delivery decision |
| [#289](https://github.com/ryoita027-glitch/gray-crown/pull/289) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #287 | Draft: Margaret V19 original-vs-walk native44 visual review gate (ART HOLD) |
| [#288](https://github.com/ryoita027-glitch/gray-crown/pull/288) | S 積層保留 | 親#286と一体でQA。単独マージ不可 | #286 | Draft: keep Ryune granary choice available after the messenger appointment |
| [#287](https://github.com/ryoita027-glitch/gray-crown/pull/287) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #285 | Draft: Margaret V19 silhouette sculpt vs V18A and V5 NPC (ART HOLD) |
| [#286](https://github.com/ryoita027-glitch/gray-crown/pull/286) | S 積層保留 | 親#284と一体でQA。単独マージ不可 | #284 | Draft: first Ryune departure remembers the granary; repeat crossings stay brief |
| [#285](https://github.com/ryoita027-glitch/gray-crown/pull/285) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #283 | Draft: Margaret V18 robe-plane structural A/B vs V17 and V5 NPC — ART HOLD |
| [#284](https://github.com/ryoita027-glitch/gray-crown/pull/284) | S 積層保留 | 親#282と一体でQA。単独マージ不可 | #282 | Draft: make Ryune's granary a discoverable early choice with an immediate story payoff |
| [#283](https://github.com/ryoita027-glitch/gray-crown/pull/283) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #281 | Draft: Margaret V17 face-plane / silver-hair silhouette native44 A/B — ART HOLD |
| [#282](https://github.com/ryoita027-glitch/gray-crown/pull/282) | S 積層保留 | 親#279と一体でQA。単独マージ不可 | #279 | Draft: keep both Aldina recruit memories accessible after the final return |
| [#281](https://github.com/ryoita027-glitch/gray-crown/pull/281) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #280 | Draft: Margaret V16 adult-proportion / neck native44 A-B vs V5 NPC (ART HOLD) |
| [#280](https://github.com/ryoita027-glitch/gray-crown/pull/280) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #276 | Draft: Margaret V14A/V15 native44 and real-village A/B preview gate — ART HOLD |
| [#279](https://github.com/ryoita027-glitch/gray-crown/pull/279) | S 積層保留 | 親#277と一体でQA。単独マージ不可 | #277 | Draft: Aldina recruit remembers the ration mother's thanks |
| [#278](https://github.com/ryoita027-glitch/gray-crown/pull/278) | C 検証候補 | プレイ阻害・セーブ・操作のQAで採否判断 | #255 | Draft: make the adventure menu usable on touch-only mobile devices |
| [#277](https://github.com/ryoita027-glitch/gray-crown/pull/277) | S 積層保留 | 親#275と一体でQA。単独マージ不可 | #275 | Draft: Aldina ration mother remembers earlier help after the war |
| [#276](https://github.com/ryoita027-glitch/gray-crown/pull/276) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #274 | Draft: Margaret V15 hair-to-robe contact native44 A/B — ART HOLD |
| [#275](https://github.com/ryoita027-glitch/gray-crown/pull/275) | S 積層保留 | 親#273と一体でQA。単独マージ不可 | #273 | Draft: Aldina fountain remembers the party's first civic question on return |
| [#274](https://github.com/ryoita027-glitch/gray-crown/pull/274) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #272 | Draft: Margaret V14 hand-authored neck/shoulder/robe A/B at native44 — ART HOLD |
| [#273](https://github.com/ryoita027-glitch/gray-crown/pull/273) | S 積層保留 | 親#271と一体でQA。単独マージ不可 | #271 | Draft: Aldina citizen remembers a voluntarily shared final demand |
| [#272](https://github.com/ryoita027-glitch/gray-crown/pull/272) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #270 | Draft: Margaret V13 upper-body silhouette A/B native44 — structural trial, ART HOLD |
| [#271](https://github.com/ryoita027-glitch/gray-crown/pull/271) | S 積層保留 | 親#269と一体でQA。単独マージ不可 | #269 | Draft: Aldina north-gate roll remembers the party's final demands |
| [#270](https://github.com/ryoita027-glitch/gray-crown/pull/270) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #268 | Draft: Margaret V12 upper hair-height / 44px V5 NPC comparison (ART HOLD) |
| [#269](https://github.com/ryoita027-glitch/gray-crown/pull/269) | S 積層保留 | 親#267と一体でQA。単独マージ不可 | #267 | Draft: preserve final-decision navigation on return to Aldina |
| [#268](https://github.com/ryoita027-glitch/gray-crown/pull/268) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #266 | Draft: Margaret V11 head/hair silhouette + value-group 44px A/B/C vs V5 NPC (ART HOLD) |
| [#267](https://github.com/ryoita027-glitch/gray-crown/pull/267) | S 積層保留 | 親#265と一体でQA。単独マージ不可 | #265 | Draft: concise ruler revisits and evidence-consistent final-camp ending |
| [#266](https://github.com/ryoita027-glitch/gray-crown/pull/266) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #264 | Draft: Margaret V10 upper-body plane native44 A/B (ART HOLD, no approval) |
| [#265](https://github.com/ryoita027-glitch/gray-crown/pull/265) | S 積層保留 | 親#263と一体でQA。単独マージ不可 | #263 | Draft: return from final-camp witness boards without repeated northward backtracking |
| [#264](https://github.com/ryoita027-glitch/gray-crown/pull/264) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #262 | Draft: Margaret V9 slimmer head mass / restrained hair value — real 44px A-B-C (ART HOLD) |
| [#263](https://github.com/ryoita027-glitch/gray-crown/pull/263) | S 積層保留 | 親#261と一体でQA。単独マージ不可 | #261 | Draft: reflect final-camp surrender in witness boards and companion dialogue |
| [#262](https://github.com/ryoita027-glitch/gray-crown/pull/262) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #260 | Draft: Margaret V8 compact hair mass + outer contour native44 A/B — ART HOLD |
| [#261](https://github.com/ryoita027-glitch/gray-crown/pull/261) | S 積層保留 | 親#259と一体でQA。単独マージ不可 | #259 | Draft: restore final-camp post-battle witness choice instead of fallback |
| [#260](https://github.com/ryoita027-glitch/gray-crown/pull/260) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #258 | Draft: real Margaret 44px idle foot-lock sprite vs whole-body bob — ART HOLD |
| [#259](https://github.com/ryoita027-glitch/gray-crown/pull/259) | S 積層保留 | 親#257と一体でQA。単独マージ不可 | #257 | Draft: optional post-battle return to changed final-camp witness boards |
| [#258](https://github.com/ryoita027-glitch/gray-crown/pull/258) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #256 | Draft: four-frame authored hero idle motion in live 44px field — ART HOLD |
| [#257](https://github.com/ryoita027-glitch/gray-crown/pull/257) | S 積層保留 | 親#254と一体でQA。単独マージ不可 | #254 | Draft: final camp witness boards visibly react to the chosen checkpoint |
| [#256](https://github.com/ryoita027-glitch/gray-crown/pull/256) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #253 | Draft: opt-in live 44px authored idle poses for four heroes — field art A/B HOLD |
| [#255](https://github.com/ryoita027-glitch/gray-crown/pull/255) | S 積層保留 | 親#241と一体でQA。単独マージ不可 | #241 | Draft: prevent toolbar Load from competing with pending portable import |
| [#254](https://github.com/ryoita027-glitch/gray-crown/pull/254) | S 積層保留 | 親#252と一体でQA。単独マージ不可 | #252 | Final camps: guide optional evidence and pay it off without false resolution |
| [#253](https://github.com/ryoita027-glitch/gray-crown/pull/253) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #251 | Draft: true live Margaret walk baseline vs authored idle art, 44px four-way canvas gate — ART HOLD |
| [#252](https://github.com/ryoita027-glitch/gray-crown/pull/252) | S 積層保留 | 親#250と一体でQA。単独マージ不可 | #250 | Final camps: preserve witness records before facing Shion or Granz |
| [#251](https://github.com/ryoita027-glitch/gray-crown/pull/251) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #248 | Draft: real Ryune canvas Margaret idle three-way A/B gate — ART HOLD |
| [#250](https://github.com/ryoita027-glitch/gray-crown/pull/250) | S 積層保留 | 親#249と一体でQA。単独マージ不可 | #249 | Final camps: preserve companion choice and make first arrivals matter |
| [#249](https://github.com/ryoita027-glitch/gray-crown/pull/249) | S 積層保留 | 親#247と一体でQA。単独マージ不可 | #247 | Final battlefield: preserve allegiance and return-trip continuity |
| [#248](https://github.com/ryoita027-glitch/gray-crown/pull/248) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #246 | Draft: Margaret original-face-preserving silver-hair A/B vs #246 NO-GO (ART HOLD) |
| [#247](https://github.com/ryoita027-glitch/gray-crown/pull/247) | S 積層保留 | 親#245と一体でQA。単独マージ不可 | #245 | Final battlefield: clear camp paths, staged orders and concise re-entry |
| [#246](https://github.com/ryoita027-glitch/gray-crown/pull/246) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #244 | Draft: Margaret front idle head/neck/shoulder structural redraw — native44 NPC A/B (ART HOLD) |
| [#245](https://github.com/ryoita027-glitch/gray-crown/pull/245) | S 積層保留 | 親#243と一体でQA。単独マージ不可 | #243 | Final battlefield: discoverable civilian waymark and persistent choice |
| [#244](https://github.com/ryoita027-glitch/gray-crown/pull/244) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #242 | Draft: Margaret lower-hair geometry 16-frame native44 V5 NPC A/B — ART HOLD |
| [#243](https://github.com/ryoita027-glitch/gray-crown/pull/243) | S 積層保留 | 親#240と一体でQA。単独マージ不可 | #240 | Draft: unblock Aldina north gate and let the four heroes leave their names |
| [#242](https://github.com/ryoita027-glitch/gray-crown/pull/242) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #239 | Draft: correct native44 cast/NPC visual baseline and contact-foot comparison — ART HOLD |
| [#241](https://github.com/ryoita027-glitch/gray-crown/pull/241) | S 積層保留 | 親#238と一体でQA。単独マージ不可 | #238 | Draft: warn before top-bar Load discards unsaved adventure |
| [#240](https://github.com/ryoita027-glitch/gray-crown/pull/240) | S 積層保留 | 親#237と一体でQA。単独マージ不可 | #237 | Draft: preserve Aldina hero ledger original after optional Granz confrontation |
| [#239](https://github.com/ryoita027-glitch/gray-crown/pull/239) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #236 | Draft: Margaret 44px NPC-language contour trial, four-direction real PNG A/B — ART HOLD |
| [#238](https://github.com/ryoita027-glitch/gray-crown/pull/238) | S 積層保留 | 親#235と一体でQA。単独マージ不可 | #235 | Draft: restore adventure menu after cancelled or failed portable save import |
| [#237](https://github.com/ryoita027-glitch/gray-crown/pull/237) | S 積層保留 | 親#234と一体でQA。単独マージ不可 | #234 | Draft: make Aldina's return poster remember Yuki and let a recruit respond to the ledger |
| [#236](https://github.com/ryoita027-glitch/gray-crown/pull/236) | X 不採用 | 明示的にART NO-GOの試作 | #233 | Draft: Margaret actual-source 5-pixel neck A/B — ART NO-GO (rejected) |
| [#235](https://github.com/ryoita027-glitch/gray-crown/pull/235) | S 積層保留 | 親#232と一体でQA。単独マージ不可 | #232 | Draft: preserve menu retry after unexpected Load, Restore, and New Game errors |
| [#234](https://github.com/ryoita027-glitch/gray-crown/pull/234) | S 積層保留 | 親#231と一体でQA。単独マージ不可 | #231 | Draft: keep Aldina official accessible and let heroes preserve the ledger |
| [#233](https://github.com/ryoita027-glitch/gray-crown/pull/233) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #230 | Draft: Margaret hand-placed head/neck/shoulder pixel construction at native 44px — ART HOLD |
| [#232](https://github.com/ryoita027-glitch/gray-crown/pull/232) | S 積層保留 | 親#229と一体でQA。単独マージ不可 | #229 | Draft: preserve adventure menu retry after unexpected manual save exception |
| [#231](https://github.com/ryoita027-glitch/gray-crown/pull/231) | S 積層保留 | 親#228と一体でQA。単独マージ不可 | #228 | Draft: restore return-road/capital gate continuity and make the scout rumor actionable |
| [#230](https://github.com/ryoita027-glitch/gray-crown/pull/230) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #227 | Draft: retain approved 44px hero scale and add same-state live 40px A/B gate — ART HOLD |
| [#229](https://github.com/ryoita027-glitch/gray-crown/pull/229) | S 積層保留 | 親#226と一体でQA。単独マージ不可 | #226 | Draft: keep export retry accessible when browser download handler throws |
| [#228](https://github.com/ryoita027-glitch/gray-crown/pull/228) | S 積層保留 | 親#225と一体でQA。単独マージ不可 | #225 | Draft: preserve Elsia north/south returns and let residents keep a record |
| [#227](https://github.com/ryoita027-glitch/gray-crown/pull/227) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #224 | Draft: 40px whole-party field/acting scale A/B against 44px V5 NPCs — ART HOLD |
| [#226](https://github.com/ryoita027-glitch/gray-crown/pull/226) | S 積層保留 | 親#223と一体でQA。単独マージ不可 | #223 | Draft: keep menu retryable after portable/recovery export fails silently |
| [#225](https://github.com/ryoita027-glitch/gray-crown/pull/225) | S 積層保留 | 親#222と一体でQA。単独マージ不可 | #222 | Draft: restore Yuki battlefield gates and reward cross-checking witnesses |
| [#224](https://github.com/ryoita027-glitch/gray-crown/pull/224) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #221 | Draft: Margaret V3 hair mass native44 A/B against V5 NPCs — ART HOLD |
| [#223](https://github.com/ryoita027-glitch/gray-crown/pull/223) | S 積層保留 | 親#220と一体でQA。単独マージ不可 | #220 | Draft: preserve adventure-menu retry when manual save fails silently |
| [#222](https://github.com/ryoita027-glitch/gray-crown/pull/222) | S 積層保留 | 親#219と一体でQA。単独マージ不可 | #219 | Draft: make Empire village hospitality and city returns reflect the player's journey |
| [#221](https://github.com/ryoita027-glitch/gray-crown/pull/221) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #218 | Draft: Margaret idle contour V2 native-44px NPC comparison — ART HOLD |
| [#220](https://github.com/ryoita027-glitch/gray-crown/pull/220) | S 積層保留 | 親#217と一体でQA。単独マージ不可 | #217 | Draft: keep adventure menu open when previous-adventure restore is cancelled |
| [#219](https://github.com/ryoita027-glitch/gray-crown/pull/219) | S 積層保留 | 親#216と一体でQA。単独マージ不可 | #216 | Draft: make Empire village watermill repair change village life and reward exploration |
| [#218](https://github.com/ryoita027-glitch/gray-crown/pull/218) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #215 | Draft: Margaret idle hair silhouette 44px pixel A/B — ART HOLD |
| [#217](https://github.com/ryoita027-glitch/gray-crown/pull/217) | S 積層保留 | 親#214と一体でQA。単独マージ不可 | #214 | Draft: warn before menu Load discards unsaved adventure progress |
| [#216](https://github.com/ryoita027-glitch/gray-crown/pull/216) | S 積層保留 | 親#213と一体でQA。単独マージ不可 | #213 | Draft: reward optional Bellad lookout scouting with guard response and bridge echo |
| [#215](https://github.com/ryoita027-glitch/gray-crown/pull/215) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #212 | Draft: Margaret 44px foot-contact continuity across all authored poses — ART HOLD |
| [#214](https://github.com/ryoita027-glitch/gray-crown/pull/214) | S 積層保留 | 親#211と一体でQA。単独マージ不可 | #211 | Draft: preserve adventure menu when new-game confirmation is cancelled |
| [#213](https://github.com/ryoita027-glitch/gray-crown/pull/213) | S 積層保留 | 親#210と一体でQA。単独マージ不可 | #210 | Draft: warn before Klein bridge point of no return and honor the collapse |
| [#212](https://github.com/ryoita027-glitch/gray-crown/pull/212) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | main | Draft: Margaret-only 44px shoe-shadow alignment from actual walk PNG — ART HOLD |
| [#211](https://github.com/ryoita027-glitch/gray-crown/pull/211) | S 積層保留 | 親#208と一体でQA。単独マージ不可 | #208 | Draft: show current HP/MP instead of maximum-only values in adventure menu |
| [#210](https://github.com/ryoita027-glitch/gray-crown/pull/210) | S 積層保留 | 親#207と一体でQA。単独マージ不可 | #207 | Draft: resume Bellad Watchfort visits without replaying the first morning |
| [#209](https://github.com/ryoita027-glitch/gray-crown/pull/209) | X 不採用 | 明示的にART NO-GOの試作 | #98 | Draft: Triton idle head/shoulder 44px structural A/B — ART NO-GO |
| [#208](https://github.com/ryoita027-glitch/gray-crown/pull/208) | S 積層保留 | 親#195と一体でQA。単独マージ不可 | #195 | Draft: prevent adventure-menu party stats from rendering as HTML |
| [#207](https://github.com/ryoita027-glitch/gray-crown/pull/207) | S 積層保留 | 親#205と一体でQA。単独マージ不可 | #205 | Draft: guide Halum's morning departure along a visible north trail |
| [#206](https://github.com/ryoita027-glitch/gray-crown/pull/206) | X 不採用 | 明示的にART NO-GOの試作 | #98 | Draft: Triton 40-color walk A/B — ART NO-GO (rejected) |
| [#205](https://github.com/ryoita027-glitch/gray-crown/pull/205) | C 検証候補 | プレイ阻害・セーブ・操作のQAで採否判断 | #203 | Draft: open the short Halum checkpoint spur and make the innkeeper acknowledge repair |
| [#204](https://github.com/ryoita027-glitch/gray-crown/pull/204) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #202 | Draft: fix mutable render-state drift in native camera A/B captures — ART HOLD |
| [#203](https://github.com/ryoita027-glitch/gray-crown/pull/203) | C 検証候補 | プレイ阻害・セーブ・操作のQAで採否判断 | #201 | Draft: fix Halum checkpoint's reversed directions and make repair choices visible |
| [#202](https://github.com/ryoita027-glitch/gray-crown/pull/202) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #200 | Draft: native-100% in-game A/B evidence for fractional camera movement — ART HOLD |
| [#201](https://github.com/ryoita027-glitch/gray-crown/pull/201) | S 積層保留 | 親#199と一体でQA。単独マージ不可 | #199 | Draft: preserve Serad–Halum–Watchfort return gates and skip repeat Halum arrival |
| [#200](https://github.com/ryoita027-glitch/gray-crown/pull/200) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #98 | Draft: in-game pixel camera A/B for four heroes and V5 NPC scale — ART HOLD |
| [#199](https://github.com/ryoita027-glitch/gray-crown/pull/199) | S 積層保留 | 親#197と一体でQA。単独マージ不可 | #197 | Draft: return to Serad without replaying first arrival or losing mission progress |
| [#198](https://github.com/ryoita027-glitch/gray-crown/pull/198) | X 不採用 | 明示的にART NO-GOの試作 | #196 | Draft: field-worker V5 source-derived four-direction arm anatomy study — ART NO-GO |
| [#197](https://github.com/ryoita027-glitch/gray-crown/pull/197) | C 検証候補 | プレイ阻害・セーブ・操作のQAで採否判断 | #194 | Draft: return to Ash Road from the correct gate without replaying arrival |
| [#196](https://github.com/ryoita027-glitch/gray-crown/pull/196) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #193 | Draft: repair missing field-worker V4 PNG codec and verify source fidelity — ART HOLD |
| [#195](https://github.com/ryoita027-glitch/gray-crown/pull/195) | S 積層保留 | 親#192と一体でQA。単独マージ不可 | #192 | Draft: prevent overlapping portable save file imports from overwriting newer selections |
| [#194](https://github.com/ryoita027-glitch/gray-crown/pull/194) | S 積層保留 | 親#191と一体でQA。単独マージ不可 | #191 | Draft: keep Ash Road mission guidance consistent with discovery order |
| [#193](https://github.com/ryoita027-glitch/gray-crown/pull/193) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #190 | Draft: field worker V4 four-direction tool-grip silhouette — native 44px ART HOLD |
| [#192](https://github.com/ryoita027-glitch/gray-crown/pull/192) | S 積層保留 | 親#189と一体でQA。単独マージ不可 | #189 | Draft: correct portable-import preflight and backup-rotation regression coverage |
| [#191](https://github.com/ryoita027-glitch/gray-crown/pull/191) | S 積層保留 | 親#188と一体でQA。単独マージ不可 | #188 | Draft: make Granz's supply-first choice lead through a readable ash-road loop |
| [#190](https://github.com/ryoita027-glitch/gray-crown/pull/190) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #114 | Draft: field worker V3b four-direction face/material pixel study — ART HOLD |
| [#189](https://github.com/ryoita027-glitch/gray-crown/pull/189) | S 積層保留 | 親#186と一体でQA。単独マージ不可 | #186 | Draft: explain blocked corrupt-save recovery downloads instead of failing silently |
| [#188](https://github.com/ryoita027-glitch/gray-crown/pull/188) | S 積層保留 | 親#185と一体でQA。単独マージ不可 | #185 | Draft: make the ash-road family's height marks a visible choice and later story echo |
| [#187](https://github.com/ryoita027-glitch/gray-crown/pull/187) | X 不採用 | 明示的にART NO-GOの試作 | #184 | Draft: Sophie V9b original-source collar pilot — native 44px ART NO-GO |
| [#186](https://github.com/ryoita027-glitch/gray-crown/pull/186) | S 積層保留 | 親#183と一体でQA。単独マージ不可 | #183 | Draft: warn when manual Save cannot restore previous browser slots |
| [#185](https://github.com/ryoita027-glitch/gray-crown/pull/185) | S 積層保留 | 親#182と一体でQA。単独マージ不可 | #182 | Draft: turn Granz's briefing into a shorter mission and optional ash-road priority |
| [#184](https://github.com/ryoita027-glitch/gray-crown/pull/184) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #181 | Draft: Sophie original-source 48px pixel workbench with V5 native-44px art A/B |
| [#183](https://github.com/ryoita027-glitch/gray-crown/pull/183) | S 積層保留 | 親#180と一体でQA。単独マージ不可 | #180 | Draft: warn when portable save import rollback cannot restore original backup |
| [#182](https://github.com/ryoita027-glitch/gray-crown/pull/182) | S 積層保留 | 親#179と一体でQA。単独マージ不可 | #179 | Draft: keep capital first-night discovery callbacks within 13 dialogue beats |
| [#181](https://github.com/ryoita027-glitch/gray-crown/pull/181) | X 不採用 | 明示的にART NO-GOの試作 | #178 | Draft: Sophie V7/V8 four-direction structural pixel pilots — ART NO-GO |
| [#180](https://github.com/ryoita027-glitch/gray-crown/pull/180) | S 積層保留 | 親#177と一体でQA。単独マージ不可 | #177 | Draft: reject malformed portable saves before replacing an adventure |
| [#179](https://github.com/ryoita027-glitch/gray-crown/pull/179) | S 積層保留 | 親#176と一体でQA。単独マージ不可 | #176 | Draft: let the White Stag refugee family visibly respond to the room choice |
| [#178](https://github.com/ryoita027-glitch/gray-crown/pull/178) | X 不採用 | 明示的にART NO-GOの試作 | #175 | Draft: Sophie V6 original-source shoulder-plane pixel study — ART NO-GO |
| [#177](https://github.com/ryoita027-glitch/gray-crown/pull/177) | S 積層保留 | 親#166と一体でQA。単独マージ不可 | #166 | Draft: warn before portable or archive import loses unsaved live progress |
| [#176](https://github.com/ryoita027-glitch/gray-crown/pull/176) | S 積層保留 | 親#174と一体でQA。単独マージ不可 | #174 | Draft: let Aldina's inn notice become an optional refugee-room choice |
| [#175](https://github.com/ryoita027-glitch/gray-crown/pull/175) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #160 | Draft: Sophie V5 original-based 24-frame lower-hair optical study — ART HOLD |
| [#174](https://github.com/ryoita027-glitch/gray-crown/pull/174) | S 積層保留 | 親#172と一体でQA。単独マージ不可 | #172 | Draft: let Aldina's first night remember voluntary street encounters |
| [#173](https://github.com/ryoita027-glitch/gray-crown/pull/173) | X 不採用 | 明示的にART NO-GOの試作 | #171 | Draft: Sophie V4 material-plane 24-frame study — ART NO-GO; compare original/V5 |
| [#172](https://github.com/ryoita027-glitch/gray-crown/pull/172) | S 積層保留 | 親#170と一体でQA。単独マージ不可 | #170 | Draft: guide Aldina arrivals with a visible, stage-aware south-gate sign |
| [#171](https://github.com/ryoita027-glitch/gray-crown/pull/171) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #169 | Draft: Sophie V3 profile-eye readability study — ART HOLD (not production) |
| [#170](https://github.com/ryoita027-glitch/gray-crown/pull/170) | S 積層保留 | 親#168と一体でQA。単独マージ不可 | #168 | Draft: let Aldina's fountain connect the victory poster to the ration queue |
| [#169](https://github.com/ryoita027-glitch/gray-crown/pull/169) | X 不採用 | 明示的にART NO-GOの試作 | #167 | Draft: Sophie V2 independent 4-direction head/neck/shoulder pixel redraw — ART NO-GO |
| [#168](https://github.com/ryoita027-glitch/gray-crown/pull/168) | S 積層保留 | 親#165と一体でQA。単独マージ不可 | #165 | Draft: make Aldina wagon route legible and show where delivery went |
| [#167](https://github.com/ryoita027-glitch/gray-crown/pull/167) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #164 | Draft: reject unstable Sophie V1 game-canvas A/B and show native 44px pixel differences — ART HOLD |
| [#166](https://github.com/ryoita027-glitch/gray-crown/pull/166) | S 積層保留 | 親#140と一体でQA。単独マージ不可 | #140 | Draft: rescue current adventure as JSON when browser save storage is denied |
| [#165](https://github.com/ryoita027-glitch/gray-crown/pull/165) | S 積層保留 | 親#163と一体でQA。単独マージ不可 | #163 | Draft: make the old-road wagon queue matter at Aldina's south gate |
| [#164](https://github.com/ryoita027-glitch/gray-crown/pull/164) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #162 | Draft: render Sophie contour V1 in real village Canvas and capture original/V1 44px A/B — ART HOLD |
| [#163](https://github.com/ryoita027-glitch/gray-crown/pull/163) | S 積層保留 | 親#161と一体でQA。単独マージ不可 | #161 | Draft: give the old north road a first sight of Aldina and an optional party beat |
| [#162](https://github.com/ryoita027-glitch/gray-crown/pull/162) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #160 | Draft: Sophie four-direction hair silhouette V1 native-44px A/B — ART HOLD |
| [#161](https://github.com/ryoita027-glitch/gray-crown/pull/161) | S 積層保留 | 親#159と一体でQA。単独マージ不可 | #159 | Draft: make old-road waystone care a visible optional choice with scout response |
| [#160](https://github.com/ryoita027-glitch/gray-crown/pull/160) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #154 | Draft: source-embedded 44px four-hero × V5 anchor board — ART HOLD |
| [#159](https://github.com/ryoita027-glitch/gray-crown/pull/159) | S 積層保留 | 親#157と一体でQA。単独マージ不可 | #157 | Draft: make north-road stone milestone discoverable and remove false shortcut cue |
| [#158](https://github.com/ryoita027-glitch/gray-crown/pull/158) | X 不採用 | 明示的にART NO-GOの試作 | #154 | Draft: Margaret V13 neck-bridge 44px visual test — ART NO-GO |
| [#157](https://github.com/ryoita027-glitch/gray-crown/pull/157) | S 積層保留 | 親#155と一体でQA。単独マージ不可 | #155 | Draft: reward cleared old-fort passage and make north-road scout recognize actual route |
| [#156](https://github.com/ryoita027-glitch/gray-crown/pull/156) | X 不採用 | 明示的にART NO-GOの試作 | #154 | Draft: Margaret V12 head/body proportion diagnostic — ART NO-GO |
| [#155](https://github.com/ryoita027-glitch/gray-crown/pull/155) | S 積層保留 | 親#153と一体でQA。単独マージ不可 | #153 | Draft: make wolf tracks and old-fort approach readable from the road sign |
| [#154](https://github.com/ryoita027-glitch/gray-crown/pull/154) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #152 | Draft: Margaret V11 4-direction shoulder-hair silhouette PNG and real-canvas A/B gate (ART HOLD) |
| [#153](https://github.com/ryoita027-glitch/gray-crown/pull/153) | S 積層保留 | 親#146と一体でQA。単独マージ不可 | #146 | Draft: make western road herb detour discoverable, collected and remembered |
| [#152](https://github.com/ryoita027-glitch/gray-crown/pull/152) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #151 | Draft: Margaret V10 4-direction temple silhouette study with native 44px V5 A/B (ART HOLD) |
| [#151](https://github.com/ryoita027-glitch/gray-crown/pull/151) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #150 | Draft: isolate Margaret-only real-canvas A/B pixels and 4× review crops (ART HOLD) |
| [#150](https://github.com/ryoita027-glitch/gray-crown/pull/150) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #149 | Draft: real village-canvas Margaret original/V9 44px A/B capture gate (ART HOLD) |
| [#149](https://github.com/ryoita027-glitch/gray-crown/pull/149) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #148 | Draft: Margaret V9 silver-hair RGB study, native 44px V5 A/B and reproducible PNG checks (ART HOLD) |
| [#148](https://github.com/ryoita027-glitch/gray-crown/pull/148) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #147 | Draft: fix V5 NPC identity drift in Margaret V8 44px walk A/B reviewer (ART HOLD) |
| [#147](https://github.com/ryoita027-glitch/gray-crown/pull/147) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #145 | Draft: Margaret V8 four-direction under-lock hair shadow with native 44px V5 review (ART HOLD) |
| [#146](https://github.com/ryoita027-glitch/gray-crown/pull/146) | S 積層保留 | 親#98と一体でQA。単独マージ不可 | #98 | Draft: merchant wagon choice and visible capital supply consequence |
| [#145](https://github.com/ryoita027-glitch/gray-crown/pull/145) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #143 | Draft: Margaret V7 original-detail front neck/collar pixel study with 44px V5 anchor review (ART HOLD) |
| [#144](https://github.com/ryoita027-glitch/gray-crown/pull/144) | X 不採用 | 明示的にART NO-GOの試作 | #143 | Draft: Margaret independent head/shoulder V6 full redraw — ART NO-GO |
| [#143](https://github.com/ryoita027-glitch/gray-crown/pull/143) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #142 | Draft: Margaret V5 crown/shoulder 48px silhouette study with native 44px V5 NPC A/B (ART HOLD) |
| [#142](https://github.com/ryoita027-glitch/gray-crown/pull/142) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #141 | Draft: Margaret V4 directional hair-to-shoulder contour PNG and native 44px A/B (ART HOLD) |
| [#141](https://github.com/ryoita027-glitch/gray-crown/pull/141) | X 不採用 | 明示的にART NO-GOの試作 | #139 | Draft: Margaret pose-aware face V3 actual PNG and 44px A/B — ART NO-GO |
| [#140](https://github.com/ryoita027-glitch/gray-crown/pull/140) | S 積層保留 | 親#124と一体でQA。単独マージ不可 | #124 | Draft: preserve corrupt previous-adventure archive bytes before New Game replacement |
| [#139](https://github.com/ryoita027-glitch/gray-crown/pull/139) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #138 | Draft: Margaret original-contour V2 real PNG 44px A/B (ART HOLD) |
| [#138](https://github.com/ryoita027-glitch/gray-crown/pull/138) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #136 | Draft: source-derived Margaret face/neck 48px pixel study with V5 44px A/B (ART HOLD) |
| [#137](https://github.com/ryoita027-glitch/gray-crown/pull/137) | S 積層保留 | 親#98と一体でQA。単独マージ不可 | #98 | Draft: Ryune brookbank choice with four-hero dialogue, visible shoreline memory and NPC response |
| [#136](https://github.com/ryoita027-glitch/gray-crown/pull/136) | D 判定資料 | 不採用素材の判定記録は保持 | #135 | Draft: real 44px four-hero PNG A/B rejects face-priority and face+feet remaps (ART NO-GO) |
| [#135](https://github.com/ryoita027-glitch/gray-crown/pull/135) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #134 | Draft: compare real 44px hero face vs face+footline preservation against V5 anchors (ART HOLD) |
| [#134](https://github.com/ryoita027-glitch/gray-crown/pull/134) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #133 | Draft: preserve hero face pixels at native 44px, in-game original/candidate A/B (ART HOLD) |
| [#133](https://github.com/ryoita027-glitch/gray-crown/pull/133) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #132 | Draft: in-game same-scene 40/42/44px hero and V5 NPC visual A/B (ART HOLD) |
| [#132](https://github.com/ryoita027-glitch/gray-crown/pull/132) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #131 | Draft: capture real village hero/V5 contact A/B at 40/42/44px (ART HOLD) |
| [#131](https://github.com/ryoita027-glitch/gray-crown/pull/131) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #130 | Draft: reject V5 footline shift using real PNG alpha; opt-in original-hero contact A/B (ART HOLD) |
| [#130](https://github.com/ryoita027-glitch/gray-crown/pull/130) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #129 | Draft: Original hero 40/42/44px in-game scale study and V5 footline A/B (ART HOLD) |
| [#129](https://github.com/ryoita027-glitch/gray-crown/pull/129) | X 不採用 | 明示的にART NO-GOの試作 | #128 | Draft: Margaret V4F directional book grip and 44px V5 source comparison (ART NO-GO) |
| [#128](https://github.com/ryoita027-glitch/gray-crown/pull/128) | X 不採用 | 明示的にART NO-GOの試作 | #125 | Draft: Margaret V4E tailored 48px walk silhouette and real-source 44px comparison (ART NO-GO) |
| [#127](https://github.com/ryoita027-glitch/gray-crown/pull/127) | X 不採用 | 明示的にART NO-GOの試作 | #125 | Draft: Margaret V4C valid PNG walk study, strict integrity and 44px source A/B (ART NO-GO) |
| [#126](https://github.com/ryoita027-glitch/gray-crown/pull/126) | X 不採用 | 明示的にART NO-GOの試作 | #125 | Draft: Margaret V4B native silhouette candidate and real-source 44px gallery (ART NO-GO) |
| [#125](https://github.com/ryoita027-glitch/gray-crown/pull/125) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #123 | Draft: Margaret V4 independent 48px hand-pixel walk redraw (art review required) |
| [#124](https://github.com/ryoita027-glitch/gray-crown/pull/124) | S 積層保留 | 親#115と一体でQA。単独マージ不可 | #115 | Draft: gracefully handle denied browser storage reads during Continue and portable saves |
| [#123](https://github.com/ryoita027-glitch/gray-crown/pull/123) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #122 | Draft: real 44px Margaret V3 / V5 evidence, reject weak silhouette and add Chromium source gate |
| [#122](https://github.com/ryoita027-glitch/gray-crown/pull/122) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #121 | Draft: Margaret V3 four-direction 48px silhouette geometry and native 44px A/B (unapproved) |
| [#121](https://github.com/ryoita027-glitch/gray-crown/pull/121) | X 不採用 | 明示的にART NO-GOの試作 | #120 | Draft: Margaret V2 hair-mass art experiment — native 44px NO-GO |
| [#120](https://github.com/ryoita027-glitch/gray-crown/pull/120) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #118 | Draft: live in-game Margaret original/silver 44px A/B without reloading |
| [#119](https://github.com/ryoita027-glitch/gray-crown/pull/119) | C 検証候補 | プレイ阻害・セーブ・操作のQAで採否判断 | #115 | Draft: exact-SHA offline Save/Continue Node regression gate |
| [#118](https://github.com/ryoita027-glitch/gray-crown/pull/118) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #117 | Draft: reversible Margaret silver-white 44px palette A/B against V5 anchors |
| [#117](https://github.com/ryoita027-glitch/gray-crown/pull/117) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #116 | Draft: refine brook keeper V2 pixel art and preserve 44px V1/V2 visual A/B |
| [#116](https://github.com/ryoita027-glitch/gray-crown/pull/116) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #114 | Draft: independent 4-direction brook keeper art, opt-in game view and V5 visual comparison |
| [#115](https://github.com/ryoita027-glitch/gray-crown/pull/115) | C 検証候補 | プレイ阻害・セーブ・操作のQAで採否判断 | #113 | Draft: keep legacy-cleared object checkpoints and follower history on Continue |
| [#114](https://github.com/ryoita027-glitch/gray-crown/pull/114) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #112 | Draft: field worker V5-style v2 hand-pixel refinement and 3-way in-game A/B |
| [#113](https://github.com/ryoita027-glitch/gray-crown/pull/113) | S 積層保留 | 親#111と一体でQA。単独マージ不可 | #111 | Draft: reject saved follower trails through loaded-world solid scenery |
| [#112](https://github.com/ryoita027-glitch/gray-crown/pull/112) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #98 | Draft: hand-authored 4-direction field worker art and V5 visual A/B in-game pilot |
| [#111](https://github.com/ryoita027-glitch/gray-crown/pull/111) | C 検証候補 | プレイ阻害・セーブ・操作のQAで採否判断 | #110 | Draft: validate complete real-step follower history on Continue |
| [#110](https://github.com/ryoita027-glitch/gray-crown/pull/110) | C 検証候補 | プレイ阻害・セーブ・操作のQAで採否判断 | #109 | Draft: preserve follower turn history through Save / Continue |
| [#109](https://github.com/ryoita027-glitch/gray-crown/pull/109) | C 検証候補 | プレイ阻害・セーブ・操作のQAで採否判断 | #108 | Draft: prevent party followers spawning inside solid scenery and NPCs |
| [#108](https://github.com/ryoita027-glitch/gray-crown/pull/108) | S 積層保留 | 親#107と一体でQA。単独マージ不可 | #107 | Draft: recover blocked saves across the full map instead of a fixed 11-tile radius |
| [#107](https://github.com/ryoita027-glitch/gray-crown/pull/107) | C 検証候補 | プレイ阻害・セーブ・操作のQAで採否判断 | #106 | Draft: preserve save position when story-dependent NPC disappears |
| [#106](https://github.com/ryoita027-glitch/gray-crown/pull/106) | A 統合本命 | 唯一の統合候補;実ブラウザQA未済 | main | Draft: resolve PR #98 / main merge conflict without touching pinned QA HEAD |
| [#105](https://github.com/ryoita027-glitch/gray-crown/pull/105) | D 判定資料 | 不採用素材の判定記録は保持 | #104 | Draft: Phase 1B art NO-GO from 44px comparison, real Canvas draw-source test |
| [#104](https://github.com/ryoita027-glitch/gray-crown/pull/104) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #103 | Draft: Phase 1B-2 Karen face A/B/C actual 48x56 headroom sprites and opt-in field review |
| [#103](https://github.com/ryoita027-glitch/gray-crown/pull/103) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #102 | Draft: Phase 1B real 4-dir Karen face-part PNGs, source-perfect reconstruction and opt-in field A/B |
| [#102](https://github.com/ryoita027-glitch/gray-crown/pull/102) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #101 | Draft: Phase 1A reversible four-hero field scale and Margaret silver-hair A/B pilot |
| [#101](https://github.com/ryoita027-glitch/gray-crown/pull/101) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #99 | Draft: Phase 0 verified hero asset inventory and same-scale offline visual comparison |
| [#100](https://github.com/ryoita027-glitch/gray-crown/pull/100) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Draft: modular Karen 3D blockout, offline GLB inspector and reversible game pilot (unapproved art) |
| [#99](https://github.com/ryoita027-glitch/gray-crown/pull/99) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #98 | Part-based character pipeline v1: offline 48px editor, 4-direction rig and tests (no production art changes) |
| [#98](https://github.com/ryoita027-glitch/gray-crown/pull/98) | B 凍結原本 | 非mergeable。参照のみ | main | Single-HEAD integrated acceptance: PR #96 late saves + #97 fort fix, strict Actions gate |
| [#97](https://github.com/ryoita027-glitch/gray-crown/pull/97) | S 積層保留 | 親#96と一体でQA。単独マージ不可 | #96 | Fix post-boss cave exit stage drift across Save/Load; preserve original art |
| [#96](https://github.com/ryoita027-glitch/gray-crown/pull/96) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | #95 | Commercial safety pass: preserve previous adventure and escape imported HUD text |
| [#95](https://github.com/ryoita027-glitch/gray-crown/pull/95) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | #94 | Restore battle hero presence at 60–72px without distorted art, overlapping enemies or HUD |
| [#94](https://github.com/ryoita027-glitch/gray-crown/pull/94) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | #93 | Battle display rollback: restore original front-facing hero sprites; keep V5 field fixes |
| [#93](https://github.com/ryoita027-glitch/gray-crown/pull/93) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | 外部/既に閉じたブランチ | Preserve V5 character designs: fix scale, grounded feet, name overlays and duplicate props |
| [#91](https://github.com/ryoita027-glitch/gray-crown/pull/91) | S 積層保留 | 親#90と一体でQA。単独マージ不可 | #90 | Playable fort discovery: follow a broken shield clue into real boss tactics and party memory |
| [#90](https://github.com/ryoita027-glitch/gray-crown/pull/90) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | #89 | Fix KO combat softlock; verify real resource attrition and honest win/loss metrics |
| [#89](https://github.com/ryoita027-glitch/gray-crown/pull/89) | S 積層保留 | 親#88と一体でQA。単独マージ不可 | #88 | Player-first balance: protect tactical choices from opening through later bosses |
| [#88](https://github.com/ryoita027-glitch/gray-crown/pull/88) | S 積層保留 | 親#87と一体でQA。単独マージ不可 | #87 | Playable Ryune moment: Ren sparring, visible choice and true wolf-battle payoff |
| [#87](https://github.com/ryoita027-glitch/gray-crown/pull/87) | S 積層保留 | 親#85と一体でQA。単独マージ不可 | #85 | Player quality: make first wolf threat and Karen Guard actually matter |
| [#86](https://github.com/ryoita027-glitch/gray-crown/pull/86) | S 積層保留 | 親#85と一体でQA。単独マージ不可 | #85 | QA: repair V5 NPC test drift and Chromium preflight order (PR #85 follow-up) |
| [#85](https://github.com/ryoita027-glitch/gray-crown/pull/85) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | #84 | Player-facing NPC art V5: concept sprites in game, face-readable dialogue, accurate legacy A/B (hero art locked) |
| [#84](https://github.com/ryoita027-glitch/gray-crown/pull/84) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #83 | Playable NPC art: convert nine generated character designs to real 48px four-direction sprites (no hero changes) |
| [#83](https://github.com/ryoita027-glitch/gray-crown/pull/83) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #82 | NPC appeal pass 2: unique front-facing work acting for 9 + role-based faces for 37, no hero art changes |
| [#82](https://github.com/ryoita027-glitch/gray-crown/pull/82) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #81 | Art rework candidate: nine resident face foundations redrawn at native 48px; hero art locked |
| [#81](https://github.com/ryoita027-glitch/gray-crown/pull/81) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #80 | Player-centered visual review and Margaret's belonging across the party — no hero art changes |
| [#80](https://github.com/ryoita027-glitch/gray-crown/pull/80) | S 積層保留 | 親#79と一体でQA。単独マージ不可 | #79 | Player-first opening integration: keep resident art, one-trip reports and distinct capital landmarks |
| [#79](https://github.com/ryoita027-glitch/gray-crown/pull/79) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #77 | Player-visible art candidate: replace nine generic villagers with individually pixel-painted directional sprites |
| [#78](https://github.com/ryoita027-glitch/gray-crown/pull/78) | S 積層保留 | 親#76と一体でQA。単独マージ不可 | #76 | Early opening quality: replace two-zone chore with meaningful one-trip reports and real battle feedback |
| [#77](https://github.com/ryoita027-glitch/gray-crown/pull/77) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #76 | Visual production pass: individually authored residents, lived-in Ryune homes and market/palace/garrison streets |
| [#76](https://github.com/ryoita027-glitch/gray-crown/pull/76) | S 積層保留 | 親#75と一体でQA。単独マージ不可 | #75 | Early playable QA: fix ignored combat-intro clicks, capture actionable battle art, compare real wolf tactics and pin evidence SHA |
| [#75](https://github.com/ryoita027-glitch/gray-crown/pull/75) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #74 | Ryune opening: four optional character farewells, gentler discovery UX, real idle-frame scheduling |
| [#74](https://github.com/ryoita027-glitch/gray-crown/pull/74) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #73 | Ryune opening: lived-in pixel scenery, grounded worker motion, area motifs and real-play evidence gate |
| [#73](https://github.com/ryoita027-glitch/gray-crown/pull/73) | S 積層保留 | 親#72と一体でQA。単独マージ不可 | #72 | Late-game production: unlock Story19 progression, meaningful 3-route choices, contextual audio and measured combat QA |
| [#72](https://github.com/ryoita027-glitch/gray-crown/pull/72) | S 積層保留 | 親#71と一体でQA。単独マージ不可 | #71 | Commercial readiness: reliable saves, portable offline releases, and S0 quality gates |
| [#71](https://github.com/ryoita027-glitch/gray-crown/pull/71) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #70 | Ryune opening: purposeful four-hero micro-acting and natural optional character reactions |
| [#70](https://github.com/ryoita027-glitch/gray-crown/pull/70) | S 積層保留 | 親#69と一体でQA。単独マージ不可 | #69 | Add explorable Ryune west fields and east brook with optional early side quest |
| [#69](https://github.com/ryoita027-glitch/gray-crown/pull/69) | S 積層保留 | 親#68と一体でQA。単独マージ不可 | #68 | Build clean player releases: minimal playable ZIP and one-file offline HTML |
| [#68](https://github.com/ryoita027-glitch/gray-crown/pull/68) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #67 | Critical visual recovery: restore 4 battle heroes, smooth party motion, authored NPC/house sprites |
| [#67](https://github.com/ryoita027-glitch/gray-crown/pull/67) | S 積層保留 | 親#66と一体でQA。単独マージ不可 | #66 | Opening world art: distinct Ryune houses, everyday NPCs, readable roads and living capital |
| [#66](https://github.com/ryoita027-glitch/gray-crown/pull/66) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | #65 | Fix player-reported battle sprite bleed, follower zigzag and unchanged cave tactics |
| [#65](https://github.com/ryoita027-glitch/gray-crown/pull/65) | S 積層保留 | 親#64と一体でQA。単独マージ不可 | #64 | Player-first fatigue pass: quicker routine battles, no wasted recovery, less dialogue friction |
| [#64](https://github.com/ryoita027-glitch/gray-crown/pull/64) | S 積層保留 | 親#63と一体でQA。単独マージ不可 | #63 | Player-first RPG combat: earned Guard counter and concise choice-aware story |
| [#63](https://github.com/ryoita027-glitch/gray-crown/pull/63) | S 積層保留 | 親#62と一体でQA。単独マージ不可 | #62 | Opening pacing: scouting with payoff, telegraphed first battles and quick discoveries |
| [#62](https://github.com/ryoita027-glitch/gray-crown/pull/62) | S 積層保留 | 親#61と一体でQA。単独マージ不可 | #61 | Deepen Gray Crown opening: orphanage medicine, road relief cart and forgotten soldiers |
| [#61](https://github.com/ryoita027-glitch/gray-crown/pull/61) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | #60 | Integration acceptance gate for three-route Gray Crown chain (CI blocked) |
| [#60](https://github.com/ryoita027-glitch/gray-crown/pull/60) | S 積層保留 | 親#59と一体でQA。単独マージ不可 | #59 | Playable Kingdom & Empire checkpoints, accurate enemy intents and 3-route epilogue previews |
| [#59](https://github.com/ryoita027-glitch/gray-crown/pull/59) | S 積層保留 | 親#58と一体でQA。単独マージ不可 | #58 | Make Ash Crown companion schism playable with solo/duo combat and checkpoint |
| [#58](https://github.com/ryoita027-glitch/gray-crown/pull/58) | S 積層保留 | 親#57と一体でQA。単独マージ不可 | #57 | Six route-dependent companion aftermath scenes before ending skeletons |
| [#57](https://github.com/ryoita027-glitch/gray-crown/pull/57) | S 積層保留 | 親#56と一体でQA。単独マージ不可 | #56 | Three distinct companion story decisions across Kingdom, Empire and Ash Crown |
| [#56](https://github.com/ryoita027-glitch/gray-crown/pull/56) | S 積層保留 | 親#55と一体でQA。単独マージ不可 | #55 | Gray Crown three-route design: conscious Ash Crown commitment |
| [#55](https://github.com/ryoita027-glitch/gray-crown/pull/55) | S 積層保留 | 親#54と一体でQA。単独マージ不可 | #54 | Prototype three endings: explicit moral kills and Ash Crown empty throne |
| [#54](https://github.com/ryoita027-glitch/gray-crown/pull/54) | S 積層保留 | 親#53と一体でQA。単独マージ不可 | #53 | Serad downstream choice payoff and combat combo integrity |
| [#53](https://github.com/ryoita027-glitch/gray-crown/pull/53) | S 積層保留 | 親#52と一体でQA。単独マージ不可 | #52 | Persist meaningful Serad grave choices and improve boss tactical hints |
| [#52](https://github.com/ryoita027-glitch/gray-crown/pull/52) | S 積層保留 | 親#51と一体でQA。単独マージ不可 | #51 | Serad optional choice, encounter-local party synergy and tactical feedback |
| [#51](https://github.com/ryoita027-glitch/gray-crown/pull/51) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #49 | Character combat feedback — four-hero acting and responsive SFX |
| [#50](https://github.com/ryoita027-glitch/gray-crown/pull/50) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #48 | Phase 9 — Four-hero Pixel Acting, exploration rewards, tactical targets, UI/audio polish (Draft) |
| [#49](https://github.com/ryoita027-glitch/gray-crown/pull/49) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #48 | Commercial pass v1 — four heroes, exploration guidance, UI/audio and targetable tactical combat (Draft) |
| [#48](https://github.com/ryoita027-glitch/gray-crown/pull/48) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #45 | Phase 8 — Ash Road → Serad first arc pixel quality + story/battle E2E (Draft) |
| [#47](https://github.com/ryoita027-glitch/gray-crown/pull/47) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #44 | Phase 7 — repair CI test order, add runner-free full QA gates and block release until evidence |
| [#45](https://github.com/ryoita027-glitch/gray-crown/pull/45) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #43 | Phase 7 — Aldina capital first arc (Draft; local-first quality gates, formal adoption pending) |
| [#44](https://github.com/ryoita027-glitch/gray-crown/pull/44) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #43 | Phase 6 — commercial quality audit, Story 00–19 roadmap and debt priorities (documentation only) |
| [#43](https://github.com/ryoita027-glitch/gray-crown/pull/43) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #41 | Phase 5 — integrated Ryune → road → old fort → gray-horned beast acceptance (Draft, CI blocked) |
| [#42](https://github.com/ryoita027-glitch/gray-crown/pull/42) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #40 | Phase 4 — Road, old fort, first boss combat/audio polish (acceptance pending) |
| [#41](https://github.com/ryoita027-glitch/gray-crown/pull/41) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #39 | Phase 3 — Ryune Pixel Acting, NPC identity and real appointment Portrait A/B |
| [#40](https://github.com/ryoita027-glitch/gray-crown/pull/40) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #38 | Ryune commercial art direction v2 — differentiated facades and four lived-in interiors |
| [#39](https://github.com/ryoita027-glitch/gray-crown/pull/39) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #36 | Phase 1 — adopt Pixel-native development baseline, reconcile #37/#38, align Source of Truth and CI |
| [#38](https://github.com/ryoita027-glitch/gray-crown/pull/38) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | #36 | Ryune Village Environment v1 — pixel-native outdoor and four interiors |
| [#37](https://github.com/ryoita027-glitch/gray-crown/pull/37) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | #36 | Phase 0 residual acceptance — main v23 save, real defeat, 2-cell trail, mobile and battle readability |
| [#36](https://github.com/ryoita027-glitch/gray-crown/pull/36) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #35 | Acceptance gate for PR #35 — real Chromium scenes, save/Continue, S1 trail fix |
| [#35](https://github.com/ryoita027-glitch/gray-crown/pull/35) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | #32 | Integrate commercial polish #33 + presentation #34; repair v3/v7 CI and resolve rendering conflicts |
| [#34](https://github.com/ryoita027-glitch/gray-crown/pull/34) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #32 | Commercial presentation pass v1 — world/UI integration |
| [#33](https://github.com/ryoita027-glitch/gray-crown/pull/33) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | #32 | Commercial polish v1 — exploration UI, NPC fidelity, world texture, battle hero parity |
| [#32](https://github.com/ryoita027-glitch/gray-crown/pull/32) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #31 | Four protagonist appeal runtime v2 — Medium44 + non-overlap party trail |
| [#31](https://github.com/ryoita027-glitch/gray-crown/pull/31) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #30 | Four protagonist appeal upgrade — Sophie v3 + Margaret v7 |
| [#30](https://github.com/ryoita027-glitch/gray-crown/pull/30) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #29 | Clean runtime sprite integration — no cutout/halo artifacts |
| [#29](https://github.com/ryoita027-glitch/gray-crown/pull/29) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #23 | Margaret v4 runtime integration + v5 face readability gate |
| [#28](https://github.com/ryoita027-glitch/gray-crown/pull/28) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Add active PR inventory audit |
| [#26](https://github.com/ryoita027-glitch/gray-crown/pull/26) | Z バックログ | main直下。プレイヤー価値・重複・QA未確認 | main | Add main v23 baseline CI |
| [#25](https://github.com/ryoita027-glitch/gray-crown/pull/25) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | main | Sync visual asset manifest with hygiene state |
| [#24](https://github.com/ryoita027-glitch/gray-crown/pull/24) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #22 | Prepare Karen Triton environment prototype v1 |
| [#23](https://github.com/ryoita027-glitch/gray-crown/pull/23) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #22 | Sophie STEADY HANDS character validation |
| [#22](https://github.com/ryoita027-glitch/gray-crown/pull/22) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #21 | Repair Karen Triton visual differentiation gate |
| [#21](https://github.com/ryoita027-glitch/gray-crown/pull/21) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #20 | Pixel Character Standard v1 — provisional |
| [#20](https://github.com/ryoita027-glitch/gray-crown/pull/20) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #18 | Triton second-character pixel validation |
| [#18](https://github.com/ryoita027-glitch/gray-crown/pull/18) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #17 | Validate Karen Chibi world scale — select 44px Medium prototype |
| [#17](https://github.com/ryoita027-glitch/gray-crown/pull/17) | H 美術保留 | ユーザー承認・実ゲーム画面QA前に採用しない | #6 | Integrate Karen Chibi Direction v1 into Pixel Acting prototype |
| [#6](https://github.com/ryoita027-glitch/gray-crown/pull/6) | B 原本祖先 | HEADが#98の祖先であると比較確認済み | main | Karen Pixel Acting technical prototype base — DO NOT MERGE YET |

## 仕分け件数

- A 統合本命: 1件
- B 凍結原本: 1件
- B 原本祖先: 13件
- C QA補助: 1件
- C 検証候補: 11件
- D 判定資料: 3件
- E 比較競合: 6件
- F 関連競合: 9件
- H 美術保留: 115件
- S 積層保留: 168件
- X 不採用: 18件
- Z バックログ: 26件

**これは統合・実プレイの成功報告ではない。** 本体main、固定PR #98、ユーザー承認済み画像の変更・有料CIの起動は行っていない。

---

## 一次選別の実行結果（2026-11-06 追記）

**スナップショットの372件のうち、19件を閉鎖しました。GitHub再検索でopen PRは353件と確認。**

- **明確なART NO-GO／不合格美術試作18件をclose**：#121, #126, #127, #128, #129, #141, #144, #156, #158, #169, #173, #178, #181, #187, #198, #206, #209, #236。いずれもPRはclosed・not merged、履歴とブランチは保持する。
- **競合する再帰修正 #349 をclose**：#362も同じcapitalRecruitReturnGuidance()の自己再帰を修正する。#362を今後のQA候補とし、#349は重複案のため閉鎖。#362も実プレイ確認・本体採用未了。#349に理由をコメント済み。
- **#398 / #396 / #391 に具体的なQA差分レビューコメントを追加**：行商人の位置と#380との競合、道標の#384との競合、QAテストのnpm非存在時の全件skipリスク。これらはclosedにせず、実行証拠待ちで保留。
- mainや#98のソース、正式アセット、Save v23を変更していない。**ゲーム本体の改善やPR #106の受入PASSを意味しない。**
- 残り353件は順次個別の差分・実ゲーム・依存関係を検証し、不合格の根拠がないものを機械的にcloseしない。GitHub側の同時並行タスクが新規PRを作ると件数が再増加し得るため、今後は各作業がこの一覧を必ず参照する。
