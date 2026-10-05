# VISUAL_FOUNDATION_AUDIT.md

## Gray Crown v23 — Visual Foundation 完全監査

**Audit target:** `gray-crown-frontier-v23-character-visual-patch.zip`  
**Audit date:** 2026-10-05  
**Mode:** READ-ONLY AUDIT — コード・画像・既存ファイルは変更していない  
**Final verdict:** **READY WITH FIXES**

---

# 1. 結論

現在のGray Crownは、**ゲーム基盤とv23正式範囲（Story State 00〜19）は十分に安定している**。一方、Visual Foundationには「次のCharacter Visual Identity工程へ入る前に整理すべき問題」が残っている。

最重要の監査結果は次の4点。

1. **Visual Foundationの正式資料群がZIP内部に存在しない。**  
   `GRAY_CROWN_CANON_v1.md`、`CHARACTER_BIBLE_v1.md`、`KINGDOM_CULTURE_v1.md`、`EMPIRE_CULTURE_v1.md`、`GRAY_CROWN_CULTURE_LOCK_v1.md`、`CHARACTER_SHAPE_LANGUAGE.md`、`COSTUME_RULES.md`、`CHARACTER_VISUAL_IDENTITY.md`、`GRAY_CROWN_ART_BIBLE.md`、`GRAY_CROWN_ART_BIBLE_v2.md` は、今回のZIPには一つも含まれていない。したがって、**会話上で決めたVisual Canonが配布物・ゲーム本体と一体化していない。**

2. **現行 `hero_party_walk.png` は正常にゲームへ接続されているが、正式Character DesignではなくPROVISIONAL。**  
   `CHARACTER_VISUAL_PATCH_v23_1.txt:3-12` は96×512 / 32×32 / 3 frames / 4 directions / 4 charactersとRow順を明記し、`js/render/world.js:3-6` も同じ構造で読み込む。現行スプライトは技術的にはACTIVEだが、Visual Canonの根拠にはしてはいけない。

3. **マーガレットのゲーム内ビジュアルに実矛盾がある。**  
   `CHARACTER_VISUAL_PATCH_v23_1.txt:10` はMargaret hairをWHITE / silver-whiteへ修正したと明記し、現行 `assets/hero_party_walk.png` も白髪になっている。ところが `js/data/npcs.js:6,31,108` のPARTY_STYLE、PORTRAITS、専用SVG portraitは紫〜暗紫髪のまま。つまり、**歩行・戦闘スプライトは白髪、会話ポートレートとSprite load失敗時fallbackは紫髪**というD級矛盾が現在存在する。

4. **ZIP内には現行Visual Source of Truthがないため、正式デザイン作業をそのまま続けると再び仮スプライトから逆算する危険がある。**  
   技術基盤を作り直す必要はない。先にVisual資料をプロジェクト内部へ戻し、どの資料がLOCKED / PROVISIONAL / OBSOLETEかを固定する必要がある。

このため判定は **READY WITH FIXES**。ゲーム開発そのものはREADYだが、Visual Identityの次工程へ入る前にSource of Truth整理とマーガレット表示矛盾の解消が必要。

---

# 2. 監査範囲とZIP構成

ZIPを展開して全ファイルを確認した。

- 総ファイル数: **108**
- `.txt`: 50
- `.js`: 35
- `.py`: 9
- `.pyc`: 7
- `.png`: 4
- `.json`: 1
- `.html`: 1
- `.css`: 1

ディレクトリ構成:

```text
gray-crown-v23/
├─ index.html
├─ package.json
├─ assets/
├─ css/
├─ js/
│  ├─ core/
│  ├─ data/
│  ├─ dev/
│  ├─ render/
│  └─ systems/
├─ tests/
└─ 開発・変更履歴・テスト・設計 TXT 群
```

**`docs/`、Markdown設定資料ディレクトリ、JSONベースのCharacter Art Canonは存在しない。**

---

# 3. 現在の技術検証

監査中にコード修正は行わず、テストだけ再実行した。

