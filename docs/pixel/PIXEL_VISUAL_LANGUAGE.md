# PIXEL_VISUAL_LANGUAGE.md

## Gray Crown — Pixel Visual Language Study

**Status:** PROPOSAL / PROTOTYPE SPEC  
**Rule:** まだRuntime変更しない。

---

# 1. 基本思想

Gray Crownのゲーム画面を、

> **Character + Movement + Timing + Camera + Lighting + Audio**

で演出する。

Pixelは低解像度の挿絵ではなく、ゲーム内Actorの演技媒体。

---

# 2. LEVEL 1 — Normal Gameplay Pixel

用途:

- 探索
- 通常NPC会話
- 日常会話
- Shop / Inn
- 小規模Event
- 戦闘前後の短い反応

基本:

- Idle
- Walk
- Turn
- Talk / Listen
- Character-specific idle tendency

Cameraは通常Player追従。

Portraitの本命は**なし**だが、Prototype終了までは既存systemを残す。

Audioは通常BGM + 必要最低限の足音 / 環境音。

---

# 3. LEVEL 2 — Enhanced Pixel Event

Gray Crown Pixel-nativeの中心言語。

用途:

- 幼馴染4人の重要会話
- 感情変化
- 戦闘前の緊張
- 章の要点
- 仲間イベント
- 戦後反応

追加要素:

- Character Variant / Signature animation
- Actor movement override
- scripted turn / look
- camera focus
- small zoom / slow pan / hold
- simple lighting overlay
- fade
- screen shake when justified
- foreground/background motion
- ambient / SE cue
- BGM stop / resume / change
- explicit pause

原則として重要SceneでもまずLevel 2で解決する。

---

# 4. LEVEL 3 — Pixel Cinematic / Pixel CG

従来ならEvent CGを使う少数Scene。

用途候補:

- 一人残る決断
- 大規模戦闘開始
- 敗走
- 死別
- 重大対峙
- Final decision

通常Mapのcamera制約から離れてよい。

候補:

- 96px級dedicated actor
- silhouette
- close-up pixel actor
- dedicated pixel background
- foreground planes
- parallax
- scene-specific animation
- lighting / weather
- camera rails / controlled cut

**一枚の巨大Pixel Artを置くだけにしない。**

少なくともActor / camera / light / foreground / audioのどれかが時間変化する。

---

# 5. 3階層の使い分け

| Scene | Level 1 | Level 2 | Level 3 |
|---|---:|---:|---:|
| 日常会話 | ◎ | △ | × |
| 感情的会話 | △ | ◎ | △ |
| 戦闘前 | ○ | ◎ | △ |
| 仲間関係 | ○ | ◎ | △ |
| 章転換 | △ | ◎ | ○ |
| 死別 / 決断 | × | ○ | ◎ |
| 大規模戦場 | × | ○ | ◎ |
| Cost | Low | Medium | High |

---

# 6. Camera Language

現行にはsmooth player-follow cameraがある。

追加候補:

Basic:
- focus(actor)
- returnToPlayer()
- hold(ms)
- offset(x,y)

Intermediate:
- panTo(target,duration)
- zoomTo(scale,duration)
- follow(actor)
- shake(intensity,duration)

Level 3:
- letterbox
- fixed framing
- scene cut

Prototypeでは **Focus / Hold / Small offset / Return** を中心とする。Zoomは必須ではない。

---

# 7. Lighting / Effects

Lightingは常時派手にしない。

用途:

- 時刻
- 火
- 雨
- 室内
- focus
- magic

Prototypeではsubtle focus overlayとfadeで十分。

Effects優先順位:

1. Actor movement
2. Timing
3. Camera
4. Audio
5. Effect

Particlesは最後。

---

# 8. Audio Language

使用候補:

- footstep
- cloth / gear small cue
- weapon draw
- door
- wind
- fire
- rain
- distant battle
- BGM stop
- BGM duck
- BGM resume
- intentional silence

> **Silence is a cue.**

BGM停止後の0.4〜0.8秒も演技単位。

---

# 9. Dialogue Language

通常会話target:

- Speaker name表示
- Portraitなし
- Speaker Actorへ軽いfocus
- 相手へ向く
- Listenerも小さく反応

感情は、

`Face + Pose + Direction + Distance + Movement + Timing`

として構成する。

例: Karen Angry

1. 台詞を一拍止める
2. 相手へ向く
3. 一歩前へ
4. 上半身をわずかに前へ
5. angry variant
6. 台詞

---

# 10. Portraitの残し方

Pixel-native採用後もrenderer自体を即削除しない。

候補用途:

- accessibility
- character database
- special pixel portrait
- tutorial/system
- exceptional scene

通常会話では使わない方向を推奨。

---

# 11. UIとの関係

会話windowがActorを隠すとPixel Actingの意味が弱くなる。

正式採用後に、

- compact dialogue
- actorを隠さない配置
- text width調整

を検討。

Prototypeでは既存Dialogueを流用し、portraitのみtoggleできる形が安全。

---

# 12. 評価条件

- Actorを見る時間が増える
- Text読み速度が落ちすぎない
- Cameraがうるさくない
- Animation待ちで会話が遅くならない
- 大事なSceneだけ密度が上がる
- 通常Sceneとの格差が自然

---

# 13. 推奨

- Level 1 = 日常標準
- Level 2 = Story主力
- Level 3 = 本当に重要な少数Scene

**Level 2がPixel-native Gray Crownの中心言語。**
