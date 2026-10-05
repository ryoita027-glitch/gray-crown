# NEXT_WORK_ORDER.md

## Gray Crown v23 — Visual Foundation Audit後の作業順

**Current verdict:** READY WITH FIXES  
**Repository:** ryoita027-glitch/gray-crown  
**Current integration branch:** visual-foundation-sync  
**GitHub policy:** 作業開始時にGitHubの最新branch / commit / diffを確認し、古いZIPよりGitHubを優先する。  
**Primary goal:** 現在までのVisual Foundation同期を維持し、未回収authoritative文書を推測で補完せず次工程へ進む。  
**Do not start v24. Do not generate images yet.**

---

# POST-AUDIT UPDATE — 2026-10-05

以下は **COMPLETED**:

- Karen Visual Identity: **B — VILLAGE RUNNER / LOCKED**
- Karen Costume Design: B方向で同期済み
- Margaret runtime hair: **white / silver-white** にportrait / fallbackまで同期
- hero_party_walk.png: **ACTIVE runtime / PROVISIONAL design**
- tests/visual_identity.test.js: Margaret hair regression追加
- Validation: JavaScript syntax PASS / Node **43/43 PASS** / Browser v21 Gate PASS / Serad Section 1 PASS / Section 2 PASS
- Visual audit / status / handoff資料をGitHub管理へ移行

残るSource-of-Truth gapは、Canon / Character Bible / Culture / Shape Language / Costume Rules / Art Bible原本の回収。見つからないものを記憶から再作成しない。

---

# NOW

## 1. Visual Source of Truthをプロジェクト内部へ戻す

最優先。

今回のZIPには以下が存在しない。

- `GRAY_CROWN_CANON_v1.md`
- `CHARACTER_BIBLE_v1.md`
- `KINGDOM_CULTURE_v1.md`
- `EMPIRE_CULTURE_v1.md`
- `GRAY_CROWN_CULTURE_LOCK_v1.md`
- `CHARACTER_SHAPE_LANGUAGE.md`
- `COSTUME_RULES.md`
- `CHARACTER_VISUAL_IDENTITY.md`
- Art Bible系

**既存のauthoritative fileがあるなら回収する。記憶から再作成しない。**

回収先の推奨:

```text
docs/canon/
docs/characters/
docs/culture/
docs/art/
```

または単一`docs/visual/`でもよいが、ファイルがZIPに実在することが最重要。

### 完了条件

- ZIP/Repositoryを開くだけで、Visual Canonの現行資料が特定できる。
- 各資料にStatus (LOCKED / PROVISIONAL / DRAFT) がある。
- 次AIがチャット履歴なしで読める。

---

## 2. Karen Visual IdentityのStatus矛盾を解消する

監査時:

- external `CHARACTER_VISUAL_IDENTITY.md`: `PROPOSAL ONLY — 方向性未選択`
- external `KAREN_COSTUME_DESIGN_v1.md`: `DESIGN LOCK`, `B — VILLAGE RUNNER`

会話履歴上Bが選択済みなら、その**既存決定を文書へ同期**する。選択が撤回されているならUNRESOLVEDへ戻す。

新しい3案を勝手に作り直さない。

### 完了条件

- Karen Visual Identity file自体が採用方向を正しく示す。
- Costume DesignとStatusが一致する。
- その2ファイルがproject内に含まれる。

---

## 3. Margaret runtime visual mismatchを修正する

監査後に実施するコード修正対象。

現在:

- `hero_party_walk.png`: white hair
- `PARTY_STYLE.margaret`: purple/dark hair
- `PORTRAITS['マーガレット']`: purple/dark hair
- `heroPortraitMarkup('マーガレット')`: purple hair SVG

これをauthoritativeな**white / silver-white**判断に合わせる。

### 注意

- 正式髪型までは決めない。
- 白髪という既存決定だけをruntime across sprite / portrait / fallbackで統一する。
- その際、Dialogue portrait testを追加する。

---

## 4. Current SpriteをPROVISIONALと明文化する

`CHARACTER_VISUAL_PATCH_v23_1.txt` または新しいVisual manifestへ:

- 規格はKEEP
- designは暫定
- Character Design → Reference → Pixel Sprite順
- current spriteから顔・体格・衣装をCanon化しない

を明記する。

---

## 5. File hygieneを整理する（削除はユーザー承認後）

候補:

- unversioned v23 report duplicates
- `hero_party_walk_whitehair.png` exact duplicate
- `tests/__pycache__`

Rollback資産:

- `hero_party_walk_v23_original.png`
- `hero_party_walk_replacement.png`

は削除せずARCHIVEへ移す案が安全。

---

## 6. Version表記を整理する

現在:

- Game: v23 / package 23.0.0
- Character patch note: v23.1

推奨表現:

> **Game Baseline v23 / Character Visual Patch rev 23.1**

または実際にrelease versionを23.1へ上げるかはユーザー判断。

今の監査では変更しない。

---

# AFTER KAREN LOCK

※ Karen Bがすでにauthoritative lockであることがproject資料で確認できたら、この段階へ進む。

## 1. Triton Visual Identity Phase 1

- 画像生成なし
- 本当に異なる3方向
- 比較評価
- ユーザー選択で停止

## 2. Sophie Visual Identity

Triton lock後に同じ工程。

## 3. Margaret Visual Identity

Sophie lock後に同じ工程。

**白髪という既存decisionを変更しない。**

## 4. 4人相互チェック

- 顔型が被っていないか
- 身長/体格/重心が同じに寄っていないか
- 髪を隠して識別できるか
- 同じ作品の人物に見えるか

この段階でも正式画像を量産しない。

---

# AFTER FOUR HEROES LOCK

## 1. `GRAY_CROWN_ART_BIBLE_v2.md` をPROVISIONALで作成

「禁止一覧」中心ではなく、Gray Crownの絵師がどう描くかを定義する。

対象:

- 線質
- セル塗り
- 影
- 目
- 髪
- 肌
- 布
- 革
- 金属
- 光
- 背景密度
- JRPGとしての華やかさと生活感の両立

## 2. Karen Stage A 1枚だけArt Test

評価順:

1. 魅力的か
2. Karen固有か
3. Gray Crownらしいか
4. AI的な不自然さがないか

## 3. Karen reproduction test

- 通常立ち
- 会話
- 歩行
- 座る
- 笑顔
- 真剣
- 戦闘準備

同一人物として安定するか確認。

## 4. Provisional Style Anchor

Karenだけでは正式Anchorにしない。

## 5. 2人目テスト

TritonまたはSophie。

- 明確に別人
- 同じゲーム・同じ絵師

両方成立後に正式Style Anchor。

## 6. Character Reference作成

Referenceが確定した後、初めてruntime spriteとの差分を取る。

---

# NOT YET

- v24
- 北の旧関所
- 新マップ
- 新ボス
- 四将の正式Character Design
- シオン正式デザイン
- 最終勇者装束
- 正式武器
- 王国/帝国紋章
- 勇者認定標章
- 宗教紋章
- 軍階級章
- Art大量生成
- Event CG
- 背景大量制作
- 正式Pixel Sprite再制作
- current spriteを基準にしたCharacter Design
- future skeleton内容のCanon化

---

# Regression rule

Visual関連のruntime fixを行った場合も、最低限:

- syntax
- `npm test` 41/41以上
- Browser v21 Gate
- Frontier Section 1
- Frontier Section 2

を維持する。

Visualだけの変更だからStory test不要、とは扱わない。