| 検証 | 監査時結果 | 根拠 |
|---|---|---|
| JavaScript syntax | PASS | `node tests/check-syntax.js` → `syntax: all JavaScript files OK` |
| Node Regression | **41/41 PASS** | `npm test` を監査中に再実行 |
| Browser v21 Gate | PASS | `npm run browser-test` の先頭Gateで `V21 BROWSER GATE PASS` |
| Serad Frontier Section 1 | PASS | `python tests/browser_alpha2_frontier_e2e_test.py` を監査中に再実行 |
| Serad Frontier Section 2 | PASS出力を確認 | `browser_alpha2_frontier_second_e2e_test.py` は `ALPHA2 FRONTIER SECOND E2E PASS...` を出力。ただし監査環境ではPASS表示後もprocess teardownがtool timeoutに当たった。既存 `TEST_REPORT_v23.txt` もPASSを記録している。 |

**注意:** 最後の項目は「ゲーム失敗」ではない。E2E本体はPASSメッセージまで到達したが、監査実行環境でChromium/runner終了待ちがタイムアウトした。Visual Foundation作業を止めるBLOCKERとは判定しないが、テストrunnerの終了処理は将来保守項目。

---

# 4. v23実装状況

`js/systems/story.js:2-30` が正式Story Stateを `00_village` から `19_frontier_second_complete` まで定義している。

| 項目 | 判定 | 証拠 |
|---|---|---|
| タイトル | 実装済み | `index.html` + `js/game.js`; Browser Gate PASS |
| New Game | 実装済み | `js/game.js: beginAlphaNewGame()`; Browser Gate PASS |
| Continue | 実装済み | `js/core/save.js`, `continueAlphaFromTitle()`; Browser Gate PASS |
| リュネ村 | 実装済み | `maps.js` `village`; Story `00_village` |
| 勇者として旅立つ流れ | 実装済み | `js/data/events.js:4-34` `alpha.village.appointment`; `movement.js:15` leaveVillage |
| 最初の戦闘 | 実装済み | `03_first_battle`; `events.js:86-99` wolf victory |
| 王都 | 実装済み | `maps.js:243-251`; `05_capital`〜`08_alpha_complete` |
| Ash Road | 実装済み | `09_ash_road_order`〜`11_ash_road_complete`; Ash Road E2Eはv21 Gate内PASS |
| セラド前線 第1区間 | 実装済み | `12`〜`15`; Section 1 E2E PASS |
| セラド前線 第2区間 | 実装済み | `16`〜`19`; v23 E2E PASS証拠あり |
| Developer Mode | 実装済み | `js/dev/developer.js`, F2; Developer regressionあり |
| Save / Load | 実装済み | schema 23 (`js/core/save.js`), migration/backupsあり |
| Battle | 実装済み | `js/systems/battle.js`, `js/render/battle.js`; Node/Brower testsあり |
| Map transition | 実装済み | `js/systems/movement.js`; transition regressionあり |
| 主人公歩行Sprite | **実装済みだがPROVISIONAL** | `assets/hero_party_walk.png`; `world.js:3-6`; patch note |
| Dialogue portrait | **実装済みだがPROVISIONAL / 一部矛盾** | `js/data/npcs.js:102-124` |
| borderland以降 | **NON-CANON / Skeleton** | `KNOWN_ISSUES_v23.txt:4-11`; `maps.js:262-297`; `movement.js:29-40` |

---

# 5. Visual / Canon資料の存在確認

## 5-1. ZIP内部

以下はすべて**MISSING**。

| 期待ファイル | ZIP内部 |
|---|---|
| `GRAY_CROWN_CANON_v1.md` | MISSING |
| `CHARACTER_BIBLE_v1.md` | MISSING |
| `KINGDOM_CULTURE_v1.md` | MISSING |
| `EMPIRE_CULTURE_v1.md` | MISSING |
| `GRAY_CROWN_CULTURE_LOCK_v1.md` | MISSING |
| `CHARACTER_SHAPE_LANGUAGE.md` | MISSING |
| `COSTUME_RULES.md` | MISSING |
| `CHARACTER_VISUAL_IDENTITY.md` | MISSING |
| `GRAY_CROWN_ART_BIBLE.md` | MISSING |
| `GRAY_CROWN_ART_BIBLE_v2.md` | MISSING |

したがって、これらを「ゲームZIPの正式資料」として扱うことはできない。

## 5-2. 監査ワークスペース外部に確認できたVisual資料

ZIP外の現セッションワークスペースには以下の2ファイルだけ確認できた。

### `/mnt/data/CHARACTER_VISUAL_IDENTITY.md`

