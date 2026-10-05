# NEXT_AI_MASTER_INSTRUCTION.md

## Gray Crown v23 — Visual Foundation / Character Identity 継続用マスター指示書

このファイルは、過去の長い会話を知らない次のAIへ渡すことを目的とする。

---

# 0. 現在地

基準Repository:

**ryoita027-glitch/gray-crown**

GitHub運用:
- main: ユーザーがimportしたv23基準
- visual-foundation-sync: Visual Foundation最新同期ブランチ
- 作業開始時に最新branch / commit / diffを確認する
- 古いZIPでGitHubを上書きしない

現在の正式本編完成範囲:

`00_village` → `19_frontier_second_complete`

ゲーム技術基盤は安定している。監査時:

- JavaScript Syntax: PASS
- Node Regression: **43/43 PASS**
- Browser v21 Gate: PASS
- Serad Frontier Section 1 E2E: PASS
- Serad Frontier Section 2 E2E: PASS出力を確認（監査toolではPASS表示後のrunner teardownがtimeout。既存TEST_REPORT_v23もPASS）

**技術基盤を理由なく改修するな。v24へ進むな。**

---

# 1. 今の目的

今はStory Content制作ではない。

目的は:

> **主人公4人の正式Character Visual Foundationを、ゲーム内仮Spriteから独立して確定すること。**

順序:

**Canon → Character Bible → Culture → Culture Lock → Shape Language → Costume Rules → Character Visual Identity → Art Bible v2 provisional → Style Test → Character Reference → Pixel Sprite**

Pixel SpriteからCharacter Designを逆算してはいけない。

---

# 2. 監査で判明した重大事項

## 2-1. Visual Foundation資料がゲームZIPに入っていない

今回のZIPには以下が存在しない:

- `GRAY_CROWN_CANON_v1.md`
- `CHARACTER_BIBLE_v1.md`
- `KINGDOM_CULTURE_v1.md`
- `EMPIRE_CULTURE_v1.md`
- `GRAY_CROWN_CULTURE_LOCK_v1.md`
- `CHARACTER_SHAPE_LANGUAGE.md`
- `COSTUME_RULES.md`
- `CHARACTER_VISUAL_IDENTITY.md`
- `GRAY_CROWN_ART_BIBLE.md`
- `GRAY_CROWN_ART_BIBLE_v2.md`

したがって、**次に新設定を考える前に、既存のauthoritative filesを回収しproject内部へ同期すること。**

見つからない設定を記憶や推測で再Canon化するな。

---

# 3. 現行Spriteの扱い

Active:

`assets/hero_party_walk.png`

規格:

- 96×512
- 32×32
- 3 frames
- 4 directions
- 4 characters
- Row 0 Karen
- Row 1 Triton
- Row 2 Sophie
- Row 3 Margaret

**規格は維持してよい。デザインはPROVISIONAL。**

正式順序は:

**Character Design → Character Reference → Pixel Sprite**

Current Spriteから:

- 顔型
- 目色
- 正式髪型
- 体格
- 衣装
- 武器

を決めてはいけない。

---

# 4. Margaretについて

Visual patch recordは:

> Margaret hair = WHITE / silver-white shading

Active walking spriteも白髪。

visual-foundation-sync では PARTY_STYLE.margaret / PORTRAITS['マーガレット'] / heroPortraitMarkup('マーガレット') を **white / silver-white** へ同期済み。tests/visual_identity.test.js で回帰防止済み。

**正式髪型・目色・衣装は依然未決定。新しく発明するな。**

---

# 5. Karenについて

監査ワークスペースにはZIP外で:

`CHARACTER_VISUAL_IDENTITY.md`

があり、以下を固定条件としている:

- 23歳
- 女性
- 165cm
- 健康的な女性体型
- 丸目
- アーチ眉
- 綺麗な鼻筋
- 赤髪
- 自然な日焼け肌
- 左利き
- 背筋が伸びる
- 前向きな重心
- 明るい
- 元気
- 勇気がある
- 正義感が強い
- 向こう見ず
- 人との距離が近い
- 幼馴染4人を非常に大切にする

現在の docs/characters/CHARACTER_VISUAL_IDENTITY.md は:

**LOCKED — B VILLAGE RUNNER**

一方、ZIP外の:

`KAREN_COSTUME_DESIGN_v1.md`

は:

**DESIGN LOCK v1 / B — VILLAGE RUNNER**

となっている。

過去会話ではユーザーがBを選択しているため、その決定をauthoritative project fileへ同期するのが自然だが、**次AIは勝手に再解釈せず、現在利用可能なauthoritative source / user confirmationを優先すること。**

