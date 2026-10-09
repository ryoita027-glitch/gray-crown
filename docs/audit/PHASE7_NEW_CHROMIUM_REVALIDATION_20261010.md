# Gray Crown Phase7 — 2026-10-10 Chromium 再実行・S0/S1判定

## 基準と改変禁止

- リポジトリ: `ryoita027-glitch/gray-crown`
- 監査対象: `pixel-vslice-phase7-ci-recovery-v1`、本検証開始時のHEAD `d48d7a05c2376c689ab116e931745f3562b4eed8`
- 実ゲーム実行ファイル: 以前検証した同ブランチ `9cce335692ce3bb742358c75856baf71bebd91e8` 以降、**ゲームのHTML/CSS/JS/人物PNGには変更がない**ことをGitHubのcommit差分から確認。実行するHTML、CSS、JavaScript 30ファイル、主人公32枚のPNG、計**64ファイル**をGit blob SHA1と照合し、**64/64一致**。さらに現在のGitHub上の主要ソース5件（index、CSS、battle.js、world.js、events.js）のblob SHAとも照合した。
- `main`, Story00–19, Save schema 23, Canon, approved sprite assets: 変更なし。

## このターンで新規に実行したPlaywright

**事前成果を単に再報告したものではない。** 現在のローカル環境にあるGit blob一致済みの実ゲームファイルから、独立した新規のChromiumセッションを起動し、カスタム通常操作プレイテストを再実行。実際の`page.keyboard.press`、表示されたボタンへのクリック、ゲーム本体の`GC.Save.save(true)`と別ページの`Continue`を使用。Dev Modeの瞬間移動、敵HP変更、イベント完了フラグの捏造は行っていない。

**結果：PASS 31 / 31チェック。FAILチェック0。** 終了コード0、実際の6枚のゲームスクリーンショット、ログと結果JSONを出力。

**正常な進行経路：**

```text
New Game → Ryune village → messenger appointment → north village gate
→ road → gray wolf battle/defeat → cave entry → chest1
→ bats battle → leverWest → crawler battle → leverEast
→ existing caveRest → boss approach → gray-horned beast (14 commands)
→ actual Save after victory → fresh page Continue (boss flag persisted)
→ cave northern exit → northroad → capital / Stage05
```

**実際の戦闘記録**（これはテスト自動操作速度であり、人間プレイ時間ではない）：灰牙狼5コマンド、通常洞窟戦を含めて計8戦、灰角獣14コマンドで勝利。勝利後に`isDefeated('boss')`が真であり、Continue後も保持。NPC会話・レバー/地形・戦闘の正常操作ができたことを確認した。

**証拠ZIP**（この会話でのファイル提供用。GitHub上でArtifactsとして成功したという意味ではない）：
`gray-crown-phase7-new-chromium-full-journey-20261010.zip`
SHA256: `c3f7a2f1810ebd15a85b17ee5a824d89197c288dcab0afd6a85f0b32f2fbd359`

ZIP収録: 新規プレイテストのソース`chromium_driver_source.py`、実行ログ、31チェックのJSON、64ファイルのGit blobリスト、撮影画面6点、SHA256を含む再検証README。スクショ6点は、街道、古砦入口、両レバー、ボス戦、撃破後、王都。

## S0/S1の検出と修正の状態

| 対象 | 今回確認した実際の状態 | 判定 |
|---|---|---|
| 起動・リュネ使者イベント・村出口 | 正常進行 | **検証範囲ではS0/S1再現なし** |
| 灰牙狼・コウモリ・ムカデ・ランダム戦・灰角獣 | 既存RPGコマンドで全戦闘解決 | **今回の経路ではS1再現なし** |
| 宝箱・左右レバー・ボス接近 | 通行・作動・ボス開始が成立 | **今回の経路では進行不能なし** |
| ボス撃破後の保存・Continue | 新規ページでboss撃破状態保持 | **今回の保存条件では破損なし** |
| 洞窟北口・北街道・王都Stage05 | 正常到達 | **今回の経路では進行不能なし** |
| 旧公式E2Eの非表示「戦う」ボタン誤クリック | PR #47のテストコードですでに修正 | **修正済、公式CIでの再実行未完了** |
| 旧公式E2Eの王都北境界座標誤り | PR #47のテストコードですでに修正 | **修正済、公式CIでの再実行未完了** |
| GitHub Actions起動前停止（Issue #46） | **未解決**。新たなゲーム本体コード修正だけでは直らない | **S1相当の受入運用ブロッカー** |

**重要**：この単一プレイテストで発見されたゲーム本体のS0/S1が0という事実は、プロジェクト全体のS0/S1が0という証明ではない。そのため、未確認の主要区間、敗北・Save破損時、旧main v23保存の読み込みやブラウザ全種類への出荷GOは認めない。

## 実行環境の厳密な制約

この管理環境はPlaywrightの通常HTTP/HTTPSの`page.goto`を`ERR_BLOCKED_BY_ADMINISTRATOR`で阻止する。そのため今回は**`page.set_content`とPlaywrightによるアセットのリクエスト配送**を使用した。表示されたのは元のHTML/JS/CSS/PNGをChromiumのCanvas/DOMで描画した実画面だが、通常の同一オリジン配信ではない。

結果には**10件の `CanvasRenderingContext2D.getImageData` CORS taint例外**を記録。この例外はテスト配送上のクロスオリジン制限に由来する可能性が高いが、**本番で必ず解消するとは未検証**。このセッションを「JS例外0」「通常Web配信受入PASS」とは扱わない。

また、**公式GitHub Actions統合受入は依然failureでjob steps 0**。失敗チェックにannotationsが2件あるが本文を接続から閲覧できず、ランナー利用枠/課金/権限/環境のどれが原因か特定不能。GitHub Settings/Actions画面にアクセスできる管理者による注記・Usage/Policies確認が必要。Issue #46を閉じない。

## 次の停止条件

1. **Issue #46**の実際の失敗注記2件を確認してActionsのRunnerを復旧する。
2. PR #47の最新SHAで`npm run check`・既存全ブラウザE2E・main v23の本物のSave互換を同じジョブで再実行し全緑にする。
3. 正常な同一オリジンWeb配信で`getImageData`例外0、戦闘・保存・王都までのE2Eが完走することを確認する。
4. 最新スクリーンショットと初見ユーザーのプレイレビューを得て、全ての確定S0/S1を修正する。

**総合判定: ローカル序盤ゲーム進行は検証成功 / 公式統合技術GO・商用GOは依然HOLD / main未マージ。**