- Status: `PROPOSAL ONLY — 方向性未選択` (`:5`)
- Scope: カレンのみ (`:6`)
- 現行 `hero_party_walk.png` は暫定であり根拠にしないと明記 (`:7`)
- A / B / C 3案比較済み
- 採用案を決定しないと明記 (`比較評価 Section`)

### `/mnt/data/KAREN_COSTUME_DESIGN_v1.md`

- Status: `DESIGN LOCK v1 / Art Test Ready` (`:5`)
- Visual Direction: `B — VILLAGE RUNNER` (`:6`)
- 本文も「正式採用したB」と記述 (`:15-19`)

この2つは**同じセッション内でも状態が食い違う**。一方は「未選択」、もう一方は「B正式採用」。会話上のユーザー選択を反映した後者が新しい可能性は高いが、今回の監査では勝手にsource-of-truthを決定しない。

**判定:** Visual資料の状態は **UNRESOLVED until synchronized**。

---

# 6. 資料 ↔ ゲーム反映分類（A〜E）

今回指定された分類:

- **A:** 資料に存在し、ゲームにも反映済み
- **B:** 資料には存在するが、ゲームには未反映
- **C:** ゲームには存在するが、資料側で正式化されていない
- **D:** 資料とゲームが矛盾
- **E:** 判断不能

| 項目 | 分類 | 理由 |
|---|---|---|
| 4人の名前・職業 | C | ゲームでは `items.js:30-34` に存在。ZIP内Character Bibleがないため資料側正式化を検証できない。 |
| カレンの23歳/165cm/左利き等 | E（ZIP基準） | ZIPにCanon/Character Bibleなし。外部Visual Identityには記載あり。 |
| カレンB VILLAGE RUNNER | E / 外部資料間不整合 | ZIPに資料なし。外部Visual Identityは未選択、外部Costume DesignはB Lock。 |
| Stage A → Stage B概念 | C / 部分実装 | `events.js` 任命式で「衣装替え」が台詞として存在するが、ランタイムは同じSprite/portraitを全Story Stateで使う。正式資料はZIPにない。 |
| Margaret 白髪 | **D** | patch noteとactive spriteは白髪だが、`npcs.js` portrait/fallbackは紫髪。 |
| Sprite row順・規格 | A（Patch資料↔Game） | `CHARACTER_VISUAL_PATCH_v23_1.txt:4-10` と `world.js:3-6` が一致。 |
| 正式顔型・目色・正式衣装 | E | ZIP内正式資料なし。Spriteから逆算禁止。 |
| 王国/帝国の正式Visual Culture | E | Culture Bible/LockがZIPにない。ゲーム内色やMapをCanon化してはいけない。 |
| Art Bible | E / MISSING | v1/v2ともZIPに存在しない。 |

---

# 7. 設定矛盾・危険箇所

## FINDING V-01 — Visual Foundation資料が配布物から欠落

**Severity:** HIGH / Visual workflow blocker  
**Type:** Missing source-of-truth

Evidence:
- ZIPの全108ファイルを列挙したが、指定されたVisual/Canon `.md` は0件。
- ZIP内Markdownは0件。JSONは `package.json` のみ。

Impact:
- 次AIがゲームコードや仮SpriteをCanonと誤認しやすい。
- これまで会話でLOCKした年齢、体格、顔、文化、衣装原則をZIP単体では復元できない。
- Character Reference → Pixel Spriteの正しい順序を強制する資料がゲーム本体と分離している。

Recommended action:
- authoritativeな既存資料を**再作成ではなく回収**し、プロジェクト内の明示的な`docs/`または`art/`へ格納する。
- 回収できない資料はUNRESOLVEDとし、記憶から再Canon化しない。

---

## FINDING V-02 — Margaret 白髪がRuntime内で不一致

**Severity:** HIGH / Active visual inconsistency  
**Type:** D — 資料とゲーム内表示の矛盾

Evidence:
- `CHARACTER_VISUAL_PATCH_v23_1.txt:10`: `Margaret hair color corrected to WHITE / silver-white shading.`
- `assets/hero_party_walk.png`: Row 3は白髪。
- `js/data/npcs.js:6`: fallback `margaret ... hair:'#42334d'`。
- `js/data/npcs.js:31`: `PORTRAITS['マーガレット']` も `hair:'#42334d'`。
- `js/data/npcs.js:108`: hero dialogue portrait SVGの髪を `#3c2e48` / `#514060` / `#33263d` で描画。
- `js/systems/dialogue.js:27`: 4主人公は毎回 `portraitMarkup(speaker)` を表示するため、会話ではこの紫髪portraitが実際に使われる。