Bが正式確認できた場合、3案を作り直さない。Visual Identity fileのStatusをB Lockへ同期する。

---

# 6. 主人公4人 runtime codeで確実に分かるもの

`js/data/items.js`:

- `karen` = カレン / 勇者
- `triton` = トリトン / 戦士
- `sophie` = ソフィ / 僧侶
- `margaret` = マーガレット / 魔法使い

これ以上の正式Character anatomyや年齢を、runtime Spriteから推測しない。

---

# 7. DO NOT INVENT

最低限、以下を勝手に決めるな。

- 王国紋章
- 帝国紋章
- 勇者認定標章
- 宗教紋章
- 宗教正式色
- 主人公4人の具体的目色
- 主人公4人の姓
- 正式武器デザイン
- 最終勇者装束
- シオンの王冠
- 王国軍階級章
- 帝国軍階級章

また、`borderland`以降の旧Skeletonに書かれた将来設定をCanonへ昇格するな。

---

# 8. Future Skeletonの扱い

v23正式完成地点は:

**`19_frontier_second_complete`**

`borderland`、`watchfort`、`empirevillage`、`imperialcity`、`yukiroad`、`elsia`、`finalfield`等は旧全体構造Skeleton。

`systems/events.js`にクラインテッド、ユウキ、ゼスター、ゼニス、シオン関連の旧会話があっても、**Visual Canonや正式Storyの根拠に使用禁止。**

特に旧Skeleton内の姓・過去・台詞を自動採用しない。

---

# 9. 今すぐやること — NOW

次AIの最初の仕事は新しい絵を作ることではない。

1. **Visual Foundation資料をproject内部へ回収・同期する。**
2. **Karen Visual IdentityのStatus（未選択 vs B Lock）をauthoritative decisionに合わせて一本化する。**
3. **Margaretの白髪をwalking sprite / dialogue portrait / fallbackで一致させる。**
4. current spriteをPROVISIONALと明文化する。
5. duplicate docs/assetsは削除せず、archive/removal candidateとして整理する。
6. Visual runtime修正後、syntax + 41 Node tests + Browser regressionを再実行する。

ここまで終わるまで画像生成へ進むな。

---

# 10. Karen lock後

KarenのB directionがproject内で正式にLOCKされたら:

**Triton → Sophie → Margaret**

の順にVisual Identityを作る。

各人物:

- 画像生成前に文章3案
- 微差ではなく魅力の見せ方を変える
- 比較評価
- ユーザー選択
- 選択時点で停止

4人を一度に決めない。

---

# 11. 4人lock後

初めて:

`GRAY_CROWN_ART_BIBLE_v2.md`

を**PROVISIONAL**で作る。

v2の中心は:

> 「何を禁止するか」ではなく「Gray Crownの絵師ならどう描くか」

王道JRPGの華と、生活する人間の現実感を両立する。

その後、Karen Stage Aを1枚だけ生成してStyle Test。

一枚成功だけで量産しない。

---

# 12. Art Test後

Karenで:

- 通常立ち
- 会話
- 歩行
- 座る
- 笑顔
- 真剣
- 戦闘準備

を再現性テスト。

Karenだけで正式Style Anchorにしない。

2人目を描き、

- 明確に別人
- 同じゲーム・同じイラストレーター

を両立できた後に正式Style Anchorを確定する。

Style Anchorから継承するのは絵師の技法だけ。

- 線
- セル塗り
- 影
- 瞳処理
- 髪処理
- 肌
- 布
- 革
- 金属
- 光
- 背景密度

顔比率・目型・鼻・体型・髪型・ポーズなどKaren本人の造形を他キャラへコピーしない。

---

# 13. NOT YET

絶対に今やらない:

- v24
- 北の旧関所
- 新Map
- 新Boss
- 四将正式デザイン
- シオン正式デザイン
- 最終勇者装束
- 正式武器
- 紋章
- 軍階級章
- Event CG
- 背景大量制作
- Hero画像一括生成
- 正式Pixel Sprite再制作
- Architecture全面改修

---

# 14. Stop rule

Visual Foundation syncの途中で不足情報を見つけたら:

**UNRESOLVED**

と書く。

推測で埋めない。

ユーザーに確認が必要なら、何が欠けているかと影響だけを提示する。

---

# 15. 基本原則

Gray CrownのVisual開発では:

> **「そこそこ良い仮デザイン」を正式版にしない。**

目標:

- 見た瞬間に興味を持てる
- 人物を知るとさらに好きになる
- 別の場面でも同じ人物に見える
- 4人並べても全員違う
- 同じゲーム、同じ絵師に見える

そして、ゲーム側へ実装する順番は:

**Character Design → Reference → Runtime Assets**

を崩さない。