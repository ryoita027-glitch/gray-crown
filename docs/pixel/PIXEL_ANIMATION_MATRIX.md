# PIXEL_ANIMATION_MATRIX.md

## Gray Crown — Animation Priority Matrix

**Status:** PROPOSAL  
**Priority:** CORE / IMPORTANT / OPTIONAL / SPECIAL EVENT

---

# 1. Priority

- **CORE**: 通常GameplayまたはCharacter identity成立に必須
- **IMPORTANT**: 主要会話・生活・戦闘の質を上げる
- **OPTIONAL**: 使用Sceneが確定してから
- **SPECIAL EVENT**: 特定Event専用。汎用化しない

---

# 2. Movement

| Animation | Karen | Triton | Sophie | Margaret |
|---|---|---|---|---|
| Idle | CORE | CORE | CORE | CORE |
| Walk | CORE | CORE | CORE | CORE |
| Run | **CORE** | IMPORTANT | IMPORTANT | IMPORTANT |
| Turn | CORE | CORE | CORE | CORE |
| Stop | **CORE** | IMPORTANT | IMPORTANT | IMPORTANT |

# 3. Conversation

| Animation | Karen | Triton | Sophie | Margaret |
|---|---|---|---|---|
| Talk | CORE | CORE | CORE | CORE |
| Listen | CORE | CORE | CORE | CORE |
| Nod | IMPORTANT | IMPORTANT | IMPORTANT | IMPORTANT |
| Shake Head | IMPORTANT | IMPORTANT | IMPORTANT | IMPORTANT |
| Look Aside | IMPORTANT | IMPORTANT | IMPORTANT | **CORE** |
| Look Back | **CORE** | IMPORTANT | OPTIONAL | IMPORTANT |
| Think | IMPORTANT | IMPORTANT | IMPORTANT | **CORE** |
| Surprise | **CORE** | IMPORTANT | IMPORTANT | IMPORTANT |

# 4. Emotion

| Animation | Karen | Triton | Sophie | Margaret |
|---|---|---|---|---|
| Smile | CORE | IMPORTANT | CORE | IMPORTANT |
| Laugh | **CORE** | IMPORTANT | OPTIONAL | OPTIONAL |
| Angry | IMPORTANT | IMPORTANT | IMPORTANT | IMPORTANT |
| Sad | IMPORTANT | IMPORTANT | IMPORTANT | IMPORTANT |
| Worried | IMPORTANT | IMPORTANT | **CORE** | IMPORTANT |
| Serious | IMPORTANT | **CORE** | IMPORTANT | **CORE** |
| Relieved | IMPORTANT | OPTIONAL | IMPORTANT | OPTIONAL |
| Embarrassed | OPTIONAL | OPTIONAL | OPTIONAL | OPTIONAL |

# 5. Life

| Animation | Karen | Triton | Sophie | Margaret |
|---|---|---|---|---|
| Sit | IMPORTANT | IMPORTANT | IMPORTANT | IMPORTANT |
| Eat | OPTIONAL | OPTIONAL | OPTIONAL | OPTIONAL |
| Drink | OPTIONAL | OPTIONAL | OPTIONAL | OPTIONAL |
| Read | OPTIONAL | OPTIONAL | IMPORTANT | **IMPORTANT** |
| Inspect | IMPORTANT | IMPORTANT | IMPORTANT | **CORE** |
| Pick Up | IMPORTANT | IMPORTANT | IMPORTANT | IMPORTANT |
| Give | IMPORTANT | IMPORTANT | **IMPORTANT** | IMPORTANT |
| Receive | IMPORTANT | IMPORTANT | **IMPORTANT** | IMPORTANT |
| Rest | OPTIONAL | OPTIONAL | OPTIONAL | OPTIONAL |

# 6. Interaction

| Animation | Karen | Triton | Sophie | Margaret |
|---|---|---|---|---|
| Approach | **CORE** | IMPORTANT | IMPORTANT | OPTIONAL |
| Help | IMPORTANT | IMPORTANT | **CORE** | IMPORTANT |
| Support | IMPORTANT | **IMPORTANT** | **CORE** | OPTIONAL |
| Reach Hand | IMPORTANT | OPTIONAL | **CORE** | OPTIONAL |
| Step Between | OPTIONAL | **CORE** | OPTIONAL | OPTIONAL |
| Touch Shoulder | IMPORTANT | IMPORTANT | **IMPORTANT** | OPTIONAL |

# 7. Battle

正式武器designは未決定。ここでは意味だけ先に分類する。

| Animation | Karen | Triton | Sophie | Margaret |
|---|---|---|---|---|
| Draw Weapon | IMPORTANT | IMPORTANT | IMPORTANT | IMPORTANT |
| Ready | IMPORTANT | **CORE** | IMPORTANT | IMPORTANT |
| Attack | IMPORTANT | IMPORTANT | IMPORTANT | IMPORTANT |
| Hit | CORE | CORE | CORE | CORE |
| Guard | IMPORTANT | **CORE** | IMPORTANT | OPTIONAL |
| Skill | IMPORTANT | IMPORTANT | IMPORTANT | IMPORTANT |
| Victory | IMPORTANT | IMPORTANT | IMPORTANT | IMPORTANT |
| Exhausted | IMPORTANT | IMPORTANT | IMPORTANT | IMPORTANT |
| Down | CORE | CORE | CORE | CORE |

# 8. Signature

| Character | Signature 1 | Signature 2 | Signature 3 |
|---|---|---|---|
| Karen | Quick Approach — CORE Prototype | Whole-body Laugh — CORE Prototype | Fast Look-back Run — CORE Prototype |
| Triton | Anchor Shift — IMPORTANT | Step Between — IMPORTANT | Short Broad Laugh — OPTIONAL |
| Sophie | Reach and Check — IMPORTANT | Steady Support — IMPORTANT | Still Anger — SPECIAL/IMPORTANT |
| Margaret | Measured Glance — IMPORTANT | Check / Mark Note — IMPORTANT | Delayed Answer — IMPORTANT |

# 9. Karen Prototype minimum

1. Idle
2. Walk
3. Turn
4. Talk
5. Surprise
6. Step Forward / Approach
7. Laugh
8. Run

Optional: Look / Nod.

最初からSad / Battle / Sit / Eatへ広げない。

# 10. Frame budget

Prototypeではframe数をCanon化しない。

目安:
- Idle 2〜4
- Walk 4〜6
- Turn 2〜3
- Talk 2〜4
- Surprise 2〜4
- Laugh 4〜6
- Run 4〜6

48px Prototypeで読みやすさとcostを確認して決定する。

# 11. Production order

Karen Prototype  
→ Karen consistency  
→ Triton transfer test  
→ Four Hero CORE  
→ Scene単位でIMPORTANT追加

COREを最初から4人まとめて量産しない。
