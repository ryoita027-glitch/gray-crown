# Gray Crown — 開発リポジトリ入口

> **注意（2026-10-11監査）:** GitHub `main` は v23 の旧基準です。**ここにある開発ブランチも、直近のNPC71人・戦闘／歩行復旧版 v5 と同一ではありません。** v5 は別途配布されたZIPで、GitHubへ統合されたという証拠はありません。古い `main` を配布・次期開発の正本として使わないでください。

## 何を開くべきか

- **GitHub上で最後まで継承された開発候補:** [chore/clean-player-distribution-20261011](../../tree/chore/clean-player-distribution-20261011)（PR #69、PR #68以前の改善を含む。未承認・未統合）
- **整理専用ブランチ:** `maintenance/repository-triage-20261011`（ゲーム本体はGitHubの上記候補から変更なし）
- **最新ユーザーテスト版 v5:** `Gray_Crown_NPC_Hero_Recovery_v5.zip`。現時点でGitHubに未保存。*内容を検証してから統合する*。
- **監査詳細:** [docs/audit/REPOSITORY_TRIAGE_20261011.md](docs/audit/REPOSITORY_TRIAGE_20261011.md)
- **過去レポート:** [docs/history/README.md](docs/history/README.md)

## プレイヤー向けZIP（GitHub開発候補から生成する場合）

```sh
npm run build:play
```

生成器 `tools/build_player_release.py` は `index.html` が参照するJS/CSSと `assets/` を抽出し、`docs/`・`tests/`・`tools/`・履歴を含めません。ただし**このブランチはv5ではない**ため、生成物がユーザーテスト中の最新ゲームと一致するとは限りません。

## 運用ルール

1. 作業開始前に **ベースコミット SHA とZIP版のファイル差分**を固定する。
2. 主人公の移動・戦闘表示・NPC素材・セーブをセットで回帰検証する。
3. アセットの参照元を確認せず削除しない。旧ドット画像もフォールバックか試作根拠なら残す。
4. 古いPRは積み上げ依存を確認してから閉じる。ブランチを一括削除しない。
5. `main` 更新はゲーム全体の受入テストと明示的な正式採用の後だけ。
