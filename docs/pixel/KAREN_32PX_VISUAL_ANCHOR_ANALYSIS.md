# KAREN_32PX_VISUAL_ANCHOR_ANALYSIS.md

## Gray Crown — Karen 32px Visual Anchor Analysis

**Status:** VISUAL REDESIGN INPUT  
**Branch:** `pixel-karen-visual-redesign-v3`  
**Technical state:** GO  
**Current visual state:** **FAIL / REDESIGN REQUIRED**  
**Purpose:** 旧32px Karenの完全コピーではなく、「なぜ魅力が成立しているか」を48px sourceへ翻訳する。

---

# 1. Current decision

Phase 2の48px Karenは、情報量とAnimation空間は増えたが、現在の比較では旧32px Karenより

- 可愛さ
- 顔のまとまり
- 軽快さ
- 主人公らしい見やすさ

が落ちている。

したがって、

> **Phase 2 Karenを単純に40〜44px表示へ縮小するだけでは正式解決としない。**

Scale IntegrationはVisual Redesignの後に行う。

---

# 2. 旧32px Karenの魅力が成立している要素

## 2-1. Head / Hair ratio

旧32pxは、顔そのものより**髪の丸いシルエット**が先に読める。

- 頭部が横長の四角ではない
- 前髪と横髪が顔の輪郭を削る
- 顔の露出面積が小さい
- 赤髪の塊の中に明るいHighlightがある
- 横・後ろ方向に髪の流れがあり、静止状態でも動きを感じる

結果として、

> 「大きい顔」ではなく「髪に包まれた小さな顔」

として読める。

---

## 2-2. Face simplification

旧32pxでは顔情報が少ないことが弱点ではなく、魅力に働いている。

- 目は小さい
- 鼻を立体的に描きすぎない
- 口も最小限
- 横顔で鼻・口を大きく突出させない
- 顔の縦面積を長くしない

これにより、Pixel Artとして顔が一つのまとまった記号になっている。

48px化で顔パーツを増やす場合も、

> **「描けるから描く」のではなく、旧32pxの顔のまとまりを壊さない**

こと。

---

# 3. Body proportion

旧32px KarenはChibi寄りだが、単純な子供体型ではない。

魅力に効いているのは、

- 頭部は比較的大きい
- 胴体は細く短い
- 腰回りが重くない
- 脚が胴体より十分に長く見える
- 腕・脚が斜めに出る
- 全体に縦長の箱ではなく、細いDiagonalがある

こと。

Phase 2 48pxの問題は、

- 胴体が大きな矩形になる
- 脚と装備が一つの暗い塊へ寄る
- Head → Torso → Legsが縦に積み上がり、軽快さが減る

こと。

48px再設計では、

> **細いTorso + 分離した脚 + Diagonal limb**

を優先する。

---

# 4. Color mass

旧32pxで目立つ順序は概ね、

1. Red-brown hair
2. Warm off-white / light upper body
3. Skin
4. Dark lower body
5. Small leather / equipment

となる。

重要なのはDark areaが主役ではないこと。

新48pxでは、

- Hairを茶色い一枚板にしない
- Off-whiteを中心の明るい面として残す
- Muted Red Vestは大きな箱ではなく短いAccentとして使う
- Pants / Boots / Swordを同一Dark massへ潰さない
- Brown leatherとdark gray pantsを分ける

こと。

---

# 5. Silhouette

旧32pxは細部ではなくSilhouetteでKarenらしさが先に来る。

有効な特徴:

- 丸い赤髪
- 小さな顔
- Shoulder〜waistが細い
- 動く髪
- 斜めの腕・脚
- 前へ出る姿勢

48pxの情報量は、このSilhouetteを強めるために使う。

情報量を増やしてSilhouetteを重くしてはいけない。

---

# 6. Lightness / Hero readability

旧32pxは周囲NPCより細かいが、

- 明部が多い
- Hairの色が強い
- Poseが斜め
- Dark outlineが全面を囲みすぎない

ため、主人公として見つけやすい。

Phase 2の48pxはDetail densityとDark contourが増えたことで、

> 「主役の華」より「情報量の多いNPC」

へ寄ってしまった。

新48pxは、

> **detail densityではなく、shape / light-dark hierarchy / motionで主人公性を作る。**

---

# 7. Old 32pxからコピーしてはいけないもの

旧32pxはVisual Anchorだが正式Character Referenceではない。

コピー禁止:

- exact pixel placement
- accidental clipping / sheet packing artifacts
- exact face pixels
- exact equipment pixels
- exact frame timing
- provisional sprite limitations

翻訳するもの:

- proportion
- silhouette
- simplification
- color hierarchy
- hair-to-face relation
- lightness
- diagonal movement

---

# 8. New 48px redesign requirements

48×48 source cellと8 Animationは維持する。

新48px Karenは最低限:

- compact face
- rounded/asymmetric hair silhouette
- red-brown hair with clear warm highlight
- low partial tie + loose hair
- smaller exposed face area
- no long side-profile nose/mouth
- tapered torso
- open-front / side-panel feel for muted-red short vest
- bright warm off-white shirt remains visible
- pants / boots / sword visually separated
- light limbs and diagonal poses
- 23-year-old adult impression
- healthy middle build
- left-handed
- sword on anatomical right hip

を満たす。

---

# 9. Redesign evaluation order

Scaleより先に以下を評価する。

1. **Character appeal**
2. **Karen-specific appeal**
3. **Face / hair cohesion**
4. **Lightness / protagonist readability**
5. **Adult readability**
6. **Animation readability**
7. **World integration**

Scale IntegrationはこのVisual Designが成立してから行う。

---

# 10. Current phase status

- Technical architecture: **GO**
- 48×48 source system: **KEEP**
- 8 Animation structure: **KEEP**
- SceneRunner: **KEEP**
- Phase 2 Karen visual: **FAIL / REDESIGN REQUIRED**
- Scale-only Phase 3 branch: **COMPARISON ONLY**
- Pixel-native formal adoption: **NOT YET**
- Portrait removal: **NOT LOCKED**
- Triton start: **PROHIBITED until Karen redesign + scale gate**

---

# 11. Next action

Create a new 48px Karen visual candidate using this analysis.

Then rerun:

- revised 48 vs old 32
- Motion Only
- Portrait OFF / ON

Only when the new 48 design is clearly more attractive and Karen-like should Scale Integration resume.
