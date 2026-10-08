# PIXEL_CINEMATIC_SYSTEM.md

## Gray Crown — Real-time Pixel Cinematic Design

**Status:** PROPOSAL — DO NOT IMPLEMENT YET

---

# 1. 目的

Event CGをなくすこと自体が目的ではない。

> **物語上の重要な時間を、ゲームエンジン内で演じる**

ための方式を定義する。

---

# 2. Scene構成

Pixel Cinematicは以下の組み合わせ。

- Actor
- Animation
- Position
- Camera
- Background
- Foreground
- Lighting
- Effect
- Dialogue
- Audio
- Timing

動画fileではなくreal-time制御を基本とする。

利点:
- 台詞修正可能
- timing調整可能
- actor差し替え可能
- 多言語化しやすい
- reuseしやすい
- event systemと統合しやすい

---

# 3. Level 2との境界

Level 2で十分:
- 4人の相談
- 小さな喧嘩
- 負傷者へ近づく
- 前線の短い緊張
- 戦闘前の視線交換

Level 3:
- 一人残る
- 死別
- 重要な崩落 / 敗走
- 大規模戦場開始
- Final decision

Level 3は少数へ限定。

---

# 4. Scene Beat model

例:

```text
actorMove Karen target
wait 200
actorTurn Karen npc
actorAnim Karen surprise
cameraFocus Karen+npc
dialogue Karen "..."
actorAnim Karen laugh
sound laughCue
cameraReturn
```

Beatは長いscript DSLへ育てすぎない。

---

# 5. Timing

重要なのは動きだけでなく**動かない時間**。

目安:
- tiny reaction: 100–250ms
- meaningful pause: 300–700ms
- heavy silence: 700–1500ms

数値を絶対規則にはしない。

---

# 6. 一人残るScene例

1. 仲間が走る
2. 一人だけStop
3. 仲間を見る
4. 0.6s silence
5. 仲間がscreen外へ
6. actorが敵側へturn
7. weapon draw
8. BGM stop
9. ambient only
10. enemy silhouette enters
11. ready pose
12. fade

この「時間」を一枚CGで置換しないことがPixel Cinematicの価値。

---

# 7. Camera

Level 3で使える候補:
- fixed composition
- slow pan
- controlled zoom
- focus transfer
- camera hold
- silhouette framing
- letterbox
- cut

ただしcamera movement自体を見せ物にしない。

---

# 8. Audio

- BGM stop / resume / change
- ambient
- footsteps
- weapon draw
- cloth
- impact
- wind/rain/fire
- silence

Audio cueはanimation frameへ過剰に埋め込まず、Scene側cueとasset-side cueを役割分担する。

---

# 9. Background / Foreground

専用Sceneではmap tile rendererに拘束されなくてよい。

ただし新しい巨大rendererをすぐ作らない。

必要時:
- dedicated pixel background
- foreground silhouette
- weather overlay
- parallax layer

を段階導入。

---

# 10. Save / Skip

PrototypeではScene中Save不可。

将来長いCinematicを作る場合のみskipを設計する。

Skip時も:
- final actor state cleanup
- camera reset
- required event effects

を保証する。

---

# 11. Reuse

Reuseすべきもの:
- camera commands
- common waits
- common actor movement
- fades
- audio controls

Reuseしすぎないもの:
- character-specific acting
- emotional timing
- signature gestures
- death/final scenes

---

# 12. Illustration fallback

採用順:

1. Level 2 Pixel Acting
2. Level 3 Pixel Cinematic
3. それでも成立しない場合だけIllustration

Illustration禁止ではない。

ただし本編Storyのdefault languageにはしない。

---

# 13. 最小Gate

Karen Prototype成功まで作らない:
- foreground engine
- parallax engine
- complex lighting
- multi-camera
- timeline editor

最初の実体は、

> **Actor + Camera + Wait + Dialogue + Audio**

だけでよい。