Impact:
- プレイ中に同一人物の髪色が歩行と会話で変わる。
- active sprite load失敗時も紫髪fallbackになる。

Recommended action:
- 監査後のNOWで修正対象。ただし今回の監査ではコードを変更しない。
- 修正時にはportrait/fallback両方を一度に合わせ、Browser testで会話portraitを確認する。

---

## FINDING V-03 — Hero dialogue portraitsは「正式顔」ではない

**Severity:** MEDIUM  
**Type:** PROVISIONAL visual implementation

Evidence:
- `js/data/npcs.js:103-104` で4人共通のSVG `face` geometryを作成。
- カレン/トリトン/ソフィ/マーガレットは主に髪・服・眉などのoverlay差で描き分ける (`:105-108`)。

Impact:
- 今後正式Character Shape Languageを実装する際、現在のportraitを基準にすると「同じ顔＋髪違い」を再固定する危険。

Recommended action:
- 現portraitを**PROVISIONAL UI placeholder**として明示。
- Character Reference確定後に置換する。現在のSVGから正式顔を逆算しない。

---

## FINDING V-04 — `hero_party_walk.png` はACTIVEだがCharacter Referenceではない

**Severity:** MEDIUM  
**Type:** PROVISIONAL asset

Evidence:
- 96×512、32×32、3 frame、4 direction、4 character。
- `world.js:3-6` がRow mappingを `karen:0,triton:1,sophie:2,margaret:3` と固定。
- battle CSSも同じPNGを利用。
- patch noteは置換Assetであることだけを記録し、正式Character Designとは定義していない。
- 外部 `CHARACTER_VISUAL_IDENTITY.md:7` は明確に暫定Spriteと記述。

Visual observations:
- 4人は髪色と服色で識別できる。
- 4方向・3frame構造は成立。
- 32×32制約上、身長・体格・顔型の正式差を表す情報は不足。
- Row 3 Margaretは白髪へ修正済み。

Conclusion:
- **技術規格はKEEP、デザイン内容はPROVISIONAL。**

---

## FINDING V-05 — Stage A / Stage Bの視覚切替は未実装

**Severity:** MEDIUM  
**Type:** Partial implementation

Evidence:
- `events.js` 任命式では王都係官が衣装・立ち位置を調整し、マーガレットも「衣装替え」と発言する。
- しかし `world.js` はStory Stateに関係なく常に `assets/hero_party_walk.png` の同じ4人Spriteを描画。
- dialogue portraitもStory State別Assetを持たない。

Impact:
- 物語上は「村の4人→王国に勇者として整えられる」という変化があるが、ビジュアルでは切り替わらない。

Conclusion:
- Stage A/Bは**Concept exists / Visual unresolved**。
- 正式Character Reference完成前にStage切替Assetを作るべきではない。

---

## FINDING V-06 — v23正式範囲外のFuture SkeletonがACTIVE source内に残る

**Severity:** MEDIUM / Canon contamination risk  
**Type:** NON-CANON content in runtime source

Evidence:
- `KNOWN_ISSUES_v23.txt:4-11` は19以降を正式実装ではなく旧Skeletonと明記。
- `maps.js:262-297` にはborderland、watchfort、帝国村、帝国都市、ユウキ旧戦場、エルシア、最終前線、シオン等が残る。
- `movement.js:29-40` は第三章〜最終章のSkeleton travel sceneを持つ。
- `systems/events.js` にはクラインテッド、ユウキ・レイナード、ゼスター、ゼニス、シオン等の旧Future dialogueが残る。

Impact:
- 検索だけすると「ゲーム内にある＝Canon」と誤認しやすい。
- 例: 旧Skeletonにある姓や将来の会話をVisual/Canon資料へ逆輸入する危険。

Conclusion:
- `19_frontier_second_complete`より先の内容は**NON-CANON / REFERENCE SKELETON**として扱う。
- Visual Foundationの根拠に使用禁止。

---

## FINDING V-07 — version表記がv23とv23.1で揺れている

