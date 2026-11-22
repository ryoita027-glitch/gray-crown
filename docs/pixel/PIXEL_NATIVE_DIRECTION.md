# PIXEL_NATIVE_DIRECTION.md

## Gray Crown — Pixel-Native Direction Study

**Status:** STUDY / PROTOTYPE RECOMMENDED — NOT YET ADOPTED  
**Repository audited:** `ryoita027-glitch/gray-crown`  
**Audited branch:** `main`  
**Audited HEAD:** `b8e0c19fd233e7b8645853f4b2f340ef67767b87`  
**Game baseline:** v23

---

# 1. 結論

Gray Crownは、**ゲーム本編のVisual LanguageをPixel-nativeへ移す方向を正式Prototype候補として採用する価値が高い**。

ただし、現時点で全面移行を決定しない。

最初にKaren一人・10〜20秒・既存リュネ村を使った小さなPixel Acting Prototypeを作り、

- Karenらしさが台詞なしでも伝わるか
- Portraitなしでも会話が成立するか
- 48px級Spriteが既存マップへ馴染むか
- Camera / Timing / Audioを含めて演出が改善するか
- 制作コストが現実的か

を確認した後、GO / REVISE / NO-GOを決める。

現時点の推奨は、

> **Illustration-firstを停止し、Pixel-native Prototypeへ進む。Illustrationは外部宣伝・特殊用途へ残す。**

である。

---

# 2. GitHub監査で確認した現在地

## Repository / Branch / PR

監査時のmain HEADは `b8e0c19...`。

Branch:

- `main`
- `visual-foundation-sync`
- `character-visual-identity-lock`
- `art-bible-v2-provisional`

PR #1〜#3はmainへmerge済み。Pixel-native検討開始時点で未mergeの制作PRは確認されなかった。

## Runtime

- Canvas: 768×480
- Logical tile: 32px
- Map: 24×15 tiles
- Current hero sheet: 32×32 / 3 walk frames / 4 directions / 4 heroes
- World rendererはCanvas 2D
- Player / followerはvisual interpolation済み
- Cameraはplayer follow + map-dependent scaleを既に持つ
- Battleは現hero sheetをCSS spriteとして2倍表示
- Dialogueはportraitを常時生成する構造
- Eventは基本 `lines -> effects`
- AudioはWebAudio oscillator中心
- Save schema 23
- transient UI中のSave/Load blockが既にある

したがってPixel-nativeは、ゲーム全体を作り直すより、

> **Animation metadata + actor runtime + minimal SceneRunner + scripted camera override**

を足す方向が現実的。

---

# 3. Illustration-firstとの比較

## Illustration-first

### 強み

- 一枚で顔・衣装・魅力を高密度に見せやすい
- Store / Key Visual / 宣伝に強い
- Character Referenceを作りやすい

### 弱み

- 通常Gameplayと重要場面でVisual Languageが分断されやすい
- 会話時の感情がPortrait依存になりやすい
- 画面内Actorが「移動駒」に戻りやすい
- CGを増やすほど差分制作量が増える

## Pixel-native

### 強み

- Gameplay画面そのものが演出空間になる
- 歩き方・距離・視線・間でCharacterを描ける
- Dialogue / Event / Battle前後を同じActor Languageで繋げられる
- 重要イベントをreal-timeで再編集できる
- Story text変更や多言語化に比較的追従しやすい
- Gray Crownの幼馴染4人の関係性と相性が良い

### 弱み

- Animation production量が大きい
- 同一Characterのframe consistencyが難しい
- 低解像度で成人女性らしさ・体格差を維持する技術が必要
- Camera / Event / Audio runtimeの追加設計が必要
- 重要SceneをすべてAnimationで作ると制作費が膨張する

---

# 4. なぜGray Crownと相性が良いか

Gray Crownの強みは、設定の説明だけではなく、

- 4人が幼馴染である
- 戦争の情報が食い違う
- 日常と制度が衝突する
- 敵兵も生活者である
- 仲間同士の距離感が物語になる

こと。

この作品では、「誰が何を言ったか」と同じくらい、

> **誰が近づくか、誰が止まるか、誰が一拍黙るか**

がCharacterizationになる。

特に既存Visual Identity:

- Karen — VILLAGE RUNNER
- Triton — GROUND ANCHOR
- Sophie — STEADY HANDS
- Margaret — MEASURED LINE

は、静止画属性よりも動作Identityへ翻訳しやすい。

---

# 5. Portrait判定

通常会話の本命候補は、

> **Portraitなし + Pixel Acting**

とする。

ただし今すぐportrait rendererを削除しない。

Prototypeで同一Sceneを、

A. Portraitあり  
B. Portraitなし

で比較し、

- 話者が分かるか
- 感情が分かるか
- Actorへ視線が行くか
- Text読み速度が落ちないか

を見る。

採用後もPortraitは特殊用途・accessibility・database等へ残せる。

---

# 6. Event CG判定

ゲーム本編の重要イベントは、まずPixel Cinematicで表現可能か検討する。

推奨優先順位:

1. Enhanced Pixel Event
2. Pixel Cinematic
3. 本当に必要な場合だけIllustration

Illustrationを禁止しない。

ただし本編のdefault languageにはしない。

---

# 7. リスク

## Production risk

Animation数を先に増やしすぎると破綻する。

対策:

- Karen 8 animationsのみ
- 一人ずつ検証
- Sceneに必要になってからIMPORTANTを追加
- Level 3を少数へ限定

## Technical risk

Cutscene Engineを大きく作りすぎる危険。

対策:

- SceneRunnerは最小Beatのみ
- Editorを作らない
- Timeline GUIを作らない
- 既存Eventを一括移行しない

## Visual risk

48px化しただけで魅力が上がらない可能性。

対策:

- resolutionではなくActingを成功条件にする
- 32px baselineとのA/Bを行う

---

# 8. 作業量の概算

Prototypeはおおよそ **20〜40時間相当**。

内訳目安:

- runtime / SceneRunner: 8〜14h
- Karen 8 animations art / cleanup: 8〜18h
- camera / portrait A-B / audio: 2〜4h
- tests / polish: 4〜8h

Prototype後:

- Four Hero core: +80〜160h
- early Vertical Slice: +150〜300h
- full game Pixel-native化: 数百時間規模

この数字はPrototypeで更新する。

---

# 9. 既存32pxの扱い

削除しない。

`hero_party_walk.png`は、

> **LEGACY ACTIVE / PROVISIONAL / PROTOTYPE COMPARISON BASELINE**

として扱う。

正式Pixel-native採用後も段階移行する。

---

# 10. 既存資料の変更候補

Pixel-nativeを正式採用する場合のみ、以下の記述変更が必要。

- `docs/visual/SOURCE_OF_TRUTH_STATUS.md`
- `docs/visual/VISUAL_ASSET_MANIFEST.md`
- `docs/audit/NEXT_WORK_ORDER.md`
- `docs/audit/NEXT_AI_MASTER_INSTRUCTION.md`
- `docs/art/GRAY_CROWN_ART_BIBLE_v2.md` のゲーム本編Art Test順序

ただし本Studyでは**変更しない**。

Art Bible v2も削除しない。将来、Marketing Illustration / material-color referenceとして再利用可能。

---

# 11. 判定

**RECOMMEND PROTOTYPE.**

まだ全面移行の正式決定ではない。

次の承認後作業は `KAREN_PIXEL_PROTOTYPE_PLAN.md` に従った最小Prototype実装である。
