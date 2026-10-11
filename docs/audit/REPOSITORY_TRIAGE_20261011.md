# Gray Crown — GitHub棚卸し・取捨選択 2026-10-11

**作業状態:** GitHub上の整理専用ブランチ。ゲームのランタイムソース／画像／テスト／CI／パッケージは**一切変更しない**。 `main` は未変更。

## 1. 実測（棚卸し時点）

| 項目 | 実測結果 |
| --- | ---: |
| GitHubブランチ | 81 |
| Open PR | 51 |
| Actions実行履歴 | 1,390（全期間・取得時の表示値） |
| 開発候補ブランチの追跡ファイル | 378 |
| `main` 追跡ファイル | 115 |
| 開発候補のWorkflows | 18 |
| 開発候補ルート直下の .txt | 51（`README.txt`、`requirements-ci.txt`を含む） |
| 同一Blob SHAのレポートの重複対 | 5組 |
| 別途配布済みユーザー確認用v5 ZIP | 449ファイル、うちNPC PNG 71（GitHub統合未確認） |

**参照固定:** `main` = `d689aabb5146c9f45466a4f74f397e664c08fb4f`; GitHub開発候補 = `chore/clean-player-distribution-20261011` @ `c337fc6319b263acb85462717a8507473ec83ff4`. GitHub上の復旧候補 `recovery/latest-improvements-20261011` @ `d87de1a8b829b98a1449c9a33d2c3e445774e101` はテスト断言不可。

## 2. 今回のファイル判定（実行済み）

| 判定 | 対象 | 実施内容・理由 |
| --- | --- | --- |
| **保持** | `index.html`, `js/`, `css/`, `assets/` | ゲーム起動と修正成果。現時点で無害と断言できないため削除しない |
| **保持** | `tests/`, `tools/`, `.github/workflows/`, `requirements-ci.txt` | 回帰防止・開発/ビルドで必要。CI実行負担は別途評価 |
| **保持** | `docs/characters/`, `docs/visual/`, `docs/pixel/` | キャラクターの採用根拠、画風と設計の参照元 |
| **移動（内容は不変）** | 古いルート文書45点（旧`README.txt`含む） | `docs/history/` へGit Blob SHAを保持して移動。古い履歴の閲覧は可能 |
| **重複整理（Git履歴とv23側で復元可能）** | `BUG_REPORT.txt`, `CHANGELOG.txt`, `KNOWN_ISSUES.txt`, `NEXT_TASKS.txt`, `TEST_REPORT.txt` | 各`_v23.txt`と**Blob SHAが完全一致**。別名コピーのみ削除し、`docs/history/*_v23.txt` を保持 |
| **歴史資料として保持** | `assets/hero_party_walk_v23_original.png`, `assets/hero_party_walk_replacement.png`, 旧デザイン候補 | 現在の参照状態とロールバック利用を未確定。今削除すると履歴喪失リスク |
| **削除保留** | ソフィ/マーガレットの方向候補と`docs/pixel/reference/`の同一PNGなど | 同一バイトだが**設計原本のパスを外部検証ツールが参照**する場合がある |
| **整理保留** | 旧ブランチ・Open PR・CI Workflow | 依存関係・固有コミット・必要なテストを確認してから別PRで処理 |

### バイナリで判明した重複（今回は消さない）

- `assets/characters/margaret/margaret_direction_candidate_v1.png` と `docs/pixel/reference/margaret_chibi_direction_lock_v5_48.png`
- `assets/characters/sophie/sophie_direction_candidate_v1.png` と `docs/pixel/reference/sophie_chibi_direction_lock_v2_48.png`
- `docs/pixel/reference/triton_chibi_direction_lock_v1.png` と `docs/pixel/reference/triton_idle_4dir_v1.png`

重複しても**パスが意味を持つ参照ファイル**の可能性があるため勝手に削除しない。

## 3. ブランチとPRの区分

| 区分 | 代表例 | 推奨扱い |
| --- | --- | --- |
| 正式旧基準 | `main` | v23正式ベースとして保全。最新プレイ版と誤認しない |
| GitHub上の最後の縦積み | PR #66 → #67 → #68 → #69 | 修正した歩行・戦闘・建物・配布処理の参照元として保持。次の統合作業のベース候補 |
| 内容追加の長い連鎖 | PR #51〜#65 | 直後のPRに継承される依存スタック。差分確認までは閉じない |
| Pixel品質/美術の旧連鎖 | PR #6, #17〜#50 | 採用済み資産・方向ロック・試作証跡を保持、PRの状態だけは別途整理 |
| サイド枝の重複候補 | PR #33/#34→#35、PR #37/#38→#39、PR #49/#50 | 後続統合コミットに内容が残るか、差分検査してから閉鎖を判断 |
| GitHub未保存の最新試験版 | `Gray_Crown_NPC_Hero_Recovery_v5.zip` | 71人の専用PNGと動作、主人公／戦闘復旧がある。GitHubに**別途正規取り込み必須** |

Open PR 51件を今回勝手に閉じたり、基点のブランチを削除したりしない。誤った依存の消失を防ぐため。

## 4. 最優先リスク

1. **v5がGitHubにない。** ZIPにある71人のPNG・アニメ処理・マーガレット足元補正がGitHub現在の378ファイル版とは別である。v5のファイル全体を実装・テストしてから、開発候補との三者差分（`main` / GitHub候補 / v5）を統合する。
2. **基準が複数ある。** PR #69→#68は最新のGitHub開発成果だが、`main`に反映されていない。旧`README.txt`がv23だけを紹介しているのは誤誘導。
3. **巨大CI履歴と18ワークフロー。** 旧実験の自動実行・書き込み権限・失敗履歴を棚卸し。削除より先に起動条件を絞り、必須回帰テストは残す。
4. **安全な統合ゲートがない。** v5のNPC71枚を保全したうえで戦闘4人表示、歩行コーナー、マーガレット足元、人物会話、save/load、Chrome実画面を同一コミットで検証する。

## 5. 次の実行順（未実施）

1. v5 ZIPから変更ファイル一覧とSHA/PNG寸法・NPC台帳を確定し、GitHub専用統合ブランチへ取り込む。
2. 旧GitHub開発候補とv5を比較して、**v5に欠けたGitHubの修正は戻し、v5にしかないNPCや改良は保持**する。
3. 統合コミットのNode/ブラウザ/セーブ検証を行い、プレイ用ZIPをCIにより作る。
4. PR依存スタックを段階的に整理。統合済みPRのみ整理・枝をアーカイブし、CI条件を最小化。
5. プレイ品質の受入後に初めて`main`昇格を検討する。

**このブランチだけをプレイ用の最新と呼ばないこと。ドキュメント整理用であり、v5統合完了でもゲーム品質保証でもない。**