**Severity:** LOW  
**Type:** Naming/version drift

Evidence:
- ZIP/README/package: v23 (`README.txt:1`, `package.json:4` = 23.0.0)
- visual patch note: `Gray Crown v23.1 Character Visual Patch` (`CHARACTER_VISUAL_PATCH_v23_1.txt:1`)

Impact:
- 次AIが「v23.1が別releaseなのか、v23のasset patchなのか」を判断しにくい。

Recommended action:
- コードbase versionとvisual patch revisionを別フィールドで明文化する。例: `Game v23 / Visual Patch 23.1`。

---

## FINDING V-08 — 重複ファイルがある

**Severity:** LOW  
**Type:** Repository hygiene

Exact duplicates:
- `BUG_REPORT.txt` == `BUG_REPORT_v23.txt`
- `CHANGELOG.txt` == `CHANGELOG_v23.txt`
- `KNOWN_ISSUES.txt` == `KNOWN_ISSUES_v23.txt`
- `NEXT_TASKS.txt` == `NEXT_TASKS_v23.txt`
- `TEST_REPORT.txt` == `TEST_REPORT_v23.txt`
- `assets/hero_party_walk.png` == `assets/hero_party_walk_whitehair.png` (SHA-256同一)

Inactive older asset:
- `hero_party_walk_replacement.png`: Margaretが暗色髪の中間版。
- `hero_party_walk_v23_original.png`: patch前のrollback用旧sprite。

Recommended action:
- 今回は削除しない。
- 後でduplicate policyを決め、CURRENT / ROLLBACK / ARCHIVEの役割をファイル名またはmanifestで明記する。

---

# 8. 命名揺れ

| 対象 | 現在の表記 | 判定 |
|---|---|---|
| Game release | `v23`, package `23.0.0`, Visual Patch `v23.1` | 揺れあり。Visual patch revisionとして整理が必要。 |
| セラド | READMEは「セラド前線」、map displayは `王国前線拠点`、IDは `frontier` | 実装IDと表示名の差として許容。ただし資料では「セラド前線拠点」と明示した方が検索しやすい。 |
| Ash Road | 日本語表示「灰の街道」、ID `ashroad` | 正常。 |
| 主人公ID | `karen`, `triton`, `sophie`, `margaret` / 日本語名 | 正常なcode IDと表示名の差。 |
| Margaret visual | Active sprite white / portrait purple | 命名ではなく実矛盾。 |
| Future names | `ユウキ・レイナード`等が旧Skeletonに存在 | NON-CANON。現行候補とみなさない。 |

---

# 9. Art Bible監査

`GRAY_CROWN_ART_BIBLE.md`、`GRAY_CROWN_ART_BIBLE_v2.md` はZIPに存在しない。

したがって、旧Art Bibleに「AI感を消すため魅力まで削る思想」が残っているかどうかは**このZIPだけでは監査不能**。

Status: **UNRESOLVED / MISSING**。

旧Art Bibleを自動的に正式基準として扱うことは禁止。

---

# 10. Visual Identity監査

ZIP内部には `CHARACTER_VISUAL_IDENTITY.md` がないため、ゲーム本体との正式同期はできない。

外部ワークスペースの同名ファイルは:

- カレンのみ
- 3方向案あり
- `PROPOSAL ONLY — 方向性未選択`
- current spriteを根拠にしないと明記

これは今回のVisual工程の思想と整合している。

ただし外部 `KAREN_COSTUME_DESIGN_v1.md` はB案をDesign Lockとしているため、**Visual Identity fileのStatus更新が追いついていない**。

この矛盾を解消するまで、新しい画像生成を始めるべきではない。

---

# 11. 主人公4人 — ZIP内で確認できるLOCKED / UNRESOLVED / DO NOT INVENT

重要: ここでは**ZIPまたは監査で実在確認できる資料だけ**を根拠にする。会話上で過去に決めた情報でも、ZIPに入っていないものは「project package内では未固定」として扱う。

## 11-1. カレン

### LOCKED / confirmed in project files
- Code ID: `karen`
- 表示名: カレン
- Job: 勇者 (`js/data/items.js:31`)
- Sprite row: 0 (`world.js:3`, patch note)
- Active sprite: 赤髪系
- 任命式で「剣を右に」と指示される描写あり（左手運用を示唆するが、ゲームシステムにhandedness fieldはない）

