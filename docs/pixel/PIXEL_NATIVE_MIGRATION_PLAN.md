# PIXEL_NATIVE_MIGRATION_PLAN.md

## Gray Crown — Migration Plan After Prototype Approval

**Status:** CONDITIONAL — ONLY AFTER PROTOTYPE GO

---

# 1. 原則

正式採用しても一括置換しない。

順序:

> **Karen → Second Character → Four Heroes → Core NPC → Existing Events → Important Events → Pixel Cinematic**

---

# 2. Phase 0 — Prototype Gate

Karen 10〜20秒Scene。

終了条件:
- acting success
- resolution decision
- portrait decision
- technical architecture viability
- production cost estimate更新

GOでなければmigration開始しない。

---

# 3. Phase 1 — Karen Core

Karen Level 1 core:
- Idle
- Walk
- Run
- Turn
- Stop
- Talk
- Listen

Identity:
- Approach
- Laugh
- Look Back

通常探索・短い会話で安定するまで他Hero量産しない。

---

# 4. Phase 2 — Second Character Transfer

**Triton推奨。**

理由:
Karenと最もmovement contrastが明確。

検証:
- Karenと明確に別人
- same renderer / metadata / SceneRunnerで動く
- Ground Anchorが伝わる

失敗したらengineではなくacting specificationへ戻る可能性も検討。

---

# 5. Phase 3 — Four Heroes CORE

Karen / Triton成功後にSophie / Margaret。

4人で:
- Idle
- Walk
- Turn
- Talk
- Listen
- Hit / Down最低限

を揃える。

同時にSignatureを1つずつ実装してsame-face / same-motion問題を検査。

---

# 6. Phase 4 — Portrait decision

既存序盤会話の短い範囲で:

- full portrait
- portraitなし
- pixel portrait if needed

を比較。

通常会話の正式modeを決める。

Portrait rendererは決定までは削除しない。

---

# 7. Phase 5 — Core NPC

全NPCを48化しない。

優先:
1. Story上よく話すNPC
2. 家族 / 村人
3. frontline人物
4. generic NPC

genericは共通base animationを許容。

主人公ほどsignature animationを要求しない。

---

# 8. Phase 6 — Existing Event Acting Pass

既存Storyを増やさず、00_villageから短い区間を選ぶ。

例:
- appointment
- departure
- first battle aftermath
- capital ceremony / White Stag

Textを書き直すのではなく、既存台詞へ:
- turn
- step
- wait
- listen
- camera
- audio

を付与する。

---

# 9. Phase 7 — Enhanced Event

Level 2を本格化。

優先:
- 4人の重要会話
- civilian encounters
- battlefield aftermath
- war information contradiction

大きなCutscene Engineはまだ不要。

---

# 10. Phase 8 — Pixel Cinematic

Level 2で不足するSceneだけ。

dedicated actor / backgroundを制作。

Level 3の総数へ上限を設け、量産しない。

---

# 11. Battle migration

Prototype GO後でも後回し。

現Battleは機能している。

移行順:
1. Ready / Hit
2. Attack / Guard
3. Character Skill
4. enemy pixel actor
5. camera / effect polish

Story acting systemとBattle systemを同時に作り直さない。

---

# 12. Vertical Slice

Character foundationが安定したら序盤短区間をnear-finalへ。

含む:
- Pixel actor
- Map/background
- UI
- dialogue presentation
- battle presentation
- event acting
- BGM / SE

この段階で初めて「Pixel-native Gray Crownの完成品質」を評価する。

---

# 13. Cost control

守る:
- animationをScene需要で増やす
- heroを一人ずつ
- NPCはtier制
- Level 3を少数化
- atlas/editor/complex lightingは必要になるまで作らない

---

# 14. Source of Truth移行

Prototype GO後に初めて以下をPixel-native基準へ正式更新:

- SOURCE_OF_TRUTH_STATUS
- NEXT_WORK_ORDER
- NEXT_AI_MASTER_INSTRUCTION
- VISUAL_ASSET_MANIFEST
- Art Bibleの役割整理

Study段階では変更しない。

---

# 15. Rollback

常に保持:
- current `hero_party_walk.png`
- Portrait system
- Art Bible v2
- Illustration-first documents

Pixel-nativeが失敗しても戻れるようにする。
