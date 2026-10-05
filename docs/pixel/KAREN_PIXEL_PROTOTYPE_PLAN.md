# KAREN_PIXEL_PROTOTYPE_PLAN.md

## Gray Crown — First Pixel Acting Prototype

**Status:** IMPLEMENTED TECHNICAL PROTOTYPE — **PHASE 1 VERDICT: REVISE**  
**Duration target:** 10〜20 seconds  
**Location:** Existing Rynne Village  
**Canon impact:** None. Prototype-only presentation test.

---

# 1. 目的

Karenを一枚絵で魅せるのではなく、

> **歩き方、止まり方、近づき方、驚き方、笑い方、去り方**

でKarenに見せられるか検証する。

---

# 2. Assets

Karen:
- 48×48 source cell Prototype actor
- Idle
- Walk
- Turn
- Talk
- Surprise
- Step Forward / Approach
- Laugh
- Run

Optional:
- Look
- Nod

NPC:
新Canon Characterは作らない。

既存リュネ村NPC `ミカ` を第一候補とする。Prototype評価対象ではないのでNPC animationは最小限。

---

# 3. Scene

新Canon eventにはしない。

Karenが画面左から歩いてくる  
→ ミカを見つける  
→ 止まる  
→ 素早く向く  
→ 驚く  
→ 一歩近づく  
→ 短い会話  
→ 大きく笑う  
→ ミカが反応  
→ Karenが振り返る  
→ 走って画面外へ

重要設定を含めない。

---

# 4. Beat spec

| Time | Beat | Karen | Camera / Audio |
|---|---|---|---|
| 0.0–2.2 | Enter | Walk | village hold |
| 2.2–2.6 | Notice | Stop | 0.2s hold |
| 2.6–3.0 | Turn | fast Turn | focus midpoint |
| 3.0–3.5 | Surprise | full-body reaction | small settle |
| 3.5–4.1 | Approach | one step | footstep |
| 4.1–7.0 | Talk | Talk / Listen | portrait A/B |
| 7.0–8.2 | Laugh | Whole-body Laugh | subtle cue optional |
| 8.2–9.0 | NPC react | Listen | hold |
| 9.0–9.6 | Look back | fast Look | shift exit direction |
| 9.6–12.5 | Exit | Run | footsteps |
| 12.5–13.2 | End | offscreen | ambient only |

秒数はPrototypeで調整。

---

# 5. Dialogue

極短。

目的はText内容ではなくActing。

> **台詞を消して動きだけ見てもKarenが活発に見えること。**

Prototype-only textにし、Canon storyへ追加しない。

---

# 6. Camera

最初は:
- Hold
- Focus midpoint
- Small offset
- Return

Zoomは任意1回まで。Pan / letterbox / shake不要。

---

# 7. Portrait A/B

同じSceneで比較:

A. existing portrait ON  
B. portrait OFF

評価:
- 話者識別
- emotion
- Actorへ視線が行くか
- dialogue tempo
- textboxがActorを隠すか

本命はB。

---

# 8. Karen identity

必須:
- red hair
- adult 23-year-old impression
- healthy body
- forward weight
- low partial hair tie
- warm off-white + muted red color mass
- activity / approachability

left-handed / right-hip swordはLock。

日常Prototypeでweapon actionは不要だが、剣を描く場合は右腰を崩さない。

---

# 9. Success Criteria

Acting:
- 台詞なしで活発さが伝わる
- Walk / Turn / LaughにKaren固有差
- over-animationではない
- 23歳感を失わない

Visual:
- 48pxがVillageから浮かない
- color massが32 baselineより読みやすい
- silhouetteが破綻しない
- pixel noiseがない

Dialogue:
- portraitなしで成立可能
- speaking/listeningが読める
- tempoが遅くならない

Technical:
- input leakなし
- camera returns
- scene後movement正常
- Story / Saveへ影響なし
- browser FPS問題なし

Production:
- 8 animationsを修正しやすい
- frame consistency維持
- Tritonへsystemを展開できそう

---

# 10. Failure

- Animation待ちで会話が遅い
- 48pxがmapに対して巨大
- 32との差が「少し綺麗」だけ
- portraitなしでは感情が読めない
- frameごとに髪 / 服が変形
- cameraが落ち着かない
- Karenが元気な少女に寄り23歳感が消える

---

# 11. Implemented prototype scope

現在Prototype開発線で実装済み:
- Karen Prototype 48×48 pixel assets
- 8 animation metadata
- minimal animation runtime
- minimal scene runner
- camera override
- Portrait ON / OFF toggle
- Motion Only
- current 32px baseline comparison
- minimal audio cues
- Node regression / browser E2E / visual A-B evidence generation

これは**正式採用ではない**。`main` の現行32px runtime、Story、Save、正式Visual production orderを置き換えない。

変更しない:
- Story 00–19
- map content
- battle design
- save schema
- current hero_party_walk.png
- four-hero production assets

---

# 12. Current implementation result

Technical Prototypeは成立している。

確認済み:
- 48×48 Karen actorを既存32px logical world上で描画できる
- Walk / Turn / Talk / Surprise / Approach / Laugh / Run / Idleを実行できる
- 既存NPCミカとの短いsceneを実行できる
- cameraはscene終了後に復帰する
- Portrait ON / OFF / Motion Only / legacy 32px baselineを同一sceneで比較できる
- Story / Save schemaを変更しない
- 既存browser regressionを維持できる
- scene cancel時も会話待ちを中断し、transient actorとinput lockを後へ残さない
- scene開始前から存在したstate lockを勝手に解除しない

未判定:
- 最終Pixel Art品質
- 48px Karenのキャラクター魅力
- 32pxに対する最終的な視覚優位
- Portrait削除の正式判断
- Pixel-native全面採用

したがって現在判定は:

> **TECHNICAL GO / VISUAL VERDICT: REVISE**

詳細評価は `docs/pixel/KAREN_PIXEL_PROTOTYPE_RESULT.md` を参照。

---

# 13. Result Gate

**GO** — 48px Pixel-nativeへ進む  
**REVISE** — 32/48/portrait併用を調整  
**NO-GO** — Illustration-first / Hybridへ戻る

失敗しても既存assetsを残すため、破壊的な賭けにしない。