### External visual artifact confirms but ZIP does not package
- 23歳、女性、165cm、健康的体型、丸目、アーチ眉、赤髪、日焼け肌、左利き等 (`/mnt/data/CHARACTER_VISUAL_IDENTITY.md:15-35`)

### UNRESOLVED in ZIP
- 正式顔型のReference
- 具体的目色
- 正式Stage A / B衣装
- 正式髪型
- 正式武器形状
- 姓

### DO NOT INVENT
上記UNRESOLVED全て。現sprite/portraitから逆算禁止。

## 11-2. トリトン

### LOCKED / confirmed in project files
- Code ID: `triton`
- 表示名: トリトン
- Job: 戦士 (`items.js:32`)
- Sprite row: 1
- Active sprite: 暗色髪、青/暗色系装備

### UNRESOLVED in ZIP
年齢、正式性別、身長、体格、顔型、目型、利き手、正式髪型、正式衣装、武器Reference、姓。これらの正式資料がZIPにない。

### DO NOT INVENT
上記UNRESOLVED。current sprite/portraitはReferenceにしない。

## 11-3. ソフィ

### LOCKED / confirmed in project files
- Code ID: `sophie`
- 表示名: ソフィ
- Job: 僧侶 (`items.js:33`)
- Sprite row: 2
- Active sprite: 金〜淡茶髪系、明色/緑系
- ゲーム内で孤児院との強い関係・治療役が描写される。

### UNRESOLVED in ZIP
年齢、正式性別、身長、体格、顔型、目型、利き手、正式髪型、正式僧侶服、宗教記号、姓。

### DO NOT INVENT
宗教紋章、宗教正式色、正式衣装、目色、姓、正式武器。

## 11-4. マーガレット

### LOCKED / confirmed in project files
- Code ID: `margaret`
- 表示名: マーガレット
- Job: 魔法使い (`items.js:34`)
- Sprite row: 3
- Visual patch note explicitly says **WHITE / silver-white hair**.

### ACTIVE CONTRADICTION
- Sprite: 白髪
- Dialogue portrait/fallback: 紫髪

### UNRESOLVED in ZIP
年齢、正式性別、身長、体格、正式顔型、目型、利き手、正式衣装、正式魔法道具、姓。

### DO NOT INVENT
current purple portraitを正式髪色/衣装の根拠にしない。active white spriteから正式髪型を逆算しない。

---

# 12. Sprite監査

## 12-1. Active asset

`assets/hero_party_walk.png`

- Size: **96 × 512**
- Frame: **32 × 32**
- Columns: **3**
- Directions: down / left / right / up
- Characters: 4
- Row block order:
  - Karen
  - Triton
  - Sophie
  - Margaret

`world.js:3-6` で実装と一致。

## 12-2. 識別

- 髪色差: 明確
- 服色差: 明確
- 向き: 4方向あり
- 歩行frame: 3frameあり
- 体格差: **限定的**。32×32かつ全員ほぼ同一cell heightのため正式身長・肩幅・重心差をReferenceとして読めない。
- 顔型/目: 判定不能

## 12-3. 既存ゲームとの接続

- World renderer: `world.js:4-6`
- Battle: `css/game.css` の `.battle-hero.sprite` が同じPNGを使用
- Browser testsもこのPNGをbase64で読み込み、decodeを確認する。

**接続は正常。デザインはPROVISIONAL。**

---

# 13. Visual制作工程の再検証

現行想定:

**Canon → Character Bible → Culture → Culture Lock → Shape Language → Costume Rules → Character Visual Identity → Art Bible → Style Anchor → Character Reference → Pixel Sprite**

### 判定

**工程そのものは妥当。**

ただし現在のプロジェクトには1段階足りない。

推奨:

**Canon → Character Bible → Culture → Culture Lock → Shape Language → Costume Rules → Visual Identity → Art Bible → Style Anchor → Character Reference → [SOURCE-OF-TRUTH SYNC GATE] → Pixel Sprite**

また、各LOCK段階の直後に小さな`Documentation Sync`を入れるべき。

理由:
- 今回、会話で作った基準資料がZIPへ入らないままSpriteだけ先に更新された。
- その結果、MargaretのSpriteだけ白髪、portraitは旧紫髪という分裂が起きた。

