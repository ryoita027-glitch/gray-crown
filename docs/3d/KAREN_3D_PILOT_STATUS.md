# Gray Crown — 3D移行 Phase 0 / Karen pilot (2026-10-19)

## 正式採用判定

**NOT ACCEPTED / TECHNICAL PILOT ONLY.**

このファイルは3D移行検証のトレーサビリティ資料であり、カレンの3Dモデルの商用品質を承認するものではない。従来の2Dアセットは変更・削除しない。既存のPRを統合しない。セーブ形式、ストーリー、バトル、プレイヤー操作に変更しない。

## 固定した基準

- 本番 `main` HEAD: `d689aabb5146c9f45466a4f74f397e664c08fb4f` (v23)
- 最新の別個の未統合候補: Draft PR #98 HEAD `075f9cb7dc0321361ad1a8674adbc0938ce3ed8c`
- この検証ブランチは **mainの固定SHAを起点** とする。PR #98のコードやアートを本番へ入れたことを意味しない。
- PR #98上の `assets/characters/karen/karen_idle.png`, `karen_walk.png` を読み取り専用の比較参照として点検した。対応する実素材はそのPR内に存在する。
- mainの `assets/hero_party_walk.png` は ACTIVE RUNTIME / PROVISIONAL DESIGN。これだけを最終的なデザイン原案と誤認しない。
- 優先する固定資料: `docs/characters/CHARACTER_VISUAL_IDENTITY.md`, `docs/characters/KAREN_COSTUME_DESIGN_v1.md`, `docs/visual/SOURCE_OF_TRUTH_STATUS.md`。

## カレン既存デザインの拘束条件

23歳、165cm、自然な赤褐色～明るい赤の髪、日焼けした健康的な肌、卵型の顔、丸く表情の出る目、アーチ眉、低い位置で髪の**一部だけ**をまとめて残りを下ろす。生成りの作業着、くすんだ赤の短い上衣、実用的なパンツと革靴、左利き・右腰に剣を携行。採用デザインは **Karen B / VILLAGE RUNNER**。特別な宝石、王国の未決定紋章、正規武器デザインを追加しない。

## 生成したローカル試作成果物と確認範囲

ソース: `tools/3d/create_karen_prototype.py`、検査: `tools/3d/check_karen_glb.py`、Blender取り込み・編集基盤: `tools/3d/make_blender_editable.py`、WebGL2閲覧器: `tools/3d/karen_viewer.html` と `js/render/karen_3d_webgl.js`。

- ローカル試作 `karen_stage_a_blockout.glb`: **80個の別メッシュ／約6,652頂点／12,984三角形／156,000 bytes**。
- Python trimeshによるGLB再読込で必要な顔・左右眼球・鼻・髪束・服・右腰装備を検出。
- Node.jsでWebGLビューアーのGLBパーサが80個のノードを読み取ることを確認。
- **Blender本体はこの実行環境に未導入**。変形・保存・GLB再出力の実動作は未確認。
- **ブラウザ実画面は未確認**。試行したChromiumがローカルHTML/HTTPを管理者制限で拒否したため、フレームレート、見た目、実ゲームとの融合を合格として報告しない。
- 試作モデルは単純化したメッシュによるブロックアウトであり、造形の商用品質、デザイン同一性、表情の自然さ、スキニング、顔のシームレスな編集を実証していない。
- `iris_unapproved`、`right_hip_scabbard_placeholder` 等は**未承認のプレースホルダー**。正式な瞳色／武器形状を確定しない。

## 技術的な境界

`karen_3d_webgl.js` は **限定的なGLBパーサ + WebGL2技術検証ツール**。POSITION/COLOR_0と三角形、単純なnode translationに限定する。一般のglTFアニメーション・skin・morph target・シェーダー・マテリアルをサポートしたものと扱わない。将来のゲーム正式描画器は、ローカル同梱可能な保守されるglTFローダー（例: Three.js GLTFLoader）の機能・オフライン起動・バンドル管理を評価して決める。

## 各工程のゲート

1. Phase 0: 固定SHA・素材・現行描画・CIを監査。**調査実施**。現行CIは未成功。
2. Phase 1 technical: 真の3D GLBメッシュと生成パイプライン。**ローカル技術検査のみ合格**。Blender .blend保存と表情・共有リグ・アニメーションは未検証。
3. Phase 1 art: 既存ドットと斜め/側面/後面を含む原案同一性、自然な顔と髪、衣装品質。**未合格**。
4. Phase 2 integration: 実ゲーム内で2Dと3Dを同条件AB比較、戦闘、イベント、save/load、PC60fps/スマホ30fpsを実測。**未着手／未合格**。
5. Phase 3以降: 他主人公3人、NPC、マップ、戦闘、正式アセット配布。**未着手**。

### 具体的な次手順

- Blender 4.xで生成GLBを読み込み、編集用.blendを保存。各顔パーツ・衣装パーツ・親子関係と表情の編集性を実測する。
- カレン正面/斜め/横/後ろを固定ライト・カメラで撮り、比較用既存スプライトと並べて不合格点を改修する。
- 村の通常プレイ画面へ専用切替アダプタを**テストブランチ上で**実装する。既存描画が常に復帰可能であること。
- 同一HEADでNode + Chromium試験、イベント、保存、負荷、実画面スクリーンショットを揃えるまで販売品質と呼ばない。