**Pixel Spriteの前に「Character Referenceとruntime visualの差分表」を作る**ことを推奨する。

---

# 14. 古い資料の処遇

## KEEP

- `V20_STABLE_BASELINE.txt` — stable comparison baseline
- `DEVELOPER_MODE_v1.txt` — 現Developer Modeの説明としてまだ概ね有効
- `FRONTIER_SECTION_DESIGN_v22.txt`
- `FRONTIER_SECTION2_DESIGN_v23.txt`
- `CHANGELOG_v23.txt`
- `BUG_REPORT_v23.txt`
- `TEST_REPORT_v23.txt`
- `KNOWN_ISSUES_v23.txt`
- `CHARACTER_VISUAL_PATCH_v23_1.txt`

## REFERENCE ONLY

- `PHASE3_SYSTEM_SPEC_v15.txt`
- `QUALITY_BENCHMARK_v14.txt`
- `QUALITY_BENCHMARK_v15.txt`
- `CHANGES_v3.txt`〜`CHANGES_v21.txt`
- v22 report群
- v17〜v19.1 test report群
- `tests/run_browser_tests.py`（package scriptsの正式gateではない補助runner）

## ARCHIVE

- `ARCHITECTURE_v19.txt` — 歴史資料として有用だが「legacy/events-legacy.jsが存在」と書く等、現runtimeとは一致しないため現行Architecture正本にはしない。
- 旧version change logs / test reports。
- `assets/hero_party_walk_v23_original.png` — rollback asset。
- `assets/hero_party_walk_replacement.png` — white hair correction前の中間asset。

## REMOVE CANDIDATE

削除は今回行わない。

- unversioned v23 duplicate docs: `BUG_REPORT.txt`, `CHANGELOG.txt`, `KNOWN_ISSUES.txt`, `NEXT_TASKS.txt`, `TEST_REPORT.txt`（各 `_v23` とSHA同一）
- `assets/hero_party_walk_whitehair.png`（active `hero_party_walk.png` とSHA同一）
- `tests/__pycache__/*.pyc`

`NEXT_TASKS_v23.txt` は今回の `NEXT_WORK_ORDER.md` 作成後は通常参照から外し、ARCHIVE候補。

---

# 15. BLOCKER判定

## Gameplay Blocker

**なし。**

Node 41/41、Browser Gate、Frontier E2Eの動作証拠がある。

## Visual Foundation Blocker

### BLOCKER-VISUAL-01 — Project内Source of Truth欠落

Visual Identityを正式に進める前に、既存Canon/Character/Culture/Shape/Costume資料をプロジェクトへ戻す必要がある。

### BLOCKER-VISUAL-02 — Margaret active visual mismatch

白髪Spriteと紫髪Dialogue portrait/fallbackの不一致を、正式画像生成に進む前に解消する必要がある。

これは「ゲームが起動しない」Blockerではなく、**Visual Designを安全に続けるためのBlocker**。

---

# 16. 最終判定

## **READY WITH FIXES**

理由:

- ゲーム技術基盤は安定している。
- v23正式Story範囲は明確に00〜19。
- 現Sprite技術規格も正常に接続されている。
- しかしVisual Foundation資料がZIPに欠落し、Source of Truthがゲーム外に散在している。
- Margaretのactive visualに明確な表示矛盾がある。
- Art Bible v1/v2の実ファイルがないため、次工程で「旧Art Bibleを正式扱いする」こともできない。

**新しい設定を考え直す必要はない。必要なのは、既に決めたものを正しい場所へ戻し、runtimeの仮Visualと分離すること。**

---

# Appendix A — 全ファイル分類の考え方

- `index.html`, `css/game.css`, `js/**/*.js`: **ACTIVE**
- `assets/hero_party_walk.png`: **ACTIVE + PROVISIONAL**
- v23 current reports/design docs: **REFERENCE / KEEP**
- historical version docs: **REFERENCE / ARCHIVE**
- v19 architecture: **OBSOLETE as current spec / ARCHIVE**
- future story skeleton inside runtime: **ACTIVE code container, but content NON-CANON**
- `tests/*.test.js`, official browser gates: **ACTIVE**
- `tests/__pycache__`: **OBSOLETE / REMOVE CANDIDATE**

完全パス一覧はZIP監査時に108ファイルすべて確認済み。実ファイル削除は行っていない。